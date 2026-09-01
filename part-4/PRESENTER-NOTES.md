# Run of show, 40 minutes

This office hour has two scenes. The research desk is deliberately not a
restaurant. The second half returns to Basil Bistro. Say that boundary out
loud so the room does not try to force one analogy onto both systems.

The deck has 18 slides. It opens with the question underneath both scenarios,
then follows a research request before naming the design choices. The research
demo comes before the support scene. The support trace then makes the same
architecture concrete when money and policy enter the room.

## Before class

```bash
cd part-4/demo
npm install
npm run demo
```

Open http://127.0.0.1:5049/part-4/slides.html and press `F` for fullscreen.
Click **Research rehearsal** on slide 9 and **Support rehearsal** on slide 14.
Click an event row and confirm the JSON appears in the right-hand panel. The
rehearsal buttons also work from a static `file://` link.

The research live button needs the Claude Code CLI installed and logged in. It
runs against the local fixture packet and may take a few minutes. The support
live button is local TypeScript and needs no credentials. Use the rehearsal in
front of the room unless you specifically want to inspect the real SDK trace.

## Timing

| Time | Slides | Must-hit beat |
| --- | --- | --- |
| 0:00–0:02 | 1–2 | Name the beginner's question. One large request can exceed one context. We need more workers without losing ownership of the answer. |
| 0:02–0:05 | 3 | Follow the research request from editor to reporters to brief. Do not explain configuration yet. Ask what the editor must remember when music times out. |
| 0:05–0:08 | 4 | Name the newsroom cast. Reporters do not talk to one another. The editor owns routing, errors, and the final message. |
| 0:08–0:11 | 5 | Choose fixed versus dynamic decomposition. Research starts with a broad question, then the result of each assignment can change the next action. |
| 0:11–0:14 | 6 | Show the parallel assignment slips. `Task` or current SDK `Agent` is a tool call. Every prompt carries its own context. |
| 0:14–0:17 | 7 | Separate "no matches" from "the source failed". Keep partial work and annotate the missing section. |
| 0:17–0:20 | 8 | Protect context with facts, trimming, position, scratchpad, and compact subagent reports. Open the context dialog if the room wants the longer list. |
| 0:20–0:25 | 9 | Click **Research rehearsal** immediately. Read the three spawn rows, the music partial failure, and the synthesis prompt. Let somebody click the final row and inspect the report. |
| 0:25–0:27 | 10 | Reset the analogy. The research desk is over. A guest is now standing at Basil Bistro's counter with two issues. |
| 0:27–0:30 | 11 | Diagnose tool choice. Descriptions are the first fix when similar tools are confused. The model chooses; the tool label narrows the choice. |
| 0:30–0:33 | 12 | Contrast prompt guidance with a programmatic precondition. Let the room predict what happens when `lookup_order` is called before `get_customer`. |
| 0:33–0:35 | 13 | Show the case-facts block, the trimmed order slip, and the manager handoff. The refund is a success; the policy gap is an escalation. Neither becomes an empty result. |
| 0:35–0:38 | 14 | Click **Support rehearsal**. Point at the denied call, verified ID, five retained order fields, refund, and handoff. |
| 0:38–0:39 | 15–16 | Run the two short question checks. Tie each answer to the smallest mechanism that fixes the observed failure. |
| 0:39–0:40 | 17–18 | Give the exam decision table, then leave the reading links and final rules visible for questions. |

## Spoken segues

Use these as handoffs, not as lines to memorize.

- Slide 1 to 2: "The technical version is simple: who decides the next step,
  and what stops a wrong step?"
- Slide 2 to 3: "Let's follow one research question before we name any
  architecture."
- Slide 3 to 4: "Now name the people in that trace."
- Slide 4 to 5: "Once we know who is working, we still need to decide whether
  the plan is fixed or can change."
- Slide 5 to 6: "The plan is only useful if the assignments carry enough
  context to stand on their own."
- Slide 6 to 7: "A failed packet should change the report, not erase the work
  that finished."
- Slide 7 to 8: "There is one more resource to protect: the context window."
- Slide 8 to 9: "You have the rules. Watch the editor use them."
- Slide 9 to 10: "That was an open research question. Now put a real guest at
  the counter."
- Slide 10 to 11: "The host cannot choose a drawer whose label is vague."
- Slide 11 to 12: "A good label helps. It still cannot guarantee the order of
  a refund."
- Slide 12 to 13: "After the lock lets us work, we still need to remember the
  right facts and hand over the unresolved part."
- Slide 13 to 14: "Let's see the whole support path, including the unsafe call
  that never reaches the ledger."
- Slide 14 to 15: "The trace showed the answer. Now use the exam's wording."
- Slide 16 to 17: "Here is the small decision table I use when two answers both
  sound plausible."
- Slide 17 to 18: "These are the readings. The last slide is the pocket card."

## Interaction openings

- Slide 2: ask whether the room would give one agent every source and every
  tool, or split the work. Ask what could go wrong with each choice.
- Slide 3: ask what the editor should say about music after a timeout. The
  answer should be "partial coverage", not "no results".
- Slide 5: ask for a task whose exact steps are known before contrasting it
  with an investigation whose next step depends on what it finds.
- Slide 6: ask what must be written in a reporter's assignment if the reporter
  cannot see the editor's conversation.
- Slide 7: ask whether zero search matches and a timeout should both trigger a
  retry.
- Slide 9: ask someone to click the music report, then the synthesis spawn. The
  payloads make explicit context visible.
- Slide 11: show `get_customer` and `lookup_order` with weak labels and ask
  which change comes first. Reveal the descriptions answer.
- Slide 12: ask whether a prompt saying "verify first" can guarantee that a
  refund never runs early. Wait for someone to say no.
- Slide 13: ask what a manager would need if the transcript disappeared.
- Slide 14: ask someone to inspect the rejected `lookup_order` result and say
  why it is not an empty order search.
- Slide 15: let the room answer before revealing the explanation. Keep the
  answer tied to a concrete failure, not a memorized buzzword.

## Demo recovery

- **Static deck:** use Research rehearsal and Support rehearsal. The live
  buttons will explain that the local server is missing.
- **Local support live:** click Stop, then run it again. It has no external
  dependency. If a row stops halfway, reload the page.
- **Research live:** do not debug credentials in front of the room. Click Stop,
  use Research rehearsal, and mention that the rehearsal preserves the event
  order and payload shapes. If the CLI is not installed, the research live
  path reports that and exits without leaving a child process.
- **Terminal trace:** `npm run trace -- --rehearse support` is the fastest
  smoke test. `npm run trace -- support` exercises the real local guard path.
  `npm run trace -- research` requires Claude Code login.

## Debts and deferrals

- Part 1's loop, `stop_reason`, hub-and-spoke, subagents, and hooks are recap,
  not new vocabulary. Say "this is the loop from Part 1" when slide 6 opens.
- Part 2's structured tool results and Basil Bistro return on slides 11–14.
  Do not re-teach MCP discovery or transports.
- Part 3's context-loading files are not part of this session. Chapter 11's
  context budget is the topic here.
- **Deferred:** full Chapter 9 escalation patterns, confidence calibration,
  and Chapter 10 retry categories. Only the rules needed by the two scenarios
  appear here.
- **Deferred:** Message Batches API and extended thinking. They belong in a
  later API and prompt-engineering session.
- **Deferred:** full provenance and conflict reconciliation from Chapter 12.
  The research trace keeps source IDs and dates but does not teach a citation
  database.

## Questions worth leaving open

- Which part of your current research workflow is actually a fixed pipeline?
- Where does a support tool in your system have a label that is too broad to
  guide selection?
- Which financial or permission rule in your system still lives only in a
  prompt?
- What facts would be painful to lose if your current conversation were
  summarized tonight?
