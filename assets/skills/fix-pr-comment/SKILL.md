---
name: fix-pr-comment
description: Fix PR review comments workflow. Use when fixing review comments from a pull request, or when user says "fix pr comment", "fix review comment", "fix-pr-comment", "address pr feedback".
args: PR_NUMBER
---

# Fix PR Comment Workflow

Workflow for fetching and fixing review comments from a pull request.

## Usage

```
/fix-pr-comment {PR_NUMBER}
```

## Workflow Overview

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ 1. FETCH     │──▶│ 2. ANALYZE   │──▶│ 3. FIX       │──▶│ 4. RESPOND   │
│   Comments   │   │   Comments   │   │   Issues     │   │   to PR      │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

---

## Phase 1: FETCH

**Goal**: Fetch all review comments from the PR

### Actions

1. Get PR details:
   ```bash
   gh pr view {PR_NUMBER} --json number,title,state,headRefName,baseRefName
   ```

2. Fetch all review comments:
   ```bash
   gh api repos/{owner}/{repo}/pulls/{PR_NUMBER}/comments --jq '.[] | {id: .id, path: .path, line: .line, body: .body, user: .user.login, created_at: .created_at}'
   ```

3. Fetch PR review threads (for threaded discussions):
   ```bash
   gh api repos/{owner}/{repo}/pulls/{PR_NUMBER}/reviews --jq '.[] | {id: .id, user: .user.login, state: .state, body: .body}'
   ```

4. Get the current diff:
   ```bash
   gh pr diff {PR_NUMBER}
   ```

### Output
```markdown
## PR #{NUMBER}: {TITLE}

### Branch
- Head: {headRefName}
- Base: {baseRefName}

### Review Comments
1. **[{file}:{line}]** by @{user}
   > {comment body}

2. **[{file}:{line}]** by @{user}
   > {comment body}
```

### Gate
- [ ] PR details fetched
- [ ] Review comments fetched
- [ ] Current branch checked out

---

## Phase 2: ANALYZE

**Goal**: Categorize and prioritize comments

### Comment Categories

| Category | Description | Priority |
|----------|-------------|----------|
| 🔴 **Bug** | Code bug or logic error | Must fix |
| 🟠 **Security** | Security concern | Must fix |
| 🟡 **Architecture** | Design/structure issue | Should fix |
| 🟢 **Style** | Code style/formatting | Nice to fix |
| 💬 **Question** | Needs clarification | Respond |
| 💡 **Suggestion** | Optional improvement | Consider |

### Analysis Output
```markdown
## Comment Analysis

### Must Fix (Critical)
1. [{file}:{line}] - {summary}
2. [{file}:{line}] - {summary}

### Should Fix
1. [{file}:{line}] - {summary}

### Nice to Fix
1. [{file}:{line}] - {summary}

### Questions to Answer
1. [{file}:{line}] - {question}
```

### Gate
- [ ] All comments categorized
- [ ] Priorities assigned
- [ ] Fix order determined

---

## Phase 3: FIX

**Goal**: Address each comment systematically

### Fix Process

For each comment (in priority order):

1. **Read the file** at the specified location
2. **Understand the feedback**
3. **Apply the fix** following project conventions
4. **Mark as addressed** in your tracking

### Fix Template
```markdown
### Fixing: [{file}:{line}]
**Comment**: {original comment}
**Action**: {what you're changing}
**Status**: ✅ Fixed / ❓ Need clarification / ⏭️ Skipped (reason)
```

### Commit Strategy

Option A: Single commit for all fixes
```bash
git add .
git commit -m "fix: address PR review comments

- Fix {issue 1}
- Fix {issue 2}
- Address {feedback 3}"
```

Option B: Separate commits per fix (for complex changes)
```bash
git commit -m "fix: {specific fix description}"
```

### Gate
- [ ] All "Must Fix" addressed
- [ ] All "Should Fix" addressed
- [ ] Code compiles/builds
- [ ] Tests pass

---

## Phase 4: RESPOND

**Goal**: Push changes and respond to reviewers

### Actions

1. Push the fixes:
   ```bash
   git push
   ```

2. Reply to each comment on GitHub:
   ```bash
   # Reply to a specific comment
   gh api repos/{owner}/{repo}/pulls/{PR_NUMBER}/comments/{comment_id}/replies \
     -f body="Fixed in {commit_sha}. {additional context if needed}"
   ```

3. Request re-review:
   ```bash
   gh pr edit {PR_NUMBER} --add-reviewer {reviewer_username}
   ```

4. Add summary comment to PR:
   ```bash
   gh pr comment {PR_NUMBER} --body "$(cat <<'EOF'
   ## Review Comments Addressed

   ### Fixed
   - ✅ [{file}:{line}] - {description}
   - ✅ [{file}:{line}] - {description}

   ### Clarifications
   - 💬 [{file}:{line}] - {response to question}

   ### Deferred
   - ⏭️ [{file}:{line}] - {reason for deferring}

   Ready for re-review!
   EOF
   )"
   ```

### Response Templates

**For bug fixes:**
```
Fixed in {commit}. Good catch! The issue was {brief explanation}.
```

**For style/suggestions:**
```
Updated as suggested. Thanks for the feedback!
```

**For questions:**
```
{Answer the question}. Let me know if you need more context.
```

**For disagreements (respectful):**
```
I considered this, but kept the current approach because {reason}. Happy to discuss further if you still have concerns.
```

### Gate
- [ ] All fixes pushed
- [ ] Comments replied to
- [ ] Re-review requested
- [ ] Summary posted

---

## Quick Reference

### GitHub CLI Commands

```bash
# View PR
gh pr view {NUMBER}

# Get PR comments
gh api repos/{owner}/{repo}/pulls/{NUMBER}/comments

# Get PR reviews
gh api repos/{owner}/{repo}/pulls/{NUMBER}/reviews

# Reply to comment
gh api repos/{owner}/{repo}/pulls/{NUMBER}/comments/{comment_id}/replies -f body="message"

# Add PR comment
gh pr comment {NUMBER} --body "message"

# Request reviewer
gh pr edit {NUMBER} --add-reviewer {username}

# View PR diff
gh pr diff {NUMBER}

# Checkout PR branch
gh pr checkout {NUMBER}
```

### Comment Response Etiquette

1. **Be grateful** - Reviewers spent time helping you
2. **Be clear** - Explain what you changed and why
3. **Be timely** - Address comments promptly
4. **Be thorough** - Don't leave comments unaddressed
5. **Be open** - Accept feedback gracefully

---

## Success Criteria

PR comments are properly addressed when:
1. All critical/must-fix comments resolved
2. All comments have responses
3. Changes pushed to the PR branch
4. Reviewers notified for re-review
5. No new issues introduced
