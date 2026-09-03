# Part 4 office-hours demo

This demo follows two scenarios from the CCAF study guide:

1. **Multi-agent research.** A coordinator assigns the visual-art, music, and
   literature-and-film beats to isolated reporters. They run in parallel. The
   coordinator passes every report, including a structured source timeout, to a
   synthesis editor. The final brief marks music as partial coverage instead
   of pretending that the timeout meant "no results".
2. **Basil Bistro support.** A local support-tool trace handles a guest's
   duplicate-charge refund and a competitor price-match request. A programmatic
   precondition blocks order work until `get_customer` verifies the guest. The
   trace trims a large order result, keeps case facts, completes the safe refund,
   and sends a self-contained policy-gap handoff to a manager.

The research fixture is not restaurant-themed on purpose. The office-hours
request treats the research system and the restaurant support agent as two
separate scenes. Basil Bistro continues the restaurant world from Parts 2 and
3 only in the support half.

## Present the deck

```bash
cd part-4/demo
npm install
npm run demo
```

Open http://127.0.0.1:5049/part-4/slides.html. Use the **Rehearse** buttons
first. They replay the same event shapes without a model call. The support
live button runs local TypeScript only. The research live button uses the real
Claude Agent SDK and needs the Claude Code CLI installed and logged in.

If you open `part-4/slides.html` as a static file, rehearsal still works. The
live buttons explain that they need the local demo server.

## Run the event trace in a terminal

```bash
npm run trace -- --rehearse research
npm run trace -- --rehearse support
npm run trace -- support       # local support tools and guard
npm run trace -- research     # live Agent SDK research run
```

Every trace line is newline-delimited JSON. Diagnostics from the HTTP server go
to its normal terminal output. The research fixture contains no credentials
and makes no network requests itself.

## What the live research path proves

`src/research.ts` calls the Claude Agent SDK with:

- one coordinator and four `AgentDefinition` entries;
- `Agent` and `Task` in the coordinator's allowed tools, because the SDK and
  the study guide use different names across versions;
- three explicit reporter prompts spawned in one coordinator turn;
- `Read` and `Glob` only for the reporters, with a separate synthesis editor;
- the full reporter reports passed explicitly to the editor;
- `settingSources: []` and a read-only tool guard, so the fixture's local
  configuration cannot change the lesson.

The prompt asks for `PARTIAL COVERAGE` whenever a packet reports a timeout.
The model's final wording may vary, but it must not invent evidence for the
unavailable music packet.

## What the support path proves

`src/support.ts` is intentionally model-free. It isolates the mechanisms that
must be deterministic:

- `checkPrecondition` rejects `lookup_order` and `process_refund` before a
  verified customer ID exists;
- `trimOrderResult` keeps five fields from the larger order record;
- the case-facts block is updated after identity and order verification;
- the duplicate refund succeeds, while the unsupported competitor price match
  becomes a structured human handoff.

That is not a claim that a production support agent needs no model. It is a
small local test harness for the safety boundary. The rehearsal and local live
support trace use the same payload shapes and event order.
