# Read the project first — architecture doc is only a fallback

> **Match the project, not the textbook.** The pattern this repo *already uses* is the source of truth — for planning, coding, reviewing, and generating docs. Follow it, whatever it is (CRUD, MVC, feature-folder, service+repo, layered, script, DDD/hexagonal, or legacy with its own quirks).

## 1. Learn how THIS project actually works

Before planning or writing anything:

1. **Read 1–2 existing modules/features closest to the task, end-to-end.** They tell you the real conventions: folder layout, naming, where business logic lives, where tests go, how things get wired/registered.
2. **Follow that grain.** Your new code should look like it was written by the same team — same structure, same names, same test style.
3. **Detect the stack** via `_shared/stack-detection.md` — but only to grab the concrete **build / test / lint commands** and stack idioms, not to decide the architecture.

## 2. When architecture docs apply (fallback only)

Open `~/.claude/architecture/*` (`ddd-architecture.md`, `clean-architecture.md`, `hexagonal-architecture.md`, the stack docs) **only** when one of these is true:

- **(a)** the project **already uses** that pattern (you saw it in step 1), OR
- **(b)** the task **explicitly asks** to refactor/migrate toward it, OR
- **(c)** the project is **greenfield** with no pattern to copy yet (then the doc is your default), OR
- **(d)** you just need the **commands/conventions** for the stack.

## 3. Do NOT impose DDD

Do **not** force DDD/Clean-Arch constructs — entities, value objects, ports, usecases, aggregates, event dispatchers, layer boundaries — onto a project that isn't built that way. That is overengineering: it produces code, plans, reviews, and docs that look foreign to the repo and confuse the team.

- **Planning/building:** mirror the reference module you read, not a layer diagram.
- **Reviewing:** score consistency with the *codebase's own* architecture, not with a textbook. A CRUD/MVC repo is not "broken architecture" — it just isn't DDD.
- **Docs:** describe the structure you actually scanned, never a domain/layer skeleton the code doesn't have.

DDD is a target to *opt into*, never a default to assume.
