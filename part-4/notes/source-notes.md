# Part 4 source notes

## Communication job

- Audience: Ravn engineers preparing for the Claude Certified Architect
  Foundations exam, plus colleagues who have never shipped an agent. They have
  seen Parts 1 to 3: the loop, tools and MCP, subagents and hub-and-spoke,
  hooks, and Claude Code configuration.
- Job: answer two beginner's questions in order. First, "An agent that can
  move money: what makes it safe, and when does a person take over?" Second,
  "Several agents researching one question: how do the failures, the sources,
  and the cost stay honest?"
- Form: 40-minute browser-native deck, 23 slides, two demos, one restaurant.
  Built like Part 1: a divider announces each half, one idea per slide with a
  headline that states it, and a dependency chain (scenario, then one case in
  steps, then each step going wrong).
  The support half is the front counter at Basil Bistro. The research half is
  the same restaurant's kitchen (the night oven) and back office (the head
  chef sends buyers to market).
- Register: start with a scene the room can picture, then the mechanism, then
  the exam's own wording in the footer. Every content slide asks a question
  before it answers it (a Predict box). The exam detail lives in clickable
  dialogs so the slide stays clean. Slang stays in presenter notes because the
  deck is shared as a link.
- Continuity: nothing from Parts 1 to 3 is re-taught. Each callback is one
  line: "the till lock from Part 3", "Part 2 rule: descriptions first",
  "Part 1 taught the contractor and the specialists".

## Teaching method

The deck applies four methods on purpose. The presenter notes explain how to
run them.

1. **Survey.** The title slide lists the four outcomes; two dividers list the
   slides of each half; kickers show position ("The support agent · 6 of 10 ·
   step 5").
2. **One case before the rules.** Slide 4 walks one case in six steps; slide
   18 walks the back office in four. Every later slide is one step going wrong.
3. **Question first, then read.** Twelve Predict boxes hold real exam-shaped
   situations. The room answers, then Reveal shows the answer and names the
   distractors.
4. **Concrete before abstract, in two codes.** A restaurant scene and a
   diagram (drawers, timeline, quote sheet) before the mechanism and the
   exam words.
5. **Retrieval at the end.** Slide 23 hides nine sentences behind cues. The
   room recalls, then checks. Spaced review: the same nine sentences cover
   every slide.

## Sources

### Ravn study guide

https://github.com/paullarionov/claude-certified-architect/blob/main/guide_en.md
(also published at https://ravnhq.github.io/claude-certified-architect/guides/en.html)

The four targets for this part:

- [Domain 4: Prompt Engineering and Structured Output (20%)](https://github.com/paullarionov/claude-certified-architect/blob/main/guide_en.md#domain-4-prompt-engineering-and-structured-output-20)
- [Domain 5: Context Management and Reliability (15%)](https://github.com/paullarionov/claude-certified-architect/blob/main/guide_en.md#domain-5-context-management-and-reliability-15)
- [Chapter 9: Escalation and Human-in-the-Loop](https://github.com/paullarionov/claude-certified-architect/blob/main/guide_en.md#chapter-9-escalation-and-human-in-the-loop)
- [Chapter 12: Preserving Provenance](https://github.com/paullarionov/claude-certified-architect/blob/main/guide_en.md#chapter-12-preserving-provenance)

Supporting chapters used for wording and examples: Chapter 6 (few-shot,
explicit criteria, validation and retry, self-correction, interview pattern),
Chapter 7 (Message Batches API), Chapter 8.3 (multi-pass review), Chapter 10
(error categories, anti-patterns, structured subagent error, coverage
annotations), Chapter 11 (case facts, trimming, position-aware input,
scratchpad, state persistence).

Practice material used: worked questions 1–3 and 7–9, and practice questions
1–15 (research) and 46–60 (support).

### Anthropic API docs

Batch processing: https://platform.claude.com/docs/en/build-with-claude/batch-processing
(checked 2026-09-03). Facts used on slide 15 and in its dialog: 50% price,
100,000 requests or 256 MB per batch, most batches complete within 1 hour,
results available when all requests finish or after 24 hours, unfinished
requests expire at 24 hours, results kept 29 days, results may not match input
order, per-request result types succeeded / errored / canceled / expired,
custom_id 1–64 characters.

### Claim map

| Slide | Deck idea | Guide basis | What the learner should be able to answer |
| --- | --- | --- | --- |
| 5 | Split a multi-issue message; investigate in parallel with shared customer context; why loops cost | Domain 5, section 1.4 (key skill); practice questions 47 and 48; Chapter 3.1 (the loop); stateless-history question (every request carries the full history) | Decompose first; each unbundled call is one more loop iteration that re-sends the history; 47 (mixed parameters) wants few-shot, 48 (sequential, redundant fetches) wants decomposition. |
| 5 | Bundle tool calls into one turn | practice question 53 | Prompt Claude to request related tools in one turn; fewer loops. |
| 6 | Precondition before order and refund work | Domain 5, section 1.4; worked question 1; practice question 51; Chapter 3.5 | A programmatic precondition gives a deterministic guarantee that prompt wording cannot; "always verify" wording over-triggers get_customer (Chapter 1.4). |
| 6 (predict), 7 | Multiple customer matches: ask for another identifier | Chapter 9.1; practice question 55 | Never let a rule pick one match; one extra turn removes a 15% error. |
| 5 (dialogs) | Descriptions first | worked question 2; practice questions 46 and 57 (callback to Part 2) | Expand descriptions with formats, examples, edge cases, boundaries before few-shot or routing code. |
| 5 (dialogs) | Explicit criteria over adjectives; severity with examples | Domain 4.1; Chapter 6.2 | Concrete categorical criteria beat "be more conservative"; false positives erode trust. |
| 5 (dialogs) | Targeted few-shot with rationale | Domain 4.2; Chapter 6.1; practice questions 47 and 60 | 2–4 (up to 4–6) examples aimed at ambiguous cases, each with the reason. |
| 5 (dialogs) | Keyword bias in the system prompt | Chapter 1.4; practice question 56 | Keyword-sensitive routing text creates unintended tool associations. |
| 7 | Escalation triggers and non-triggers | Chapter 9.1; Domain 5.2; worked question 3; practice questions 49 and 50 | Manager request, policy gap, no progress, threshold via hook, multiple matches. Not mood, self-rated confidence, or a classifier. |
| 7 (dialog) | Three escalation patterns | Chapter 9.2 | Immediate; try then escalate; acknowledge, resolve, escalate on repeat. |
| 9 | Case-facts block outside the summary; hybrid context (facts block, recent turns verbatim, older turns summarized); when retrieval beats summarization | Chapter 11.1; Domain 5.1; Chapter 1.5 (three context-window problems); practice questions 54, 65, 66, 68 | Transactional facts survive summarization only in a separate block sent every prompt; hybrid for one long session; semantic retrieval for months of sessions with specific recall questions. |
| 9 | Trim and normalize tool results in PostToolUse | Chapter 11.2; Chapter 3.5; practice question 59 | Keep the fields the step needs; normalize formats from tools you do not own, in code. |
| 8 | Self-contained handoff, as a tool with a schema | Chapter 9.3; Domain 5, section 1.4 (customer ID, reason, recommended action); Domain 4.3 (required versus nullable fields) | The human sees only the summary; required and nullable fields; schema guarantees shape not truth. |
| 10 | Validation and retry with feedback; when retry cannot help | Domain 4.4; Chapter 6.5 | Retry with the specific error fixes format and arithmetic; it cannot conjure absent data. |
| 10 | Self-correction (stated versus calculated total) | Chapter 6.6 | Extract both values; conflict_detected exposes what a schema cannot see. |
| 10 | Self-critique before replying | practice question 52 | Evaluator step against concrete completeness criteria. |
| 11 | Stratified sampling and field-level confidence | Chapter 9.4; Domain 5.5 | Aggregate accuracy hides per-type failures; sample confident outputs; calibrate thresholds on labeled data. |
| 15, 16 | Message Batches API | Chapter 7; Domain 4.5; worked question 11; API docs | 50% cost, up to 24 hours, no latency SLA; non-blocking work only; custom_id; resubmit failures only; cadence window ≤ promise − 24h; no tool loop inside a batch. |
| 18 | Narrow decomposition; partition to avoid overlap | worked question 7; practice questions 4 and 11; Chapter 8 | Cover the whole question; assign distinct subtopics before delegating. |
| 18 | Narrow tool passes | practice questions 9, 10, and 15 | load_document instead of fetch_url; a limited verify_fact tool for the common case. |
| 19 | Access failure versus valid empty result; structured error; local recovery; coverage labels | Chapter 10; Domain 5.3; worked question 8; practice questions 3, 5, 6, 9, and 12 | Return failure type, query, partial results, alternatives, coverage impact; retry locally 1–2 times then propagate; annotate coverage in synthesis. |
| 20 | Claim to source with date; conflicts kept with attribution | Chapter 12.1–12.3; Domain 5.6; practice question 1 (research) | Preserve source and date through every hop; keep both values and let the coordinator reconcile; dates prevent fake contradictions. |
| 21 | Key findings first; structured compact returns | Chapter 11.3; Domain 5.1; practice questions 13 and 14 | Primacy and headings mitigate lost-in-the-middle; upstream agents return structured data, not page dumps. |
| 20, 21 | Render by type; scratchpad; state files | Chapter 12.4; Chapter 11.4; Chapter 11.6 | Tables for numbers, prose for news; findings survive a new session; manifest enables resume. |
| 23 | Multi-pass review; interview pattern | Domain 4.6; Chapter 8.3; Chapter 6.4; worked question 12 | Per-file passes plus an integration pass; fresh instance (Part 3); ask before building in unfamiliar domains. |

## Teaching model

One restaurant, three rooms. Each object below carries a mechanism. Nothing is
decoration.

### The front counter (slides 3–13): one support agent

| Technical role | Restaurant object | Responsibility |
| --- | --- | --- |
| Support agent | the host at the front counter | Understands the request, chooses tools, explains the outcome, hands off policy gaps. |
| Multi-issue message | two problems on one ticket | Split first; one look in the guest book; both lines move together. |
| `get_customer` | guest book | One verified ID. Two matches: ask for another identifier. |
| `lookup_order` | order ledger | Read after verification; 40+ fields, five needed. |
| `process_refund` | locked till | A precondition in code refuses it until identity and order are verified. |
| `escalate_to_human` | manager call | The handoff, not the transcript, goes upstairs. |
| Few-shot examples | three tickets from last week, with the right move and why | Teach the ambiguous cases; adjectives do not. |
| Escalation criteria | the handbook's "call the manager" page | Situations, not moods. |
| Case-facts block | ticket pinned to the counter | Survives the shift change (summarization). |
| PostToolUse trim | the short order slip | Five fields, not the whole ledger. |
| Validation, retry, self-critique | the expediter at the pass | Checks every plate against the ticket before it leaves. |
| Stratified sampling | the chef tastes one plate per station nightly | Finds the station that has been over-salting for a week. |

### The kitchen (slides 15–16): the Message Batches API

| Technical role | Restaurant object | Responsibility |
| --- | --- | --- |
| Messages API | day oven | One dish now; someone is waiting; full price. |
| Message Batches API | night oven | Thousands of trays; done within 24 hours; no promise when; half price. |
| custom_id | the label on each tray | Results come out in any order. |
| Resubmit failures only | only the burnt trays go back in | Never rebake the whole load. |
| No multi-turn tool use inside a batch | you cannot talk to the oven while it bakes | Each request is one complete turn. |
| SLA cadence | promise 30h, oven 24h, so a tray goes in within 6h | window ≤ promise − 24h; 8-hour loading breaks it, 4-hour keeps it. |
| Iterate on a sample first | bake one test loaf | One bad prompt times 100,000 requests is an expensive night. |

### The back office (slides 17–22): the head chef sends buyers to market

| Technical role | Restaurant object | Responsibility |
| --- | --- | --- |
| Coordinator | head chef | Splits the menu into markets, writes each order sheet, reads the notes, decides. |
| Research subagent | buyer | One market, one order sheet, one note back. |
| Synthesis subagent | menu planner | Turns the notes into a plan with coverage labels. |
| Narrow decomposition | "plan the menu" split into three vegetable markets | Fish and wine never assigned. |
| Partitioning | no two buyers at one stall | Overlap doubles tokens. |
| Least privilege | a wine-market pass, not a "go anywhere" pass | load_document instead of fetch_url; a small verify_fact tool. |
| Timeout versus empty result | "market closed" versus "no monkfish today" | Retry decision versus valid answer. |
| Structured error | the note back when the market is closed | failure_type, attempted_query, partial_results, alternatives, coverage_impact. |
| Coverage annotation | FULL / PARTIAL COVERAGE on each course | Finished work stays in; the gap is named. |
| Provenance | supplier name and quote date on every price | A price without them is gossip. |
| Conflict handling | two tomato quotes, both kept | Chef decides; never pick one silently. |
| Position-aware input | key numbers on top of the sheet | Lost-in-the-middle mitigation. |
| Compact structured returns | the sheet, not the catalog | The chef's desk is small. |
| Scratchpad and state files | the order book; per-buyer state | Survive a crash or a new session. |

The exam's own research example ("AI impact on creative industries", music
timeout, 40% versus 12% growth) appears in dialogs so the room recognizes the
wording on test day. The demo data is the menu-sourcing scene so the analogy
and the trace use the same names.

## Deliberate exclusions and simplifications

- **No re-teaching of Parts 1 to 3.** Hub-and-spoke, the Task tool, hooks
  versus prompts, tool descriptions, "no sushi" versus "menu unavailable",
  tool_choice, schema rules, and the fresh-eyes reviewer appear only as
  one-line callbacks.
- **No production model in the support demo.** The support trace is a local
  tool and guard harness. It isolates the precondition, trimming, case facts,
  and handoff.
- **The live research run varies in wording.** The fixture guarantees the
  fish timeout and the two tomato quotes. The model may label produce or wine
  as partial for its own reasons (for example, missing quantities). The
  rehearsal shows the canonical plan.
- **Batch limits are stated from the API docs, not the guide.** The guide
  gives 50%, 24 hours, no SLA, custom_id, and the 4-hour cadence example. The
  dialog adds the documented limits and result types.
- **Chapter 12.4 rendering, Chapter 11.6 state persistence, the interview
  pattern, and multi-pass review live in dialogs**, not on slides.
- **Exam scenarios outside this course** (Developer Productivity Tools,
  Conversational AI Architecture Patterns, Agentic AI Tools) are named in the
  weights dialog only.

## Demo design

Two scenarios, one event vocabulary, two runners each.

1. **Support, live.** `src/support.ts` runs real local TypeScript tools behind
   `checkPrecondition`. Order: request and case facts; two issue cards; an early
   `lookup_order` denied by code; verified customer; trimmed order (five of 19
   fields); safe refund; manager handoff; final outcome. The deck's stage shows
   the guest bubble, four drawers (guest book, order ledger, locked till,
   manager call), the pinned ticket, and the manager card.
2. **Support, rehearsal.** `src/mock.ts` replays the same event order and
   payloads. The deck embeds a copy so the static page works.
3. **Research, live.** `src/research.ts` calls `query()` from the Claude Agent
   SDK with a head-chef coordinator, three buyer subagents (produce, fish,
   wine) with `Read` and `Glob` only, and a menu-planner subagent. Each buyer
   is confined to its own market file by a PreToolUse hook. Order: coordinator
   prompt; three spawns in one turn; each buyer reads one packet; two notes
   complete, fish returns a structured partial failure; the chef passes all
   three notes to the planner; the plan labels fish PARTIAL COVERAGE and keeps
   both tomato quotes.
4. **Research, rehearsal.** Same events without a model. The deck's stage
   shows the chef and four nodes, messages flying, clickable spawns that open
   the order sheet and the note.

`demo/src/mock.ts` and the deck's embedded arrays are one contract. Change
identifiers or payloads in both.
