# Market packet: fish

- source_id: FISH-2026-09
- source_type: price desk lookup
- SOURCE_STATUS: unavailable

The fish market's price desk did not answer before the deadline. The request
timed out. This file is a fixture for the failure path, not evidence about fish
prices. Do not turn the timeout into an empty successful result. Return
`status: partial_failure`, `failure_type: source_timeout`, the attempted query
"autumn fish quotes for the tasting menu", `partial_results: []`, the
alternatives "ask the secondary fishmonger" and "retry tomorrow morning", and
the coverage impact "the fish course is not sourced".
