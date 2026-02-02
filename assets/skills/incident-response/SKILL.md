---
name: incident-response
description: Incident response workflow for handling production issues. Use when there's an incident, outage, production down, or when user says "incident", "outage", "production down", "service down", "emergency".
---

# Incident Response Workflow

Structured workflow for handling production incidents with clear phases from triage to postmortem.

## IMPORTANT: Read Architecture First

**Before responding to incidents, you MUST read the appropriate architecture reference:**

### Global Architecture Files
```
~/.claude/architecture/
├── clean-architecture.md    # Core principles for all projects
├── flutter-mobile.md        # Flutter + Riverpod
├── react-frontend.md        # React + Vite + TypeScript
├── go-backend.md            # Go + Gin
├── laravel-backend.md       # Laravel + PHP
├── remix-fullstack.md       # Remix fullstack
└── monorepo.md              # Monorepo structure
```

### Project-specific (if exists)
```
.claude/architecture/        # Project overrides
```

**Understand the system architecture to diagnose and fix issues effectively.**

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| TRIAGE | `@devops` | Infrastructure & monitoring |
| INVESTIGATE | `@react-frontend-dev`, `@go-backend-dev`, `@laravel-backend-dev`, `@flutter-mobile-dev`, `@remix-fullstack-dev` | Stack-specific debugging |
| INVESTIGATE | `@security-audit` | Security incidents |
| INVESTIGATE | `@db-designer` | Database issues |
| MITIGATE | `@devops` | Quick rollback/scaling |
| RESOLVE | Stack-specific dev agents | Permanent fix |
| POSTMORTEM | `@docs-writer` | Document learnings |

## Workflow Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│1. TRIAGE │──▶│2. INVESTI│──▶│3. MITIGATE──▶│4. RESOLVE│──▶│5. POST-  │
│          │   │  GATE    │   │          │   │          │   │  MORTEM  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
     │              │              │              │
     │              │              │              └──── Monitor ────┐
     │              │              └──── If fails ─────────┐        │
     │              └──── Escalate if needed              │        │
     └──── Notify stakeholders ────────────────────────────┴────────┘
```

---

## Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| 🔴 **P1** | Critical - Complete outage | Immediate (< 15 min) | Production down, data loss, security breach |
| 🟠 **P2** | High - Major degradation | < 1 hour | Core features broken, 50%+ users affected |
| 🟡 **P3** | Medium - Partial degradation | < 4 hours | Non-core features broken, < 50% users affected |
| 🟢 **P4** | Low - Minor issue | < 24 hours | UI bugs, minor performance issues |

---

## Phase 1: TRIAGE

**Goal**: Assess severity, scope, and impact immediately

**Timeline**: 5-15 minutes

### Actions

1. **Initial Assessment**:
   - [ ] Incident reported (alert/user/monitoring)
   - [ ] Timestamp recorded
   - [ ] Initial severity assigned (P1-P4)

2. **Gather Critical Information**:
   ```markdown
   - What is down/broken?
   - When did it start?
   - How many users affected?
   - Error messages/logs?
   - Recent deployments/changes?
   ```

3. **Identify System & Architecture**:
   - [ ] Identify affected stack (Flutter/React/Go/Laravel/Remix)
   - [ ] Identify affected service/component
   - [ ] Read architecture doc for affected area

4. **Establish Incident Response**:
   - [ ] Create incident channel (Slack/Teams)
   - [ ] Assign incident commander
   - [ ] Notify stakeholders (use template below)

5. **Quick Health Checks**:
   ```bash
   # Check service status
   curl -I https://[service-url]/health

   # Check logs (last 100 lines)
   kubectl logs -n [namespace] [pod] --tail=100
   # or
   docker logs [container] --tail=100

   # Check metrics
   # (CPU, memory, disk, network)
   ```

### Output Template

```markdown
## INCIDENT REPORT

**Severity**: P[1-4] - [CRITICAL/HIGH/MEDIUM/LOW]
**Status**: INVESTIGATING
**Started**: [timestamp]
**Affected**: [service/feature]
**User Impact**: [number/percentage] users
**Stack**: [Flutter/React/Go/Laravel/Remix]
**Architecture Doc**: [path]

### Summary
[One-line description of what's broken]

### Impact
- [ ] Production down
- [ ] Feature degraded
- [ ] Data integrity issues
- [ ] Security concerns

### Recent Changes
- [Last deployment/change]
- [Time of change]

### Initial Observations
- [Error messages]
- [Metrics anomalies]
- [User reports]

### Response Team
- Incident Commander: [name]
- Engineers: [names]
- On-call: [name]

### Communication
- Incident Channel: [link]
- Status Page Updated: [Y/N]
```

### Gate
- [ ] Severity assessed
- [ ] Stakeholders notified
- [ ] Architecture doc identified
- [ ] Response team assembled
- [ ] Communication channel established

---

## Phase 2: INVESTIGATE

**Goal**: Find the root cause

**Timeline**: 15-60 minutes (varies by severity)

### Actions

1. **Read Architecture Documentation**:
   - [ ] Read architecture doc for affected stack
   - [ ] Understand system components and dependencies
   - [ ] Identify critical paths

2. **Collect Evidence**:
   ```bash
   # Application logs
   grep -i error /var/log/[app].log | tail -50

   # System logs
   journalctl -u [service] --since "30 minutes ago"

   # Database logs
   # (stack-specific commands from architecture doc)

   # Network/traffic
   netstat -an | grep [port]
   ```

3. **Check Monitoring Dashboards**:
   - [ ] CPU/Memory usage
   - [ ] Request rate/latency
   - [ ] Error rate
   - [ ] Database connections/queries
   - [ ] External service dependencies

4. **Timeline Analysis**:
   ```markdown
   - [HH:MM] - Normal operation
   - [HH:MM] - [Event: deployment/config change/traffic spike]
   - [HH:MM] - First error logged
   - [HH:MM] - User reports started
   - [HH:MM] - Full outage
   ```

5. **Root Cause Analysis (5 Whys)**:
   ```
   Problem: [What is failing?]

   Why? → [First level cause]
   Why? → [Second level cause]
   Why? → [Third level cause]
   Why? → [Fourth level cause]
   Why? → [ROOT CAUSE]
   ```

6. **Check Dependencies**:
   - [ ] External APIs responding?
   - [ ] Database accessible?
   - [ ] Cache service healthy?
   - [ ] Message queue working?
   - [ ] CDN functioning?

### Investigation Output

```markdown
## ROOT CAUSE ANALYSIS

**Architecture Reference**: [path to doc]
**Affected Component**: [service/layer from architecture]
**Root Cause**: [detailed description]

### Timeline
- [HH:MM] - Event 1
- [HH:MM] - Event 2
- [HH:MM] - Failure point

### Evidence
**Logs**:
```
[relevant log entries]
```

**Metrics**:
- CPU: [before/after]
- Memory: [before/after]
- Error rate: [before/after]

**Related Changes**:
- Commit: [sha] - [description]
- Deploy: [time] - [version]
- Config: [change description]

### Hypothesis
[What we think caused it]

### Verification
[How to verify the hypothesis]
```

### Gate
- [ ] Root cause identified
- [ ] Evidence collected
- [ ] Timeline established
- [ ] Dependencies checked

---

## Phase 3: MITIGATE

**Goal**: Stop the bleeding with temporary fix

**Timeline**: Immediate (5-30 minutes)

### Principles
1. **Speed over perfection** - Stop user impact NOW
2. **Temporary is OK** - Permanent fix comes later
3. **Minimize risk** - Don't make it worse
4. **Preserve evidence** - Keep logs/data for analysis

### Mitigation Strategies

#### Strategy 1: Rollback
```bash
# Rollback to previous version
git log --oneline -5
git revert [bad-commit-sha]
# or
kubectl rollout undo deployment/[name]
# or
docker service update --rollback [service]
```

#### Strategy 2: Disable Feature
```bash
# Feature flag (if available)
# Turn off problematic feature
curl -X POST [config-service]/flags/[feature] -d '{"enabled": false}'
```

#### Strategy 3: Scale Resources
```bash
# Horizontal scaling
kubectl scale deployment/[name] --replicas=10

# Vertical scaling (increase resources)
# Update deployment with more CPU/memory
```

#### Strategy 4: Traffic Routing
```bash
# Route traffic away from bad instance
# Update load balancer/ingress
kubectl patch ingress [name] -p '[patch-json]'
```

#### Strategy 5: Kill Switch
```bash
# Emergency circuit breaker
# Disable non-critical services to save core
```

#### Strategy 6: Database Mitigation
```sql
-- If database issue
-- Kill long-running queries
SELECT pg_terminate_backend([pid]);

-- Add missing index temporarily
CREATE INDEX CONCURRENTLY idx_temp ON [table]([column]);
```

### Mitigation Checklist
- [ ] Mitigation strategy selected
- [ ] Tested in staging (if time permits for P2-P4)
- [ ] Executed in production
- [ ] User impact reduced/eliminated
- [ ] System stable
- [ ] Monitoring confirms mitigation working

### Output Template

```markdown
## MITIGATION APPLIED

**Strategy**: [Rollback/Feature Flag/Scaling/etc]
**Applied At**: [timestamp]
**Applied By**: [name]

### Action Taken
```bash
[exact commands executed]
```

### Result
- User Impact: [before] → [after]
- Error Rate: [before] → [after]
- Service Status: [before] → [after]

### Monitoring
- [ ] Metrics returning to normal
- [ ] Error rate decreased
- [ ] Users can access service
- [ ] No new issues introduced

### Next Steps
- [ ] Monitor for 15-30 minutes
- [ ] Proceed to RESOLVE for permanent fix
```

### Gate
- [ ] User impact mitigated
- [ ] System stable
- [ ] Monitoring shows improvement
- [ ] No new critical issues

---

## Phase 4: RESOLVE

**Goal**: Implement permanent fix

**Timeline**: Hours to days (depending on severity)

### Actions

1. **Read Architecture Documentation**:
   - [ ] Re-read architecture doc for affected stack
   - [ ] Understand proper fix location and approach
   - [ ] Follow architecture patterns

2. **Design Permanent Fix**:
   ```markdown
   ### Fix Design
   **Based on**: [architecture doc]
   **Affected Layers**: [from architecture doc]

   **Root Cause**: [from investigation]

   **Permanent Solution**:
   - [Change 1 - following architecture patterns]
   - [Change 2 - following architecture patterns]

   **Why This Prevents Recurrence**:
   [Explanation]
   ```

3. **Implement Fix**:
   - [ ] Create branch: `incident/[issue-id]-[description]`
   - [ ] Implement following architecture doc patterns
   - [ ] Add monitoring/alerting to prevent recurrence
   - [ ] Add tests to catch this scenario

4. **Test Thoroughly**:
   ```bash
   # Use test commands from architecture doc
   flutter test           # Flutter
   go test ./...          # Go
   bun test               # React/Remix
   php artisan test       # Laravel

   # Integration tests
   # Load tests (if performance issue)
   # Security tests (if security issue)
   ```

5. **Gradual Rollout** (for P1/P2 incidents):
   - [ ] Deploy to staging
   - [ ] Canary deployment (5% traffic)
   - [ ] Monitor for issues
   - [ ] Gradual increase (25%, 50%, 100%)

### Resolution Checklist
- [ ] Fix follows architecture doc
- [ ] Root cause addressed
- [ ] Tests added to prevent regression
- [ ] Monitoring/alerting enhanced
- [ ] Code reviewed
- [ ] Documentation updated

### Deployment

```bash
# Commit with incident reference
git add .
git commit -m "fix: [description] (incident #[id])

Root cause: [explanation]
Resolution: [what was changed]

Prevents recurrence by: [explanation]

Fixes #[incident-id]"

# Create PR
gh pr create --title "fix: [description] (incident #[id])" --body "$(cat <<'EOF'
## Summary
Resolves incident #[id]

## Root Cause
[Detailed explanation]

## Permanent Fix
[What was changed, following architecture patterns]

## Prevention
- [ ] Monitoring added
- [ ] Tests added
- [ ] Documentation updated

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Staging deployment successful
- [ ] Canary deployment successful

## Rollback Plan
`git revert [commit-sha]`
EOF
)"
```

### Gate
- [ ] Permanent fix implemented
- [ ] Following architecture patterns
- [ ] All tests passing
- [ ] Deployed successfully
- [ ] Monitoring confirms fix

---

## Phase 5: POSTMORTEM

**Goal**: Learn and prevent future incidents

**Timeline**: Within 3-5 days after resolution

### Actions

1. **Schedule Postmortem Meeting**:
   - [ ] Blameless environment
   - [ ] All involved parties
   - [ ] Within 1 week of incident

2. **Write Postmortem Document**:

### Postmortem Template

```markdown
# Incident Postmortem: [Title]

**Date**: [YYYY-MM-DD]
**Severity**: P[1-4]
**Duration**: [HH:MM]
**Impact**: [X users / Y transactions / Z revenue]
**Authors**: [names]

## Summary
[2-3 sentence summary of what happened]

## Timeline (All times in [timezone])

| Time | Event |
|------|-------|
| HH:MM | Normal operation |
| HH:MM | [Trigger event] |
| HH:MM | First error detected |
| HH:MM | Incident declared |
| HH:MM | Triage complete |
| HH:MM | Root cause identified |
| HH:MM | Mitigation applied |
| HH:MM | Service restored |
| HH:MM | Permanent fix deployed |
| HH:MM | Incident closed |

## Root Cause
[Detailed explanation of what went wrong and why]

### Contributing Factors
1. [Factor 1]
2. [Factor 2]
3. [Factor 3]

## Impact

### Users
- [X] users unable to access [feature]
- [Y] failed transactions
- [Z] support tickets

### Business
- [Estimated revenue impact]
- [Reputation impact]
- [SLA breach: Y/N]

### Engineering
- [On-call hours]
- [Development time]

## Resolution

### Immediate Mitigation
[What we did to stop the bleeding]

### Permanent Fix
[What we changed to prevent recurrence]

## What Went Well
1. [Positive aspect 1]
2. [Positive aspect 2]
3. [Positive aspect 3]

## What Went Wrong
1. [Problem 1]
2. [Problem 2]
3. [Problem 3]

## Action Items

| Action | Owner | Priority | Due Date | Status |
|--------|-------|----------|----------|--------|
| [Action 1] | [Name] | P1 | [Date] | [Open/In Progress/Done] |
| [Action 2] | [Name] | P2 | [Date] | [Open/In Progress/Done] |
| [Action 3] | [Name] | P3 | [Date] | [Open/In Progress/Done] |

### Preventive Measures
- [ ] Add monitoring for [metric]
- [ ] Add alerting for [condition]
- [ ] Improve documentation for [area]
- [ ] Add tests for [scenario]
- [ ] Update runbook for [process]
- [ ] Architecture review for [component]

### Process Improvements
- [ ] Update incident response playbook
- [ ] Improve deployment process
- [ ] Enhance testing strategy
- [ ] Update on-call rotation

## Supporting Information

### Logs
```
[Relevant log excerpts]
```

### Metrics
[Screenshots/graphs of relevant metrics]

### Related Incidents
- [Previous similar incident #123]
- [Related issue #456]

## Lessons Learned
1. [Key learning 1]
2. [Key learning 2]
3. [Key learning 3]
```

### Postmortem Checklist
- [ ] Postmortem doc written
- [ ] Meeting held (blameless)
- [ ] Action items assigned with owners
- [ ] Action items tracked
- [ ] Knowledge base updated
- [ ] Runbook updated (if applicable)
- [ ] Architecture doc updated (if applicable)

### Gate
- [ ] Postmortem complete
- [ ] Action items tracked
- [ ] Team learned lessons
- [ ] Prevention measures in place

---

## Communication Templates

### Initial Incident Notification

```
🚨 INCIDENT ALERT - P[X]

Status: INVESTIGATING
Affected: [service/feature]
Impact: [brief description]
Started: [timestamp]

We are investigating and will provide updates every [15/30] minutes.

Incident Channel: [link]
Status Page: [link]

- Incident Commander: [name]
```

### Status Update

```
📊 INCIDENT UPDATE - P[X]

Status: [INVESTIGATING/MITIGATING/RESOLVED]
Time: [timestamp]

Progress:
- [Update 1]
- [Update 2]

Current Impact: [description]

Next update in [15/30] minutes or when status changes.

- Incident Commander: [name]
```

### Resolution Notification

```
✅ INCIDENT RESOLVED - P[X]

Duration: [HH:MM]
Resolved: [timestamp]

Summary:
- Issue: [brief description]
- Cause: [root cause]
- Fix: [what was done]

Impact:
- [X] users affected
- [Y] duration

All services are now operating normally.

Postmortem will be shared within [3-5] days.

Thank you for your patience.

- Incident Commander: [name]
```

---

## Quick Reference

### Architecture Docs
| Stack | Doc |
|-------|-----|
| All | `clean-architecture.md` |
| Flutter | `flutter-mobile.md` |
| React | `react-frontend.md` |
| Go | `go-backend.md` |
| Laravel | `laravel-backend.md` |
| Remix | `remix-fullstack.md` |
| Monorepo | `monorepo.md` |

### Incident Response Checklist

#### First 5 Minutes
- [ ] Assign severity (P1-P4)
- [ ] Create incident channel
- [ ] Notify stakeholders
- [ ] Assign incident commander
- [ ] Begin triage

#### First 15 Minutes
- [ ] Read architecture doc
- [ ] Gather logs/metrics
- [ ] Identify affected components
- [ ] Establish timeline
- [ ] Update stakeholders

#### First 30 Minutes
- [ ] Root cause hypothesis
- [ ] Mitigation plan ready
- [ ] Execute mitigation
- [ ] Monitor impact

#### First Hour
- [ ] Service restored (mitigated)
- [ ] Monitoring stable
- [ ] Plan permanent fix

#### First Day
- [ ] Permanent fix designed
- [ ] Following architecture patterns
- [ ] Tests added
- [ ] Deployed with monitoring

#### First Week
- [ ] Postmortem scheduled
- [ ] Postmortem written
- [ ] Action items assigned
- [ ] Prevention measures planned

### Severity Response SLA

| Severity | Detection | Triage | Mitigation | Resolution |
|----------|-----------|--------|------------|------------|
| 🔴 P1 | < 5 min | < 15 min | < 30 min | < 4 hours |
| 🟠 P2 | < 15 min | < 30 min | < 1 hour | < 24 hours |
| 🟡 P3 | < 1 hour | < 2 hours | < 4 hours | < 1 week |
| 🟢 P4 | < 4 hours | < 1 day | Best effort | < 2 weeks |

### Escalation Path

```
P1: Immediate
├── Incident Commander
├── Engineering Manager
├── CTO
└── CEO (if customer-facing)

P2: < 1 hour
├── Incident Commander
├── Engineering Manager
└── CTO (if not resolved in 2 hours)

P3: < 4 hours
├── Incident Commander
└── Engineering Manager

P4: Normal business hours
└── Incident Commander
```

### Key Metrics to Monitor

#### Application Metrics
- [ ] Request rate
- [ ] Response time (p50, p95, p99)
- [ ] Error rate
- [ ] Active users
- [ ] Transaction volume

#### Infrastructure Metrics
- [ ] CPU usage
- [ ] Memory usage
- [ ] Disk usage
- [ ] Network I/O
- [ ] Database connections

#### Business Metrics
- [ ] Conversion rate
- [ ] Revenue
- [ ] User satisfaction
- [ ] SLA compliance

### Common Incident Types

| Type | Common Causes | Typical Mitigation |
|------|---------------|-------------------|
| **Deployment** | Bad code, config error | Rollback |
| **Infrastructure** | Resource exhaustion | Scale up/out |
| **Database** | Slow queries, locks | Kill queries, add indexes |
| **External Dependency** | API down, timeout | Circuit breaker, fallback |
| **Security** | Attack, vulnerability | Block traffic, patch |
| **Data** | Corruption, loss | Restore from backup |

### War Room Best Practices

1. **Clear Roles**:
   - Incident Commander (makes decisions)
   - Investigators (find root cause)
   - Communicators (update stakeholders)
   - Scribes (document timeline)

2. **Communication**:
   - Use dedicated channel
   - Update every 15-30 minutes
   - Be specific, not vague
   - No blame, focus on fix

3. **Decision Making**:
   - Incident Commander has final say
   - Bias toward action
   - Don't wait for perfect information
   - Mitigate first, understand later

4. **Documentation**:
   - Log every action with timestamp
   - Save logs/metrics
   - Screenshot dashboards
   - Record decisions and rationale

---

## Runbook Examples

### Service Down

```bash
# 1. Check if service is running
systemctl status [service]
# or
kubectl get pods -n [namespace]

# 2. Check logs
journalctl -u [service] --since "10 minutes ago"
# or
kubectl logs -n [namespace] [pod] --tail=100

# 3. Restart service
systemctl restart [service]
# or
kubectl rollout restart deployment/[name]

# 4. Verify
curl https://[service]/health
```

### High CPU Usage

```bash
# 1. Identify process
top -o %CPU
# or
ps aux --sort=-%cpu | head

# 2. Check if legitimate
# (deployment, batch job, etc.)

# 3. If abnormal, scale up
kubectl scale deployment/[name] --replicas=[N+2]

# 4. Investigate root cause
# (profiling, logs, etc.)
```

### Database Slow

```sql
-- 1. Check active queries
SELECT pid, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;

-- 2. Kill long-running queries
SELECT pg_terminate_backend([pid]);

-- 3. Check for locks
SELECT * FROM pg_locks WHERE NOT granted;

-- 4. Add missing indexes (if needed)
CREATE INDEX CONCURRENTLY idx_name ON table(column);
```

---

## Emergency Contacts

**Add your team's contacts:**

```markdown
### On-Call Rotation
- Primary: [name] - [contact]
- Secondary: [name] - [contact]

### Escalation
- Engineering Manager: [name] - [contact]
- CTO: [name] - [contact]
- CEO: [name] - [contact]

### External
- Cloud Provider Support: [contact]
- Database Support: [contact]
- Security Team: [contact]
```

---

## Additional Resources

- [Incident Response Plan]
- [Runbook Collection]
- [Monitoring Dashboard]
- [Status Page]
- [Postmortem Archive]
- [Architecture Documentation]
