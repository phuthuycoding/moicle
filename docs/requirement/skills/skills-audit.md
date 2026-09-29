---
feature: skills-audit
context: skills
created: 20260929_1053
kind: feature
status: archived
---
# Spec Requirement

## Feature
skills-audit — audit-driven cleanup and hardening of the moicle package

## Objective
Remove confirmed duplication in packaged assets (kill `/doc`, fold `feature-track` into `feature-build` as a TRACK mode), de-collide skill auto-invoke triggers, sync stale docs, and give the CLI a real unit+integration test suite — so the package is smaller, sharper, and provably working.

## Problem Statement
The package grew organically: `/doc` command duplicates the more capable `docs-sync` skill; `feature-track` is a single-purpose skill that is really a mode of `feature-build`; `feature-build`'s description claims triggers (`clean up`, `improve code`) that collide with `cleanup`'s auto-invocation; CLAUDE.md/README describe a stale structure (missing `upgrade.ts`, `install/` subdir, `doc.md`; wrong command count; Windsurf shown unsupported although wired); and a published npm CLI has `npm test` as a placeholder. Upgrading users also keep stale assets (`doc.md`, `feature-track`) because `upgrade`/`install` never remove items no longer shipped.

## Scope
### In Scope
- Remove `assets/commands/doc.md` and every reference (`README.md`, `CLAUDE.md`, decision matrices, `src/commands/postinstall.ts` output if mentioned)
- Merge `assets/skills/feature/track/` into `feature-build` as a fifth mode **TRACK**; delete the track skill dir; update all cross-references (`feature-build`, `fix-bug`, `review-code`, README, CLAUDE.md)
- De-collide trigger phrases across all skill/command descriptions (`feature-build` drops `clean up`, `improve code`; audit rest)
- Sync structural docs: `CLAUDE.md` (command list, `install/` subdir, skill/command counts), `README.md` (counts, Windsurf checkbox, `/doc` + `/feature-track` mentions)
- Real test suite: unit + integration, wired into `npm test`, covering utils and all command flows against temp dirs
- CLI review pass: fix confirmed issues only (swallowed errors, missing boundary handling, dead code) — no style refactors
- Decide + document the stale-asset path for removed items (`doc.md`, `feature-track` dirs already installed in user environments)

### Out of Scope
- License change (GPL-3.0 → MIT) — flagged as open question, separate decision
- New skills, new commands, new agents, new editor targets
- Version bump or release (owned by release workflow)
- Reformatting, import reordering, style refactors, renames for preference
- Implementing a scoped Windsurf flow beyond what exists

## Actors
- Package maintainer (user) — approves spec and plan
- npm end-user — installs/upgrades moicle into Claude/Codex/Cursor/Antigravity/Windsurf
- Claude Code — auto-invokes skills by description triggers
- Contributor — runs `npm test` before changes

## Functional Requirements
### FR-001
- Requirement: Remove the `/doc` command entirely — delete `assets/commands/doc.md` and every reference to it across README, CLAUDE.md, postinstall output, and decision matrices.
- Priority: must
- Notes: `docs-sync` skill FULL mode is the canonical doc generator; the command is the weaker duplicate sharing the same triggers.

### FR-002
- Requirement: Merge `feature-track` into `feature-build` as mode **TRACK** (fifth mode alongside NEW/REFACTOR/API/DEPRECATE). Delete `assets/skills/feature/track/`. Update every cross-reference pointing at `/feature-track`. Preserve all existing trigger phrases — including the Vietnamese ones — in the merged description so auto-invocation keeps working.
- Priority: must
- Notes: `feature-build` already routes checklist-loop requests to `/feature-track`; merging makes it one skill with a mode table entry, matching the 22→9 consolidation pattern from commit 18a5bd3. Keep TRACK concise — reference the loop contract, don't dump 200 lines into an 897-line file.

### FR-003
- Requirement: Audit every skill/command `description:` trigger list; ensure no phrase is claimed by two assets. `feature-build` drops `clean up` and `improve code` (owned by `cleanup`).
- Priority: must
- Notes: Colliding triggers make auto-invocation non-deterministic.

### FR-004
- Requirement: Sync structural docs to reality — `CLAUDE.md` (4→2 commands, 11→10 skills, 16→18 agents, add `upgrade.ts`, `install/` subdir, `doc.md`+`brainstorm.md` removal), `README.md` (same counts, remove `/doc` + `/brainstorm` + `/feature-track` rows, check Windsurf support line matches src), `AGENTS.md` (replace "no automated test suite" guidance with real `test/` layout + commands), `package.json` description if it cites counts. Fix the `/challenge` trigger table by adding the documented Vietnamese triggers to `challenge/SKILL.md`'s description (docs are correct in intent; the file lacks them).
- Priority: must
- Notes: Counts must match `find assets` output, not memory. CLAUDE.md lists `/challenge` triggers ("check kĩ hơn", "soi lại", "phản biện", "có lặp code không") that do not exist in the skill's description field — docs promise auto-invoke the file does not deliver. Maintainer confirmed: add them to the skill, keep Vietnamese triggers everywhere.

### FR-005
- Requirement: Provide a unit+integration test suite wired to `npm test`: unit tests for path resolution, cursor transforms, `inferItemType`, scope/target resolution; integration tests running install/uninstall/enable/disable/status against temp dirs. `npm test` must build first (`bun run build && bun test`) since CLI-spawn tests need fresh `dist/`; `prepublishOnly` gains the test step so a red suite cannot ship.
- Priority: must
- Notes: Biggest pro gap — a published CLI ships zero tests today. Interactive prompt paths (inquirer) may be mocked or skipped; file operations must be real. CI already runs `bun run test` (ci.yml, Node 18/20/22) — no new workflow needed.

### FR-006
- Requirement: Review `src/` for confirmed defects — swallowed errors, missing error boundaries, dead code — and fix only confirmed issues with tests covering each fix.
- Priority: should
- Notes: Per house rules: no drive-by refactors; every fix needs evidence it was broken.

### FR-007
- Requirement: Handle or document stale-asset cleanup for items removed by this feature (`doc.md`, `brainstorm.md`, `feature-track/` in existing `~/.claude`, `./.claude`, `.cursor/` installs). Either `install` prunes assets no longer shipped, or README documents the manual removal path.
- Priority: should
- Notes: `upgrade` bumps the npm package only; without handling, removed items live forever in user environments.

### FR-008
- Requirement: Remove the `model:` field from all 16 agent frontmatter blocks — files keep `name` + `description` only. No functional change for non-Claude editors (transforms already strip it); Claude Code defaults to `inherit`, matching Anthropic's own recommendation.
- Priority: should
- Notes: Maintainer decision: de-Claude-ify agent files — `model: sonnet` pins a mid-tier model regardless of the user's session choice, and the field is reportedly ignored in some Claude Code versions anyway (anthropics/claude-code#44385).

### FR-009
- Requirement: Remove the `/brainstorm` command entirely — delete `assets/commands/brainstorm.md` and migrate its 6 ideation frameworks (First Principles, SCAMPER, Design Thinking, Working Backwards, 5 Whys, Rapid Fire) into a new `@brainstormer` agent. Update every reference (`bootstrap.md`, `feature-build` TRACK mode, `marketing-brand`, `usage.ts`, README, CLAUDE.md) to route to `@brainstormer` or drop the mention.
- Priority: must
- Notes: Maintainer decision: commands shrink 4→2 (`bootstrap`, `marketing`); ideation lives in an agent persona, not a command. `bootstrap.md`'s mid-flow `/brainstorm` call ran inline — replacing it must keep that UX: embed a short framework-pick step inline rather than delegating to a subagent mid-flow.

### FR-010
- Requirement: Add two utility agents under `assets/agents/utilities/` following the established agent convention (name+description frontmatter, architecture reference, engineering-principles block, match-the-project-first): `@researcher` (breadth exploration — prior art, libraries, code paths, trade-offs, sourced recommendations) and `@brainstormer` (ideation facilitator carrying the 6 frameworks from the removed command). Agents: 16→18.
- Priority: should
- Notes: Pairs with the kf harness `researcher` role concept; brainstormer is the new home for `/brainstorm` content. Boundary to write into `@researcher`: the agent is a subagent persona for delegated/parallel exploration — it must not clone `research-explore`'s in-session gated workflow (WEB/SPIKE/ONBOARDING stay with the skill).

## Non-Functional Requirements
- `npm test` green on macOS + Linux CI-equivalent envs; no network access in tests
- No new runtime dependencies; dev-only test tooling preferred (bun test or node:test)
- Installed-layout flattening behavior unchanged for retained items
- Minimal diffs: touch only lines related to each change; no reformatting
- Conventional commit style per AGENTS.md

## Main Use Cases
- UC-001 Fresh `moicle install` ships exactly 10 skills, 2 commands, 18 agents, 9 architecture refs
- UC-002 User says "làm track này" / "tracked loop" → `feature-build` TRACK mode auto-invokes
- UC-003 User says "clean up codebase" → `cleanup` skill invokes, never `feature-build`
- UC-004 Contributor runs `npm test` → unit + integration suite runs green
- UC-005 Existing user upgrades → stale `doc.md`/`brainstorm.md`/`feature-track` removed or documented path exists
- UC-006 Agent files carry no editor-specific fields — frontmatter is `name` + `description` only across all install targets
- UC-007 User invokes `@brainstormer`/`@researcher` specialists — ideation works without the `/brainstorm` command

## Constraints
- No manual `package.json` version bump — release workflow owns versions
- Preserve every existing trigger phrase during the TRACK merge (auto-invoke continuity)
- Do not change install flattening (`<group>-<action>`) behavior for retained skills
- Changes follow existing TS style: 2-space, single quotes, semicolons, small modules

## Assumptions
- Vietnamese trigger phrases stay — they are the author's own invocation phrases; "unprofessional" concern is outweighed by auto-invoke continuity
- `challenge`, `fix-incident`, and both `marketing-*` skills stay — each carries a distinct workflow (confirmed by maintainer)
- Windsurf works today via the rules-file path; only the README checkbox is stale
- Test runner choice (bun test vs node:test) deferred to planning — must not add a runtime dep

## Acceptance Criteria
- [ ] `find assets -name "doc.md"` returns nothing; no `/doc` reference remains in README/CLAUDE.md/src
- [ ] `find assets -name "brainstorm.md"` returns nothing; `@brainstormer` + `@researcher` exist in `assets/agents/utilities/`; brainstormer carries all 6 frameworks; no `/brainstorm` reference remains outside `.works/`
- [ ] `assets/skills/feature/track/` is gone; `feature-build` SKILL.md documents a TRACK mode containing all former `feature-track` trigger phrases; no file references `/feature-track`
- [ ] No trigger phrase appears in two different skill/command `description:` fields
- [ ] `npm test` exits 0 and executes unit + integration cases (not a placeholder)
- [ ] `moicle install --project` into a temp dir produces exactly 10 skills + 2 commands + 18 agents; `moicle list` agrees
- [ ] README + CLAUDE.md counts equal `find assets` output for skills, commands, agents, architecture
- [ ] `bun run build` completes clean
- [ ] No `assets/agents/**/*.md` frontmatter contains a `model:` field; `name` + `description` remain intact

## Edge Cases
- User upgrades without reinstalling → stale `feature-track/` dir + `doc.md` remain active in `~/.claude` (covered by FR-007)
- `moicle enable/disable/status` called for a removed item that is still installed → must not crash (verify in integration test)
- TRACK merge must not balloon `feature-build` past readability — keep the mode tight, keep the mode-select table accurate
- `feature/` group with only `build/` left — verify flattener still produces `feature-build` correctly
- Windows: symlink-vs-copy path differences in integration tests (skip symlink asserts on win32)

## Open Questions
- License: keep GPL-3.0 or move to MIT? (separate decision, does not block)
- Test runner: `bun test` (repo already uses bun) vs `node --test` on compiled dist (works for npm-only contributors) — decide in Phase 2
- FR-007 approach: auto-prune on install vs documented manual path — decide in Phase 2

## Test Strategy
- Level: unit+integration
- UI Tests: n/a (CLI — no UI layer; interactive prompts mocked or skipped)
- Tools: bun test or node:test + temp dirs (runner decided in Phase 2)
- Coverage Target: 80% of `src/utils` + all command orchestration paths; inquirer prompt internals excluded
