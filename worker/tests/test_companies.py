import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from companies import CITIZENSHIP_REQUIRED, citizenship_rule, normalise


class TestNormalise(unittest.TestCase):
    def test_lowercases_and_strips_punctuation(self):
        self.assertEqual(normalise("L3Harris Technologies"), "l3harris")
        self.assertEqual(normalise("Booz, Allen."), "booz allen")

    def test_drops_corporate_suffixes(self):
        self.assertEqual(normalise("RTX Corporation"), "rtx")
        self.assertEqual(normalise("Anduril Industries"), "anduril")
        self.assertEqual(normalise("Rocket Lab USA"), "rocket lab")

    def test_never_strips_a_name_to_nothing(self):
        # "Systems Inc" is all suffix; keeping one word beats returning "".
        self.assertNotEqual(normalise("Systems Inc"), "")

    def test_collapses_whitespace(self):
        self.assertEqual(normalise("  General   Dynamics  "), "general dynamics")


class TestCitizenshipRule(unittest.TestCase):
    def test_finds_a_prime_by_its_own_name(self):
        rule = citizenship_rule("Lockheed Martin")
        self.assertIsNotNone(rule)
        self.assertEqual(rule.name, "Lockheed Martin")

    def test_finds_a_company_through_an_alias(self):
        self.assertEqual(citizenship_rule("Raytheon").name, "RTX")
        self.assertEqual(
            citizenship_rule("General Dynamics Mission Systems").name,
            "General Dynamics",
        )

    def test_matching_is_case_insensitive(self):
        self.assertIsNotNone(citizenship_rule("spacex"))
        self.assertIsNotNone(citizenship_rule("BLUE ORIGIN"))

    def test_does_not_match_on_a_substring(self):
        # The bug this guards: a naive `"saic" in name` marked both of these as
        # defence contractors on the real feed.
        self.assertIsNone(citizenship_rule("Mosaic"))
        self.assertIsNone(citizenship_rule("RosaicLabs"))

    def test_leaves_ordinary_employers_alone(self):
        for name in ("Stripe", "Jane Street", "Google", "Databricks", "Figma"):
            self.assertIsNone(citizenship_rule(name), name)

    def test_every_rule_carries_a_reason(self):
        for rule in CITIZENSHIP_REQUIRED:
            self.assertTrue(rule.reason.strip(), rule.name)
            self.assertGreater(len(rule.reason), 25, rule.name)

    def test_no_duplicate_names_or_aliases(self):
        seen = set()
        for rule in CITIZENSHIP_REQUIRED:
            for label in (rule.name, *rule.aliases):
                key = normalise(label)
                self.assertNotIn(key, seen, f"{label} is listed twice")
                seen.add(key)


if __name__ == "__main__":
    unittest.main()
