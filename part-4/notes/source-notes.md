# Part 4 source notes

## Communication job

- Audience: Ravn engineers preparing for the Claude Certified Architect
  Foundations exam, plus colleagues who have never built a multi-agent system.
- Job: answer the beginner's question, "When one request needs more work than
  one context can hold, who decides the next step, and how do we keep the
  system from guessing?"
- Form: 40-minute browser-native deck with two self-contained scenes and a
  local demo. The research scene is a non-restaurant newsroom because the
  office-hours request says that scenario does not fit the course restaurant.
  The support scene returns to Basil Bistro from Parts 2 and 3.
- Register: start with a concrete trip, then name the protocol term. Use
  "editor" and "beat reporter" before "coordinator" and "subagent". Use the
  guest, ledger, and manager before showing tool names. Keep the language
  direct. Slang stays in presenter notes because the deck is shared as a link.
- Continuity: Part 1 introduced the agent loop and hub-and-spoke architecture.
  Part 2 showed the restaurant counter and structured tool results. Part 3
  showed the staff handbook and context loading. This part reuses the loop,
  explicit handoffs, and Basil Bistro only where the support scenario needs
  them.

## Sources

### Ravn study guide

https://ravnhq.github.io/claude-certified-architect/guides/en.html

The primary reading for this office hour is:

- [Chapter 3: Claude Agent SDK](https://ravnhq.github.io/claude-certified-architect/guides/en.html#chapter-3-claude-agent-sdk-building-agentic-systems),
  especially the agentic loop, `AgentDefinition`, hub-and-spoke, `Task`,
  explicit context passing, parallel spawning, and hooks.
- [Chapter 8: Task decomposition strategies](https://ravnhq.github.io/claude-certified-architect/guides/en.html#chapter-8-task-decomposition-strategies),
  especially fixed pipelines, dynamic adaptive decomposition, and the
  per-file-then-integration pattern.
- [Chapter 11: Context management in production systems](https://ravnhq.github.io/claude-certified-architect/guides/en.html#chapter-11-context-management-in-production-systems),
  especially fact blocks, trimming tool results, position-aware input,
  scratchpads, subagent context budgets, and state persistence.

The customer-support examples add the scenario-specific decisions:

- [Example 1: verify before financial work](https://ravnhq.github.io/claude-certified-architect/guides/en.html#example-1-scenario-customer-support-agent)
- [Example 2: improve tool descriptions first](https://ravnhq.github.io/claude-certified-architect/guides/en.html#example-2-scenario-customer-support-agent)
- [Example 3: explicit escalation criteria](https://ravnhq.github.io/claude-certified-architect/guides/en.html#example-3-scenario-customer-support-agent)
- [Example 7: research decomposition](https://ravnhq.github.io/claude-certified-architect/guides/en.html#example-7-scenario-multi-agent-research-system)
- [Example 8: structured timeout context](https://ravnhq.github.io/claude-certified-architect/guides/en.html#example-8-scenario-multi-agent-research-system)
- [Example 9: limited-scope fact verification](https://ravnhq.github.io/claude-certified-architect/guides/en.html#example-9-scenario-multi-agent-research-system)

The practice questions supply additional rehearsal:

- [Questions 1–15: multi-agent research](https://ravnhq.github.io/claude-certified-architect/guides/en.html#scenario-multi-agent-research-system)
- [Questions 46–60: customer support](https://ravnhq.github.io/claude-certified-architect/guides/en.html#scenario-customer-support-agent)

The user-facing study link is the guide above. The deck links directly to the
worked examples and practice scenarios so nobody has to hunt for them.

### Claim map

| Deck idea | Guide basis | What the learner should be able to answer |
| --- | --- | --- |
| Stop the loop from `stop_reason` | Chapter 3.1 and practice question 58 | Continue on `tool_use`; finish on `end_turn`. Do not parse friendly text or use an arbitrary loop limit as the main signal. |
| Coordinator and isolated reporters | Chapter 3.2–3.4; Domain 1.2–1.3 | The coordinator decomposes, delegates, aggregates, handles errors, and communicates. Subagents do not inherit its history. |
| Explicit prompts and parallel work | Chapter 3.4; practice questions 2, 8, and 11 | Put required source text, prior results, and the output shape in each prompt. Emit independent `Task` calls in one response when work can run together. |
| Fixed versus dynamic decomposition | Chapter 8.1–8.3; Domain 1.6 | Use a fixed pipeline when the steps are known and reproducibility matters. Adapt the plan when discovery changes the next task. |
| Honest partial coverage | Chapter 10.1–10.4; practice questions 5, 6, 9, and 12 | An empty result can be a successful finding. A timeout is an access failure. Return failure type, query, partial results, alternatives, and coverage impact. |
| Context protection | Chapter 11.1–11.6; practice questions 13 and 14 | Keep facts outside summaries, trim fields, put findings at the top and actions at the end, use a scratchpad, and return compact structured subagent results. |
| Narrow support tools | Domain 2.1 and practice questions 46 and 57 | Similar tools need descriptions with inputs, examples, and boundaries. Inspect descriptions before adding routing infrastructure. |
| Deterministic identity gate | Domain 1.4; Example 1; practice question 51 | A programmatic precondition blocks `lookup_order` and `process_refund` until `get_customer` returns one verified ID. A prompt alone cannot guarantee order. |
| Proportional escalation | Chapter 9; Examples 3 and practice questions 49 and 50 | Use clear policy rules and examples. Escalate a policy gap or explicit manager request. Do not use sentiment or model self-confidence as the main trigger. |
| Self-contained handoff | Chapter 9.3; Chapter 11.1 | The manager needs customer ID, issue, order, actions, amount, recommendation, and reason without the hidden transcript. |

A JSON schema guarantees syntactic structure and required fields. It does not
make a claim true. The deck does not turn structured output into evidence.

## Teaching model

The part has two scenes because the user's office-hours request explicitly
separates them. Do not make the research system secretly restaurant-themed.

### Scene A: research desk, not a restaurant

| Technical role | Scene object | Responsibility |
| --- | --- | --- |
| Coordinator | assigning editor | Splits the question, chooses coverage, passes context, handles gaps, and asks for the final brief. |
| Research subagent | beat reporter | Reads only its assigned packet and returns a compact report. |
| Synthesis subagent | copy editor | Receives all reporter packets from the coordinator and writes the integrated brief. |
| `Task` or `Agent` call | assignment slip | Starts an isolated subagent session. The current SDK uses `Agent` in some traces; the guide calls the operation `Task`. |
| Explicit prompt context | assignment packet | Names the question, source path, output fields, and limits. |
| Isolated context | reporter notebook | The reporter does not see the editor's history or another reporter's notes unless the editor passes them. |
| Coverage annotation | desk note | Says which section is full, partial, or missing. |
| Structured error | callback to the editor | Gives failure type, attempted query, partial results, alternatives, and impact. |
| Scratchpad | editor's working notes | Stores durable facts so a long investigation does not need to reread everything. |

The research question and local source packets use the study guide's "AI impact
on creative industries" example. The music packet contains a deliberate source
timeout marker. It is a fixture for the failure path, not evidence about music.
The report must not turn it into a successful zero-result claim.

### Scene B: Basil Bistro support

| Technical role | Restaurant object | Responsibility |
| --- | --- | --- |
| Customer | guest at the front counter | Supplies the request and can resolve identity ambiguity. |
| Support agent | front-counter host | Understands the request, calls tools, explains the outcome, and hands off policy gaps. |
| `get_customer` | guest book | Finds and verifies one customer ID. Multiple matches require another identifier, not a guess. |
| `lookup_order` | order ledger | Reads order facts after identity verification. |
| `process_refund` | locked till | Performs the financial action only after the verified-ID precondition passes. |
| `escalate_to_human` | manager call | Sends a policy question with a complete handoff. |
| Tool description | label on a drawer | Tells the host when to use a tool, its inputs, and when not to use it. |
| Case-facts block | ticket pinned to the counter | Keeps IDs, dates, amounts, and the current request outside a lossy conversation summary. |
| Precondition or `PreToolUse` hook | till lock | Refuses unsafe order or refund calls in code. The prompt can ask; the lock decides. |
| Trimmed tool result | short order slip | Keeps the five fields needed now instead of all ledger fields. |

The support data is fictional and uses `.test` email data. It reuses Basil Bistro,
margherita pizza, and the order-counter idea from Part 2 without reusing the
MCP server's technical responsibility. This scene is about orchestration and
safety, not about rediscovering MCP.

## Deliberate exclusions and simplifications

- **No full web-search integration.** The research demo uses local source
  packets, so the room studies decomposition, context passing, and failure
  propagation without credentials, network flakiness, or a search vendor
  hiding the mechanism. The live path still uses the real Claude Agent SDK to
  spawn and coordinate subagents.
- **No production model in support.** The support trace is a local tool and
  guard harness. It isolates the deterministic identity gate, context trimming,
  facts, and handoff. It does not claim that a production support agent can
  answer without a model.
- **No complete escalation lecture.** The deck uses the smallest parts of
  Chapter 9 needed for the customer-support examples: policy gaps, ambiguity,
  and a structured handoff. Confidence calibration and sampling are outside
  this session.
- **No complete error-handling lecture.** The deck borrows the empty-result,
  timeout, partial-result, and coverage distinctions from Chapter 10 because
  the research scenario needs them. Retry budgets and all error categories are
  left to a later reliability session.
- **No Message Batches API or extended thinking.** They appear elsewhere in
  the guide and need their own API-focused treatment. They are not needed to
  understand the two systems here.
- **No provenance system beyond source IDs and dates.** The editor preserves
  the fields required by the study guide examples. A production citation and
  conflict-resolution design would need Chapter 12.
- **No arbitrary loop limit as completion logic.** A production guard may use a
  budget to stop runaway cost, but the deck teaches that the API's structured
  stop signal controls normal continuation.
- **No claim that parallel work is always better.** It helps only when
  subtasks are independent. A dependency belongs in a sequential step or a
  dynamic plan.

## Demo design

The demo has one event vocabulary and two runners.

1. The **live research runner** calls `query()` from the Claude Agent SDK. It
   defines a coordinator, three parallel reporters, and a synthesis editor.
   Each reporter receives an explicit source path and a compact output contract.
   The reporter packets are local, so the live run needs Claude Code login but
   not a web API key. `settingSources: []` and a read-only tool guard keep the
   fixture isolated.
2. The **live support runner** executes real local TypeScript functions. It
   first attempts `lookup_order` too early, shows the guard deny it, verifies
   `CUST-2048`, trims the order ledger, refunds `$18.00`, and escalates the
   competitor-price policy gap. The action path is deterministic by design.
3. The **rehearsal runner** replays the same event shapes and payloads without a
   model or network. The slide deck embeds a copy of those events because it
   must work as a static link. `demo/src/mock.ts` and the deck's arrays are one
   contract and must be updated together if identifiers or payloads change.

The important live research event order is:

1. coordinator starts and receives the research question;
2. three reporters spawn in one turn;
3. each reporter reads only its assigned packet;
4. two reports complete and the music report returns structured partial
   failure;
5. the coordinator passes all reports to the synthesis editor;
6. the final brief labels music partial and the run ends cleanly.

The important support event order is:

1. request and case facts;
2. two issue cards;
3. an early `lookup_order` attempt is denied by code;
4. verified customer, trimmed order, and safe refund;
5. manager handoff for the policy gap;
6. final outcome and clean exit.

Each event row in the deck is clickable. It shows the full JSON payload so the
class can see that a blocked call is not an empty business result and that a
handoff contains enough context for a person who never saw the conversation.
