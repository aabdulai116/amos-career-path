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

## Phase 5 — README, polish, deploy

**Nav collapses to icons below `sm`.**
At 375px the wordmark wrapped onto three lines and "Settings" fell off the right
edge. Labels are now `sr-only sm:not-sr-only`, so they leave the screen but stay
in the accessibility tree.

**Filter chips scroll sideways on a phone instead of wrapping.**
Wrapped, the two chip rows took roughly 400px of an 812px viewport and left the
graph a sliver. Scrolling keeps the bar at about 150px. The minimap is hidden
below `sm` for the same reason — on a phone it covered most of the canvas.

**`robots: { index: false }`.**
This is a personal tracker, not something that should turn up in a search for my
name. Remove it if the deployed copy is ever meant to be found.

**Screenshots are real, not placeholders.**
`docs/screenshots/` holds captures of the running app with sample progress, and
the README says how to replace them. A portfolio repo whose README shows grey
boxes undersells the thing.

**Keyboard path through the Atlas, verified end to end:** focus a node, Enter
opens the panel, focus moves into it, Escape closes it and focus returns to the
node it came from. The search box is the other way in — `/` focuses it, arrows
move through results, Enter jumps.

## Phase 6 — 100 Days of Code tracker

**Structure only, never the content.**
`src/data/course.ts` holds section titles, lecture counts and run times — facts
about the course, the same things Udemy's own public curriculum page shows. None
of Dr. Angela Yu's lectures, transcripts or exercises are reproduced. The flow is:
watch on Udemy, come back, record the day. The transcribed run times sum to 57
hours, which matches the figure Udemy advertises — a useful check that the
transcription is right, and a test asserts it.

**Every day carries a practice project of my own.**
Deliberately *different* from the course's build for that day: day 7 is Hangman
in the course, so the practice build is a category word-guess; day 22 is Pong, so
the practice build is Breakout. Same skill, second rep, and a repo link field so
each one can become a proof-of-work entry. The later portfolio days point at
things this platform or the quant track actually needs — an order book viewer, a
market-making game, a multi-board job poller.

**Marking a day watched does not log hours.**
It credits the streak, but watch speed is mine to know — a 1hr 12min section at
1.5x is 48 minutes. The day's run time is shown and hours stay a deliberate entry
on the skill side.

**Lecture deep links are pasted, not generated.**
Udemy lecture URLs carry opaque ids that cannot be derived from a section number.
Each day has a field to save its link the first time you open it; until then the
button goes to the course page.

**`course` was added to the persisted state without a version bump.**
`parseProgressState` defaults it to `{}`, so a JSON file exported before this
phase still imports cleanly.

## Phase 7 — C++ order book compiled to WebAssembly

**Integer ticks, never floating point.**
Prices are `int64` ticks of one cent and quantities are integers. Two orders at
"the same price" must compare equal for price-time priority to mean anything,
and `0.1 + 0.2` does not. Every float bug in a matching engine starts here.

**Price priority from the map, time priority from the deque.**
Bids are a `std::map` ordered descending and asks ascending, so `begin()` is
always the top of book. Each price level holds a `std::deque<Order>`, so the
order resting longest at a price fills first. An `unordered_map` from order id
to its level makes cancel O(1) to find.

**Trades print at the maker's price.**
A buy limit at 105 hitting a resting ask at 100 trades at 100. The resting order
set the terms; the taker crossed to it. Tested explicitly, because getting this
backwards is a classic error.

**A market order's unfilled remainder is cancelled, not rested.**
That is what an exchange does when the book runs dry, and it is why `submit()`
takes an `allowResting` flag rather than duplicating the matching loop.

**The engine knows nothing about JavaScript.**
`order_book.hpp` is plain C++ with no Emscripten include, so it compiles and
tests natively — 72 assertions, no framework, a non-zero exit code is the whole
contract. `bindings.cpp` is the only file that touches embind. That split is
what makes `npm run test:engine` possible without a browser.

**int64 narrows to double at the boundary.**
JavaScript numbers are doubles, so the binding layer converts. Ticks and lot
sizes stay far inside double's exact integer range, and the alternative — BigInt
across embind — would make the JS side unpleasant for no real gain here.

**The .wasm artifact is committed.**
Normally build output does not belong in git, but Vercel has no Emscripten, so
an uncommitted artifact means a broken page in production. `npm run build:engine`
regenerates it; `engine/build/` (the native test binary) stays ignored.

**Bid green and ask red sit in the CVD floor band.**
The validator puts the pair at ΔE 7.1 for deutan, which is only legal with
secondary encoding. So the ladder labels each side in text and separates them
spatially around the spread — the colour is a convention on top, never the only
signal.

**Verified in the browser, not just in tests.** A market buy of 10 against a
seeded book filled at 100.05, the best ask, leaving the rest of that level
resting.

## Phase 8 — The Learn panel

**Lesson content is data, not JSX.**
`src/lib/orderbook-lessons.ts` holds the explainer so it can be tested. Two of
those tests are worth more than they look: one checks the sweep demo really is
bigger than the cheapest level but smaller than everything it can reach, so it
genuinely demonstrates a partial sweep; the other checks the queue demo has two
equal orders at one price and a taker that clears exactly one, so the survivor
is visible. If someone edits the numbers and breaks the lesson, the build says so.

**The demos drive the real engine.**
Nothing in the panel is a mock-up. Pressing "Sweep two levels" clears the book,
lays out the setup and sends the order through the same C++ that everything else
uses, then shows the fills it got back. If the prose and the engine ever
disagreed, the panel would show the disagreement rather than hide it.

**A setState-during-render bug, found only by running it.**
The first version called `onRunDemo(demo)` inside `setRan`'s updater function.
React runs updaters during render, so the demo was executing — and setting state
on the parent — mid-render. Typecheck and lint both passed; only the browser
console caught it. Running the demo first and storing the plain result fixes it.

## Phase 9 — The market-making game

**The engine decides the fills, the game only decides what they cost.**
Each round places your quote as two resting limit orders in the C++ book, then
sends each counterparty through as a market order. The fills come back from the
matching engine. Nothing in the TypeScript decides who traded — which means the
game cannot drift away from the engine's actual behaviour.

**Seeded randomness.**
mulberry32 for the uniform draws and Box-Muller on top for the value walk, with
the generator state carried through the game state rather than held in a module
variable. A game is therefore reproducible, and the tests are not flaky — one of
them checks 4,000 normal draws have mean near 0 and standard deviation near 1.

**Adverse selection is the whole lesson, so it is modelled explicitly.**
An informed counterparty sees the true value and only deals when your quote is
on the wrong side of it: they lift an ask that is too cheap or hit a bid that is
too dear. Everyone else is noise. Quote tight and you trade more, but a larger
share of what you trade is with someone who knows more than you.

**Inventory is closed out at the true value when the game ends.**
Carrying a position to the bell is a directional bet, not market making, and the
score should say so. The summary reports worst position alongside profit for the
same reason — a good number reached by taking risk is not the same skill.

**Spread captured and picked off are reported separately.**
Total profit hides the trade-off. Spread captured is what quoting earned; picked
off counts the fills the value immediately moved against. The interesting
question is the ratio, not the total.

**Verified by playing a full game.** Twenty rounds, 102 lots, final score +510.
The score equalled spread captured exactly, which only happens when the position
ends flat — and with a fixed 99.95/100.05 quote that is 5 ticks × 102 lots = 510.
The accounting checks out by hand, which is the point of keeping it pure.
