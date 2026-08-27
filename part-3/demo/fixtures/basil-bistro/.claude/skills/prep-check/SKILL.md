---
name: prep-check
description: Audit a station's prep against the kitchen handbook and print the close-of-day checklist. Use when closing the kitchen or checking whether prep is ready.
context: fork
allowed-tools: ["Read", "Grep", "Glob"]
argument-hint: "Station to audit, for example pizza"
---

# Prep check

Runs in its own forked context, so the verbose audit never fills the main
session.

## Steps

1. Read the station named in the argument (default: every station).
2. Check each item against docs/prep-standards.md.
3. Print the close-of-day checklist with any violations.

The allowed-tools list is the boundary: this skill can read and search, but it
cannot write files or run shell commands.
