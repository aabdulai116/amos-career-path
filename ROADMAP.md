# Roadmap

Everything asked for on this project, what state it is in, and what is waiting on
a decision. This file is the record — it gets updated in the same commit as the
work it describes, so the checkbox and the code can never drift apart.

**Status key:** `[x]` shipped · `[~]` partly done · `[ ]` not started ·
`[!]` blocked or needs a decision · `[–]` declined, with the reason

Last updated: 25 November 2026 · 37 commits · 197 tests · branch `main`

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

### LeetCode & NeetCode
- [ ] NeetCode section, by pattern, in NeetCode's own order
- [ ] LeetCode section
- [ ] Every problem badged **Blind 75** or **NeetCode 150** so you can see which
      is which, exactly as you asked
- [ ] Per-problem: your notes, your solution, attempt history, link out
- [ ] **In-browser code runner** — Pyodide, real CPython via WebAssembly, no
      backend, with a test harness so you see cases pass or fail
- [!] **Company tags** — LeetCode sells these as Premium, so I will not scrape
      them. Two routes: you tag as you go, or you point me at a public
      community dataset and I import it labelled as community-sourced.
      *Needs your choice.*
- [ ] Problem statements stay on LeetCode — that text is theirs, so each card
      carries metadata plus your work, and a button to open the real thing

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

## Ideas parked for later
*Nothing yet — tell me an idea and it lands here with a date.*

---

## Decisions log
Non-obvious engineering choices live in [DECISIONS.md](DECISIONS.md), one section
per phase.
