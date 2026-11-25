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
- [x] Repo public at github.com/aabdulai116/amos-career-path, commits authored by you only

### Phase 7 — C++ order book (WebAssembly)
- [x] Price-time priority matching engine in C++20, 293 lines, no dependencies
- [x] Limit and market orders, cancel, multi-level sweeps, partial fills
- [x] 72 native assertions, clean under `-Wall -Wextra -Wpedantic` — `npm run test:engine`
- [x] Compiled to WebAssembly with Emscripten + embind — `npm run build:engine`
- [x] Typed TypeScript bridge, no wasm details leaking into React
- [x] Depth ladder, live stats, order entry, trade tape, imbalance bar
- [x] Market-making game on top of the engine — quote, get filled, manage inventory, scored on adverse selection

### Phase 6 — 100 Days of Code tracker
- [x] All 102 sections as data — titles, lecture counts, run times (sums to 57hr ✓)
- [x] Mark a day watched, with "up next" and progress by track
- [x] **A practice project for every one of the 100 days**, distinct from the
      course's own build for that day
- [x] Per-day notes, repo link, and a saved Udemy lecture link
- [x] Flow is: watch on Udemy → come back → record it here

---

## Next up

### Internships
- [ ] Internships section with roles listed by category
- [ ] Data source: `SimplifyJobs/Summer2027-Internships` — **verified working**,
      17,723 listings / 5,070 active / 2,238 Summer 2027 / 229 Quant / 1,555 Software
- [ ] **Work-authorization filter** to your rule:
  - exclude *U.S. citizenship required* and anything naming a clearance — CPT cannot fix those
  - keep but flag amber *Does Not Offer Sponsorship* — that is about future H-1B, not CPT
  - keep and mark unverified anything silent — your "I'll find out myself" bucket
- [!] **The sponsorship field is 99.7% silent** (5,056 of 5,070 say `Other`), so the
      filter alone does nothing. Plan: add a **personal CPT verdict per company**
      that you set once and every future role from that company inherits, plus a
      keyword scan for clearance language. *Needs your yes before I build it.*
- [ ] Filters: category, term, location, degree, posted-within
- [!] **"First to know" notifications** — needs a backend: Vercel Cron + a store
      for what you have already seen + email or push. This is the step where the
      app stops being purely static. *Needs a decision on the stack.*
- [ ] Saved / applied / rejected tracking per role

### LeetCode & NeetCode — Phase 10, shipped
- [x] All eighteen patterns, in NeetCode's own order, because the order is the
      curriculum
- [x] Every problem links out to LeetCode; the seven Premium ones link to the
      free mirror NeetCode publishes instead
- [x] Every problem badged **Blind 75** where it is one, and the whole list
      switchable between NeetCode 150 and Blind 75 — the stats rescope with it
- [x] Per-problem: notes, your own solution, sittings, minutes, a
      "needed the walkthrough" flag, and links to NeetCode's video and solution
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
- [ ] Insight days and spring/early-insight programmes
- [ ] Fully funded conferences for SWE and quant
- [ ] Deadline countdowns on each
- [ ] Curated by hand — there is no API for these, and I would rather say so
      than pretend otherwise
- [!] **Scheduled "look for opportunities" task** — you mentioned you already had
      one; I checked this machine and there are none. *Say the word and I'll create it.*

---

## Waiting on you
- [ ] **Deploy to Vercel** — `npx vercel`, needs your login so it has to be you
- [ ] **Rewrite "why I built this" in the README** — my text is a marked placeholder
- [ ] Push the 4 unpushed commits (phase 6)

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
- [ ] CI badge, test count, and a one-line "what this demonstrates" at the top

---

## Ideas parked for later
*Nothing yet — tell me an idea and it lands here with a date.*

---

## Decisions log
Non-obvious engineering choices live in [DECISIONS.md](DECISIONS.md), one section
per phase.
