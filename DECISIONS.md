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

## Phase 3 — Dashboard

**The chart gets its own hue, `--chart-series: #2d9fd4`.**
The UI accent `#38bdf8` sits at OKLCH lightness 0.75, above the 0.48–0.67 band a
data mark needs to stay readable on this dark surface — the palette validator
fails it. `#2d9fd4` passes the lightness band and clears 3:1 contrast against the
card surface. The accent stays as it is for buttons and links, which are text and
UI, not data.

**Hours per week is a column chart, not a line.**
Weekly totals are discrete buckets with plenty of empty weeks; a line would draw
a slope between two weeks that never happened. Columns are capped at 24px with a
2px gap, hairline grid, no legend (one series), and only the best week is labelled
directly — the rest is in the hover tooltip and the table view behind the "Table"
button.

**Domain and path progress are meter lists, one hue.**
The bar encodes a ratio against that row's own total, which is a magnitude job, so
every bar is `--chart-series`. The domain's own colour appears as a dot beside the
name — identity next to the mark, not in it. Ten domain hues as data marks would
fail CVD separation.

**Four headline numbers are stat tiles, not a bar chart.**
Overall %, done, unlocked now and in progress are unrelated measures on different
scales. The countdown is the hero figure, since it is the one number the page is
really about.

**Anything that depends on "now" or on saved progress renders `—` until
hydration.**
The countdown, the pace, the streak and the chart all read the clock or
localStorage, neither of which the server can know. Cards keep fixed heights and
the lists keep min-heights, so the values fill in without the layout moving.

**Finished skills with no proof link are shown, not hidden.**
This is the list resume bullets come from, so an empty row with an "add a link"
button is more useful than a shorter, tidier list.

**Deep links: `/?skill=<id>` opens that skill in the Atlas.**
Read with `useSearchParams` and used as the selection until the session picks its
own, so no effect writes state on mount. The Atlas page is wrapped in `Suspense`
to keep the rest statically rendered.

**The path chips appear on both pages** and write to the same persisted setting,
so changing the path on the dashboard changes what the Atlas highlights.

## Phase 4 — Notes, settings, export and import

**Notes render through a hand-written markdown subset, not a library.**
`src/lib/markdown.ts` parses to a tree of plain objects and `<Markdown>` turns
that into React elements. Nothing ever becomes an HTML string, so there is no
`dangerouslySetInnerHTML` and no injection surface — worth more for notes than
full CommonMark coverage. Supported: `#`/`##`/`###`, `-` and `1.` lists, `>`
quotes, ``` fences, `---`, `**bold**`, `*italic*`, `` `code` `` and links.

**Link hrefs are filtered at parse time.**
Only `http:`, `https:`, `mailto:` and in-app absolute paths survive; anything
else — `javascript:`, `data:`, protocol-relative `//host` — stays literal text.
Tested directly, because this is the one place a note could do damage.

**Notes have Write and Preview tabs** rather than a live split pane. The panel is
26rem wide; two columns there would make both unreadable.

**Import replaces, it never merges.**
Merging two progress files raises questions with no good answer — whose
`completedAt` wins, do hours add up. Replacing is predictable, and the UI says so
before you pick a file. A file that fails validation changes nothing at all,
which is covered by a test.

**Reset confirms inline, not with `window.confirm`.**
The inline prompt names what is about to go ("Delete 12 skills and 30 logged
days?"), which a browser dialog cannot do, and it matches the rest of the UI.

**The recruiting date only commits when it parses.**
`isValidDayKey` lives in `src/lib/dates.ts` and is tested; a half-typed date in
the picker never reaches the store, so the countdown cannot show `NaN`.

**Export is a plain download of exactly what is in storage**, pretty-printed and
named with today's date. A round-trip test takes a populated store through
`exportState` → JSON → `importState` and asserts every field survives.
