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

## Phase 10 — LeetCode / NeetCode practice

**The problem list is generated, not typed.** The NeetCode 150 is 150 LeetCode
slugs and 150 YouTube ids. Typing those by hand means inventing URLs, and a slug
one character out is a dead link that looks alive. NeetCode publishes the exact
data that drives neetcode.io in their own repository, so `scripts/sync-problems.ts`
fetches it and writes `src/data/problems.ts`. Every slug, pattern, difficulty and
video id is theirs. The generator validates before it writes — 150 problems, 75
Blind 75, the Blind 75 a subset of the 150, unique slugs, slug and video-id
shapes, known patterns and difficulties — and exits non-zero rather than writing
a partial file, so a change upstream fails loudly.

**leetcode.com cannot be link-checked from Node.** It sits behind bot protection
and answers a plain `curl` with a 403 challenge page. Getting around that is not
something I will do, so `check:links` leaves these alone. The protection against
a bad link is the generator instead: the slugs come from NeetCode rather than
from me, and their shape is asserted in the tests.

**The 150, not the 450.** NeetCode's full practice list is in the same file. The
badges in the brief are about the 150, so that is what ships; widening it is one
filter in the generator, called out in a comment there.

**Difficulty is the only thing coloured.** Eighteen patterns is far past the
point where a hue per category means anything, so the pattern meters share one
accent and the name carries identity. Difficulty is three ordered values, and
the steps `#35a56b` / `#ad7510` / `#dd4f7d` were picked by running the palette
validator against the dark surface: all three inside OKLCH L 0.48–0.67, worst
adjacent pair deutan ΔE 8.3 and normal-vision ΔE 17.3, every one over 3:1 on
`--surface`. The word "Easy"/"Medium"/"Hard" is always rendered beside the
colour, so difficulty is never colour alone.

**No test harness, and no generated function stubs.** A per-problem test harness
would have to invent cases, which only checks my own assumptions rather than
LeetCode's. The runner executes exactly what is written, asserts included, and
reports what printed. For the same reason the starter text is comments only: a
guessed `def twoSum(self, nums, target)` that is subtly wrong looks authoritative
and silently disagrees with the real signature. Paste the real one from LeetCode.

**Python runs in a Web Worker, as an ES module.** Two reasons for the worker:
the 12 MB interpreter would otherwise freeze the page while it loads, and an
accidental `while True:` cannot be interrupted from inside CPython — the only
reliable stop is to destroy the worker, which a background thread makes
survivable. It is a module worker rather than a classic one because
`importScripts()` cannot reach a cross-origin CDN; `import()` in a module worker
can. Verified in the browser: both forms were tried, and only the module import
loaded Pyodide.

**The run timeout starts when the interpreter picks the code up.** The first
version armed a 15-second timer when the page posted the code, so the very first
run of a visit spent that budget downloading the interpreter and then reported
an infinite loop. The worker now posts `started` immediately before executing,
and the page swaps a 180-second boot budget for the 15-second run budget at that
point. A boot failure says the download failed; only a run failure blames a loop.

**Output printed before an exception is kept.** The first version replaced it
with the traceback. What printed before the error is usually the clue to it, so
the panel shows the output, a blank line, then the cleaned traceback — Pyodide's
own frames stripped, and `File "<exec>", line 4` reduced to `line 4`.

**Spaced review is derived from the record, not from memory.** Tracking attempts
and a hint flag is only worth doing if something uses them. A solve comes back
after 7 days if it needed the walkthrough or took more than two sittings, 21
after a second-sitting solve, and 45 after a clean first solve; the queue sorts
most-overdue first and breaks ties on curriculum order.

**Pyodide 314.0.8, pinned.** Published 2026-11-13, the current stable release.
Pyodide ships the interpreter, the standard library and the wasm as one versioned
bundle, so a floating version would change Python itself under the page.

**Verified in the browser, not only in tests.** A real solution to Contains
Duplicate with two asserts printed `both cases pass` in 3 ms under Python
314.0.8; a deliberate `ZeroDivisionError` printed `total 6` and then a clean
three-line traceback; the code survived a full page reload; the Blind 75 switch
rescoped all four stat tiles and the list to 75; and the page has no horizontal
overflow at 375 px.

## Phase 11 — course priorities, exercises and complexity notes

**Priorities are judged against the destination, not the teaching.** Every one
of the 102 days is core, useful or skim with a line saying why. The split came
out at 37 core, 36 useful, 29 skim, and a test asserts core stays under half the
course — if most of it were core the marking would say nothing. Another test
names fourteen days that must stay core (dictionaries, OOP, files, pandas,
comprehensions, SQL, git, groupby, time series, NumPy, regression, statistics,
the end-to-end model) and four turtle-graphics days that must stay skim, so a
later edit cannot quietly reshuffle the curriculum.

**Only "core" is coloured.** The question the panel answers is "where do I slow
down?", and one highlighted class answers it faster than three competing hues.
The word is always rendered beside the colour.

**The useful number is hours, not day counts.** "29 days of skim" means nothing;
"16.1 hours you can watch at speed" is a decision. Each class totals the run
time of its unwatched days, and a "next core day" line skips past everything
skimmable.

**Randomisation, specifically.** Day 4 is marked core, but for lists rather than
for `random`. The note says so: `random` looks like a toy at that point and comes
back for real in Monte Carlo on Day 80 and in this app's own market-making game.
That was a direct question and it deserved a direct answer in the data rather
than a shrug.

**205 exercises, weighted by priority.** Core days get three drills, useful two,
skim one — a test asserts the mean exercise count decreases across the three
classes. They are deliberately separate from the day's project: a project takes
an evening, a drill takes ten minutes and answers "did that land?".

**Exercises that cannot run here say so.** Pyodide has no window, no browser and
no socket, so a Tkinter or Flask or live-API drill would fail in a way that
looks like the learner's fault. Those carry `runnable: false` and render a line
saying to build them locally. 78% run in the page; a test holds that ratio above
75% and asserts no unrunnable exercise carries starter code.

**Packages load on demand.** `loadPackagesFromImports` runs before the code, so
`import pandas` fetches numpy, pandas and their dependencies the first time and
is free afterwards. That makes the Day 25, 72–81 and 92 exercises genuinely
runnable — verified in the browser: a pandas DataFrame printed, and matplotlib
wrote a 22 KB PNG to the virtual filesystem in 1.6 seconds.

**Two bugs the browser found and the tests could not.** Pyodide's `batched`
stdout callback hands over a line with the newline already stripped, so the
first pandas run arrived as one unreadable paragraph; the worker puts the
newline back. And `loadPackagesFromImports` prints "Loading numpy, pandas…" to
stdout, which made library chatter look like program output; it now goes to the
status line through `messageCallback`.

**The matplotlib deprecation warning is explained, not suppressed.** `savefig`
emits two MatplotlibDeprecationWarnings on this version, from inside the
library. Filtering them would teach the wrong habit, so the starter says where
they come from and that a warning is not an error — reading that difference is
part of the exercise.

**Complexity is two free-text fields.** Not a dropdown: half the value is having
to decide, and "O(n) amortised" or "O(log n) average, O(n) worst" does not fit a
picker. Both halves are needed before the pair shows on the collapsed row, and
the practice page counts solved problems with no Big-O written down, because
that gap is exactly what a revision pass would otherwise discover too late.

## Phase 12 — internships and the Python worker

**The honest finding came first.** The plan was a keyword classifier over
listing text. The feed has no listing text, and of its 5,066 active records the
`sponsorship` field says something useful for 14. Zero titles mention a
clearance, citizenship or ITAR. A keyword classifier would have matched nothing
and reported a confident empty result, which is worse than no feature.

**So the unit of classification is the employer, not the advert.** Cleared and
export-controlled work is a property of the company and stable enough to write
down. `worker/companies.py` lists 38 — defence primes, FFRDCs and national
labs, ITAR hardware — each with the reason, rendered in the UI verbatim so the
claim can be checked rather than trusted. It is deliberately short: a wrong
block hides a real job, while a missing company costs one manual check. That
asymmetry decided every borderline call.

**96% of listings are "unknown", and they stay in the list.** Silence is not a
no. A test asserts the unknown share stays above 80%, so a future change that
starts claiming to know most of them fails loudly rather than quietly guessing.
Another asserts blocked stays under 15%.

**"Does not sponsor" is amber, not red.** CPT is work authorisation a student
already holds through their university; it costs the employer no petition. A
company that will not sponsor an H-1B may still take a CPT intern. Treating it
as a closed door would hide jobs that are open.

**Company-name matching was the real bug.** The first version used
`"saic" in name.lower()` and declared *Mosaic* and *RosaicLabs* defence
contractors on the live feed. `normalise()` lowercases, strips punctuation and
drops corporate suffixes, and matching is exact on that form. Both false
positives are pinned by tests, in Python and again against the generated file.

**The normaliser exists twice, on purpose, and is tested against itself.**
Python decides the verdicts; TypeScript stores mine, keyed the same way, or a
verdict recorded in the app would not match the employer the worker decided
about. A test in the app checks its implementation against a table of answers
produced by the Python one.

**A test caught redundancy the aliases did not need.** Asserting no duplicate
keys failed on ten aliases that `normalise()` already resolved — "Anduril
Industries", "Sandia National Labs" and the rest. They came out, and the test
now prevents them coming back.

**Duplicate requisitions are grouped, not dropped.** Bandwidth posts the same
Raleigh role seven times with seven requisition ids; TikTok fourteen. All are
real, so none is removed — the newest leads the group and the others come along
as extra links. 2,996 rows became 2,815.

**The data file lives in public/, not src/data/.** Three thousand listings are
1.1 MB. Compiled into a TypeScript module that is 1.1 MB of JavaScript in the
bundle; as a static file it is fetched once, gzips to 230 KB and costs the rest
of the app nothing. The app validates it on arrival rather than trusting its
own generator, and a test asserts the app drops none of what the worker wrote —
if it did, one of the two would be wrong.

**Plain http is flagged, not filtered.** Three employers serve their
application form over unencrypted http. Dropping them would hide real jobs, so
the row warns instead; an application form is exactly where personal details
get typed. A test holds the share under 2%.

**Notifications are not built, and the reason is stated.** "First to know"
needs a scheduler, somewhere to remember what has been seen and a delivery
channel — the point where this stops being a static site. The offline version
that is genuinely useful shipped instead: the page records when it was last
opened and marks what is new since. The visit is stamped on unmount, so the
session that is reading the page still sees its own "new".

**Summer 2027, not 2028.** The repository for a summer appears about a year
ahead and `SimplifyJobs/Summer2028-Internships` returns a 404 today. One
constant changes when it exists. Summer 2027 is not a placeholder: those roles
are open now and a sophomore can apply to them.

**Verified in the browser.** Marking TikTok "No CPT" on one listing moved
"ruled out" from 105 to 236 and emptied a filtered view of 131 roles, which is
the inheritance working end to end; Bandwidth collapsed to one row badged
"7 openings" with all seven links intact; the page has no horizontal overflow
at 375 px. The console showed module errors from a file moved earlier in the
session — stale HMR buffer, disproved by a clean production build from a
cleared `.next` and a fresh dev server with no errors.

## Phase 13 — accounts, sync and CI

**Signed out is the default, not the fallback.** The whole app works with no
account and no database: progress stays in localStorage exactly as it always
did. That is what someone gets when they open a shared link, and it is the
single most important decision here. A signup wall is how a tool meant for
first-years ends up used by nobody. Every server path copes with `getDb()`
returning null, and each sign-in provider only registers when its credentials
exist, so a deployment with no environment variables simply has no sign-in
button rather than a broken one.

**No passwords.** Google and Microsoft only. A student project that stores
password hashes is a student project that will one day leak them, and both
providers are accounts every university already issues. It also removes the
reset-email flow entirely.

**Normalised tables, not a JSON blob per user.** A blob would have been a
tenth of the code. Real columns mean a user's work can be queried, a bad write
touches one row instead of all of it, and two devices editing different skills
do not collide. Twelve tables: four that Auth.js owns and eight of the app's.

**Merge per record, not per document.** Whole-document last-write-wins means
opening the app on a phone can erase an evening's work from a laptop, which is
the kind of loss that makes someone stop trusting a tool. Records are small and
independent, so they are resolved separately. Ties go to the server, so a
device that merely reads cannot overwrite.

**Timestamps come from middleware, not from eighteen mutations.** Last-write-
wins needs an `updatedAt` on every record. Writing that into each reducer is
eighteen chances to forget one, and a record whose timestamp never moves
silently loses to a stale device forever. A small Zustand middleware stamps
whichever records changed, detected by reference inequality — every reducer
already builds a fresh object only for the entry it touches, so that is exactly
the set, with no deep comparison and nothing to maintain as mutations are
added.

**No tombstones, and it is written down.** Clear a problem on a laptop and a
phone that has not synced since will put it back. Fixing it properly means
recording deletions and keeping them until every device has seen them. Worth
doing if this ever needs to be exact; not worth the complexity now. Stated in
the code, in SETUP.md and here rather than left for someone to discover.

**The Neon HTTP driver was the wrong choice, found before shipping.** The save
replaces several tables and must not half-succeed, so it runs in a transaction
— and `drizzle-orm/neon-http` throws "No transactions support" the moment one
opens. Switched to the WebSocket pool driver, which gives real transactions and
behaves like the Postgres the tests run against, so the tests exercise the
production path rather than a different one.

**Database tests run real Postgres, in-process.** PGlite is Postgres compiled
to WebAssembly, so the committed migration is applied for real, foreign keys
and cascades behave, and transactions are transactions. No service container,
no fixtures pretending to be a database, and CI runs them as cheaply as a unit
test. They cover the round trip of every record type, that one user's rows are
invisible to another, that deleting a user cascades, and that syncing twice
changes nothing.

**Authorization is deliberately boring.** Every query filters by the user id
from the session, and no code path takes a user id from a request body. The
body is validated by the same parser an imported file goes through, because it
arrives from a browser and is input, not data.

**Account deletion is a button.** The moment other people's data is involved,
"let me out" cannot be an email to me. One delete, cascaded by foreign keys.

**CI runs all three languages.** Typecheck, lint, 463 TypeScript tests and the
build; 46 Python tests with no dependencies to install; 72 C++ assertions. The
link checker hits other people's servers, so it runs only on main and is
allowed to fail without failing the build — a flaky network should not block a
pull request.

**An audit regression was fixed rather than accepted.** Adding drizzle-kit
pulled in an esbuild with a known advisory through a deprecated transitive
dependency, taking the project from zero vulnerabilities to four. The suggested
fix was a major downgrade of drizzle-kit. An `overrides` entry forcing a
patched esbuild fixed it instead, and generating the migration afterwards
proved drizzle-kit still works.
