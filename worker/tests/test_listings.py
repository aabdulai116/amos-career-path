import sys
import time
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from listings import Listing, days_old, normalise, wanted_term


def record(**over):
    base = {
        "id": "abc",
        "company_name": "Stripe",
        "title": "Software Engineer Intern",
        "url": "https://example.com/job",
        "category": "Software",
        "locations": ["NYC"],
        "degrees": ["Bachelor's"],
        "terms": ["Summer 2027"],
        "date_posted": 1_775_000_000,
        "active": True,
        "is_visible": True,
        "sponsorship": "Other",
    }
    base.update(over)
    return base


class TestWantedTerm(unittest.TestCase):
    def test_keeps_the_cycles_still_open(self):
        self.assertTrue(wanted_term(["Summer 2027"]))
        self.assertTrue(wanted_term(["Fall 2027"]))
        self.assertTrue(wanted_term(["Summer 2028"]))

    def test_keeps_undated_postings(self):
        # A third of the feed; mostly rolling roles, so dropping them loses jobs.
        self.assertTrue(wanted_term(["N/A"]))

    def test_drops_cycles_that_have_passed(self):
        self.assertFalse(wanted_term(["Summer 2026"]))
        self.assertFalse(wanted_term(["Winter 2026", "Fall 2026"]))

    def test_keeps_a_listing_if_any_term_qualifies(self):
        self.assertTrue(wanted_term(["Summer 2026", "Summer 2027"]))

    def test_no_terms_at_all_is_dropped(self):
        self.assertFalse(wanted_term([]))


class TestNormalise(unittest.TestCase):
    def test_keeps_a_good_record(self):
        items, report = normalise([record()])
        self.assertEqual(len(items), 1)
        self.assertEqual(report.kept, 1)
        self.assertEqual(items[0].company, "Stripe")

    def test_drops_inactive_and_invisible(self):
        items, report = normalise([record(active=False), record(is_visible=False)])
        self.assertEqual(items, [])
        self.assertEqual(report.active, 0)

    def test_drops_the_wrong_category(self):
        items, report = normalise([record(category="Hardware")])
        self.assertEqual(items, [])
        self.assertEqual(report.dropped_category, 1)

    def test_drops_a_cycle_that_has_passed(self):
        items, report = normalise([record(terms=["Summer 2026"])])
        self.assertEqual(items, [])
        self.assertEqual(report.dropped_term, 1)

    def test_drops_records_missing_what_a_link_needs(self):
        for broken in ({"url": ""}, {"title": "  "}, {"company_name": None}, {"id": ""}):
            items, report = normalise([record(**broken)])
            self.assertEqual(items, [], broken)
            self.assertEqual(report.dropped_malformed, 1, broken)

    def test_drops_a_url_that_is_not_http(self):
        # A generated file feeds an href; javascript: must never reach it.
        items, _ = normalise([record(url="javascript:alert(1)")])
        self.assertEqual(items, [])

    def test_survives_junk_in_the_array(self):
        items, report = normalise(["not a dict", 42, None, record()])
        self.assertEqual(len(items), 1)
        self.assertEqual(report.dropped_malformed, 3)

    def test_normalises_the_two_spellings_of_each_category(self):
        items, _ = normalise([
            record(id="a", category="Software Engineering"),
            record(id="b", category="AI/ML/Data"),
            record(id="c", category="Data Science, AI & Machine Learning"),
        ])
        self.assertEqual(
            sorted(i.category for i in items),
            ["AI / ML / Data", "AI / ML / Data", "Software"],
        )

    def test_sorts_newest_first(self):
        items, _ = normalise([
            record(id="old", date_posted=1_000),
            record(id="new", date_posted=9_000),
            record(id="mid", date_posted=5_000),
        ])
        self.assertEqual([i.id for i in items], ["new", "mid", "old"])

    def test_counts_everything_it_saw(self):
        items, report = normalise([
            record(id="keep"),
            record(id="cat", category="Product"),
            record(id="term", terms=["Summer 2026"]),
            record(id="dead", active=False),
        ])
        self.assertEqual(report.total, 4)
        self.assertEqual(report.active, 3)
        self.assertEqual(report.kept, 1)
        self.assertEqual(report.dropped_category + report.dropped_term, 2)

    def test_missing_date_becomes_zero_rather_than_crashing(self):
        items, _ = normalise([record(date_posted=None)])
        self.assertEqual(items[0].posted, 0)


class TestDaysOld(unittest.TestCase):
    def listing(self, posted):
        return Listing("i", "c", "t", "https://x", "Software", (), (), (), posted, "")

    def test_counts_whole_days(self):
        now = time.time()
        self.assertEqual(days_old(self.listing(int(now - 3 * 86400)), now), 3)

    def test_today_is_zero(self):
        now = time.time()
        self.assertEqual(days_old(self.listing(int(now - 60)), now), 0)

    def test_undated_is_zero_not_negative(self):
        self.assertEqual(days_old(self.listing(0)), 0)

    def test_a_future_date_does_not_go_negative(self):
        now = time.time()
        self.assertEqual(days_old(self.listing(int(now + 86400)), now), 0)


if __name__ == "__main__":
    unittest.main()


class TestGroupDuplicates(unittest.TestCase):
    def listing(self, **over):
        base = dict(
            id="i", company="Bandwidth", title="Software Engineer Intern",
            url="https://x/1", category="Software", locations=("Raleigh, NC",),
            degrees=(), terms=("Summer 2027",), posted=100, sponsorship="",
        )
        base.update(over)
        return Listing(**base)

    def test_collapses_rows_a_reader_cannot_tell_apart(self):
        from listings import group_duplicates

        groups = group_duplicates([
            self.listing(id="a", url="https://x/a", posted=300),
            self.listing(id="b", url="https://x/b", posted=200),
            self.listing(id="c", url="https://x/c", posted=100),
        ])
        self.assertEqual(len(groups), 1)
        self.assertEqual(groups[0].openings, 3)
        self.assertEqual(groups[0].primary.id, "a")

    def test_keeps_every_link_rather_than_dropping_requisitions(self):
        from listings import group_duplicates

        groups = group_duplicates([
            self.listing(id="a", url="https://x/a"),
            self.listing(id="b", url="https://x/b"),
        ])
        self.assertEqual(groups[0].others, ("https://x/b",))

    def test_different_locations_stay_separate(self):
        from listings import group_duplicates

        groups = group_duplicates([
            self.listing(id="a", locations=("Raleigh, NC",)),
            self.listing(id="b", locations=("Seattle, WA",)),
        ])
        self.assertEqual(len(groups), 2)

    def test_different_titles_stay_separate(self):
        from listings import group_duplicates

        groups = group_duplicates([
            self.listing(id="a", title="Software Engineer Intern"),
            self.listing(id="b", title="Data Engineer Intern"),
        ])
        self.assertEqual(len(groups), 2)

    def test_location_order_does_not_split_a_group(self):
        from listings import group_duplicates

        groups = group_duplicates([
            self.listing(id="a", locations=("NYC", "SF")),
            self.listing(id="b", locations=("SF", "NYC")),
        ])
        self.assertEqual(len(groups), 1)

    def test_preserves_the_incoming_order(self):
        from listings import group_duplicates

        groups = group_duplicates([
            self.listing(id="new", title="B", posted=300),
            self.listing(id="old", title="A", posted=100),
        ])
        self.assertEqual([g.primary.id for g in groups], ["new", "old"])

    def test_a_single_listing_is_a_group_of_one(self):
        from listings import group_duplicates

        groups = group_duplicates([self.listing()])
        self.assertEqual(groups[0].openings, 1)
        self.assertEqual(groups[0].others, ())
