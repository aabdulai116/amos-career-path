# Roadmap

Everything asked for on this project, what state it is in, and what is waiting on
a decision. This file is the record — it gets updated in the same commit as the
work it describes, so the checkbox and the code can never drift apart.

**Status key:** `[x]` shipped · `[~]` partly done · `[ ]` not started ·
`[!]` blocked or needs a decision · `[–]` declined, with the reason

Last updated: 25 November 2026 · 50 commits · 235 TS tests + 72 C++ checks · branch `main`

---

## Shipped

### Phase 1 — Foundation
- [x] Next.js 16 App Router + TypeScript (`strict`, no `any`) + Tailwind v4
- [x] React Flow (`@xyflow/react`) with `dagre` layout
- [x] Zustand store persisted to `localStorage`
- [x] Lucide icons, dark theme by default
- [x] Vitest set up
- [x] Content in typed data files: `domains.ts`, `skills.ts`, `paths.ts`, `resources.ts`
- [x] Progress stored separately from content, so editing content never wipes it
- [x] 10 domains including the new **Math** and **Quant**
- [x] 97 skills with prerequisites and one-sentence summaries
- [x] **C++ Fundamentals** and **Modern C++ & Performance** added to Programming
- [x] All 15 Quant skills, incl. Monte Carlo added beyond the original 14
- [x] 9 career paths, incl. **Quant Trader / Researcher / Developer**
- [x] Resource library seeded from the supplied links only — no invented URLs
- [x] `scripts/check-links.ts` + `npm run check:links` — **42/42 links verified live**
- [x] Tests: status computation, cycle detection, path maths, recommendation order

### Phase 2 — Atlas
- [x] Pan, zoom, minimap, fit view
- [x] Search with `/` shortcut, arrow keys, Enter to jump
- [x] Domain filter chips and career-path filter chips (they intersect)
- [x] Path selection dims everything off the path
- [x] Nodes show name, domain colour, status, and a resource progress bar
- [x] Side panel: summary, clickable prerequisites and unlocks, resources grouped
      beginner → intermediate → advanced with checkboxes, notes, proof link,
      hours logged, Mark done
- [x] Edges animate once a prerequisite is finished
- [x] Locked skills remain fully readable

### Phase 3 — Dashboard
- [x] Countdown to recruiting (1 Aug 2027) and the pace needed to finish in time
- [x] Overall %, skills done, unlocked now, in progress — scoped to the chosen path
- [x] Recommended next, ranked by how many skills each one unlocks
- [x] Progress by domain and by career path
- [x] Weekly hours chart, streak counter, table view
- [x] Proof-of-work list, newest first, flagging entries with no link yet

### Phase 4 — Notes, settings, data
- [x] Markdown notes with Write / Preview (hand-written safe parser, no HTML injection)
- [x] Proof links, hours log, streak
- [x] Export progress as JSON · import · reset with inline confirm
- [x] Editable recruiting target date

### Phase 5 — Release readiness
- [x] README: features, tech stack, how to add a skill / domain / path / resource
- [x] Real screenshots in `docs/screenshots/`
- [x] Vercel deploy instructions, both dashboard and CLI
- [x] Mobile fixes, keyboard path verified, app icon, metadata, `noindex`
- [x] Repo public at github.com/aabdulai116/career-compass, commits authored by you only

### Phase 7 — C++ order book (WebAssembly)
- [x] Price-time priority matching engine in C++20, 293 lines, no dependencies
- [x] Limit and market orders, cancel, multi-level sweeps, partial fills
- [x] 72 native assertions, clean under `-Wall -Wextra -Wpedantic` — `npm run test:engine`
- [x] Compiled to WebAssembly with Emscripten + embind — `npm run build:engine`
- [x] Typed TypeScript bridge, no wasm details leaking into React
- [x] Depth ladder, live stats, order entry, trade tape, imbalance bar
- [x] Market-making game on top of the engine — quote, get filled, manage inventory, scored on adverse selection

### Phase 15 — ready for other people, shipped
- [x] Error, crash and 404 pages — a thrown error showed a blank white page
- [x] Generated social preview card, so a shared link does not look suspicious
- [x] Site is findable now (robots index was off)
- [x] First-run bar pointing newcomers at the intake instead of the Atlas wall
- [x] Feedback link that opens a prefilled issue with the page and browser
- [x] Renamed to CareerCompass, GitHub repo renamed to career-compass

### Phase 14 — onboarding, opportunities, privacy and scale, shipped
- [x] **Start here**: a six-question intake that suggests a path and five
      first skills, for people who do not know what they want yet
- [x] **Opportunities**: 20 insight days, early programmes and conferences,
      all links verified, with deadlines you record rather than ones I guessed
- [x] **Privacy page** saying exactly what is stored and what is not
- [x] **Sync writes only what changed** — an idle sync now writes 0 rows
      instead of 531, measured
- [x] Rate limiting on /api/sync, per user
- [x] Nav scrolls on a phone now there are ten destinations

### Phase 13 — accounts, sync and CI, shipped
- [x] Sign in with Google (Auth.js v5), no passwords
- [–] **Microsoft sign-in** — code is ready, but Microsoft now requires a paid
      Azure account to register an app at all, university tenants refuse
      students, and registering in someone else's directory is not ours to do.
      Costs almost nothing to skip: Outlook users sign in with Google
- [x] Neon Postgres with Drizzle, twelve tables, migrations committed
- [x] Sync: one endpoint, server-side merge, last-write-wins per record
- [x] A Zustand middleware that timestamps changed records in one place
- [x] Works entirely signed out — no account needed to use the whole app
- [x] First sign-in adopts whatever the browser already had
- [x] Account deletion that cascades to every row
- [x] Integration tests against Postgres in-process (PGlite), no services
- [x] **GitHub Actions CI** — typecheck, lint, 463 TS tests, 46 Python tests,
      72 C++ assertions, build, and the link check on main
- [x] CI badge in the README (two green runs)
- [ ] Tombstones, so a deletion on one device is not undone by a stale one

### Phase 11 — course practice and priorities, shipped
- [x] A priority on all 102 days — core, useful or skim — each with a line on
      why, judged against software engineering, AI and quant
- [x] Hours remaining per priority class, and a "next core day" pointer, so the
      signal is actionable rather than decorative
- [x] Filter the day list by priority
- [x] 205 practice exercises, two or three per day: core days get three, skim
      days get one
- [x] A Python editor on every runnable exercise, sharing the practice page's
      interpreter; packages load on demand so pandas, NumPy, matplotlib,
      scikit-learn and sqlite3 all work
- [x] Exercises that need a window, a browser or the network are marked, not
      faked
- [x] Time and space complexity recorded per NeetCode problem, shown on the
      collapsed row for revision

### Phase 6 — 100 Days of Code tracker
- [x] All 102 sections as data — titles, lecture counts, run times (sums to 57hr ✓)
- [x] Mark a day watched, with "up next" and progress by track
- [x] **A practice project for every one of the 100 days**, distinct from the
      course's own build for that day
- [x] Per-day notes, repo link, and a saved Udemy lecture link
- [x] Flow is: watch on Udemy → come back → record it here

---

## Next up

### Internships — Phase 12, shipped
- [x] Roles listed by category from the verified SimplifyJobs feed, newest first
- [x] **A Python worker** (`worker/`, no dependencies) that fetches, classifies
      and writes the page's data; 46 tests
- [x] **The CPT work-authorisation filter**, built on what the data can actually
      support: the feed states a position for 14 of 5,066 active listings, and
      no title mentions a clearance, so the worker rules out 38 employers where
      citizenship is effectively a precondition and marks the rest unverified
- [x] **A personal CPT verdict per company**, recorded once and inherited by
      every future posting from that employer, overriding the generated answer
- [x] Filters: category, recency, degree, search, and my own stage
- [x] Saved / applied / interview / offer / rejected tracking, with notes
- [x] Duplicate requisitions grouped — 2,996 rows became 2,815, nothing dropped
- [x] Plain-http application forms flagged, since that is where personal
      details get typed
- [~] **"First to know" notifications** — still needs a backend. Shipped the
      honest offline version instead: the page remembers when you last opened
      it and marks what is new since. Real push needs a scheduler, storage and
      a delivery channel. *Still needs a decision on the stack.*
- [ ] Known-sponsor marking from the US Department of Labor's LCA disclosure
      files, which would let a listing cite a real filing rather than a guess

### LeetCode & NeetCode — Phase 10, shipped
- [x] All eighteen patterns, in NeetCode's own order, because the order is the
      curriculum
- [x] Every problem links out to LeetCode; the seven Premium ones link to the
      free mirror NeetCode publishes instead
- [x] Every problem badged **Blind 75** where it is one, and the whole list
      switchable between NeetCode 150 and Blind 75 — the stats rescope with it
- [x] Per-problem: notes, your own solution, sittings, minutes, a
      "needed the walkthrough" flag, time and space complexity, and links to
      NeetCode's video and solution
- [x] **In-browser code runner** — Pyodide, real CPython 3.14 via WebAssembly,
      in a Web Worker, no backend
- [x] **Spaced review queue** — a problem you needed the walkthrough for comes
      back in 7 days, a second-sitting solve in 21, a clean first solve in 45.
      Most overdue first
- [x] Filters: scope, status, difficulty, pattern, title search
- [x] Data generated from NeetCode's own published problem file, so no slug or
      video id is hand-typed — `npm run sync:problems`
- [!] **Company tags** — LeetCode sells these as Premium, so I will not scrape
      them. Two routes: you tag as you go, or you point me at a public
      community dataset and I import it labelled as community-sourced.
      *Still needs your choice.*
- [x] Problem statements stay on LeetCode — that text is theirs, so each row
      carries metadata plus your work, and a button to open the real thing
- [ ] A test harness with per-problem cases. Deliberately not built: the real
      cases live on LeetCode, and cases I invent only check my own assumptions.
      The runner executes whatever you write, asserts included

### Opportunities
- [x] Insight days and spring/early-insight programmes
- [x] Fully funded conferences for SWE and quant
- [x] Deadline countdowns — on dates you record, not ones invented here
- [x] Curated by hand — there is no API for these, and the page says so
- [!] **Scheduled "look for opportunities" task** — you mentioned you already had
      one; I checked this machine and there are none. *Say the word and I'll create it.*

---

## Waiting on you
- [ ] **Deploy to Vercel** — `npx vercel`, needs your login so it has to be you
- [x] **Google OAuth registered**, verified end to end: a real sign-in wrote
      your account and progress to Neon
- [–] **Microsoft Entra** — blocked by Microsoft, see docs/SETUP.md
- [x] **Neon database created**, 13 tables migrated, zero drift against the
      committed migrations
- [x] **"Why I built this" written** — Amos's own reason: arriving with no
      club, no list and no one to ask, and wanting the next first-year to
      have the map he did not

---

## Declined, and why
- [–] **Mirroring the Udemy course** onto the platform. Re-hosting Dr. Angela Yu's
      videos, transcripts or exercises is copyright infringement and breaks
      Udemy's terms; buying the course licenses you to watch it, not republish it.
      On a public repo it also invites a DMCA notice against your name.
      **Replaced by** the Phase 6 tracker, which holds structure, your notes, your
      projects and your progress, and sends you to Udemy to watch.
- [–] **Scraping LeetCode Premium company tags.** Paywalled data; see the route above.

---

## Skills this project is built to demonstrate

The aim is breadth that is **load-bearing** — every technology here is present
because a feature genuinely needs it, not because it looks good in a list. An
interviewer who asks "why Postgres here?" should get an answer about the problem,
not about the CV.

### Proven today

| Skill area | Where it shows |
|---|---|
| TypeScript, `strict`, no `any` | 9,700 lines across 49 files |
| React 19 / Next.js App Router | Three routed pages, server and client split |
| **Graph algorithms** | Cycle detection, topological sort, transitive closure, prerequisite closure — all hand-written and tested |
| **Layout algorithms** | dagre for rank, custom greedy row-packing for domain bands |
| Data visualisation + a11y | Palette validated against CVD and contrast, not eyeballed |
| **Parser writing** | Markdown subset parsed to a tree, no `dangerouslySetInnerHTML` |
| Security thinking | href scheme allowlist, XSS-safe rendering by construction |
| State & persistence | Zustand, schema validation on import, forward-compatible state |
| Testing | 197 unit tests, including data-integrity tests that fail the build |
| Tooling / DX | Link checker that distinguishes "embedding disabled" from "dead" |

### The gap

The repo is **99.2% TypeScript**. For someone targeting software engineering, AI
*and* quant, a single-language frontend project tells one third of the story. The
three additions below each close a gap **and** are needed by the roadmap anyway.

### Planned, load-bearing additions

**1. Work-authorisation classifier — Python, NLP, data engineering** *(AI gap)*

I measured the obvious approach and it failed: 5,056 of 5,070 active listings
leave the sponsorship field as `Other`. The signal only exists in the job
description prose. So the CPT filter has to read the text — fetch the posting,
extract work-authorisation statements, classify into *citizenship required /
no sponsorship / CPT acceptable / silent*, and report a confidence.

This is the strongest story in the whole project: the naive approach was tried,
*measured*, shown not to work, and replaced with something that does.

Carries: Python, text classification, evaluation against a hand-labelled set,
precision/recall trade-offs where a false negative costs a real opportunity.

**2. Ingestion worker — Python, scheduling, data pipeline** *(backend gap)*

Poll the feed, normalise, dedupe against what has been seen, detect genuinely new
postings, write to a database, trigger notifications. Idempotent, because a cron
job that double-notifies is worse than one that misses.

Carries: Python, Postgres schema design and indexing, cron, idempotency, change
detection, structured logging, Docker for the worker.

**3. Order-book matching engine — C++ compiled to WebAssembly** *(quant gap)* — **SHIPPED**

The Quant Developer path on the Atlas is Low Latency C++ and Market
Microstructure, and the project currently proves neither. A price-time priority
matching engine in C++, compiled to WASM, running in the browser, with a
visualiser and a market-making game on top.

It is load-bearing: the engine has to process order flow fast enough to stay
smooth, which is the actual reason to reach for C++ and WASM. It is also already
on the plan — Day 89 and Day 95 of the course tracker.

Carries: modern C++, WebAssembly, performance measurement, and market
microstructure as a *demonstrated* understanding rather than a line on a CV.

**4. Pyodide code runner — WebAssembly, sandboxing** *(done, Phase 10)*

Real CPython 3.14 in the browser for the practice page, in a Web Worker so a
runaway loop can be killed without taking the tab with it.

**5. CI/CD — GitHub Actions** *(cheap, visible)*

Run typecheck, lint, tests and the link checker on every push. A green badge on
the README is the single clearest signal that the tests are real.

### What this makes the language bar say

TypeScript · **Python** · **C++** — three languages, each earning its place.
That is the diversity a recruiter sees before reading a word.

### Presentation
- [x] README rewritten for phases 6–9, with a "what this demonstrates" section and
      screenshots of the course tracker, the order book and the game
- [ ] Consider a small monorepo (`apps/web`, `services/ingest`, `packages/engine`)
      so the structure itself shows the range
- [x] README and screenshots extended for the practice page (Phase 10)
- [x] GitHub Actions running every suite on push (Phase 13)
- [x] CI badge (added once runs went green)

---

## Ideas parked for later
*Nothing yet — tell me an idea and it lands here with a date.*

---

## Decisions log
Non-obvious engineering choices live in [DECISIONS.md](DECISIONS.md), one section
per phase.
