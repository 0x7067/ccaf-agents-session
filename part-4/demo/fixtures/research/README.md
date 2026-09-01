# Research fixture

This is a small local source packet for the live Part 4 research run. It keeps
network access and credentials out of the classroom demo while giving the real
Claude Agent SDK subagents files to inspect.

The coordinator assigns one packet to each beat reporter. `music.md` contains
a deliberate unavailable-source marker. A reporter must return a structured
partial failure instead of pretending that the source returned no matches.
