"""
Fetch the internship feed, classify every listing's work-authorisation status,
and write the file the app reads.

    python3 worker/ingest.py                  # fetch and write
    python3 worker/ingest.py --dry-run        # fetch, report, write nothing
    python3 worker/ingest.py --input f.json   # use a saved feed, no network

Output: public/data/internships.json

It is written to public/ rather than compiled into src/data/ because three
thousand listings are 800 KB. As a TypeScript module that is 800 KB of
JavaScript in the bundle; as a static file it is fetched once, cached, and
costs the rest of the app nothing. The app validates it on arrival rather than
trusting its own generator.
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from authorisation import classify, is_worth_applying, reason_table  # noqa: E402
from companies import CITIZENSHIP_REQUIRED  # noqa: E402
from listings import (  # noqa: E402
    FEED_SEASON,
    FEED_URL,
    ListingGroup,
    fetch,
    group_duplicates,
    normalise,
)

OUTPUT = Path(__file__).resolve().parent.parent / "public" / "data" / "internships.json"

SCHEMA_VERSION = 1


def to_record(group: ListingGroup) -> dict[str, object]:
    listing = group.primary
    verdict = classify(listing.company, listing.sponsorship)
    extra: dict[str, object] = (
        {"openings": group.openings, "more": list(group.others)}
        if group.others
        else {}
    )
    return {
        "id": listing.id,
        "company": listing.company,
        "title": listing.title,
        "url": listing.url,
        "category": listing.category,
        "locations": list(listing.locations),
        "degrees": list(listing.degrees),
        "terms": list(listing.terms),
        "posted": listing.posted,
        "status": verdict.status,
        "evidence": verdict.evidence,
        "reason": verdict.key,
        **extra,
    }


def build(raw: list[dict[str, object]]) -> tuple[dict[str, object], object]:
    items, report = normalise(raw)  # type: ignore[arg-type]
    groups = group_duplicates(items)
    records = [to_record(group) for group in groups]

    counts: dict[str, int] = {}
    for record in records:
        key = str(record["status"])
        counts[key] = counts.get(key, 0) + 1

    payload = {
        "version": SCHEMA_VERSION,
        "generatedAt": int(time.time()),
        "season": FEED_SEASON,
        "source": FEED_URL,
        "reasons": reason_table(),
        "counts": {
            "total": len(records),
            "byStatus": counts,
            "openings": sum(group.openings for group in groups),
            "worthApplying": sum(
                1
                for group in groups
                if is_worth_applying(
                    classify(group.primary.company, group.primary.sponsorship)
                )
            ),
        },
        "listings": records,
    }
    return payload, report


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", help="a saved feed, instead of fetching")
    parser.add_argument("--dry-run", action="store_true", help="report, write nothing")
    args = parser.parse_args()

    if args.input:
        raw = json.loads(Path(args.input).read_text(encoding="utf-8"))
    else:
        print(f"fetching {FEED_URL}")
        raw = fetch()

    payload, report = build(raw)
    counts = payload["counts"]  # type: ignore[assignment]

    print(f"  {report.total:6} records in the feed")           # type: ignore[union-attr]
    print(f"  {report.active:6} active")                        # type: ignore[union-attr]
    print(f"  {report.dropped_category:6} dropped, wrong category")   # type: ignore[union-attr]
    print(f"  {report.dropped_term:6} dropped, cycle has passed")     # type: ignore[union-attr]
    print(f"  {report.dropped_malformed:6} dropped, malformed")       # type: ignore[union-attr]
    print(f"  {report.kept:6} kept")                            # type: ignore[union-attr]
    print(f"  {counts['total']:6} rows after grouping duplicate requisitions")  # type: ignore[index]
    print()
    for status in ("blocked", "no_sponsorship", "sponsors", "unknown"):
        n = counts["byStatus"].get(status, 0)  # type: ignore[index]
        print(f"  {n:6} {status}")
    print(f"  {counts['worthApplying']:6} worth applying to")  # type: ignore[index]
    print(f"\n  {len(CITIZENSHIP_REQUIRED)} employers on the citizenship list")

    if args.dry_run:
        print("\ndry run: nothing written")
        return 0

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(payload, separators=(",", ":"), ensure_ascii=False),
        encoding="utf-8",
    )
    size = OUTPUT.stat().st_size
    print(f"\nwrote {OUTPUT.relative_to(OUTPUT.parent.parent.parent)} ({size // 1024} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
