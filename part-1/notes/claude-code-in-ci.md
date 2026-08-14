# Claude Code in CI/CD

## 5.9 Claude Code CLI for CI/CD

The -p (or --print) flag:

claude -p "Analyze this pull request for security issues"
Non-interactive mode: processes the prompt, prints to stdout, exits
Does not wait for user input
The only correct way to run Claude in CI/CD pipelines

Structured output for CI:
`claude -p "Review this PR" --output-format json --json-schema '{"type":"object",...}'`

- `--output-format json` — output in JSON
- `--json-schema` — validate output against a schema
- The result can be parsed to automatically post inline PR comments

Session context isolation: The same Claude session that generated code is often less effective at reviewing it (the model retains its reasoning context and is less likely to challenge its own decisions). Use an independent instance for review.

Preventing duplicate comments: When re-reviewing after new commits, include prior review results in context and instruct Claude to report only new or unresolved issues.
