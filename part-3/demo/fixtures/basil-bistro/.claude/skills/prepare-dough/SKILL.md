---
name: prepare-dough
description: Mix flour, water, and yeast to spec, knead, proof until doubled, and report when the dough is ready to bake.
context: fork
allowed-tools: ["Read", "Grep", "Glob", "Write"]
argument-hint: "Recipe to follow, for example pizza-dough"
---

# Prepare dough

Runs in its own forked context, so the mixing details never fill the main
session. The chef gets back "dough is ready" or "it didn't work out."

## Steps

1. Read the recipe named in the argument (default: pizza-dough).
2. Check ingredient stock against docs/prep-standards.md.
3. Mix, knead, and proof. Write the dough state to a temp file.
4. Report readiness or failure.

The allowed-tools list is the boundary: this skill can read, search, and write,
but it cannot run shell commands or delete files.
