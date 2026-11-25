"""
Fetching and normalising the SimplifyJobs internship feed.

Source: https://github.com/SimplifyJobs/Summer2027-Internships
        .github/scripts/listings.json on the dev branch

The feed is a community-maintained JSON array of every listing the project has
ever tracked - around 17,700 records, of which roughly 5,000 are still active.
This module turns it into the much smaller shape the app needs and nothing more.

No third-party packages: urllib and json are enough, and a worker with no
dependencies is a worker that still runs in two years.
"""

from __future__ import annotations

import json
import time
import urllib.request
from dataclasses import dataclass, field
from typing import Any, Iterable

FEED_URL = (
    "https://raw.githubusercontent.com/SimplifyJobs/Summer2027-Internships"
    "/dev/.github/scripts/listings.json"
)

# The repository for a given summer appears about a year ahead. Summer 2028 -
# the cycle this whole app is pointed at - does not exist yet; when it does,
# this is the one line that changes.
FEED_SEASON = "Summer 2027"

USER_AGENT = "amos-career-path-internship-worker/1.0"

# The categories worth seeing. The feed also carries Hardware, Product and a
# few strays, which are not what any of these career paths lead to.
RELEVANT_CATEGORIES = {
    "Software",
    "Software Engineering",
    "Quant",
    "AI/ML/Data",
    "Data Science, AI & Machine Learning",
}

# Normalised onto these, because the feed uses two spellings for two of them.
CATEGORY_LABELS = {
    "Software": "Software",
    "Software Engineering": "Software",
    "Quant": "Quant",
    "AI/ML/Data": "AI / ML / Data",
    "Data Science, AI & Machine Learning": "AI / ML / Data",
}


@dataclass(frozen=True)
class Listing:
    id: str
    company: str
    title: str
    url: str
    category: str
    locations: tuple[str, ...]
    degrees: tuple[str, ...]
    terms: tuple[str, ...]
    posted: int
    sponsorship: str


@dataclass
class FetchReport:
    """What came back, so a run says what it saw rather than only what it kept."""

    total: int = 0
    active: int = 0
    kept: int = 0
    dropped_category: int = 0
    dropped_term: int = 0
    dropped_malformed: int = 0
    malformed_examples: list[str] = field(default_factory=list)


def fetch(url: str = FEED_URL, timeout: int = 120) -> list[dict[str, Any]]:
    """Download the feed. The only function here that touches the network."""
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=timeout) as response:
        if response.status != 200:
            raise RuntimeError(f"{url} returned {response.status}")
        payload = json.loads(response.read().decode("utf-8"))
    if not isinstance(payload, list):
        raise RuntimeError("feed is not a JSON array")
    return payload


def wanted_term(terms: Iterable[str]) -> bool:
    """
    Keep the cycles a sophomore can actually apply to now, plus the undated
    ones. "N/A" is a third of the feed and is mostly rolling postings, so
    dropping it would throw away real jobs.
    """
    for term in terms:
        if "2027" in term or "2028" in term or term == "N/A":
            return True
    return False


def _as_str_tuple(value: Any) -> tuple[str, ...]:
    if not isinstance(value, list):
        return ()
    return tuple(str(v) for v in value if isinstance(v, str) and v.strip())


def normalise(raw: list[dict[str, Any]]) -> tuple[list[Listing], FetchReport]:
    """
    Turn the feed into Listings, dropping what is inactive, off-category, in a
    cycle that has passed, or too broken to use. Counts every drop, because a
    silent filter is how a pipeline starts lying.
    """
    report = FetchReport(total=len(raw))
    kept: list[Listing] = []

    for record in raw:
        if not isinstance(record, dict):
            report.dropped_malformed += 1
            continue
        if not record.get("active") or not record.get("is_visible", True):
            continue
        report.active += 1

        category = record.get("category")
        if category not in RELEVANT_CATEGORIES:
            report.dropped_category += 1
            continue

        terms = _as_str_tuple(record.get("terms"))
        if not wanted_term(terms):
            report.dropped_term += 1
            continue

        identifier = record.get("id")
        company = record.get("company_name")
        title = record.get("title")
        url = record.get("url")
        if not all(isinstance(v, str) and v.strip() for v in (identifier, company, title, url)):
            report.dropped_malformed += 1
            if len(report.malformed_examples) < 5:
                report.malformed_examples.append(str(record.get("id")))
            continue
        if not str(url).startswith(("http://", "https://")):
            report.dropped_malformed += 1
            continue

        posted = record.get("date_posted")
        kept.append(
            Listing(
                id=str(identifier),
                company=str(company).strip(),
                title=str(title).strip(),
                url=str(url),
                category=CATEGORY_LABELS[str(category)],
                locations=_as_str_tuple(record.get("locations")),
                degrees=_as_str_tuple(record.get("degrees")),
                terms=terms,
                posted=int(posted) if isinstance(posted, (int, float)) else 0,
                sponsorship=str(record.get("sponsorship") or ""),
            )
        )

    report.kept = len(kept)
    # Newest first: a listing posted today is worth more than one from March.
    kept.sort(key=lambda listing: listing.posted, reverse=True)
    return kept, report


@dataclass(frozen=True)
class ListingGroup:
    """
    One opening as a human reads it, plus the other requisitions that are
    indistinguishable from it.

    Large employers post the same role once per team: Bandwidth has seven
    identical "Software Engineer Intern" rows in Raleigh, TikTok fourteen
    "Machine Learning Engineer Intern" in San Jose. They are real, separate
    requisitions with their own ids, so none is dropped - but seven identical
    rows is noise, not information. The newest stands for the group and the
    rest come along as extra links.
    """

    primary: Listing
    others: tuple[str, ...]

    @property
    def openings(self) -> int:
        return 1 + len(self.others)


def group_duplicates(items: list[Listing]) -> list[ListingGroup]:
    """
    Collapse listings that a reader cannot tell apart: same employer, same
    title, same places, same terms. Input order is preserved, so a newest-first
    list stays newest-first and the newest of each group leads it.
    """
    groups: dict[tuple[str, str, tuple[str, ...], tuple[str, ...]], list[Listing]] = {}
    order: list[tuple[str, str, tuple[str, ...], tuple[str, ...]]] = []

    for listing in items:
        key = (
            listing.company.casefold(),
            listing.title.casefold(),
            tuple(sorted(listing.locations)),
            tuple(sorted(listing.terms)),
        )
        if key not in groups:
            groups[key] = []
            order.append(key)
        groups[key].append(listing)

    return [
        ListingGroup(
            primary=groups[key][0],
            others=tuple(item.url for item in groups[key][1:]),
        )
        for key in order
    ]


def days_old(listing: Listing, now: float | None = None) -> int:
    """Whole days since posting; 0 for today and for anything undated."""
    if listing.posted <= 0:
        return 0
    seconds = (time.time() if now is None else now) - listing.posted
    return max(0, int(seconds // 86400))
