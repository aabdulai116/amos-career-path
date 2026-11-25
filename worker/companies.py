"""
Companies whose US internships effectively require US citizenship or permanent
residency, and therefore cannot be reached on an F-1 visa with CPT.

Why a curated list rather than a model: the listings feed has no description
text, and not one of its 5,000-odd active titles mentions a clearance, ITAR or
citizenship. The only place that signal lives is the employer. Export-controlled
and cleared work is a property of the company, not of the advert, and it is
stable enough to write down and review.

Each entry says why, so the claim can be checked rather than trusted. This is a
heuristic about the common case - a company here may still run a commercial team
that hires internationally - which is exactly why a personal verdict set in the
app overrides anything decided here.
"""

from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class CompanyRule:
    """One employer, the reason, and any names the feed actually uses."""

    name: str
    reason: str
    aliases: tuple[str, ...] = ()

    @property
    def key(self) -> str:
        """Short code for the reason, so the generated file stores codes."""
        return REASON_KEYS[self.reason]


# Reason strings, kept short because they are shown in the UI verbatim.
CLEARANCE = "Most roles need a US security clearance, which requires citizenship."
ITAR = "Export-controlled (ITAR) work, which requires US person status."
FFRDC = "A federally funded lab; US citizenship is required for most positions."

REASON_KEYS = {
    CLEARANCE: "company-clearance",
    ITAR: "company-itar",
    FFRDC: "company-ffrdc",
}

# Aliases are only listed where normalise() would not already get there. It
# strips corporate suffixes, so "Anduril Industries" and "Sandia National Labs"
# need no entry - and a test fails if a redundant one is added.
CITIZENSHIP_REQUIRED: tuple[CompanyRule, ...] = (
    # Defence primes and integrators.
    CompanyRule("Lockheed Martin", CLEARANCE),
    CompanyRule("Northrop Grumman", CLEARANCE),
    CompanyRule("RTX", CLEARANCE, ("Raytheon", "Collins Aerospace", "Pratt & Whitney")),
    CompanyRule("General Dynamics", CLEARANCE, (
        "General Dynamics Mission Systems",
        "General Dynamics Information Technology",
        "GDIT",
        "General Dynamics Electric Boat",
    )),
    CompanyRule("L3Harris Technologies", CLEARANCE),
    CompanyRule("BAE Systems", CLEARANCE),
    CompanyRule("Leidos", CLEARANCE),
    CompanyRule("SAIC", CLEARANCE, ("Science Applications International Corporation",)),
    CompanyRule("CACI", CLEARANCE),
    CompanyRule("Peraton", CLEARANCE),
    CompanyRule("Booz Allen", CLEARANCE, ("Booz Allen Hamilton",)),
    CompanyRule("Two Six Technologies", CLEARANCE),
    CompanyRule("Nightwing", CLEARANCE),
    CompanyRule("Parsons", CLEARANCE),
    CompanyRule("KBR", CLEARANCE),
    CompanyRule("ManTech", CLEARANCE),
    CompanyRule("Amentum", CLEARANCE),
    CompanyRule("Noblis", CLEARANCE),
    CompanyRule("Riverside Research", CLEARANCE),
    CompanyRule("Huntington Ingalls", CLEARANCE, ("HII",)),
    CompanyRule("Sierra Nevada Corporation", CLEARANCE),
    CompanyRule("Institute for Defense Analyses", FFRDC),
    # Federally funded research and development centres.
    CompanyRule("MITRE", FFRDC, ("The MITRE Corporation",)),
    CompanyRule("Draper", FFRDC, ("The Charles Stark Draper Laboratory",)),
    CompanyRule("The Aerospace Corporation", FFRDC, ("Aerospace Corporation",)),
    CompanyRule("Johns Hopkins Applied Physics Laboratory", FFRDC, ("JHU APL", "Johns Hopkins APL")),
    CompanyRule("MIT Lincoln Laboratory", FFRDC, ("Lincoln Laboratory",)),
    CompanyRule("Sandia National Laboratories", FFRDC),
    CompanyRule("Los Alamos National Laboratory", FFRDC),
    CompanyRule("Lawrence Livermore National Laboratory", FFRDC),
    CompanyRule("Pacific Northwest National Laboratory", FFRDC, ("PNNL",)),
    CompanyRule("Idaho National Laboratory", FFRDC),
    # Space and defence hardware, export controlled.
    CompanyRule("SpaceX", ITAR, ("Space Exploration Technologies",)),
    CompanyRule("Blue Origin", ITAR),
    CompanyRule("Anduril", ITAR),
    CompanyRule("Rocket Lab USA", ITAR),
    CompanyRule("Firefly Aerospace", ITAR),
    CompanyRule("Relativity Space", ITAR),
)

# Suffixes dropped before comparing, so "RTX Corporation" matches "RTX".
_SUFFIXES = (
    "corporation", "corp", "incorporated", "inc", "llc", "ltd", "limited",
    "plc", "company", "co", "group", "holdings", "technologies", "technology",
    "labs", "laboratories", "laboratory", "systems", "industries", "solutions",
    "international", "usa", "us", "na",
)


def normalise(name: str) -> str:
    """
    A comparable form of a company name: lower case, no punctuation, no
    corporate suffixes, single-spaced.

    Matching has to be exact on this form rather than a substring test. A naive
    `"saic" in name` marks "Mosaic" and "RosaicLabs" as defence contractors -
    which it did, on this very feed, before these rules were written.
    """
    cleaned = re.sub(r"[^a-z0-9& ]+", " ", name.lower())
    words = [w for w in cleaned.split() if w]
    while len(words) > 1 and words[-1] in _SUFFIXES:
        words.pop()
    return " ".join(words)


def _index() -> dict[str, CompanyRule]:
    table: dict[str, CompanyRule] = {}
    for rule in CITIZENSHIP_REQUIRED:
        for label in (rule.name, *rule.aliases):
            key = normalise(label)
            if key:
                table[key] = rule
    return table


_LOOKUP = _index()


def citizenship_rule(company_name: str) -> CompanyRule | None:
    """The rule for this employer, or None when nothing is known about it."""
    return _LOOKUP.get(normalise(company_name))
