---
name: cleanup
description: Safely remove dead code and consolidate duplicates. Two modes — DEAD-CODE (remove unreachable/unused code) and DUPLICATE (merge copy-paste into one canonical). Detect with stack-appropriate tools, VERIFY every hit with grep, then classify DELETE (true dead) vs KEEP (reusable utilities/helpers/scopes — never delete on a tool signal alone). Stack-aware. Use when the user says "cleanup", "clean up codebase", "dead code", "remove dead code", "remove unused code", "find unused code", "unused code", "declutter", "tech debt", "duplicate code", "consolidate duplicates", "copy-paste code".
args: "[MODE]"
---

# Cleanup Workflow

Remove rot **without deleting things worth keeping**. Tools only propose candidates — grep and judgment decide what actually goes. The classic failure is trusting a dead-code tool blindly and deleting reusable helpers, which turns a "cleanup" into a rejected mess.

## Pick your mode

| Situation | Mode | Jump to |
|-----------|------|---------|
| Remove unreachable / unused code | **DEAD-CODE** | [Mode DEAD-CODE](#mode-dead-code) |
| Consolidate copy-paste into one canonical | **DUPLICATE** | [Mode DUPLICATE](#mode-duplicate) |

Run either, or both in sequence. If scope is unclear, ask one line: *"Whole repo or just `<module>`? Delete directly, or report for review first?"* then proceed.

- ❌ Reformatting / renaming / restructuring working code → use `@refactor`.
- ❌ Reviewing a branch/PR for quality → use `/review-code`.
- ❌ A bug surfaced during cleanup → use `/fix-bug`.

## ⛔ Rule #1 — Keep reusable, delete only true dead (both modes)

> A tool reporting "unused / unreachable" is **not enough** to delete. Classify every candidate:

| | **DELETE** (true dead) | **KEEP** (reusable — ask if unsure) |
|---|---|---|
| What | Leftover of a removed feature · orphaned unit after a refactor · a real duplicate · an unreachable business flow | Generic utility / formatter / parser / query-scope helper · value-object accessors · intended public API surface · "might need it later" generic code |
| Tell | Tied to one specific dead feature/flow; deleting it, nobody rebuilds it | General-purpose helper not tied to any feature; deleting it means rewriting it later |
| Action | Delete | **Keep.** If unsure, list it and ask the user — do not auto-delete |

When torn between the two columns, **default to KEEP and ask**. A leftover helper is cheaper than deleting something the team meant to use.

## Read stack first (both modes)

Detect the stack via `~/.claude/architecture/_shared/stack-detection.md`, then use the matching tools. These only produce *candidates*; install if missing (tell the user).

| Stack | Dead code | Duplicate | Unused deps |
|---|---|---|---|
| **Go** | `deadcode -test ./...` (whole-program) + `staticcheck -checks U1000 ./...` (unexported/const/type/field) | `dupl` | `go mod tidy` (diff) |
| **TS/JS** | `knip` · `ts-prune` | `jscpd` | `depcheck` · `knip` |
| **Python** | `vulture` | `pylint --enable=duplicate-code` | `deptry` |
| **Dart/Flutter** | `dart analyze` | `dart_code_metrics` | `dart pub deps` |
| **Any** | — | — | LSP "no references" / editor find-usages |

> ⚠️ **Multiple entry points** (API + worker + cron/CLI): make **all** of them roots for the whole-program analysis. Otherwise code used only by one entry point is reported dead by mistake.

<a id="mode-dead-code"></a>
## Mode DEAD-CODE

### 1. Detect
Run the stack's dead-code tools to get the candidate list.

### 2. Verify each candidate with grep — don't trust the tool
Confirm **zero real references** before touching anything. Tools miss these cases:

- **Same name in different packages/modules** — a naive count matches the wrong symbol. Confirm the exact definition (path + namespace).
- **Interface / polymorphism** — several same-named constructors/handlers are separate *implementations of one contract* (one per adapter/driver). That is **not duplication — never merge them**; merging breaks the abstraction.
- **Reflection / registered-by-name** — event listeners, queue/cron tasks registered by string, ORM callbacks, test-suite methods. Whole-program tools can't see these → false "dead".
- **Test-only usage** — a helper only tests call: decide by policy (usually keep while tests use it).

### 3. Classify
Sort each verified candidate into **DELETE · KEEP · ASK · BACKLOG** (BACKLOG = dead but touches security/business semantics → don't decide alone; write it to a doc for the user).

### 4. Remove safely
1. **One commit per group** (by layer or by file); message states *what* and *why it's dead*.
2. After each group, clean orphaned imports, then **build + test + lint must stay green**.
3. Re-run the dead-code tool: removed symbols are gone, and **no new dead code appeared** (if deleting A orphaned B, handle B or stop and reassess).
4. **Check for orphaned flows**: if you removed a producer, is a listener/handler left dangling? If you removed an enqueue helper, does a scheduler still enqueue that task another way? Confirm the real flow still lives.

### 5. (Optional) Prevent regrowth
Propose wiring the unused-code check into the project's existing lint/CI so dead code can't silently regrow. Keep any intentional-keep items (BACKLOG) **informational**, not a hard gate.

<a id="mode-duplicate"></a>
## Mode DUPLICATE

### 1. Detect
Run the duplicate detector to find copy-paste blocks.

### 2. Confirm it's a REAL duplicate
Diff the two versions. It's only a duplicate if the **logic and behavior are identical**.

> **Never merge when semantics differ** — e.g. `""→nil` vs `""→pointer-to-empty`, `"1.000"` vs `"1,000"` formatting, two different normalization algorithms. Merging changes behavior = a bug. Write it to backlog instead of merging blindly.

### 3. Choose one canonical
Pick the correct home for the shared version, respecting the project's existing import/dependency direction (a helper used by lower-level code must live where that code can import it). Do **not** create a god `utils` package.

### 4. Redirect and remove
Point all call sites at the canonical, delete the extra copies, then build + test green.

## Output

```
## Cleanup: <mode> — <scope>

### Delete (verified 0 refs)
- <file:symbol> — <why dead: leftover / orphan / true duplicate>

### Keep (reusable — untouched)
- <file:symbol> — <why kept>

### Ask
- <file:symbol> — dead, but <reason for doubt>

### Backlog (dead, touches security/business)
- <file:symbol> — <decision needed>

### Verify: build ✅ · test ✅ · tool before→after: N → M
```

If deleting: one commit per group; do **not** commit / push / open a PR unless the user asks.

## Boundaries

- ❌ Do not delete a reusable helper/scope/utility just because a tool flags it unused → **KEEP or ASK**.
- ❌ Do not merge functions with different semantics, and do not merge same-name interface implementations.
- ❌ Do not drop DB tables/columns/migrations during cleanup — that needs a separate explicit confirmation.
- ❌ Do not commit/push/open a PR unless the user explicitly asks.
- ✅ When in doubt, default to KEEP and ask.
