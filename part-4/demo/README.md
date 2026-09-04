# Part 4 demo: the counter and the back office

Two scenarios from the CCAF study guide, both set at Basil Bistro:

1. **The front counter (support).** A local support-tool trace handles a
   guest's duplicate-charge refund and a competitor price-match request. A
   precondition in code blocks `lookup_order` and `process_refund` until
   `get_customer` returns one verified ID. The trace trims a 19-field order
   record to five fields, keeps a case-facts block up to date, completes the
   safe refund, and sends a self-contained handoff to a manager.
2. **The back office (research).** A head chef (coordinator) sends three
   buyers (subagents) to the produce, fish, and wine markets in parallel. The
   fish market's price desk times out and the buyer returns a structured
   partial failure. The produce buyer finds two tomato quotes a month apart and
   keeps both with supplier and date. A menu planner writes a sourcing plan
   with KEY FINDINGS first and a coverage label on every course.

## Present the deck

```bash
cd part-4/demo
npm install
npm run demo
```

Open http://127.0.0.1:5049/part-4/slides.html. Slide 13 is the counter; slide
23 is the back office. Use **Rehearse** first on each. It replays recorded
events without a model call. Slide 13's **Run live** runs the real local
TypeScript tools and needs nothing. Slide 22's **Run live** uses the real
Claude Agent SDK and needs the Claude Code CLI installed and logged in.

If you open `part-4/slides.html` as a static file, rehearsal still works. The
live buttons explain that they need the local demo server.

## Run the event trace in a terminal

```bash
npm run trace -- --rehearse support
npm run trace -- --rehearse research
npm run trace -- support       # real local support tools and guard
npm run trace -- research     # real Agent SDK sourcing run
```

Every trace line is newline-delimited JSON. Diagnostics from the HTTP server go
to its normal terminal output. The market fixture contains no credentials and
makes no network requests itself.

## What the support path proves

`src/support.ts` is intentionally model-free. It isolates the mechanisms that
must be deterministic:

- `checkPrecondition` rejects `lookup_order` and `process_refund` before a
  verified customer ID exists, and rejects a refund whose order, amount, or
  reason does not match the verified case;
- `trimOrderResult` keeps five fields from the larger order record;
- the case-facts block is updated after identity and order verification;
- the duplicate refund succeeds, while the competitor price match becomes a
  structured human handoff.

That is not a claim that a production support agent needs no model. It is a
small local harness for the safety boundary.

## What the live research path proves

`src/research.ts` calls the Claude Agent SDK with:

- one head-chef coordinator and four `AgentDefinition` entries (three buyers
  and a menu planner);
- `Agent` and `Task` in the coordinator's allowed tools, because the SDK and
  the study guide use different names across versions;
- three explicit buyer prompts spawned in one coordinator turn;
- `Read` and `Glob` only for the buyers, each confined to its own market file
  by a PreToolUse hook; a planner with no tools;
- the full buyer notes passed explicitly to the planner;
- `settingSources: []`, so the fixture's local configuration cannot change the
  lesson.

The prompt asks for `PARTIAL COVERAGE` whenever a note reports a timeout and
for both quotes whenever suppliers disagree. The model's wording varies. It
must not invent a fish price and must not drop a tomato quote. A test run took
about 85 seconds and $0.47.

The rehearsal in `src/mock.ts` and the deck's embedded copy use the same
payload shapes and event order as the live paths. Change all three together.
