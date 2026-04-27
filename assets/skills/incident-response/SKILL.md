---
name: incident-response
description: "Triage production incidents, coordinate investigation, apply mitigation, implement permanent fixes, and generate blameless postmortem reports. Use when there's an incident, outage, production down, or when user says 'incident', 'outage', 'production down', 'service down', 'emergency'."
user-invocable: true
triggers:
  - incident
  - outage
  - production down
  - service down
  - emergency
  - production issue
---

# Incident Response Workflow

Structured five-phase workflow for handling production incidents: triage severity, investigate root cause, mitigate user impact, implement permanent fix, and document learnings in a blameless postmortem.

## IMPORTANT: Read Architecture First

Read the appropriate architecture reference before responding to incidents:

- Global: `~/.claude/architecture/` (clean-architecture.md, flutter-mobile.md, react-frontend.md, go-backend.md, laravel-backend.md, remix-fullstack.md, monorepo.md)
- Project-specific: `.claude/architecture/` (overrides global if present)

## Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| P1 | Critical — complete outage, data loss, security breach | Immediate (< 15 min) |
| P2 | High — major degradation, 50%+ users affected | < 1 hour |
| P3 | Medium — partial degradation, < 50% users affected | < 4 hours |
| P4 | Low — minor issue, UI bugs | < 24 hours |

## Workflow

```
TRIAGE → INVESTIGATE → MITIGATE → RESOLVE → POSTMORTEM
```

---

## Phase 1: TRIAGE (5-15 min)

**Goal**: Assess severity, scope, and impact immediately.

1. Record what is down/broken, when it started, how many users are affected, error messages, and recent deployments
2. Identify affected stack and read architecture doc for that area
3. Assign severity (P1-P4) and establish incident response (channel, commander, stakeholders)
4. Run quick health checks:
   ```bash
   curl -I https://[service-url]/health
   kubectl logs -n [namespace] [pod] --tail=100
   ```

### Gate
- [ ] Severity assessed
- [ ] Stakeholders notified
- [ ] Architecture doc identified
- [ ] Response team assembled

---

## Phase 2: INVESTIGATE (15-60 min)

**Goal**: Find the root cause.

1. Read architecture doc — understand system components and dependencies
2. Collect evidence: application logs, system logs, monitoring dashboards (CPU, memory, request rate, error rate, database connections)
3. Build a timeline from normal operation through failure
4. Apply 5 Whys to drill to root cause
5. Check all dependencies: external APIs, database, cache, message queue, CDN

### Gate
- [ ] Root cause identified with evidence
- [ ] Timeline established
- [ ] Dependencies checked

---

## Phase 3: MITIGATE (5-30 min)

**Goal**: Stop user impact with a temporary fix. Speed over perfection.

**Strategies** (pick the fastest safe option):
- **Rollback**: `git revert [sha]` or `kubectl rollout undo deployment/[name]`
- **Feature flag**: Disable the problematic feature
- **Scale**: `kubectl scale deployment/[name] --replicas=10`
- **Traffic routing**: Route away from bad instances
- **Database**: Kill long-running queries, add temporary indexes

### Gate
- [ ] User impact mitigated
- [ ] System stable — monitoring confirms improvement
- [ ] No new critical issues introduced

---

## Phase 4: RESOLVE (hours to days)

**Goal**: Implement a permanent fix following architecture patterns.

1. Re-read architecture doc for proper fix location and approach
2. Design permanent fix addressing root cause, following architecture layer boundaries
3. Implement on branch `incident/[issue-id]-[description]` with monitoring/alerting improvements and regression tests
4. Test thoroughly using stack-appropriate test commands
5. For P1/P2: gradual rollout (staging → 5% canary → 25% → 50% → 100%)

### Gate
- [ ] Permanent fix follows architecture patterns
- [ ] Tests added to prevent regression
- [ ] Monitoring/alerting enhanced
- [ ] Deployed and verified

---

## Phase 5: POSTMORTEM (within 3-5 days)

**Goal**: Learn and prevent future incidents. Blameless.

Write a postmortem covering:
- **Summary**: Date, severity, duration, impact (users/revenue)
- **Timeline**: Event-by-event from normal operation through resolution
- **Root cause**: Detailed explanation with contributing factors
- **Impact**: Users, business, engineering hours
- **Resolution**: Immediate mitigation and permanent fix
- **What went well / what went wrong**
- **Action items**: Specific, assigned, with owners and due dates — monitoring, alerting, tests, runbook, architecture review
- **Lessons learned**

### Gate
- [ ] Postmortem document written
- [ ] Blameless meeting held
- [ ] Action items assigned with owners and tracked
- [ ] Prevention measures in place
