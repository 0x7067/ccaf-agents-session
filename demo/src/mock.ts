/**
 * A canned, realistic event stream for REHEARSAL ONLY (`npm run demo` then
 * click "Run mock"). It replays the shape of a real run against przsend so
 * Carlos can practice narration and test the projector without spending
 * tokens or time. The class demo should use the real run.
 */

import type { DemoEvent } from "./events.js";

type Timed = { at: number; e: DemoEvent };

const A1 = "toolu_mock_a11y";
const A2 = "toolu_mock_copy";
const A3 = "toolu_mock_code";

export const MOCK_EVENTS: Timed[] = [
  { at: 0, e: { t: "status", msg: "MOCK RUN — replaying a recorded-style session" } },
  {
    at: 300,
    e: {
      t: "init",
      model: "claude-sonnet-4-6",
      tools: ["Agent", "Read", "Grep", "Glob"],
    },
  },
  {
    at: 1500,
    e: {
      t: "coord_text",
      text: "I'll audit this file-sharing app across three dimensions in parallel: accessibility, UX copy, and code quality. Spawning all three auditors now.",
    },
  },
  {
    at: 2600,
    e: {
      t: "spawn",
      id: A1,
      agent: "a11y-auditor",
      description: "Audit UI accessibility",
      prompt:
        "Audit the accessibility of this Next.js temporary-file-sharing app. Focus on src/components/ui and src/app/[locale]. Check heading semantics, interactive element nesting, labels, and contrast. Return at most 4 findings as: [severity] file:line — issue — why — fix.",
    },
  },
  {
    at: 3100,
    e: {
      t: "spawn",
      id: A2,
      agent: "copy-auditor",
      description: "Audit UX copy",
      prompt:
        "Audit the user-facing copy of this app. All strings live in messages/en.json and messages/es.json (next-intl). Check spelling, capitalization consistency, clarity, and en/es parity. Return at most 4 findings as: [severity] file (key) — issue — rewrite.",
    },
  },
  {
    at: 3600,
    e: {
      t: "spawn",
      id: A3,
      agent: "code-auditor",
      description: "Audit server code",
      prompt:
        "Audit server code quality and security. Focus on src/server/functions, src/app/api, and prisma/schema.prisma. Look for plaintext credentials, race conditions, injection, framework misuse. Return at most 4 findings as: [severity] file:line — issue — why — fix.",
    },
  },
  { at: 4800, e: { t: "sub_tool", parentId: A1, tool: "Glob", detail: "src/components/ui/**/*.tsx" } },
  { at: 5200, e: { t: "sub_tool", parentId: A2, tool: "Read", detail: "messages/en.json" } },
  { at: 5600, e: { t: "sub_tool", parentId: A3, tool: "Read", detail: "prisma/schema.prisma" } },
  { at: 6600, e: { t: "sub_tool", parentId: A1, tool: "Read", detail: "files/[fileId]/page.tsx" } },
  { at: 7200, e: { t: "sub_tool", parentId: A2, tool: "Read", detail: "messages/es.json" } },
  { at: 7800, e: { t: "sub_tool", parentId: A3, tool: "Grep", detail: "/password/ in src" } },
  { at: 8900, e: { t: "sub_tool", parentId: A1, tool: "Read", detail: "ui/download-file-button.tsx" } },
  { at: 9500, e: { t: "sub_tool", parentId: A3, tool: "Read", detail: "functions/increase-download-count.ts" } },
  {
    at: 11000,
    e: {
      t: "sub_done",
      parentId: A2,
      result:
        '[high] messages/en.json (ReportModal.report-file-subtitle) — "malicious or ilegal" is misspelled — should be "illegal".\n[med] messages/en.json (Errors.error-uploading-description) — "An error has occured" — should be "occurred".\n[med] Inconsistent capitalization: "Report Type" (Title Case) vs "Additional details" (sentence case) in the same form.\n[low] Footer key "made-with-love-by" renders as "PRZ SEND by" — key name and copy have drifted apart.',
    },
  },
  {
    at: 13500,
    e: {
      t: "sub_done",
      parentId: A1,
      result:
        "[high] files/[fileId]/page.tsx:172 — <h2> elements used as field labels (\"File name:\") — headings are for structure, not labels; screen readers announce a broken outline. Use <dt>/<dd> or plain labels.\n[high] ui/download-file-button.tsx:118 — <Button> nested inside <a> — invalid HTML, double tab stop, confusing for assistive tech. Make the anchor the button.\n[med] ui/download-file-button.tsx:96 — download-limit warning uses text-red-700 on the dark theme — likely fails WCAG AA contrast.\n[med] ui/dropzone.tsx:33 — dropzone div is clickable but the inner input is the only focusable element — verify keyboard flow announces the drop target.",
    },
  },
  {
    at: 16000,
    e: {
      t: "sub_done",
      parentId: A3,
      result:
        "[crit] prisma/schema.prisma:44 + functions/access-file-with-password.ts:10 — file passwords stored and compared in PLAINTEXT (where: { id, password }). Hash with bcrypt/argon2.\n[high] functions/increase-download-count.ts:8 — read-after-increment race: parallel downloads can exceed downloadLimit before deletion triggers. Use a conditional update in one transaction.\n[high] functions/submit-error-report-form.ts:24 — user input interpolated raw into email HTML — HTML injection. Escape or send plaintext.\n[med] app/[locale]/files/[fileId]/page.tsx:1 — next/head <Head> is a silent no-op in the App Router — page metadata is never set. Use the metadata export.",
    },
  },
  {
    at: 17500,
    e: {
      t: "coord_text",
      text: "All three auditors reported back. Merging their findings into one prioritized report.",
    },
  },
  {
    at: 19500,
    e: {
      t: "result",
      report: [
        "## Audit report — przsend",
        "",
        "Three specialist auditors reviewed the app in parallel. The app is in good shape overall, but one critical security issue (plaintext passwords) should be fixed before anything else.",
        "",
        "1. 🔴 **[crit] Plaintext file passwords** — stored and compared as-is in the DB (`schema.prisma`, `access-file-with-password.ts`). Hash them. *(code-auditor)*",
        "2. 🟠 **[high] Download-count race** — parallel downloads can blow past the limit (`increase-download-count.ts`). Single conditional transaction. *(code-auditor)*",
        "3. 🟠 **[high] HTML injection in feedback email** — user text interpolated into HTML (`submit-error-report-form.ts`). Escape it. *(code-auditor)*",
        "4. 🟠 **[high] Button nested inside link** — invalid HTML on the download CTA (`download-file-button.tsx`). *(a11y-auditor)*",
        "5. 🟠 **[high] Headings used as labels** — broken outline on the download page (`files/[fileId]/page.tsx`). *(a11y-auditor)*",
        "6. 🟠 **[high] “ilegal” typo** — in the report-file modal (`messages/en.json`). *(copy-auditor)*",
        "7. 🟡 **[med] `next/head` no-op in App Router** — page metadata silently ignored. *(code-auditor)*",
        "8. 🟡 **[med] “occured” typo + inconsistent capitalization** across forms. *(copy-auditor)*",
        "9. 🟡 **[med] Contrast risk** — `text-red-700` warning on dark theme. *(a11y-auditor)*",
      ].join("\n"),
      costUsd: 0.42,
      durationMs: 19200,
      numTurns: 4,
    },
  },
];

export function playMock(emit: (e: DemoEvent) => void): () => void {
  const timers = MOCK_EVENTS.map(({ at, e }) => setTimeout(() => emit(e), at));
  return () => timers.forEach(clearTimeout);
}
