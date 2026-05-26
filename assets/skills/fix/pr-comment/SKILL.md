---
name: fix-pr-comment
description: Fix PR review comments workflow. Use when fixing review comments from a pull request, or when user says "fix pr comment", "fix review comment", "fix-pr-comment", "address pr feedback".
args: PR_NUMBER
---

# Fix PR Comment Workflow

Fetch all review comments on an open PR, address each, push, and respond back to GitHub.

**ARGUMENTS:** `PR_NUMBER` — the PR you authored.

## When to use this skill

- ✅ Reviewer left comments and you need to address each one
- ✅ Want to track which comments are resolved vs still open
- ✅ Need structured responses posted back to GitHub
- ❌ You are the reviewer → use `/review:pr`
- ❌ No PR yet → use `/review:branch`
- ❌ Fix is a brand-new bug surfaced by reviewer → `/fix:hotfix` first, then this skill

---

## Workflow

```
FETCH → ANALYZE → FIX → RESPOND
```

---

## Phase 1: FETCH

```bash
PR={number}
gh pr view $PR --json number,title,state,headRefName,baseRefName,author
gh pr diff $PR
gh api repos/{owner}/{repo}/pulls/$PR/comments \
  --jq '.[] | {id, path, line, body, user: .user.login, created_at}'
gh api repos/{owner}/{repo}/pulls/$PR/reviews \
  --jq '.[] | {id, user: .user.login, state, body}'
```

Collect into a list. Each comment has: `id`, `file:line`, `author`, `body`, `created_at`.

### Gate
- [ ] All comments fetched (line-level + review-level)
- [ ] Current diff loaded
- [ ] PR is open (closed/merged PR → ask if user really wants to revisit)

---

## Phase 2: ANALYZE

For each comment, classify:

| Category | Action |
|----------|--------|
| **Must-fix** (bug, security, broken test, arch violation) | Fix in this round |
| **Should-fix** (style, naming, missing test for new code) | Fix unless explicit reason not to |
| **Discussion** (asking a question, proposing alternative) | Reply with reasoning before fixing |
| **Nit / preference** (subjective) | Acknowledge + decide; OK to push back politely |
| **Outdated** (code already changed) | Reply "resolved by {commit}" and resolve thread |

Ambiguous comment (e.g., "this feels off")? Ask the reviewer for specifics before guessing.

Build a triage table:

```markdown
| # | File:line | Author | Category | Plan |
|---|-----------|--------|----------|------|
| 1 | handler.go:42 | @alice | must-fix | extract validation to DTO |
| 2 | store.go:88 | @bob | discussion | reply: prefer current approach because ... |
```

### Gate
- [ ] Every comment classified
- [ ] Plan written per comment
- [ ] Ambiguous comments → questions queued for reviewer

---

## Phase 3: FIX

### Rules
- Fix in order: must-fix → should-fix → discussion outcomes
- One concern per commit (`fix(handler): validate input in DTO per #pr-comment-1`)
- After each batch: run build + lint + tests locally
- Re-run `/review:branch` before pushing

### When the fix changes architecture
If a comment requests something structural (move logic between layers, add a port), use `/feature:refactor` for that subtree, then come back here to respond.

### Gate
- [ ] All must-fix items addressed
- [ ] Build + lint + tests green
- [ ] Self-review with `/review:branch` clean

---

## Phase 4: RESPOND

Push commits, then reply on GitHub.

```bash
git push
# Reply to each thread
gh api repos/{owner}/{repo}/pulls/$PR/comments/{comment_id}/replies -f body="..."
# Or single summary review
gh pr review $PR --comment --body "$(cat reply.md)"
```

### Reply patterns

**Fixed**
> Fixed in {sha}. {one-line of what changed}.

**Pushing back (politely)**
> Considered this — keeping current approach because {specific reason}. Happy to revisit if you have stronger evidence.

**Asking back**
> Could you clarify what you mean by "this feels off"? Is it about {hypothesis A} or {hypothesis B}?

**Resolved by other change**
> Resolved by {sha} earlier in the chain — line {N} no longer exists.

### Resolve threads
After replying, mark threads resolved (GitHub UI or API). Don't leave dangling threads — reviewer can't tell what's done.

### Re-request review
```bash
gh pr edit $PR --add-reviewer {original_reviewer}
```

### Gate
- [ ] Every comment has a reply
- [ ] Threads resolved where appropriate
- [ ] Commits pushed
- [ ] Reviewer re-requested

---

## Final Report

```markdown
## PR #{N}: comments addressed

| # | File:line | Category | Resolution | Commit |
|---|-----------|----------|------------|--------|
| 1 | handler.go:42 | must-fix | Extracted validation | abc123 |
| 2 | store.go:88 | discussion | Replied + kept approach | — |
| 3 | helper.go:5 | nit | Renamed | def456 |

### Build / Lint / Tests: PASS
### Re-review requested: @{reviewer}
```

---

## Hard Rules

- **Reply to every comment** — silence reads as ignoring
- **Push back politely** when you have a real reason; never just close threads
- **One concern per commit** — easier for reviewer to verify
- **Run `/review:branch` before pushing** — catch easy issues before reviewer round 2
- **Don't argue style** when the team has a linter — let the tool decide

---

## Related Skills

| When | Use |
|------|-----|
| You are the reviewer | `/review:pr` |
| Self-review before pushing again | `/review:branch` |
| Reviewer asked for architectural refactor | `/feature:refactor` |
| Reviewer surfaced a bug needing investigation | `/fix:root-cause` |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| ANALYZE | `@code-reviewer` | Triage comments by severity |
| FIX | Stack-specific dev agent | Apply code changes |
| FIX | `@security-audit` | If comment flagged security |
| RESPOND | `@docs-writer` | Polish written replies |
