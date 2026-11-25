# Decisions

Small calls made while building, so I do not have to re-derive them later.
Format: decision, then why.

## Phase 1 — scaffold, data model, seed data

**Data files live in `src/data/`, not a top-level `/data/`.**
The project uses the `src/` layout, so `@/data/skills` keeps one import alias for
everything and the data sits next to the code that reads it. File names and
exported types are exactly as specified.

**Next.js 16, React 19, Tailwind 4, Vitest 5.**
`create-next-app` pinned to 15.5.4 shipped with a high-severity `postcss` advisory
that is only fixed in Next 16, and the pinned Vitest 4 pulled in a critical
`tinypool` RCE advisory. Both were upgraded, so `npm audit` reports zero
vulnerabilities. `@types/node` moved to v24 to match the installed Node and
Vitest 5's peer range.

**`eslint-config-next` 16 flat config, `@eslint/eslintrc` removed.**
The scaffolded `FlatCompat` shim crashes under eslint-config-next 16, which ships
flat configs directly.

**Career paths list core skills only; the prerequisite closure is computed.**
`paths.ts` would otherwise repeat the whole dependency chain, and every edit to a
prerequisite would need a matching edit in up to nine paths. `pathSkillIds()` in
`src/lib/graph.ts` walks the closure instead, dependency-first.

**`Resource` has no `id` field, so resource identity is `skillId::url`.**
The spec's `Resource` shape is kept exactly as given. `resourceId()` in
`resources.ts` derives a stable key for the `resourcesWatched` checkboxes, so
correcting a title or creator does not lose a checkmark.

**A skill stored as `in_progress` or `done` keeps that status even if its
prerequisites are not done.**
Derived status only fills in `available` versus `locked`. If I deliberately start
something out of order, the app should not overrule me and call it locked.

**An `in_progress` prerequisite does not unlock anything.**
"Available when all prerequisites are **done**" is taken literally. Started is not
finished.

**`recommendedNext` ranks by *transitive* unlock count over the whole graph.**
"How many other skills they unlock" reads most usefully as total downstream
leverage, not just direct children. Ties break by the smaller hours estimate, then
by name, so the list is stable between renders.

**Pace returns `Infinity` rather than a negative number when the target date has
passed**, and sets `overdue: true`. The UI decides how to phrase that.

**Day keys and week keys are local time, weeks start on Monday.**
A study log should match the day I actually felt I was studying, not UTC.

**A day counts toward the streak if hours were logged *or* a resource was checked
off**, as specified. The current streak also tolerates today not being logged yet,
so the number does not read as broken at 9am.

**Import rejects an unknown `version` instead of merging what it can.**
Silently half-importing progress is worse than refusing the file.

**Link checker: oEmbed first, then the page as a second opinion.**
Four of the seeded YouTube links (SuperSimpleDev HTML/CSS, SuperSimpleDev
JavaScript, SuperSimpleDev React, Stanford CS229) return **401** from the oEmbed
endpoint. That is embedding being disabled by the uploader, not a dead video — all
four play fine on YouTube. So a non-200 from oEmbed falls back to fetching the page
and reading YouTube's own `playabilityStatus`, which does separate "cannot embed"
from "gone". Nothing is ever removed automatically; the script prints a table and
exits non-zero.

**97 skills, not exactly 90.**
Close to the target, and the extra few are DSA sub-topics and CS core breadth I did
not want to merge into vaguer nodes.

**Added `Monte Carlo & Numerical Methods` to the Quant domain** beyond the listed
fourteen, because one of the seeded resources (Quant Guild Library) covers Itô
calculus *and* Monte Carlo, and it had nowhere sensible to attach.
