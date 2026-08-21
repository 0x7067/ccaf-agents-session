# AGENTS.md

`AGENTS.md` is the source of truth for repository instructions. Keep
`CLAUDE.md` as a symlink to this file so the two entrypoints cannot drift.

## Course contract

This repository is a teaching kit for the Ravn CCAF study group. Optimize for
exam reasoning. The mixed audience is a permanent course constraint. Write
first for the colleague who has never built an agent, while keeping the code,
protocol traces, and technical claims exact enough for experienced engineers.

Treat each course part as one instructional unit. Before changing a part, read
its source notes, slides, presenter notes, demo README, and demo code. A content
change is complete only when those artifacts use the same terms, examples,
order, and claims. If a part's topic or readiness changes, update both the root
`README.md` and `index.html`.

Teach the course's stated scope. Map factual claims to the official study guide
in the part's source notes. Record deliberate exclusions and their reasons
there. If you remove a topic, remove stale notes and promises that imply the
course still covers it. Track a deferred promise in presenter notes until a
later part pays it back.

## Teaching model

Keep every part inside one course-wide food and restaurant world. Part 1's
recipe, chef, and fridge lead into Part 2's restaurant, menu, order counter, and
kitchen. Future parts must extend that world instead of starting a new analogy
domain.

Give each part one main scene within that world. Introduce the scene before its
identifiers appear, then map each technical role to one food, staff, place, or
action. Use the same names, data, and outcomes in the slides, presenter notes,
demo, and documentation. Connect a new scene to an established course image so
new vocabulary attaches to a model the audience already learned. Record the
mapping in the part's source notes. Reuse an established object only for the
same technical responsibility.

An analogy must explain a mechanism, choice, or consequence. Cut a callback
that is only decorative. If the restaurant model cannot carry a distinction
cleanly, state the mechanism in plain language. Start with what a newcomer
needs to picture, then show the schema, request, or code that carries it.

Use direct, conversational slide copy. Keep spoken slang in presenter notes
because each deck is shared as a standalone link. Name callbacks to earlier
parts instead of assuming the audience remembers them.

## Technical explanations

Define the actors before tracing an interaction. Name who chooses, sends,
executes, transforms, and returns each value. When an SDK or host adds protocol
metadata, distinguish that envelope from the intent produced by the model or
user. Keep configuration controls attached to the layer that owns them.

Preserve semantic boundaries in examples and demos:

- An empty business result is a successful result with no matches.
- A validation or execution failure is an error with enough structured context
  to retry, correct the input, or escalate.
- A transport or permission failure is not an empty business result.
- Reading context is distinct from performing an action.

Teach the distinction through a consequence the audience can reason about.
The source notes must identify any simplified or deliberately omitted product
behavior so the exam answer stays unambiguous.

## Narrative

State the beginner's underlying question near the opening. Introduce the
vocabulary and cast needed to answer it, then follow one concrete scenario from
request to result. Show a real trace before configuration details, selection
controls, or architecture advice that depends on the trace.

When slide order changes, update the run-of-show timing, spoken segues,
interaction openings, slide count, and navigation copy in the same change. Use
relative segues instead of hardcoded page numbers.

## Deck layout

Let cards, comparison panels, chat panels, and code blocks hug their content
unless equal height communicates a real comparison. Use top alignment inside
grids and center the group when the slide needs visual balance. Large empty
boxes are a layout bug, especially when they push content toward headings or
footers.

Render every slide after a shared CSS or layout change. For isolated copy
changes, render every affected slide. Check at 1600x1000, 1440x900, 1280x800,
and 480px wide. Inspect headings, footers, code, and leaf text elements for
clipping or overflow. Container bounds alone can miss wrapped or clipped
content.

Exercise changed navigation, dialogs, keyboard controls, and demo controls in
the browser. A deck change is complete when the content remains readable and
the affected interactions work at every required size.

## Demo contract

Make the live path prove the mechanism being taught. Isolate that mechanism
from unrelated failure sources. Use a real local integration when the protocol
or orchestration is the subject. Add a deterministic rehearsal when live
execution depends on credentials, a model, a child process, or the network.
The rehearsal must preserve the live path's event order and payload shapes.

Before changing scenario data, search the whole part for every copy of its
identifiers, events, payloads, and visible output. Update the real
implementation, runner, mock or rehearsal, deck examples, presenter notes,
source notes, and demo README together. Prefer a shared data source when the
deck can remain self-contained; otherwise treat the copies as one contract.

Use the demo's existing package manager and scripts. Run its typecheck plus the
narrowest command that exercises the changed path. A process-based demo must
reach its final event, exit cleanly, and leave no child process behind. Exercise
both live and rehearsal controls when browser event handling changes.

For a stdio protocol, reserve stdout for protocol traffic and send diagnostics
to stderr. Keep example configuration free of credentials and reference
environment variables for secrets.
