import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from authorisation import (
    FEED_BLOCKED,
    FEED_NO_SPONSORSHIP,
    FEED_SPONSORS,
    classify,
    is_worth_applying,
)


class TestClassify(unittest.TestCase):
    def test_feed_citizenship_requirement_blocks(self):
        verdict = classify("Some Startup", FEED_BLOCKED)
        self.assertEqual(verdict.status, "blocked")
        self.assertEqual(verdict.evidence, "feed")

    def test_feed_sponsorship_offer_is_green(self):
        verdict = classify("Some Startup", FEED_SPONSORS)
        self.assertEqual(verdict.status, "sponsors")
        self.assertEqual(verdict.evidence, "feed")

    def test_no_sponsorship_is_amber_not_red(self):
        # CPT is not sponsorship. Treating this as a closed door would hide
        # jobs that are genuinely open.
        verdict = classify("Some Startup", FEED_NO_SPONSORSHIP)
        self.assertEqual(verdict.status, "no_sponsorship")
        self.assertTrue(is_worth_applying(verdict))

    def test_defence_employer_blocks_when_the_feed_is_silent(self):
        verdict = classify("Lockheed Martin", "Other")
        self.assertEqual(verdict.status, "blocked")
        self.assertEqual(verdict.evidence, "company")

    def test_the_feed_overrides_the_company_list(self):
        # The posting is more specific and more recent than our rules.
        verdict = classify("Lockheed Martin", FEED_SPONSORS)
        self.assertEqual(verdict.status, "sponsors")
        self.assertEqual(verdict.evidence, "feed")

    def test_silence_is_unknown_not_a_refusal(self):
        for value in ("Other", "", None, "   ", "something unexpected"):
            verdict = classify("Some Startup", value)
            self.assertEqual(verdict.status, "unknown", repr(value))
            self.assertEqual(verdict.evidence, "none")
            self.assertTrue(is_worth_applying(verdict))

    def test_every_verdict_explains_itself(self):
        for company, field in (
            ("Some Startup", FEED_BLOCKED),
            ("Some Startup", FEED_SPONSORS),
            ("Some Startup", FEED_NO_SPONSORSHIP),
            ("Lockheed Martin", "Other"),
            ("Some Startup", "Other"),
        ):
            verdict = classify(company, field)
            self.assertGreater(len(verdict.reason), 20)


class TestIsWorthApplying(unittest.TestCase):
    def test_only_a_hard_block_is_excluded(self):
        self.assertFalse(is_worth_applying(classify("SpaceX", "Other")))
        self.assertTrue(is_worth_applying(classify("Stripe", "Other")))
        self.assertTrue(is_worth_applying(classify("Stripe", FEED_NO_SPONSORSHIP)))


if __name__ == "__main__":
    unittest.main()
