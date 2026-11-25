# Internship worker

A dependency-free Python pipeline that turns a community job feed into the file
the Internships page reads.

```bash
python3 worker/ingest.py                      # fetch, classify, write
python3 worker/ingest.py --dry-run            # report only
python3 worker/ingest.py --input feed.json    # no network
python3 -m unittest discover -s worker/tests -t worker   # 46 tests
```

Output: `public/data/internships.json`

## Why Python, and why no packages

The classifying is data work, which is where Python belongs, and keeping it out
of the app means the browser downloads listings rather than the logic that
produced them. `urllib`, `json`, `re`, `dataclasses` and `unittest` are enough.
A worker with no dependencies is a worker that still runs in two years.

## The problem it actually solves

The source feed is
[SimplifyJobs/Summer2027-Internships](https://github.com/SimplifyJobs/Summer2027-Internships),
about 17,700 records of which roughly 5,000 are active.

It carries a `sponsorship` field. On the run this was written against, that
field said something useful for **14 of 5,066 active listings** — the rest are
`"Other"`. Not one of the 5,000 titles mentions a clearance, ITAR or
citizenship, and the feed carries no description text. So there is nothing to
keyword-match on, and any classifier that claims confidence here is inventing
it.

What is actually knowable is the **employer**. Cleared and export-controlled
work is a property of the company, not of the advert, and it is stable enough
to write down and review. `companies.py` is that list: 38 employers — defence
primes, FFRDCs and national labs, ITAR hardware — each with the reason, which
is shown in the UI verbatim so the claim can be checked rather than trusted.

## The four answers

| Status | Meaning | Where from |
|---|---|---|
| `blocked` | Citizenship or a clearance is effectively required | the feed, or the company list |
| `no_sponsorship` | The posting says it does not sponsor | the feed |
| `sponsors` | The posting says it does | the feed |
| `unknown` | Nobody has said | nowhere, and that is the point |

Two decisions worth stating:

**`no_sponsorship` is amber, not red.** CPT is work authorisation a student
already holds through their university; it costs the employer no petition. A
company that will not sponsor an H-1B may still take a CPT intern, so that is a
question to ask, not a door that is closed.

**`unknown` stays in the list.** Around 96% of listings land here. Hiding them
would make the page look decisive and cost real jobs. The cost of checking one
posting is far lower than the cost of never seeing it.

The app layers one more thing on top that the worker cannot know: a personal
CPT verdict per company, recorded once and inherited by every future posting
from that employer. It overrides anything decided here.

## Matching company names is the whole trick

An early version matched with `"saic" in name.lower()` and declared **Mosaic**
and **RosaicLabs** defence contractors. `normalise()` lowercases, strips
punctuation and drops corporate suffixes, and matching is exact on that form.
A test pins both false positives, and another fails if a redundant alias is
added — if `normalise()` already gets there, the alias is noise.

`src/lib/internships.ts` reimplements `normalise()` in TypeScript so a verdict
recorded in the app matches the employer the worker decided about. A test in
the app checks the two against a table of answers produced by this module.

## Duplicate requisitions

Large employers post one requisition per team: seven identical Bandwidth
"Software Engineer Intern" rows in Raleigh, fourteen TikTok ML rows in San
Jose. They are real and separate, so none is dropped — but seven identical rows
is noise. `group_duplicates` folds listings that a reader cannot tell apart
(same employer, title, places and terms), keeps the newest as the row, and
carries the rest along as extra links. That turned 2,996 rows into 2,815.

## Files

| | |
|---|---|
| `companies.py` | the curated employer rules and `normalise()` |
| `authorisation.py` | the classifier — pure functions, no network |
| `listings.py` | fetching, normalising, grouping |
| `ingest.py` | the entry point that writes the app's file |
| `tests/` | 46 tests, `unittest`, no framework |

## What it deliberately does not do

**It does not scrape job descriptions.** That would mean thousands of requests
to employers' sites for a marginal gain, and it is rude.

**It does not notify.** "First to know" needs a backend — something running on
a schedule, somewhere to remember what has been seen, and a way to reach you.
The app does the honest offline version instead: it remembers when you last
opened the page and marks what is new since.

**It does not guess about sponsorship from H-1B data.** The US Department of
Labor publishes LCA disclosure files, which would let a future version mark
known sponsors with a real citation. Until that is actually ingested, claiming
to know would be fiction.

## The season

`FEED_SEASON` in `listings.py` is `Summer 2027`. Summer 2028 — the cycle this
whole app points at — has no repository yet; it appears about a year ahead.
When it does, that constant and `FEED_URL` are the only lines that change.
Summer 2027 is not a placeholder in the meantime: those roles are open now and
a sophomore can apply to them.
