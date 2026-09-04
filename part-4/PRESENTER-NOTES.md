# Run of show, 40 minutes

Twenty-three slides, two demos, one restaurant. Built like Part 1: a divider
announces each half, every slide carries one idea and its headline states
that idea, and each slide depends on the one before it. The first half stays
at Basil Bistro's front counter with one support agent. The second half walks
into the kitchen (the night oven) and the back office (the head chef sends
buyers to market).

Parts 1 to 3 already taught the loop, subagents, hub-and-spoke, hooks, tool
descriptions, and "no sushi" versus "kitchen locked". Do not re-teach them.
Later slides refer back in one line each.

## How this deck teaches

- **Survey.** Two divider slides list what is coming. Each kicker says where
  you are ("The support agent · 5 of 9 · step 5"). Slide 4 and slide 17 lay
  out the steps every later slide hangs on.
- **One case first, then the mechanisms.** Slide 4 shows Mara's whole case
  done right: her message, the agent's final reply, and the six steps between
  them. Slides 5 to 11 take the steps in order and show where each breaks.
  Slide 17 does the same for the back office with four steps.
- **Question before answer.** Thirteen green **Predict** boxes hold real
  exam-shaped situations. Ask, wait for two or three answers from the room,
  then click Reveal. Wrong guesses are the point.
  On slides 5 to 11 and 16 the answer replaces the question when you click Reveal;
  click Hide to bring the question back.
- **Recall at the end.** Slide 23 hides nine sentences behind cues. Ask the
  room to say each before you click Show.

The highlighted terms open dialogs with the depth: the guide's JSON, the
distractors and why they lose, the API numbers. Every dialog is optional.

## Before class

```bash
cd part-4/demo
npm install
npm run demo
```

Open http://127.0.0.1:5049/part-4/slides.html and press `F` for fullscreen.
On slide 13 click **Rehearse** and watch the drawers, the ticket, and the
manager card fill. On slide 22 click **Rehearse**, watch the head chef send
three buyers, and click the fish buyer to read its note. Confirm
`claude -p "hi"` works if you plan to click **Run live** on slide 22. Slide
13's live path is local TypeScript and needs nothing.

The static `file://` link works for everything except the two live buttons.

## Timing

| Time | Slide | Must-hit beat |
| --- | --- | --- |
| 0:00–0:01 | 1–2 | Read the four points, then the divider list. "Parts 1 to 3 gave you an agent that works. This half makes it one you can trust with money and policy." |
| 0:01–0:03 | 3 | Read the exam scenario in its own words. Unpack the two halves of the target: solve most alone, and know when a person decides. |
| 0:03–0:05 | 4 | The slide plays itself when it opens (about 15 seconds): Mara types, sends, the agent answers, the why-box appears, then the six steps land one by one. Stay quiet until the reply is on screen, then walk the six steps. **Replay** restarts it; **Skip** shows everything at once if you are short on time. Say: "the rest of this half takes these steps in order and breaks each one." |
| 0:05–0:07 | 5 | Step 1. Left side is the problem, right side is the fix. Read the failure box (practice question 48), then the red trace. Point at "get_customer again" and ask why. Then the three "be careful" bullets in your own voice: the prompt steers every call; the history is there but the prompt outranks it; two issues means two fresh starts. Click "gives no plan" for the two prompts side by side. Then read the four prompt lines on the right and the green trace. Click "see it on the wire" only for engineer-heavy rooms. Predict: the 58% look-alike wants few-shot (question 47), not decomposition. If someone says "just pass the messages array", agree that it is required and point out the exam agent already does, yet still refetches. |
| 0:07–0:11 | 6 | Steps 2 and 3. Left is the problem: the 12% skip (questions 1 and 51), the red trace, then the three "be careful" bullets: a prompt is a request, louder wording is a wrong answer, few-shot does not block. Right is the fix: read the four lines of code, then the "why this fix works" box in one breath (code is deterministic, a rule can only ask), then the green trace with DENIED. Click the trace link for the exam question and distractors. Predict: two Mara Singhs (question 55), ask for another identifier. |
| 0:11–0:14 | 7 | Step 5. Left is the problem: the 55% agent (worked question 3, practice question 49) and the three shortcuts that are wrong answers, in the guide's own table. Right is the fix: the guide's five-row escalation table, read aloud row by row, then "put it in the prompt as criteria plus examples". Predict: question 50, which of four cases is the real policy gap. |
| 0:14–0:16 | 8 | Step 5. Left: the thin-handoff trace, and say the guide's rule yourself (the manager only sees the summary); three "be careful" bullets: one-line reason, free text, fields the agent cannot know. Right: the bad handoff, then the guide's handoff JSON read aloud, then the "make the UI pretty" ticket analogy. Predict: which fields required, which nullable. Open the schema dialog for engineer-heavy rooms. |
| 0:16–0:18 | 9 | Step 3. Left: the 15% discount that became "promotional pricing was discussed" (question 54), then three "be careful" bullets: summarization blurs numbers, the delaying fixes are wrong answers, tool results add noise. Right: one request at turn 26, read top to bottom (facts block, summary of turns 1 to 20, turns 21 to 25 word for word, trimmed tool result); click a layer when someone asks "how does that look in real life". Then the meeting and contact-list analogy. Predict: the 78,000-token cooking session (question 65), hybrid; say when the searchable archive becomes the answer (question 68). |
| 0:18–0:20 | 10 | Step 6. Left: the valid-but-wrong extraction, then three "be careful" bullets: the schema checks shape not truth, "try again" needs the exact error, retry cannot find what is absent. Right: the six-line check-and-retry code, then self-correction (stated versus calculated total) and the self-critique pass (question 52), then the spell-checker versus proofreader analogy. Predict: A or B, which retry helps. |
| 0:20–0:22 | 11 | Step 6 at scale. Say the name first: stratified random sampling. Left: 97% overall hiding 40% on receipts, then three "be careful" bullets: one overall number, checking only the doubtful ones, the two meanings of "confidence" (slide 7 versus here). Right: the table that shows how 60% on 3% of volume still averages to 97%, then the three steps, then the factory analogy. Predict: is 97% ready to automate? |
| 0:22–0:23 | 12 | What to watch for. Read the five bullets; they are the checklist for the demo. |
| 0:23–0:26 | 13 | Click **Rehearse** at once. Point at DENIED, the ticket growing, "trimmed 14 fields", the manager card filling last. Click a row. |
| 0:26–0:27 | 14 | Divider. "Nobody is waiting at the counter for any of this." |
| 0:27–0:30 | 15 | Day oven, night oven. Label, no talking to the oven, test loaf. Predict: the manager who wants both workloads on Batches. |
| 0:30–0:32 | 16 | Point at the top chart: the same order in every row, arriving just after a tray went in. Only the orange wait changes. Ask the room which rows cross the promise line before you read them. Then the day bar: the order at 00:05 waits the whole window, the one at 04:30 barely waits. Right side: splitting buys only a shorter wait; then the three-row table for when to use one load, split, or not Batches. Predict: 26 hours, and the 20-hour trap. |
| 0:32–0:34 | 17 | The back office cast and four steps. One line for the Part 1 callback, then move on. |
| 0:34–0:35 | 18 | Split so it covers every course; no overlap; narrow passes. Predict: creative industries, only visual art. |
| 0:35–0:36 | 19 | Closed market versus empty shelf. The structured note. Coverage labels. Predict: 3 of 5 markets. |
| 0:36–0:37 | 20 | Supplier and date on every price. Both tomato quotes stay. Predict: 40% versus 12%. |
| 0:37–0:38 | 21 | Key findings first; the sheet, not the catalog. Predict: the 75K-token middle. |
| 0:38–0:39 | 22 | Click **Rehearse**. Three spawns in one turn, fish partial, both tomato quotes in the plan. Click the fish buyer. Run live only if time and login allow. |
| 0:39–0:40 | 23 | Cover, recall, check. Ask for each sentence before you click Show. Leave it on screen for questions. |

## Spoken segues

- 2 to 3: "Before any mechanism, here is what the exam actually asks of this
  agent, in its own words."
- 3 to 4: "Before any rule, here is the whole job done right. One guest, one
  conversation, one refund, one handoff."
- 4 to 5: "Step 1. Mara said two things in one breath."
- 5 to 6: "Steps 2 and 3. Before the host touches the ledger or the till, one
  question: who is this?"
- 6 to 7: "The lock handles the order of calls. Now the boundary that matters
  most: 'I handle this' versus 'a person handles this'."
- 7 to 8: "When the host does call the manager, what does the manager get?"
- 8 to 9: "The handoff has the facts because the host kept them. Here is
  where they lived."
- 9 to 10: "Right facts, right decision. Is the answer good?"
- 10 to 11: "That was one plate. Now a thousand a day."
- 11 to 12: "Rules done. Before the demo, here is what to look for."
- 13 to 14: "Everything so far had someone waiting. Second half: nobody is."
- 14 to 15: "The night oven."
- 15 to 16: "Within 24 hours sounds harmless until you promise a customer 30."
- 16 to 17: "Out of the kitchen, into the back office. The head chef has a
  menu to source and cannot visit every market."
- 17 to 18: "Step 1: how the chef splits the menu."
- 18 to 19: "The buyers are back. One of them has bad news."
- 19 to 20: "Step 4: what must be on the sheet the chef reads?"
- 20 to 21: "And how big should that sheet be?"
- 21 to 22: "Watch the chef run it."
- 22 to 23: "Nine sentences. Say them before I show them."

## Interaction openings

- Slide 3: ask what "appropriate escalation" would look like in their own
  product before you show the bullets.
- Slide 4: ask what a bad host does with a two-issue complaint. Someone will
  say "forgets the second one".
- Slide 6: ask what goes wrong if the host looks up an order by name alone.
  Then ask whether a louder prompt line would fix it, before you read the
  second bullet.
- Slide 7: ask whether an angry guest should reach the manager faster than a
  calm one. Then ask what the guest has to say for immediate escalation.
- Slide 8: ask what a manager needs if the transcript vanished.
- Slide 10: ask which of the five steps a schema can do. Answer: only part of
  step 1.
- Slide 16: before revealing the chart, ask the room to compute the worst case
  for an order that arrives right after a tray goes in, with one load a day.
- Slide 19: ask what "0 results" from the industry-reports source means versus
  "connection timeout" from the patent database. Part 2 gave them the words.
- Slide 20: ask what is missing from "$3.60/kg" as a fact. Supplier, date.
- Slide 23: recall is the interaction. Do not skip it for time.

## Demo recovery

- **Static deck:** both **Rehearse** buttons work. The live buttons explain
  that the local server is missing.
- **Support live (slide 13):** click Stop, then Run live again. No external
  dependency. If the drawers look stale, click Rehearse once to reset.
- **Research live (slide 22):** do not debug credentials on stage. Click
  Stop, click Rehearse, and say that the rehearsal preserves the event order
  and payload shapes. A real run took 85 seconds and about $0.47 in testing.
  The model's wording varies; the fixture guarantees the fish timeout and the
  two tomato quotes.
- **Terminal:** `npm run trace -- --rehearse support` and
  `npm run trace -- --rehearse research` are the fastest smoke tests.
  `npm run trace -- support` runs the real local guard.
  `npm run trace -- research` runs the real Agent SDK.

## Callbacks and deferrals

- Part 1: the loop, Task/Agent, hub-and-spoke, hooks, schema rules, error
  categories, lost-in-the-middle. Slides 4, 6, 8, 17, 18, and 21 name the
  callback in one line each.
- Part 2: tool descriptions and "no sushi" versus "menu unavailable". The
  "descriptions first" exam item now lives only in a dialog; slide 19 lifts
  the "no sushi" distinction to the coordinator.
- Part 3: ask versus enforce, /compact blurring numbers, the fresh-eyes
  reviewer. Slides 6, 9, and the multi-pass dialog point back.
- **Deferred to dialogs:** Chapter 12.4 rendering, Chapter 11.6 state
  persistence, the interview pattern, multi-pass review, confidence
  calibration detail.
- **Not covered by this course:** the Developer Productivity Tools,
  Conversational AI Architecture, and Agentic AI Tools scenarios. The weights
  dialog on slide 3 lists all eight.

## Questions worth leaving open

- Which rule in your support prompt is an adjective, and what would the three
  example tickets be?
- Who in your company receives an escalation today, and what do they see?
- Which of your batch-shaped jobs still runs on the day oven?
- Where does a number in your reports travel without its source and date?
