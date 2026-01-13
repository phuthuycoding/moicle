---
name: hotfix-workflow
description: Quick bug fix workflow with rollback plan. Use when fixing bugs, hotfixes, urgent issues, production bugs, or when user says "fix bug", "hotfix", "urgent fix", "production issue".
---

# Hotfix Workflow

Fast-track workflow for fixing bugs with safety rollback plan.

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

**Time**: 5-10 minutes

### Actions
1. Gather information:
   - Error message / stack trace
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (prod/staging/dev)
   - Affected users/scope

2. Assess severity:
   ```
   🔴 CRITICAL - Production down, data loss
   🟠 HIGH     - Major feature broken, many users affected
   🟡 MEDIUM   - Feature degraded, workaround exists
   🟢 LOW      - Minor issue, cosmetic
   ```

3. Document:
   ```markdown
   ## Bug Report
   **Severity**: [CRITICAL/HIGH/MEDIUM/LOW]
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
- [ ] Severity assessed
- [ ] Scope understood

---

## Phase 2: REPRODUCE & ANALYZE

**Goal**: Reproduce the bug and find root cause

**Time**: 10-20 minutes

### Actions
1. Reproduce locally:
   ```bash
   # Setup same environment
   # Follow exact steps
   # Confirm bug occurs
   ```

2. Find root cause (5 Whys):
   ```
   Why did it fail? → [answer]
   Why? → [deeper answer]
   Why? → [even deeper]
   Why? → [root cause emerging]
   Why? → [ROOT CAUSE]
   ```

3. Identify fix location:
   - Which file(s)?
   - Which function(s)?
   - What's the minimal change?

4. Check git blame:
   ```bash
   git log --oneline -10 -- [affected_file]
   git blame [affected_file] | grep -A5 -B5 "[problem_area]"
   ```

### Analysis Output
```markdown
## Root Cause Analysis
**Root Cause**: [description]
**Introduced**: [commit/PR if known]
**Affected Files**:
- file1.ts:123
- file2.ts:456

**Fix Strategy**: [brief description of fix]
```

### Gate
- [ ] Bug reproduced locally
- [ ] Root cause identified
- [ ] Fix location known

---

## Phase 3: FIX

**Goal**: Implement minimal fix

**Time**: 15-30 minutes

### Principles
1. **Minimal change** - Fix only what's broken
2. **No refactoring** - Save for later
3. **No new features** - Stay focused
4. **Preserve behavior** - Don't change anything else

### Actions
1. Create hotfix branch:
   ```bash
   git checkout -b hotfix/[issue-id]-[short-description]
   ```

2. Implement fix:
   - Make smallest possible change
   - Add defensive code if needed
   - Add inline comment explaining fix

3. Fix template:
   ```typescript
   // HOTFIX: [issue-id] - [brief description]
   // Root cause: [why this fixes it]
   [your fix code]
   ```

### Gate
- [ ] Fix implemented
- [ ] Code compiles
- [ ] No unrelated changes

---

## Phase 4: VERIFY

**Goal**: Confirm fix works without breaking other things

**Time**: 10-15 minutes

### Actions
1. Test the fix:
   - [ ] Original bug no longer occurs
   - [ ] Related functionality still works
   - [ ] Edge cases handled

2. Run existing tests:
   ```bash
   # Run all tests
   pnpm test        # JS/TS
   go test ./...    # Go
   flutter test     # Flutter
   ```

3. Add regression test:
   ```typescript
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
- [ ] Regression test added
- [ ] No new issues introduced

### Feedback Loop
If verification fails:
1. Note what failed
2. Return to FIX phase
3. Adjust fix
4. Re-verify

---

## Phase 5: DEPLOY

**Goal**: Ship the fix safely

**Time**: 5-10 minutes

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
   [what was changed]

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
   ```typescript
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
3. Analyze why fix failed
4. Create better fix

---

## Quick Reference

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
