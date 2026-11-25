"""
Work-authorisation classification for one listing.

The question this answers is narrow and practical: as an F-1 student who would
work on CPT, is this role worth an application?

It is deliberately a four-way answer with a large "nobody said" bucket. The
feed's own sponsorship field is filled in for 14 of its 5,000-odd active
listings; everything else is silence, and silence is not a no. Reporting
silence as "unverified, check it yourself" is the honest output, and it is the
one that does not quietly hide a job he could have had.

Pure functions, no network: ingest.py does the fetching.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from companies import citizenship_rule

Status = Literal["blocked", "no_sponsorship", "sponsors", "unknown"]

# What the feed's sponsorship field can say. Anything else is treated as
# silence, including its overwhelmingly common "Other".
FEED_BLOCKED = "U.S. Citizenship is Required"
FEED_NO_SPONSORSHIP = "Does Not Offer Sponsorship"
FEED_SPONSORS = "Offers Sponsorship"


@dataclass(frozen=True)
class Verdict:
    status: Status
    reason: str
    # Where the answer came from, so the UI can say how much to trust it.
    evidence: Literal["feed", "company", "none"]
    # Short code for the reason. The generated file stores one of these per
    # listing and the prose once, which is the difference between a 1.3 MB
    # download and a third of that.
    key: str


UNKNOWN = Verdict(
    status="unknown",
    reason="Nobody has said either way. Check the posting before you apply.",
    evidence="none",
    key="none",
)


def classify(company_name: str, sponsorship: str | None) -> Verdict:
    """
    Decide a listing's work-authorisation status.

    Order matters. The feed's explicit statement about this specific role beats
    a general rule about the employer, because the listing is more specific and
    more recent than anything written down here.
    """
    field = (sponsorship or "").strip()

    if field == FEED_BLOCKED:
        return Verdict(
            status="blocked",
            reason="The posting states US citizenship is required.",
            evidence="feed",
            key="feed-citizenship",
        )
    if field == FEED_SPONSORS:
        return Verdict(
            status="sponsors",
            reason="The posting states it offers sponsorship.",
            evidence="feed",
            key="feed-sponsors",
        )
    if field == FEED_NO_SPONSORSHIP:
        return Verdict(
            # Amber, not red. CPT is work authorisation a student already holds
            # through their university; it costs the employer no petition. A
            # company that will not sponsor an H-1B may still take a CPT intern,
            # so this is a question to ask, not a door that is closed.
            status="no_sponsorship",
            reason=(
                "The posting says it does not sponsor. CPT is not sponsorship, "
                "so ask - but expect to have to explain that."
            ),
            evidence="feed",
            key="feed-no-sponsorship",
        )

    rule = citizenship_rule(company_name)
    if rule is not None:
        return Verdict(
            status="blocked",
            reason=rule.reason,
            evidence="company",
            key=rule.key,
        )

    return UNKNOWN


def is_worth_applying(verdict: Verdict) -> bool:
    """
    The filter that matters: everything except a hard block. An unverified
    listing stays in, because the cost of checking one posting is far lower
    than the cost of never seeing a job you could have had.
    """
    return verdict.status != "blocked"


def reason_table() -> dict[str, str]:
    """Every reason string the classifier can produce, keyed by its code."""
    from companies import CITIZENSHIP_REQUIRED

    table = {
        "feed-citizenship": "The posting states US citizenship is required.",
        "feed-sponsors": "The posting states it offers sponsorship.",
        "feed-no-sponsorship": classify("x", FEED_NO_SPONSORSHIP).reason,
        "none": UNKNOWN.reason,
    }
    for rule in CITIZENSHIP_REQUIRED:
        table[rule.key] = rule.reason
    return table
