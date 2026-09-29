---
feature: "skills-audit"
context: "skills"
created: "20260929_1100"
status: planning
---

# Use Case Index

Every use case is its own file under `use-cases/`. Do not write a combined narrative here.

## Use Case Files

| ID | Name | File | Primary Actor | Status |
|---|---|---|---|---|
| UC-001 | Fresh install ships deduplicated asset set | [UC-001](UC-001.md) | npm end-user | planned |
| UC-002 | Vietnamese/shorthand triggers still auto-invoke the right skill | [UC-002](UC-002.md) | Claude Code | planned |
| UC-003 | "clean up" routes to cleanup skill, never feature-build | [UC-003](UC-003.md) | Claude Code | planned |
| UC-004 | Contributor runs real test suite | [UC-004](UC-004.md) | Contributor | planned |
| UC-005 | Upgrade leaves no stale removed assets | [UC-005](UC-005.md) | npm end-user | planned |
| UC-006 | Agent files carry no editor-specific fields | [UC-006](UC-006.md) | Package maintainer | planned |
| UC-007 | Specialist agents for research and ideation | [UC-007](UC-007.md) | Claude Code user | planned |

## Use Case Coverage

| UC ID | FR references | TC references | Acceptance coverage |
|---|---|---|---|
| UC-001 | FR-001, FR-002, FR-004, FR-009 | TC-006, TC-011, TC-014 | install counts + no removed assets |
| UC-002 | FR-002, FR-004 | TC-010 | all triggers preserved/added, no dupes |
| UC-003 | FR-003 | TC-009 | zero duplicated trigger phrases |
| UC-004 | FR-005, FR-006 | TC-001, TC-002, TC-003, TC-004, TC-005, TC-007, TC-012 | suite runs green, regressions covered |
| UC-005 | FR-007 | TC-008 | stale items removable + documented |
| UC-006 | FR-008 | TC-013 | zero `model:` keys in agent frontmatter |
| UC-007 | FR-009, FR-010 | TC-014 | agents exist per convention; frameworks migrated; zero `/brainstorm` refs |

## Totals

| Metric | Total |
|---|---:|
| Use cases | 7 |
| Actors | 4 (npm end-user, Claude Code, Contributor, Package maintainer) |
| Functional requirements covered | 10 |
| Test cases linked | 14 |
