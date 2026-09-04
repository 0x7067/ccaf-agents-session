# Market fixture

This is a small local packet of market quote sheets for the live Part 4
research run. It keeps network access and credentials out of the classroom demo
while giving the real Claude Agent SDK subagents files to inspect.

The head chef (coordinator) assigns one packet to each buyer (subagent):
`produce.md`, `fish.md`, and `wine.md`. `fish.md` contains a deliberate
unavailable-source marker. A buyer must return a structured partial failure
instead of pretending that the market had no prices. `produce.md` contains two
tomato quotes with different dates. A buyer must keep both with supplier and
date instead of picking one.
