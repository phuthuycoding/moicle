---
feature: "skills-audit"
context: "skills"
created: "20260929_1100"
status: planning
---

# Test Plan

Test Strategy from `phase-1-spec-requirement.md` decides the depth:
`unit` → Unit; `unit+integration` → Unit + Integration; `full` → Unit + Integration + UI/E2E.

This feature uses **unit+integration**: unit cases for pure functions, integration cases driving real CLI commands against `fs.mkdtemp` directories. No UI/E2E (CLI has no UI layer; inquirer prompts are out of test scope).

## Feature Test Summary

| Field | Value |
|---|---|
| Feature | skills-audit |
| Context | skills |
| Test level | unit+integration |
| UI scope | n/a (CLI) |
| Tools / commands | `bun test` (via `npm test`); temp dirs via `fs.mkdtempSync` |
| Coverage target | 80% of `src/utils` + all command orchestration paths |

## Overall Case Counts

| Test type | Planned | Must pass | Notes |
|---|---:|---:|---|
| Unit | 5 | 5 | pure functions: display names, type inference, editor dirs, cursor transform, semver |
| Integration | 9 | 9 | real CLI flows + asset audits against temp dirs and the assets tree |
| UI / E2E | 0 | 0 | no UI layer |
| **Total** | **14** | **14** | TC-012 expands: one regression test per confirmed FR-006 defect |

## Use Case Coverage Matrix

| Use case | Requirement(s) | Test cases | Planned | Pass criteria |
|---|---|---|---:|---|
| UC-001 | FR-001, FR-002, FR-004, FR-009 | TC-006, TC-011, TC-014 | 3 | install ships exact set; docs counts match tree |
| UC-002 | FR-002, FR-004 | TC-010 | 1 | TRACK mode + all former triggers present; challenge triggers added |
| UC-003 | FR-003 | TC-009 | 1 | zero phrases in two descriptions |
| UC-004 | FR-005, FR-006 | TC-001–005, TC-007, TC-012 | 7 | all green under `bun test` |
| UC-005 | FR-007 | TC-008 | 1 | stale item removed by uninstall; no crash on status |
| UC-006 | FR-008 | TC-013 | 1 | no `model:` key in any agent frontmatter |
| UC-007 | FR-009, FR-010 | TC-014 | 1 | both agents exist per convention; 6 frameworks migrated; zero `/brainstorm` refs |

## Requirement Coverage Matrix

| Requirement | Use case(s) | Test case(s) | Covered? | Gap / note |
|---|---|---|---|---|
| FR-001 | UC-001 | TC-006, TC-011 | yes | doc.md gone, zero refs |
| FR-002 | UC-001, UC-002 | TC-006, TC-010 | yes | TRACK merged, triggers preserved |
| FR-003 | UC-003 | TC-009 | yes | description audit |
| FR-004 | UC-001, UC-002 | TC-011 | yes | docs counts + challenge triggers |
| FR-005 | UC-004 | TC-001–005, TC-007, TC-008 | yes | suite is the deliverable |
| FR-006 | UC-004 | TC-012 | yes | one regression test per confirmed defect |
| FR-007 | UC-005 | TC-008 | yes | uninstall removes stale item |
| FR-008 | UC-006 | TC-013 | yes | frontmatter audit |
| FR-009 | UC-001, UC-007 | TC-006, TC-014 | yes | brainstorm.md gone + frameworks in agent |
| FR-010 | UC-007 | TC-014 | yes | both agents exist per convention |

## TC-001

| Field | Detail |
|---|---|
| Test case ID | TC-001 |
| Requirement reference | FR-005 |
| Use case reference | UC-004 |
| Test type | Unit |
| Priority | High |
| Preconditions | `bun test` harness in place |
| Input | file names with `.md`, `.md.disabled`, `.mdc`, `.mdc.disabled`, `.disabled` suffixes |
| Steps | See steps table below |
| Expected outcome | `cleanItemDisplayName` strips each suffix correctly; bare names returned unchanged |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | call `cleanItemDisplayName` on each suffix variant | correct stem returned per suffix |
| 2 | call on a name with no suffix | same name returned |

## TC-002

| Field | Detail |
|---|---|
| Test case ID | TC-002 |
| Requirement reference | FR-005 |
| Use case reference | UC-004 |
| Test type | Unit |
| Priority | High |
| Preconditions | temp skills dir with/without a named skill present |
| Input | `/x`, `@x`, `x` (skill exists), `x` (no skill) |
| Steps | See steps table below |
| Expected outcome | `inferItemType` → commands / agents / skills / agents respectively |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | `inferItemType('/doc', 'claude', 'project')` | `commands` |
| 2 | `inferItemType('@refactor', ...)` | `agents` |
| 3 | `inferItemType('cleanup', ...)` with skills dir containing it | `skills` |
| 4 | `inferItemType('nope', ...)` | `agents` fallback |

## TC-003

| Field | Detail |
|---|---|
| Test case ID | TC-003 |
| Requirement reference | FR-005 |
| Use case reference | UC-004 |
| Test type | Unit |
| Priority | Medium |
| Preconditions | n/a |
| Input | each `EditorTarget` × scope |
| Steps | See steps table below |
| Expected outcome | `getEditorDir`/`getEditorConfig` return documented paths per target (claude→.claude, codex→.codex, cursor→.cursor, windsurf→.windsurf/rules + codeium memories, antigravity) |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | resolve dir for each target × global/project | path matches documented convention |
| 2 | resolve config for each target | name/paths non-empty, consistent |

## TC-004

| Field | Detail |
|---|---|
| Test case ID | TC-004 |
| Requirement reference | FR-005 |
| Use case reference | UC-004 |
| Test type | Unit |
| Priority | Medium |
| Preconditions | n/a |
| Input | sample agent markdown + command markdown |
| Steps | See steps table below |
| Expected outcome | cursor transform emits `.mdc` content with expected frontmatter/renaming; idempotent where applicable |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | transform an agent file | valid .mdc content produced |
| 2 | transform a command file | valid output; no crash on edge-shaped input |

## TC-005

| Field | Detail |
|---|---|
| Test case ID | TC-005 |
| Requirement reference | FR-005 |
| Use case reference | UC-004 |
| Test type | Unit |
| Priority | Medium |
| Preconditions | semver helpers accessible (exported or via import path) |
| Input | version strings incl. `v` prefix and pre-release suffix |
| Steps | See steps table below |
| Expected outcome | `compareVersions` orders correctly; `parseSemver` tolerates `v`/suffixes |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | compare 3.0.2 vs 3.1.0 | <0 |
| 2 | parse `v3.1.0-beta` | [3,1,0] |

## TC-006

| Field | Detail |
|---|---|
| Test case ID | TC-006 |
| Requirement reference | FR-001, FR-002, FR-009 |
| Use case reference | UC-001 |
| Test type | Integration |
| Priority | High |
| Preconditions | built `dist/`; temp HOME + temp cwd |
| Input | `moicle install --project` (and `--target cursor` variant) |
| Steps | See steps table below |
| Expected outcome | exactly 2 commands + 10 skills + 18 agents installed; `feature-build` present, `feature-track` + `doc` + `brainstorm` absent; `moicle list` agrees |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | run install --project into temp cwd | exit 0 |
| 2 | count `.claude/commands/*.md` | 2, none named doc/brainstorm |
| 3 | count `.claude/skills/*` dirs | 10 incl. feature-build, no feature-track |
| 4 | count `.claude/agents/*.md` | 18 incl. researcher + brainstormer |
| 5 | run `moicle list --project` | lists same counts |

## TC-007

| Field | Detail |
|---|---|
| Test case ID | TC-007 |
| Requirement reference | FR-005 |
| Use case reference | UC-004 |
| Test type | Integration |
| Priority | High |
| Preconditions | temp install from TC-006-style setup |
| Input | `moicle disable <item>` → `status` → `enable <item>` |
| Steps | See steps table below |
| Expected outcome | disable renames to `.disabled`; status reports disabled; enable restores |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | disable an installed skill | dir renamed `*.disabled` |
| 2 | `moicle status --project` | item shown disabled |
| 3 | enable it | original name restored |

## TC-008

| Field | Detail |
|---|---|
| Test case ID | TC-008 |
| Requirement reference | FR-005, FR-007 |
| Use case reference | UC-005 |
| Test type | Integration |
| Priority | High |
| Preconditions | temp install + manually planted stale items (`commands/doc.md`, `skills/feature-track/`) |
| Input | `moicle status`, `moicle disable` on stale item, `moicle uninstall` |
| Steps | See steps table below |
| Expected outcome | status lists stale item without crash; uninstall removes it along with shipped items |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | plant stale doc.md + feature-track dir | present in tree |
| 2 | `moicle status` / `disable doc` | no crash; stale item toggles |
| 3 | `moicle uninstall --project` | stale items removed with the rest |

## TC-009

| Field | Detail |
|---|---|
| Test case ID | TC-009 |
| Requirement reference | FR-003 |
| Use case reference | UC-003 |
| Test type | Integration |
| Priority | High |
| Preconditions | assets tree post-FR-003 |
| Input | all `description:` trigger phrases across skills + commands |
| Steps | See steps table below |
| Expected outcome | no phrase appears in two descriptions; `feature-build` lacks `clean up`, `improve code` |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | extract quoted phrases from every `description:` field | phrase→owner map built |
| 2 | assert every phrase has exactly one owner | zero collisions |
| 3 | assert feature-build lacks the two evicted phrases | absent |

## TC-010

| Field | Detail |
|---|---|
| Test case ID | TC-010 |
| Requirement reference | FR-002 |
| Use case reference | UC-002 |
| Test type | Integration |
| Priority | High |
| Preconditions | TASK-002 done; pre-merge `feature-track` triggers recorded (from git history) |
| Input | `assets/skills/feature/build/SKILL.md` + repo tree |
| Steps | See steps table below |
| Expected outcome | TRACK mode documented in build skill; all former track triggers present in description; `feature/track/` dir absent; no `/feature-track` refs repo-wide |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | read feature-build mode table | TRACK row present |
| 2 | diff former track trigger list vs feature-build description | every phrase present |
| 3 | grep repo for `/feature-track` | zero hits outside .works |

## TC-011

| Field | Detail |
|---|---|
| Test case ID | TC-011 |
| Requirement reference | FR-004 |
| Use case reference | UC-001 |
| Test type | Integration |
| Priority | Medium |
| Preconditions | TASK-005 done |
| Input | README.md, CLAUDE.md, `find assets` counts |
| Steps | See steps table below |
| Expected outcome | documented counts equal filesystem counts; challenge description contains documented Vietnamese triggers; Windsurf line consistent with src |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | count skills/commands/agents/arch via find | authoritative numbers |
| 2 | grep README/CLAUDE.md for counts | match |
| 3 | read challenge description | Vietnamese triggers present |

## TC-012

| Field | Detail |
|---|---|
| Test case ID | TC-012 |
| Requirement reference | FR-006 |
| Use case reference | UC-004 |
| Test type | Unit / Integration (per defect) |
| Priority | High |
| Preconditions | TASK-009 identifies confirmed defects |
| Input | each confirmed defect's repro |
| Steps | See steps table below |
| Expected outcome | one regression test per defect — failing before fix, passing after |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | write failing test reproducing defect | red |
| 2 | apply minimal fix | green |
| 3 | keep test in suite | permanent regression coverage |

## TC-013

| Field | Detail |
|---|---|
| Test case ID | TC-013 |
| Requirement reference | FR-008 |
| Use case reference | UC-006 |
| Test type | Integration |
| Priority | Medium |
| Preconditions | TASK-011 done |
| Input | all `assets/agents/**/*.md` frontmatter |
| Steps | See steps table below |
| Expected outcome | zero `model:` keys; every file still has `name` + `description` |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | parse frontmatter of each agent file | name + description present |
| 2 | assert no `model:` key exists | zero hits across 16 files |

## TC-014

| Field | Detail |
|---|---|
| Test case ID | TC-014 |
| Requirement reference | FR-009, FR-010 |
| Use case reference | UC-007 |
| Test type | Integration |
| Priority | High |
| Preconditions | TASK-001, TASK-012 done |
| Input | `assets/agents/utilities/` + repo-wide `/brainstorm` grep |
| Steps | See steps table below |
| Expected outcome | `researcher.md` + `brainstormer.md` exist with agent-convention structure; brainstormer contains all 6 frameworks; `assets/commands/brainstorm.md` absent; zero `/brainstorm` references outside `.works/` |
| Status | PENDING |

### Steps

| Step | Action | Expected result |
|---|---|---|
| 1 | read both new agent files | frontmatter (name+description, no model), arch reference, engineering-principles block present |
| 2 | grep brainstormer for the 6 frameworks | First Principles, SCAMPER, Design Thinking, Working Backwards, 5 Whys, Rapid Fire all present |
| 3 | grep assets/src/README/CLAUDE.md for `/brainstorm` | zero hits |
