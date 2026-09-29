---
name: kanban-archive
description: 'Close a PASS-reviewed feature or bug with kf archive. Features require a completion report and canonical docs; bugs update related docs only when needed. Use at review with current PASS reports or when completing closure in dones.'
---

# Kanban Phase 6 — Artifact (Autonomous)

Argument: `<feature_name>`.

Close the work item with traceable results and the appropriate documentation.

---

## 1. Prepare closure artifacts

```bash
kf status --change {feature_name}
kf status --change {feature_name} --json
```

Require current PASS testing and review reports. Read `kind` before choosing closure work:

- Feature: use `kf instruct feature-report --change {feature_name}` and write `phase-6-feature-report.md` in the review folder. Include actual changes, test/review evidence, documentation manifest, limitations and accepted follow-ups.
- Bug: no feature report or feature planning artifacts are required. Read the bug report and review result; confirm the verified fix, regression evidence and docs impact.

If already in dones, complete only missing closure work and validate; never reimplement.

## 2. Sync docs

For a feature, let `kf archive` copy requirement, UC index/files/diagram and test plan/current result into canonical docs. The requirement mirror under `docs/requirement/` was already written in Phase 1 — `kf archive` refreshes it and stamps `status: archived`. Do not manually copy the UC index/files, diagram or test plan before archive, and do not change approved source artifacts during closure. Update other affected docs from the plan's documentation impact as needed.

For a bug, update existing related feature docs only when the fix changes documented behavior or reveals inaccurate documentation. Use the feature/context named in the bug report; do not overwrite feature docs with bug-report content. Record bug ID, fix summary and regression reference in the project's changelog or change-history section (e.g. CHANGELOG.md) when one exists. If behavior is already documented correctly, leave docs as-is and record “No documentation update required” with the reason in the review report. Bug archive does not automatically create canonical feature docs.

## 3. Archive and validate

```bash
kf archive {feature_name}
kf validate --change {feature_name}
```

`kf archive` requires current PASS reports, runs the dones hook, moves review → dones and marks metadata archived. Features additionally require the feature report and receive canonical copies; bugs do not. `kf stage ... dones` uses the same archive path. Validate after archive and check reported canonical destinations for a feature. Do not report completion if validation fails.

When refreshing an item already in dones, canonical docs may include later bug fixes. If the CLI reports changed canonical docs, preserve them with `--skip-specs`; do not use `--force` to restore an older snapshot without explicit user direction.

## 4. Git handoff

```bash
git status
```

Commit when the user requested it or project instructions explicitly require it. Use conventional commits: `feat({context}): ...` for features and `fix({context}): ...` for bugs. Include only this work item's changes, respect ignored .works directories and preserve unrelated working-tree changes. Otherwise report that changes are uncommitted.

---

## Done

Pipeline complete. Deliver the final report:

```text
## Pipeline Complete: {context}/{feature_name}
1. ✓ Confirm — requirement or bug triage
2. ✓ Plan — approved feature contract or lightweight bug contract
3. ✓ Implement — {M}/{M} tasks
4. ✓ Test — {N}/{N} passed
5. ✓ Review — PASS
6. ✓ Archive — kf archive, docs sync/update status

Artifacts: .works/dones/{feature_name}_{timestamp}/
Feature canonical docs:
- docs/requirement/{context}/{feature_name}.md
- docs/use-cases/{context}/{feature_name}/README.md
- docs/use-cases/{context}/{feature_name}/UC-###.md (one file per use case)
- docs/use-cases/{context}/{feature_name}/diagram.md
- docs/testplan/{context}/{feature_name}.md
- docs/testplan/{context}/{feature_name}-result.md
```

For bugs, list only related docs actually updated, or state why none were needed. Report the commit SHA only if a commit was made.
