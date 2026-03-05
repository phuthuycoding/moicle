---
name: ship
description: Ship workflow for versioning, changelog, tagging, and creating PR. Use when releasing, shipping versions, or when user says "release", "ship", "publish", "new version", "cut release", "bump version".
---

# Release Workflow

Workflow for shipping releases with versioning, changelog, tagging, and PR creation.

## IMPORTANT: Read Architecture First

**Before starting any phase, you MUST read the appropriate architecture reference:**

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

**Understand the project's release process and conventions before proceeding.**

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| PRE-CHECK | `@code-reviewer` | Final code review |
| PRE-CHECK | `@test-writer` | Verify test coverage |
| PRE-CHECK | `@security-audit` | Security scan before release |
| CHANGELOG | `@docs-writer` | Generate changelog & release notes |

## Workflow Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│1.PRE-CHECK──▶│2.VERSION │──▶│3.CHANGELOG──▶│4.TAG+COMMIT──▶│5.CREATE PR│
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

---

## Phase 1: PRE-CHECK

**Goal**: Ensure codebase is release-ready

### Actions
1. **Identify project stack and read architecture doc**
2. Verify branch state:
   ```bash
   git status
   git log --oneline -20
   git diff main..HEAD --stat  # or master
   ```

3. Run full test suite:
   ```bash
   flutter test           # Flutter
   go test ./...          # Go
   bun test               # React/Remix
   php artisan test       # Laravel
   ```

4. Check for:
   - [ ] All tests passing
   - [ ] No uncommitted changes
   - [ ] No pending PRs that should be included
   - [ ] No known critical bugs

5. Review what's being released:
   ```bash
   git log $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD --oneline
   ```

### Output
```markdown
## Pre-Release Check

**Stack**: [Flutter/React/Go/Laravel/Remix]
**Branch**: [branch name]
**Last Release**: [tag/version]

### Tests: [PASS/FAIL]
### Commits Since Last Release: [count]

### Changes Summary
- feat: [list features]
- fix: [list fixes]
- breaking: [list breaking changes]
```

### Gate
- [ ] All tests pass
- [ ] Clean working tree
- [ ] Changes catalogued

---

## Phase 2: VERSION

**Goal**: Determine and apply the correct version number

### Versioning Strategy

Follow [Semantic Versioning](https://semver.org/):
```
MAJOR.MINOR.PATCH

MAJOR - Breaking changes (incompatible API changes)
MINOR - New features (backwards compatible)
PATCH - Bug fixes (backwards compatible)
```

### Actions
1. Determine version bump based on commits:
   ```
   feat!: / BREAKING CHANGE: → MAJOR
   feat:                     → MINOR
   fix: / perf: / refactor:  → PATCH
   ```

2. Check current version:
   ```bash
   # Node.js
   node -e "console.log(require('./package.json').version)"

   # Flutter
   grep 'version:' pubspec.yaml

   # Go
   git describe --tags --abbrev=0

   # Laravel
   grep "'version'" config/app.php
   ```

3. Apply version bump:
   ```bash
   # Node.js
   npm version [major|minor|patch] --no-git-tag-version

   # Flutter - update pubspec.yaml version field

   # Go - version via git tags only

   # Laravel - update config/app.php version
   ```

4. Ask user to confirm the new version number

### Gate
- [ ] Version number confirmed by user
- [ ] Version applied to project files
- [ ] Bump type matches changes

---

## Phase 3: CHANGELOG

**Goal**: Generate clear, useful release notes

### Actions
1. Collect commits since last release:
   ```bash
   git log $(git describe --tags --abbrev=0 2>/dev/null || git rev-list --max-parents=0 HEAD)..HEAD --pretty=format:"- %s (%h)" --reverse
   ```

2. Categorize changes:
   ```markdown
   ## [x.y.z] - YYYY-MM-DD

   ### Breaking Changes
   - description (#PR)

   ### Features
   - description (#PR)

   ### Bug Fixes
   - description (#PR)

   ### Performance
   - description (#PR)

   ### Other
   - description (#PR)
   ```

3. Update CHANGELOG.md (prepend new version at top)

### Gate
- [ ] CHANGELOG.md updated
- [ ] All significant changes documented

---

## Phase 4: TAG & COMMIT

**Goal**: Create release commit and tag

### Actions
1. Stage and commit version + changelog:
   ```bash
   git add -A
   git commit -m "chore(release): bump version to [x.y.z]"
   ```

2. Create annotated tag:
   ```bash
   git tag -a v[x.y.z] -m "Release v[x.y.z]"
   ```

### Gate
- [ ] Version commit created
- [ ] Tag created

---

## Phase 5: CREATE PR

**Goal**: Push and create PR to master

### Actions
1. Push branch and tag:
   ```bash
   git push origin [branch] -u
   git push origin v[x.y.z]
   ```

2. Create PR:
   ```bash
   gh pr create --base master --title "chore(release): v[x.y.z]" --body "$(cat <<'EOF'
   ## Release v[x.y.z]

   ### Changes
   [paste categorized changelog here]

   ### Checklist
   - [ ] Tests passing
   - [ ] Version bumped
   - [ ] CHANGELOG updated
   - [ ] Tag created
   EOF
   )"
   ```

### Gate
- [ ] Branch pushed
- [ ] Tag pushed
- [ ] PR created to master

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

### Version Bump Decision
| Commit Type | Bump | Example |
|-------------|------|---------|
| `feat!:` / `BREAKING CHANGE:` | MAJOR | API removed |
| `feat:` | MINOR | New endpoint |
| `fix:` / `perf:` | PATCH | Bug fix |

### Commit Message Format
```
chore(release): bump version to x.y.z
```

### Tag Format
```
v[MAJOR].[MINOR].[PATCH]
```

### Release Checklist
- [ ] Tests pass
- [ ] Version bumped
- [ ] CHANGELOG updated
- [ ] Committed & tagged
- [ ] PR created to master
