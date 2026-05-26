---
name: fix-incident
description: Incident response workflow for handling production issues. Use when there's an incident, outage, production down, or when user says "incident", "outage", "production down", "service down", "emergency".
---

# Incident Response Workflow

Structured workflow for handling production incidents from triage to postmortem. **Speed > completeness** during P1/P2 — mitigation first, root cause after.

## When to use this skill

- ✅ Production is down or degraded right now
- ✅ Users are impacted, on-call has been paged
- ✅ Need to coordinate response, mitigation, comms, and postmortem
- ❌ Bug is reported but no users impacted → use `/fix:hotfix`
- ❌ Already mitigated, need to find root cause → use `/fix:root-cause`
- ❌ Postmortem only, no active incident → jump to Phase 5

---

## Workflow

```
TRIAGE → INVESTIGATE → MITIGATE → RESOLVE → POSTMORTEM
   ↓           ↓            ↓          ↓          ↑
 comms      comms        comms      comms      learn
```

## Read Architecture First

Before responding:
1. `~/.claude/architecture/ddd-architecture.md`
2. Stack-specific doc for the affected service
3. Runbook for the affected component (`docs/runbooks/` or wiki)

## Severity

Use `~/.claude/architecture/_shared/severity-levels.md` (incident severity table — P1-P4 with response times).

### Ambiguous severity (P2 vs P3)?
Decide UP if any apply:
- Revenue impact (checkout, payment, signups blocked)
- Security risk (auth, data exposure)
- Data integrity at risk (writes might be lost / corrupted)
- Regulatory / SLA breach
- Pattern matches a prior P2+ (e.g., same DB instance flaky again)

Otherwise: P3.

### Escalation criteria

Page or escalate when:

| Trigger | Action |
|---------|--------|
| P1 on customer-facing system | Page CTO / engineering lead within 15 min |
| P1 + data loss / breach | Page legal + security lead immediately |
| P2 lasting >2 hours without mitigation | Page engineering lead, consider promoting to P1 |
| P1/P2 spanning >1 shift | Schedule formal handoff (see Phase 1.5) |
| Customer-facing comms required | Notify support + comms lead within 30 min |
| Public disclosure may be needed (security) | Notify legal + comms + leadership |

---

## Phase 1: TRIAGE (5–15 min)

**Goal:** classify severity, assemble response, start comms.

### Actions
1. Capture: what, when, who's affected, error messages, recent deploys
2. Assign severity (P1–P4) — use ambiguous-severity rule above
3. Open incident channel (`#incident-{date}-{short-name}`)
4. Assign roles:
   - **Incident Commander (IC)** — coordinates, makes decisions
   - **Tech Lead** — investigates / fixes
   - **Comms Lead** — updates stakeholders
5. Page on-call for affected service
6. Check escalation criteria above — page additional people if any trigger
7. Send first status update (template below)

### First update template
```
[INCIDENT] {severity} {service} — {one-line impact}
Detected: {timestamp}
Status: investigating
Channel: #incident-{slug}
Next update: {time}
```

### Gate
- [ ] Severity assigned (and escalation triggered if applicable)
- [ ] IC + Tech Lead identified
- [ ] Incident channel open
- [ ] First status sent

---

## Phase 1.5: HANDOFF (only if shift change during incident)

For incidents spanning >1 shift, do a formal handoff. Skip if same team handles end-to-end.

### Handoff template
```markdown
## Incident Handoff: {service} {date}

**From:** {outgoing IC} → **To:** {incoming IC}
**Channel:** #incident-{slug}
**Severity:** {current}

### Current state
- Impact: {what users see right now}
- Mitigations applied: {list with timestamps}
- What worked: {list}
- What didn't: {list}

### Active investigations
- {open question + who was looking into it}

### Active hypotheses
- {hypothesis + evidence for/against}

### Open decisions
- {decision needed + options + recommended choice}

### Next steps
- {action + owner + ETA}

### People paged / informed
- {list with role + when paged}

### Pending comms
- {next update due at HH:MM}
- {customer-facing status due}
```

Live walkthrough (5-10 min): outgoing IC walks incoming IC through the timeline + open questions in the incident channel. Both confirm understanding before handoff completes.

### Gate
- [ ] Handoff doc posted in incident channel
- [ ] Incoming IC acknowledges + confirms understanding
- [ ] Stakeholders notified of new IC

---

## Phase 2: INVESTIGATE (parallel with comms)

**Goal:** find what's broken — don't fix yet, identify it.

### Check in this order
1. **Recent deploys** — last 24h. Roll back candidate?
2. **Monitoring dashboards** — error rate, latency, saturation, traffic (the 4 golden signals)
3. **Logs** — error spikes, new error types
4. **Dependencies** — upstream services, DB, cache, queue, external APIs
5. **Infrastructure** — CPU, memory, disk, network, certificate expiry, DNS

### Common patterns
| Symptom | Likely cause |
|---------|-------------|
| Errors only on new code path | Bad deploy → rollback |
| Errors across all paths | Infra (DB, cache, network) |
| Slow but not erroring | Resource saturation / external API slowdown |
| Intermittent | Cache, race condition, flapping dependency |
| Started exactly on a cron tick | Scheduled job |

### Gate
- [ ] Suspected cause identified (even if not yet confirmed)
- [ ] Mitigation candidates listed
- [ ] Update sent to incident channel

---

## Phase 3: MITIGATE (fast, reversible)

**Goal:** stop the bleeding. Don't fix root cause yet.

### Mitigation options (pick fastest reversible)
| Option | When | Reversibility |
|--------|------|---------------|
| Rollback deploy | Recent deploy is suspect | Easy |
| Feature flag off | Bad feature behind flag | Easy |
| Scale up | Resource saturation | Easy |
| Failover | Region / instance down | Medium |
| Block traffic | Bot / DDoS | Medium |
| DB restore | Data corruption | Hard — last resort |

### Rules
- **One change at a time.** If you change 3 things and it gets better, you don't know which fixed it.
- **Announce before doing.** "Rolling back to {sha} in 60s." Then do it.
- **Time-box.** If a mitigation doesn't work in 10 min, try the next one.

### Verify mitigation
- [ ] Error rate dropping in monitoring
- [ ] Users confirming (sample check)
- [ ] No new alerts firing

### Gate
- [ ] Impact reduced (errors down, users unblocked)
- [ ] Mitigation status sent to channel
- [ ] Severity downgraded if appropriate

---

## Phase 4: RESOLVE

**Goal:** apply the permanent fix and verify.

### Actions
1. Confirm root cause (use `/fix:root-cause` workflow if not obvious)
2. Implement permanent fix following stack architecture
3. Add test that would have caught this
4. Deploy fix through normal pipeline (don't skip CI even under pressure — unless explicitly authorized)
5. Monitor for {N} hours post-deploy
6. Remove temporary mitigation (e.g., re-enable feature flag) only after fix proven stable

### Gate
- [ ] Root cause confirmed
- [ ] Fix deployed
- [ ] Regression test added and passing
- [ ] Monitoring shows healthy metrics for ≥1 hour
- [ ] Incident marked resolved in channel

---

## Phase 5: POSTMORTEM

**Goal:** learn from this so it doesn't happen again. **Blameless.**

### Schedule
- Within 48h of resolution for P1/P2
- Within 1 week for P3
- Optional for P4 (only if recurring pattern)

### Postmortem template

```markdown
# Postmortem: {service} {date}

## Summary
{1-paragraph: what happened, impact, duration}

## Impact
- Users affected: {N or %}
- Duration: {detected → mitigated → resolved}
- Revenue / SLA impact: {if applicable}

## Timeline (UTC)
| Time | Event |
|------|-------|
| HH:MM | Deploy of {sha} |
| HH:MM | First alert fired |
| HH:MM | IC paged |
| HH:MM | Mitigation: rollback to {sha} |
| HH:MM | Error rate normal |
| HH:MM | Permanent fix deployed |

## Root Cause
{Technical cause — what code / config / data caused this}

## Contributing Factors
- {Factor 1, e.g., test gap}
- {Factor 2, e.g., missing alert}

## What Went Well
- {e.g., fast detection, clear rollback path}

## What Didn't Go Well
- {e.g., took 20 min to identify suspect deploy}

## Action Items
| # | Action | Owner | Due | Severity |
|---|--------|-------|-----|----------|
| 1 | {add alert for X} | @alice | {date} | high |
| 2 | {add regression test} | @bob | {date} | medium |
```

### Action item rules
- Each action item has owner + due date
- Track to completion (open a ticket, link from postmortem)
- "Better testing" is NOT an action item — be specific ("add test for X case")

---

## Communication

### Update frequency by severity

| Severity | Update cadence | Channels |
|----------|---------------|----------|
| P1 | Every 15 min while investigating; every 30 min after mitigation | Incident channel + status page + customer email if >30 min outage |
| P2 | Every 30 min while investigating; hourly after mitigation | Incident channel + status page |
| P3 | Hourly | Incident channel |
| P4 | At start, on mitigation, on resolution | Incident channel |

If nothing new to report, post anyway: "No update — still investigating, next update at HH:MM." Silence creates panic.

### Templates

**Status update**
```
[UPDATE {time} UTC] {severity} {service}
Impact: {what users see — specific, not "issues"}
Action: {what we're doing right now}
ETA mitigation: {time or "unknown"}
Next update: {time}
```

**Mitigation applied**
```
[MITIGATED {time} UTC] {severity} {service}
Impact: {reduced from X to Y}
Mitigation: {what we did}
Permanent fix: {ETA}
Next update: {time}
```

**Resolved**
```
[RESOLVED {time} UTC] {service}
Total duration: {detected → resolved}
Root cause: {one line}
Mitigation: {what we did}
Permanent fix: {deployed at HH:MM | scheduled by DATE}
Postmortem: {date} — link to come
```

---

## Hard Rules

- **Speed > completeness during P1/P2** — mitigate first, perfect later
- **One change at a time** during mitigation
- **Blameless postmortems** — focus on system, not person
- **Don't skip CI** for the fix unless explicitly authorized by IC
- **Don't close the incident** until monitoring is healthy for ≥1 hour
- **Action items must have owner + date** — otherwise they don't happen

---

## Related Skills

| When | Use |
|------|-----|
| Bug reported but no active incident | `/fix:hotfix` |
| Root cause unclear, need deep investigation | `/fix:root-cause` |
| Need to roll back deployment | (use ops runbook, not a skill) |
| Documenting postmortem as a doc | `/docs:write` |

---

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| TRIAGE | `@devops` | Infra + monitoring context |
| INVESTIGATE | Stack-specific dev agent | Code-level debugging |
| INVESTIGATE | `@security-audit` | If suspected breach / leak |
| INVESTIGATE | `@db-designer` | If DB / data issue |
| MITIGATE | `@devops` | Rollback / scale / failover |
| RESOLVE | Stack-specific dev agent | Permanent fix |
| POSTMORTEM | `@docs-writer` | Write postmortem doc |
