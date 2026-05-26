# Severity Levels — Canonical Reference

Single source of truth for severity classification across review, hotfix, and incident workflows.

## Code / Architecture Severity (review skills)

| Level | Meaning | Examples |
|-------|---------|----------|
| **CRITICAL** | Architecture broken; ship-blocker | Build fails, circular imports, domain imports framework, secrets in code |
| **HIGH** | DDD violation or correctness risk | Cross-domain import, business logic in wrong layer, no ports dir, N+1 query on main table, missing auth check |
| **MEDIUM** | Structure issue or test gap | Anemic entity, fat controller, missing events, missing test for new code path, missing JSON tags |
| **LOW** | Convention issue | File naming, redundant code, DTOs in wrong package, style nits |

**Rule:** all CRITICAL/HIGH must be fixed before merge. MEDIUM allowed with explicit waiver. LOW = nice to fix.

## Incident Severity (incident-response, hotfix)

| Level | Description | First response | Examples |
|-------|-------------|---------------|----------|
| **P1** | Critical — complete outage / data loss / security breach | <15 min | Site down, DB corrupted, secret leak, all logins broken |
| **P2** | High — major degradation, ≥50% users affected | <1 h | Login flow broken for one IdP, checkout fails, key endpoint 5xx |
| **P3** | Medium — partial degradation, <50% users | <4 h | One feature broken, perf regression on a non-critical path |
| **P4** | Low — minor issue, no significant impact | <24 h | UI glitch, typo in copy, deprecated warning |

**Ambiguous P2 vs P3?** If revenue impact, security risk, or data integrity in question → P2. Otherwise P3.

## Mapping between scales

| Code severity | If found in PR | If found in production |
|---------------|---------------|------------------------|
| CRITICAL | Block merge | P1 incident |
| HIGH | Request changes | P2 incident |
| MEDIUM | Comment | P3 incident |
| LOW | Comment / approve | P4 incident |
