---
feature: "skills-audit"
context: "skills"
created: "20260929_1100"
status: planning
---

# Use Case Diagram

```mermaid
flowchart LR
  U[npm end-user] --> UC1[UC-001 Fresh install ships deduplicated assets]
  U --> UC5[UC-005 Upgrade leaves no stale assets]
  C[Claude Code] --> UC2[UC-002 Trigger phrases auto-invoke right skill]
  C --> UC3[UC-003 clean up routes to cleanup only]
  D[Contributor] --> UC4[UC-004 npm test runs real suite]
  M[Package maintainer] --> UC6[UC-006 Editor-neutral agent frontmatter]
  C --> UC7[UC-007 Specialist agents: researcher + brainstormer]
```

- Actors: npm end-user, Claude Code, Contributor, Package maintainer
- Use cases: UC-001, UC-002, UC-003, UC-004, UC-005, UC-006, UC-007
- Relationships: end-user drives install/upgrade flows; Claude Code drives auto-invocation + specialist agent flows; Contributor drives test flow; maintainer owns asset neutrality
