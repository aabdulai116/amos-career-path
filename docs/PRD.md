# CareerCompass, product requirements

Written after the fact. The project was built by working outward from a problem
rather than from a spec, and this document reconstructs the spec that was
implied. It is kept so the next project can start here instead of ending here.

Status: shipped and live. Last reviewed 28 November 2026.

---

## 1. The problem

A first-year computer science student who wants a technical internship has to
work out three things at once:

1. What to learn.
2. What order to learn it in.
3. Whether they are already behind.

Most of what exists answers only the first. Checklists, roadmap images and
"top 10 things to learn" posts give a flat list of topics with no sense of
sequence and no sense of time. A student can complete twenty items in an order
that leaves them unprepared, because the items depend on each other.
Probability has to come before stochastic calculus. Memory layout has to come
before low latency C++.

The cost is not that the student learns nothing. It is that they spend months
on the wrong thing and find out late, usually at the first interview.

## 2. Who it is for

The primary user is a first or second year CS student at a school with no CS
club, no older student to ask, and no structured advice. They are motivated and
have time, but no map.

A secondary user is a student who already picked a direction and wants to
change it, and needs to know how much of their work still counts.

This is not for people already in the recruiting pipeline. Someone with two
internships does not need a map.

## 3. Why this and not a checklist

The central product decision is that skills form a graph, not a list.

Because the data is a graph, the app can answer questions a checklist cannot:
what does finishing this unlock, what is reachable from where I am now, and
what carries over if I switch tracks. That last one is the feature the author
most needed and did not have. Changing your mind should be cheap, and it is
only cheap if you can see the overlap.

## 4. Goals

| Goal | How we know it worked |
| --- | --- |
| A new student knows what to do today, within one minute of opening it | The landing page states a single next action, not a menu |
| Switching tracks does not feel like starting over | Overlapping skills are shown as already done, not reset |
| Progress survives a new laptop | Signed-in progress restores on another device |
| Nothing blocks a first look | Every feature works with no account and no network |

## 5. Non-goals

These were considered and deliberately left out.

- **Not a course.** It points at other people's teaching and tracks progress
  through it. It does not host or mirror content.
- **Not a job board.** The internship list is filtered for a specific need
  (students who will work on CPT) and is not trying to be comprehensive.
- **Not social.** No profiles, no comparison, no leaderboards. Comparison is
  the thing that made the original problem feel bad.
- **Not a judge.** Practice problems run code so you can try an idea. They do
  not grade it.

## 6. Scope

### 6.1 Skill map

A directed graph of skills with prerequisites. Each node carries status, notes,
hours logged, a proof link and which resources were watched. Several named
tracks run through the graph, and the overlap between them is visible.

### 6.2 Course tracker

A hundred day Python course, one record per day. Each day holds whether it was
watched, whether the project was done, which exercises were completed, the code
written for them, notes and a repo link. Days carry a priority so a student can
tell which ones are worth the time and which can be skimmed.

### 6.3 Practice

The NeetCode 150, with the problems runnable in the browser through Python
compiled to WebAssembly. Each problem records status, attempts, and the time
and space complexity the student arrived at. Recording the complexity matters
more than recording the answer, because complexity is what gets asked.

### 6.4 Internships

A board of listings, narrowed to roles that are realistic for a student needing
work authorisation. Classification happens at the employer level, not from
listing text, because the listing field that claims to describe sponsorship is
unusable in practice. Employers that cannot be classified are shown as unknown
rather than guessed at.

### 6.5 Accounts and sync

Optional. Google sign-in, database sessions, and last write wins merging per
record. The app is fully usable signed out, and signing in is an upgrade that
moves the same data somewhere it survives a new machine.

### 6.6 Order book

A matching engine in C++ compiled to WebAssembly, for the quant track. It is
there to be read and poked at, as an artefact of the thing it teaches.

## 7. Data and privacy

Progress belongs to the student. Concretely:

- Signed out, everything lives in the browser and no request leaves it.
- Signed in, the stored record is progress plus the identity fields Google
  returns. Nothing else.
- Export produces the whole state as JSON, and import accepts it back.
- There is no analytics on what a student studies.

## 8. Constraints

- **Free to run.** Vercel Hobby and Neon's free tier. This caps database
  storage at 1 GB per project and rules out anything needing an always-on server.
- **One maintainer, studying full time.** Favour boring technology and tests
  over cleverness that needs explaining later.
- **Works on a phone.** Students will open the link on a phone first.
- **No account required.** This is a constraint, not a feature, and it shapes
  every server path: each one has to work when there is no database.

## 9. Risks

| Risk | Handling |
| --- | --- |
| Student loses progress | Export and import always available, plus optional sync |
| Sync clobbers newer work from another device | Per record timestamps, newest wins, merged on the server |
| Database unavailable | App is designed to run with no database at all |
| Free tier storage exhausted | Currently 8 MB of 1 GB. Writes fail at the cap, they are not billed |
| A dependency vanishes | External content is linked, not mirrored, and links are CI checked |
| Linked resources rot | A CI job checks them and flags what needs a human |

## 10. Open questions

- Deletion does not propagate between devices. There are no tombstones, so a
  record deleted on one device returns from another. Accepted for now and
  documented.
- Sponsorship data could come from the Department of Labor disclosure files
  rather than employer heuristics. Not started.
- Whether anyone other than the author actually uses it. Unknown until it is
  shared, which is the point of shipping it.

---

## Using this as a template

The order of the sections is the order worth thinking in.

1. Write section 1 first, and write it as a problem somebody has, not as a
   product. If the problem cannot be stated without naming the solution, the
   problem is not understood yet.
2. Write section 5 before section 6. Deciding what you are not building is what
   keeps a solo project finishable.
3. Write section 4 as a table with a right hand column. A goal with no way to
   tell whether it happened is a wish.
4. Write section 8 honestly. Most solo project failures are constraint
   failures, not idea failures.
5. Leave section 10 genuinely open. A PRD with no open questions is a PRD that
   has not been thought about.

Revisit the document when a decision contradicts it. If the product moved, edit
the document. If the document is right and the code drifted, fix the code.
