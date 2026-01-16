---
name: hotfix
description: Quick bug fix workflow with rollback plan. Use when fixing bugs, hotfixes, urgent issues, production bugs, or when user says "fix bug", "hotfix", "urgent fix", "production issue".
---

# Hotfix Workflow

Fast-track workflow for fixing bugs with safety rollback plan.

## IMPORTANT: Read Architecture First

**Before fixing, you MUST read the appropriate architecture reference:**

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

**Understand the codebase structure before making changes.**

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| FIX | `@react-frontend-dev`, `@go-backend-dev`, `@laravel-backend-dev`, `@flutter-mobile-dev`, `@remix-fullstack-dev` | Stack-specific bug fix |
| FIX | `@security-audit` | Security-related bugs |
| VERIFY | `@test-writer` | Regression test |
| VERIFY | `@code-reviewer` | Quick code review |
| DEPLOY | `@devops` | CI/CD & deployment |

## Workflow Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│1. IDENTIFY──▶│2. REPRODUCE──▶│ 3. FIX   │──▶│4. VERIFY │──▶│5. DEPLOY │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                    │                              │
                    │              Fail?           │
                    │         ┌────────────────────┘
                    ▼         ▼
              ┌──────────────────┐
              │    6. ROLLBACK   │
              │   (if needed)    │
              └──────────────────┘
```

---

## Phase 1: IDENTIFY

**Goal**: Identify exactly what the bug is

### Actions
1. Gather information:
   - Error message / stack trace
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (prod/staging/dev)
   - Affected users/scope

2. **Identify project stack and read architecture doc**

3. Assess severity:
   ```
   🔴 CRITICAL - Production down, data loss
   🟠 HIGH     - Major feature broken, many users affected
   🟡 MEDIUM   - Feature degraded, workaround exists
   🟢 LOW      - Minor issue, cosmetic
   ```

### Output
```markdown
## Bug Report
**Severity**: [CRITICAL/HIGH/MEDIUM/LOW]
**Stack**: [Flutter/React/Go/Laravel/Remix]
**Architecture Doc**: [path]
**Error**: [error message]
**Steps**:
1. ...
2. ...
**Expected**: [what should happen]
**Actual**: [what happens]
**Environment**: [prod/staging/dev]
```

### Gate
- [ ] Bug clearly described
- [ ] Architecture doc identified
- [ ] Severity assessed
- [ ] Scope understood

---

## Phase 2: REPRODUCE & ANALYZE

**Goal**: Reproduce the bug and find root cause

### Actions
1. **Read architecture doc** to understand codebase structure
2. Reproduce locally following architecture patterns
3. Find root cause using 5 Whys:
   ```
   Why did it fail? → [answer]
   Why? → [deeper answer]
   Why? → [even deeper]
   Why? → [root cause emerging]
   Why? → [ROOT CAUSE]
   ```

4. Identify fix location based on architecture:
   - Which layer? (from architecture doc)
   - Which file(s)?
   - What's the minimal change?

5. Check git blame:
   ```bash
   git log --oneline -10 -- [affected_file]
   git blame [affected_file] | grep -A5 -B5 "[problem_area]"
   ```

### Analysis Output
```markdown
## Root Cause Analysis
**Architecture Reference**: [path to doc]
**Affected Layer**: [layer from architecture doc]
**Root Cause**: [description]
**Introduced**: [commit/PR if known]
**Affected Files**:
- file1:123
- file2:456

**Fix Strategy**: [brief description following architecture patterns]
```

### Gate
- [ ] Bug reproduced locally
- [ ] Root cause identified
- [ ] Fix location known (per architecture)

---

## Phase 3: FIX

**Goal**: Implement minimal fix following architecture

### Principles
1. **Minimal change** - Fix only what's broken
2. **Follow architecture** - Respect layer boundaries from doc
3. **No refactoring** - Save for later
4. **No new features** - Stay focused
5. **Preserve behavior** - Don't change anything else

### Actions
1. Create hotfix branch:
   ```bash
   git checkout -b hotfix/[issue-id]-[short-description]
   ```

2. **Read architecture doc** for the affected layer
3. Implement fix following architecture patterns:
   - Use correct patterns from doc
   - Follow naming conventions from doc
   - Respect layer boundaries

4. Add inline comment explaining fix:
   ```
   // HOTFIX: [issue-id] - [brief description]
   // Root cause: [why this fixes it]
   [your fix code]
   ```

### Gate
- [ ] Fix follows architecture doc
- [ ] Fix implemented minimally
- [ ] Code compiles
- [ ] No unrelated changes

---

## Phase 4: VERIFY

**Goal**: Confirm fix works without breaking other things

### Actions
1. Test the fix:
   - [ ] Original bug no longer occurs
   - [ ] Related functionality still works
   - [ ] Edge cases handled

2. Run existing tests (use command from architecture doc):
   ```bash
   flutter test           # Flutter
   go test ./...          # Go
   bun test               # React/Remix
   php artisan test       # Laravel
   ```

3. Add regression test following architecture patterns:
   ```
   // Test to prevent regression
   it('should [expected behavior] - fixes #[issue-id]', () => {
     // Arrange: setup that caused bug
     // Act: trigger the bug scenario
     // Assert: verify correct behavior
   });
   ```

4. Manual verification:
   - [ ] Reproduce original steps
   - [ ] Confirm bug is fixed
   - [ ] Test happy path
   - [ ] Test edge cases

### Gate
- [ ] Original bug fixed
- [ ] All tests pass
- [ ] Regression test added (following arch patterns)
- [ ] No new issues introduced

### Feedback Loop
If verification fails:
1. Note what failed
2. Return to FIX phase
3. Adjust fix (following architecture)
4. Re-verify

---

## Phase 5: DEPLOY

**Goal**: Ship the fix safely

### Actions
1. Commit with clear message:
   ```bash
   git add .
   git commit -m "fix: [short description] (#[issue-id])

   Root cause: [brief explanation]
   Fix: [what was changed]

   Fixes #[issue-id]"
   ```

2. Create PR:
   ```bash
   gh pr create --title "fix: [description]" --body "$(cat <<'EOF'
   ## Summary
   Fixes #[issue-id]

   ## Root Cause
   [explanation]

   ## Fix
   [what was changed, following architecture patterns]

   ## Testing
   - [ ] Original bug no longer occurs
   - [ ] Regression test added
   - [ ] All tests pass

   ## Rollback Plan
   Revert commit: `git revert [commit-sha]`
   EOF
   )"
   ```

3. Deploy (if applicable):
   ```bash
   # Follow your deployment process
   # Monitor for issues
   ```

### Gate
- [ ] PR created/merged
- [ ] Deployed (if applicable)
- [ ] Monitoring in place

---

## Phase 6: ROLLBACK (If Needed)

**Goal**: Quickly revert if fix causes more problems

### When to Rollback
- [ ] Fix introduced new bugs
- [ ] Performance degraded
- [ ] Unexpected side effects
- [ ] Users reporting new issues

### Rollback Actions

1. **Quick Revert**:
   ```bash
   # Find the hotfix commit
   git log --oneline -5

   # Revert it
   git revert [hotfix-commit-sha]
   git push
   ```

2. **Feature Flag** (if available):
   ```
   // Disable the fix temporarily
   if (!featureFlags.hotfix_123_enabled) {
     // Original behavior
   }
   ```

3. **Redeploy previous version**:
   ```bash
   # Deploy previous known-good version
   git checkout [previous-tag]
   # Run deploy
   ```

### Post-Rollback
1. Document what went wrong
2. Return to REPRODUCE phase
3. Analyze why fix failed (check architecture compliance)
4. Create better fix

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

### Hotfix vs Feature

| Aspect | Hotfix | Feature |
|--------|--------|---------|
| Speed | Fast (< 1 hour) | Thorough |
| Scope | Minimal | Full |
| Testing | Targeted | Comprehensive |
| Design | Skip | Required |
| Risk | Higher, has rollback | Lower |

### Severity Response Time

| Severity | Response | Fix Target |
|----------|----------|------------|
| 🔴 CRITICAL | Immediate | < 1 hour |
| 🟠 HIGH | Same day | < 4 hours |
| 🟡 MEDIUM | Next sprint | < 1 week |
| 🟢 LOW | Backlog | When convenient |

### Commit Message Format
```
fix: [short description] (#issue-id)

Root cause: [why it happened]
Fix: [what was changed]

Fixes #[issue-id]
```

### Rollback Checklist
- [ ] Identify rollback commit
- [ ] Test rollback locally
- [ ] Execute rollback
- [ ] Verify system stable
- [ ] Notify stakeholders
- [ ] Document learnings

---

## Emergency Contacts

Add your team's emergency contacts here:
```
On-call: [contact]
Backend lead: [contact]
DevOps: [contact]
```
