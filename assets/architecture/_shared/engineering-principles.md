# Engineering Principles — the bar every agent codes to

> **Senior mindset:** the goal is working software the team can read, trust, and change — not a showcase of patterns. These principles apply to writing, reviewing, designing, and documenting code.

## 1. Simple first — never overengineer

- Start with the simplest design that solves **today's** requirement. YAGNI: don't build for imagined futures.
- No speculative abstractions: no interface with a single implementation "for later", no config for values that never change, no generic helper with one caller.
- Earn complexity: add a layer/pattern only when the simple version demonstrably fails — a measured performance problem, real duplication (3+ sites), variability that exists today.
- When two designs both work, pick the one with fewer moving parts.

## 2. Think business first — always see the whole picture

Before writing any code:

1. **Restate the business requirement** in 1–2 sentences: who uses this, what must be true after it runs, what must never happen.
2. **Walk the scenario end-to-end**, not just the happy path: empty/null/boundary input, failure paths, permissions, and idempotency/concurrency wherever money or state is involved.
3. **Trace the blast radius**: who calls or depends on what you're touching? Update every affected site — a half-changed codebase is worse than an unchanged one.

If a business rule is ambiguous, ask — never invent business behavior.

## 3. Challenge the solution — fit, risk, worth it

Never accept a feature or solution at face value; pushing back is part of the job:

- **Fit**: does this solution suit THIS project's stack, scale, and conventions? A pattern that shines elsewhere can be wrong here.
- **Risk**: name what can break before starting — data, security, performance, migration, maintenance burden.
- **Worth it**: weigh cost (effort + added complexity + ongoing maintenance) against real benefit. If it doesn't pay, say so and propose the cheaper alternative — including "don't build it".

Raise concerns BEFORE implementing, with reasons and an alternative — not after the code is written.

## 4. Senior-level code

- **Errors**: handle every exception explicitly with context + logging; never swallow errors in an empty catch; fail fast with clear messages. The app must never crash from an unhandled path.
- **Naming**: intention-revealing, idiomatic to the language AND to this codebase (see `read-project-first.md`). Don't rename existing identifiers unless that is the task.
- **Structure**: small focused functions, guard clauses over deep nesting, split files before they sprawl (~500 lines is the ceiling).
- **Consistency**: your diff should look like the same team wrote it — same style, same test approach as the surrounding code.

## 5. No garbage code

- Every line must justify its existence: no dead code, commented-out blocks, leftover debug prints, unused imports/params/variables.
- No drive-by edits: don't reformat, rename, or "improve" code unrelated to the task.
- Reuse before writing: search for an existing helper/pattern before creating a new one.
- Delete what you obsolete: replacing code means removing the old path, not leaving both.

## 6. Comments must earn their place

- Comment only what the code cannot say: a non-obvious constraint, a business rule, the *why* behind a surprising approach.
- Never write comments that restate the next line, echo the function name, or narrate your edit ("added this to fix…", "changed to use X").
- If a comment is needed to explain *what* the code does, rewrite the code instead.
