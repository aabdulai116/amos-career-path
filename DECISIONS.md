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

## Phase 2 — Atlas

**Layout: dagre for x, domain bands for y.**
dagre with `rankdir: "LR"` decides horizontal position, so a skill always sits to
the right of everything it depends on. Left on its own, dagre interleaves the
domains and the map becomes unreadable, so vertical position is reassigned into
one band per domain, in the order domains are declared. Inside a band, nodes are
greedily packed into the fewest rows where none overlap horizontally.

**Filters dim, they never hide.**
Domain chips, path chips and search all narrow the same way: matching skills stay
at full strength and everything else drops to 22% opacity. Hiding nodes would make
the map's shape change under me every time I typed, and dangle the edges that
cross into a hidden domain. Domain and path filters intersect, they do not union.

**Nodes declare `width` and `height` instead of being measured.**
React Flow otherwise measures them on a second pass, which both shifts the first
paint and — less obviously — makes the minimap draw nothing at all, because it
only renders nodes that already have dimensions.

**`skipHydration` plus an explicit `useHydrateProgress()` hook.**
Zustand's persist middleware normally reads localStorage at import time, which
makes the first client render disagree with the server's. The store now skips
that and a hook rehydrates after mount, so hydration is clean and saved progress
appears a frame later.

**Status never changes implicitly, so `SkillProgress.status` is optional.**
Ticking a resource or typing a note used to create a progress entry defaulted to
`in_progress`, which meant jotting a thought on a locked skill reported it as
started. Activity is now recorded without claiming a status; only the Start and
Mark done buttons set one. Absent means "derive from prerequisites".

**The path chip's tagline is shown as text, not a `title` tooltip.**
As a `title` it became the button's accessible name, so a screen reader announced
the tagline instead of "Quant Trader". The selected path's tagline now sits under
the chip row where everyone can read it.

**The map opens at a readable zoom, not `fitView`.**
97 skills over ten bands is far taller than one screen, so fitting the whole thing
opens it at a zoom where no label is legible. It opens top-left at 0.8 instead;
"fit view" is one click away in the controls.

**The side panel overlays the canvas rather than pushing it.**
Pushing would resize the React Flow viewport and move every node sideways each
time a skill is opened.

**Atlas is `/`.** It is the page I will actually open. Dashboard and Settings are
stubs until phases 3 and 4.
