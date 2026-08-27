# Part 3 source notes

## Communication job

- Audience: Ravn engineers studying for the Claude Certified Architect
  Foundations exam, plus colleagues who do not configure Claude Code every
  day.
- Job: make Claude Code configuration concrete enough that the audience can
  reason through exam scenarios about who owns a rule, when it loads, and how
  Claude runs unattended.
- Form: 40-minute browser-native deck with one local demo (deterministic
  loader plus a live headless run).
- Register: the same direct, conversational style as Parts 1 and 2, pitched
  at the half of the room that has never written a CLAUDE.md. Slang stays in
  the delivery, not on the slides.
- Continuity: the deck names its callbacks rather than assuming them. Part 1
  gave Claude hands and taught that prompts ask while hooks enforce. Part 2
  gave the order counter and taught the two MCP configuration scopes. Part 3
  trains the staff that works behind that counter and then leaves one of them
  to run the place overnight.

## Sources

### Ravn study guide

https://ravnhq.github.io/claude-certified-architect/guides/en.html

The specific guide sections behind this deck are:

- [Chapter 5: Claude Code — Configuration and Workflows](https://ravnhq.github.io/claude-certified-architect/guides/en.html#chapter-5-claude-code-configuration-and-workflows):
  sections 5.1–5.10. The deck follows the chapter's order closely.
- [Domain 3: Claude Code Configuration and Workflows](https://ravnhq.github.io/claude-certified-architect/guides/en.html#domain-3-claude-code-configuration-and-workflows-20):
  the exam framing (20% of the exam) for hierarchy, slash commands and
  skills, path-specific rules, planning mode, and iterative refinement.
- [Scenario 2: Code Generation with Claude Code](https://ravnhq.github.io/claude-certified-architect/guides/en.html#scenario-2-code-generation-with-claude-code)
  and [Scenario 5: Claude Code for Continuous Integration](https://ravnhq.github.io/claude-certified-architect/guides/en.html#scenario-5-claude-code-for-continuous-integration):
  the two exam scenarios this part serves.
- Practice questions 10, 16, and 17 (the `-p` flag; `--output-format json`
  with `--json-schema`; the independent review instance) supply slides 15 and
  16.
- [Exercise 2: Configuring Claude Code for Team Development](https://ravnhq.github.io/claude-certified-architect/guides/en.html#exercise-2-configuring-claude-code-for-team-development)
  is effectively the demo's fixture repo: project CLAUDE.md, `.claude/rules/`
  with frontmatter, a skill with `context: fork` and `allowed-tools`, and the
  planning-vs-direct choice.

Claim-by-claim mapping:

- Slide 2's premise (no memory between sessions; the host loads files) is
  Part 1's statelessness fact (guide 1.2) applied at the tool level.
- Slides 3–4 carry guide 5.1: the three-level CLAUDE.md hierarchy, the
  new-teammate mistake, and user-level files never being shared via VCS.
  Slide 3's lean-handbook guidance (specific and checkable rules, name the
  replacement, emphasis as a budget, treat wrong behavior as a bug report
  against the file) comes from Domain 3.1's note. "Instruction, not
  configuration; a hard rule belongs in a PreToolUse hook" is Domain 3.1's
  opening sentence.
- Slide 5 (ask vs enforce) reuses Domain 3.1's hook point and Part 1's
  deterministic-vs-probabilistic table (guide 3.5).
- Slide 6 carries guide 5.2: `@` immediately before the path, relative
  resolution, nesting depth 5, and — from Domain 3.1's note — imports expand
  inline at launch and do not reduce context.
- Slide 7 carries guide 5.3 and Domain 3.3: YAML frontmatter `paths`, load
  only when editing matching files, globs for file kinds versus
  directory-level CLAUDE.md for one place.
- Slides 8–9 carry guide 5.4–5.5 and Domain 3.2: project commands shared via
  VCS, user commands private, both formats creating `/name` commands, skills
  as folders with `SKILL.md` frontmatter, `context: fork`, `allowed-tools`,
  `argument-hint`, skill-vs-CLAUDE.md (on demand vs always), personal
  variants under different names, and at-rest loading (only the description
  loads until invoked). The plugin caution is Domain 3.2's note.
- Slide 10 carries guide 5.6 and Domain 3.4: planning mode is read-only
  investigation with an approved plan; when to plan vs execute directly; the
  Explore subagent; the combined approach. The steering dialog (`/goal`,
  `/loop`, `/compact` with an instruction, Rewind, worktrees) is Domain 3.4's
  "steering a long run" note.
- Slide 11 carries guide 5.7–5.8 and 5.10 plus Domain 1.7: `/compact`
  (risk of losing numeric values and dates), `/memory`, `--resume`,
  `fork_session`, and fresh-session-with-summary beating stale resumes.
- Slides 15–16 carry guide 5.9: `-p` non-interactive semantics, structured
  output with `--output-format json` and `--json-schema`, session context
  isolation for review, and preventing duplicate comments by feeding prior
  findings back. Practice question 16's rationale supplies the
  parse-and-post-inline-comments story.

### Claude Code documentation

https://code.claude.com/docs/en/ — the guide's official-documentation table
lists Memory, Skills, Hooks, Sub-agents, MCP, GitHub Actions, GitLab CI/CD,
and Headless pages. The deck teaches the guide's version of each claim; the
docs are provenance, not a second source of exam truth.

## Deliberate exclusions

Recorded so the exam answer stays unambiguous:

- **`settings.json`, permission modes, and `allowed-tools` config files.** The
  guide never teaches them in this domain. The two-scope instruction model
  (plus directory level) is the exam's model. A settings lecture would add a
  fourth answer to a three-shelf question.
- **Claude Code hooks as implementation.** Part 1 taught hooks
  deterministically (guide 3.5). This deck only reuses that guarantee on
  slide 5. Teaching hook configuration here would duplicate Part 1 without
  exam coverage in Domain 3.
- **Extended thinking and the Message Batches API.** They surface in the
  guide's CI scenario and practice question 11, but they are Domain 4 API
  material (last-resort accuracy lever; batch for overnight, real-time for
  blocking checks). Deferred to the prompt-engineering part; tracked in the
  presenter notes.
- **Context degradation signals, scratchpad files, and case-facts blocks.**
  Domain 5 material. Slide 11 only names the `/compact` summarization risk
  because the guide puts it under the `/compact` entry.
- **Iterative refinement (Domain 3.5): concrete input/output examples,
  test-driven iteration, the interview pattern.** It is prompt-engineering
  practice that happens inside Claude Code, and Domain 4 teaches the same
  skills with more depth. Named as deferral in the presenter notes.
- **Sub-agents in Claude Code, output styles, IDE integrations.** Not in the
  guide's Domain 3 or chapter 5. Subagent architecture is already Part 1's
  material at the SDK level.
- **MCP configuration.** Part 2 covered it. Slide 4 only separates
  `~/.claude.json` (servers) from `~/.claude/CLAUDE.md` (instructions)
  because the room met both files and deserves the one-dialog disambiguation.

## Teaching model

The restaurant continues. One main scene: the staff area and the back office
of Basil Bistro — the same restaurant Part 2's MCP server ran.

| Technical role | Restaurant object | Responsibility reused or new |
|---|---|---|
| `~/.claude/CLAUDE.md` (user) | the chef's knife roll | New. Personal style, carried to every kitchen, never left behind. |
| Project `CLAUDE.md` | the staff handbook | New. The team's standards, hung by the time clock, committed. |
| Subdirectory `CLAUDE.md` | the station card | New. Rules taped where they apply, loaded only when working there. |
| Hard rule → `PreToolUse` hook | the freezer lock | Callback to Part 1's hooks: paper asks, steel enforces. |
| `@path` imports | the binder that photocopies referenced chapters | New. Organization by reference; expanded inline. |
| `.claude/rules/` with `paths` | laminated cards | New. Pulled out only for matching tickets; globs follow a kind of file. |
| Skills and slash commands | the procedure drawer | New. Fixed procedures pulled by name, on demand. |
| `context: fork` | the commis chef | New. Runs the card in the back; one page comes back. |
| `allowed-tools` | what the card permits | New. Read/Grep/Glob cannot delete files. |
| Planning mode | mise en place (prep before you cook) | New. Read-only investigation, approved plan, then execution. |
| Explore subagent | the commis chef checking the walk-in | New. Verbose discovery stays out of the main context. |
| `/compact` | clearing the counter | New. Summary frees the window; numbers blur. |
| `/memory` | writing the lesson into the handbook | New. Persists across sessions. |
| `fork_session` | two chefs, one base sauce | New. Branches from shared context, diverge independently. |
| `claude -p` | the night shift | New. Unattended, prints, exits. |
| `--json-schema` findings | the close-of-day report form | New. Fixed fields the morning crew can pin to the code. |
| Independent review instance | the health inspector | New. Wasn't in the kitchen when the food was cooked. |
| Plugin | the catering crew | New. Brings its own people and routines; enumerate before hiring. |

Naming continuity: "team recipe book" stays tied to Part 2's `.mcp.json`,
while Part 1's recipe remains its earlier fixed-steps example. Part 3 uses
"procedure" for skills and slash commands, so two committed project files do
not share an analogy. "Menu" still means the Part 2 resource, and Basil
Bistro is still the restaurant. The demo fixture reuses Part 2's menu item
(`margherita-pizza`) in its prep list so the world stays one world.

## Demo design

The mechanism under study is configuration loading plus unattended
execution. Both are isolated from unrelated failure sources:

1. **The loader** (`src/loader.ts`) implements exactly the loading semantics
   the guide documents: user scope, project scope, `@path` expansion (depth
   ≤ 5), directory scope for the touched file's ancestors, `paths` glob
   matching for `.claude/rules/`, and skills/commands at rest. It reads the
   real fixture repo on disk and is fully deterministic — no model, no
   credentials. It is a teaching model, labeled as such; the live step below
   is the real product behavior.
2. **The night shift** (`src/run.ts`) spawns the real `claude -p` inside the
   fixture repo with `--output-format json` and `--json-schema`. The prompt
   is only answerable from the project's own imported standards (maximum
   prep batch 24), so a correct answer proves the handbook loaded. The
   schema-validated findings are what a CI pipeline would post as inline
   comments. Failures surface honestly as error events (CLI missing, auth,
   quota) and the run still ends with a `done` event.
3. **Rehearsal** replays the same event order and payload shapes with the
   loader phase still real (server-side) or fully embedded (static page).

The fixture repo (`fixtures/basil-bistro/`) mirrors Exercise 2 in the guide:
project CLAUDE.md with an import, two `paths`-scoped rules (one matching
tonight's ticket, one not), a skill with `context: fork` and `allowed-tools`,
a legacy command, a station card, and a deliberately non-compliant prep file
(36 portions against a maximum of 24). The user scope uses a stand-in home
directory (`fixtures/home/`) so the demo never touches a real `~/.claude`.
