#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# The SAME audit the class just watched, headless, exactly as CI runs it.
#
#   npm run audit:headless          (from the demo/ folder)
#   AUDIT_REPO=/path/to/repo npm run audit:headless
#
# Teaching points baked into this file:
#   -p / --print         → non-interactive: process, print, exit. THE way to
#                          run Claude in CI. No TTY, no questions asked.
#   --agents             → the same three subagent definitions as the live demo
#   --output-format json → machine-readable result envelope
#   --json-schema        → the model's answer must match audit-schema.json
#                          (guarantees valid JSON + required fields; does NOT
#                           guarantee the values are true, schema ≠ semantics)
#   fresh session        → this process shares NO context with any session that
#                          wrote the code. Author ≠ reviewer.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

DIR="$(cd "$(dirname "$0")" && pwd)"
REPO="${AUDIT_REPO:-$HOME/dev/web/przsend}"
OUT="${AUDIT_OUT:-$DIR/audit-result.json}"

PROMPT='Audit this repository. You are the coordinator: do not read project
files yourself. Spawn the a11y-auditor, copy-auditor and code-auditor subagents
IN PARALLEL in your first response, giving each the context it needs (this is a
Next.js temporary-file-sharing app using next-intl and Prisma). When all three
report back, merge their findings into the structured output.'

echo "── headless audit of $REPO ──"
cd "$REPO"

claude -p "$PROMPT" \
  --agents "$(cat "$DIR/auditors.json")" \
  --allowed-tools "Agent" "Task" "Read" "Grep" "Glob" \
  --output-format json \
  --json-schema "$(cat "$DIR/audit-schema.json")" \
  > "$OUT"

echo "── raw result envelope → $OUT ──"

# In a real pipeline this is where you'd post PR comments. Here: pretty-print.
if command -v jq >/dev/null; then
  echo
  jq -r '.structured_output.summary // empty' "$OUT"
  echo
  jq -r '.structured_output.findings[]?
         | "[\(.severity)] \(.dimension) · \(.file)\(if .line then ":\(.line)" else "" end) | \(.issue)"' "$OUT"
fi
