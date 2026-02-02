---
name: deprecation
description: Deprecation workflow for safely removing features or code. Use when deprecating, removing features, sunsetting functionality, or when user says "deprecate", "remove feature", "sunset", "phase out", "delete feature".
---

# Deprecation Workflow

Systematic workflow for safely deprecating and removing features or code without breaking user workflows.

## IMPORTANT: Read Architecture First

**Before deprecating anything, you MUST read the appropriate architecture reference:**

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

**Understand dependencies and impact before deprecating.**

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| IDENTIFY | `@refactor` | Analyze dependencies and impact |
| IDENTIFY | `@code-reviewer` | Find all usages |
| PLAN | `@clean-architect` | Migration strategy |
| PLAN | `@api-designer` | API versioning (if applicable) |
| PLAN | `@docs-writer` | Deprecation notices |
| MIGRATE | `@react-frontend-dev`, `@go-backend-dev`, `@laravel-backend-dev`, `@flutter-mobile-dev`, `@remix-fullstack-dev` | Stack-specific migration |
| VERIFY | `@test-writer` | Migration tests |
| VERIFY | `@code-reviewer` | Final review |

## Workflow Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│1. IDENTIFY──▶│ 2. PLAN  │──▶│3. MIGRATE│──▶│ 4. REMOVE│──▶│5. VERIFY │
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
      │                             │              │              │
      │           Timeline:         │              │              │
      │         ┌──────────────────────────────────┴──────────────┘
      │         │
      ▼         ▼
  Announce → Warn → Migrate → Remove → Monitor
  (T-90)    (T-60)  (T-30)     (T-0)    (T+30)
```

---

## Phase 1: IDENTIFY

**Goal**: Identify what to deprecate and its full impact

### Actions

1. **Identify project stack and read architecture doc**

2. Define what to deprecate:
   - [ ] Feature/module/API/class/method
   - [ ] Reason for deprecation
   - [ ] Alternative solution (if any)

3. Analyze dependencies:
   ```bash
   # Find all usages (adjust per stack)

   # TypeScript/JavaScript
   grep -r "deprecatedFunction" --include="*.ts" --include="*.tsx" --include="*.js"

   # Go
   grep -r "DeprecatedFunc" --include="*.go"

   # PHP
   grep -r "deprecatedMethod" --include="*.php"

   # Dart
   grep -r "deprecatedWidget" --include="*.dart"
   ```

4. Identify stakeholders:
   - [ ] Internal teams using this
   - [ ] External users/customers
   - [ ] Third-party integrations
   - [ ] Documentation references

5. Assess impact based on architecture:
   - [ ] Which layers affected (from architecture doc)
   - [ ] Dependencies between layers
   - [ ] Breaking change severity
   - [ ] Migration complexity

6. Check version control history:
   ```bash
   git log --oneline --all -- [deprecated-file]
   git blame [deprecated-file]
   ```

### Output
```markdown
## Deprecation Analysis

### Stack & Architecture
- Stack: [Flutter/React/Go/Laravel/Remix]
- Architecture Doc: [path to doc]

### What to Deprecate
- Type: [Feature/API/Class/Method/Module]
- Name: [full name/path]
- Reason: [why deprecating]

### Alternative Solution
- Recommended: [new approach]
- Migration path: [how to migrate]

### Usage Analysis
- Internal usages: [count] in [locations]
- External usages: [estimated count]
- Dependencies: [list affected modules]

### Affected Layers (from architecture)
- Layer 1: [impact description]
- Layer 2: [impact description]

### Stakeholders
- Teams: [list]
- External users: [estimated]
- Integrations: [list]

### Impact Assessment
- Breaking change: [Yes/No]
- Severity: [Critical/High/Medium/Low]
- Migration effort: [High/Medium/Low]
- Risk: [High/Medium/Low]
```

### Gate
- [ ] Architecture doc read
- [ ] Deprecation target identified
- [ ] All usages found
- [ ] Impact assessed
- [ ] Stakeholders identified
- [ ] Alternative exists (or valid reason for removal)

---

## Phase 2: PLAN

**Goal**: Create migration plan and timeline

### Actions

1. **Re-read architecture doc** for migration patterns

2. Choose deprecation strategy:

   **Soft Deprecation** (Gradual):
   - Mark as deprecated with warnings
   - Provide alternative
   - Keep functional during grace period
   - Remove later

   **Hard Deprecation** (Immediate):
   - Breaking change in next major version
   - Force migration
   - Use for security/critical issues

3. Define timeline:
   ```
   Recommended timelines:

   Internal APIs:
   - Announce: Now
   - Warning: +2 weeks
   - Removal: +4-6 weeks

   Public APIs:
   - Announce: Now
   - Warning: +1 version (minor)
   - Removal: +1 version (major)
   - Total: 3-6 months minimum

   Critical security issues:
   - Announce: Now
   - Removal: Next patch/ASAP
   ```

4. Create migration guide:
   - [ ] What's being deprecated
   - [ ] Why it's being deprecated
   - [ ] What to use instead
   - [ ] How to migrate (step-by-step)
   - [ ] Code examples (before/after)
   - [ ] Automated migration tools (if possible)

5. Plan communication:
   - [ ] Changelog entry
   - [ ] Release notes
   - [ ] Email notifications (if external)
   - [ ] Documentation updates
   - [ ] In-code warnings

6. Identify risks and mitigation:
   - [ ] Users won't migrate → Extend timeline
   - [ ] No alternative exists → Build it first
   - [ ] Complex migration → Provide tooling
   - [ ] External dependencies → Coordinate

### Planning Template
```markdown
## Deprecation Plan

### Architecture Reference
- Doc: [path to architecture doc]
- Affected patterns: [patterns from doc]

### Strategy
- Type: [Soft/Hard Deprecation]
- Reason: [justify choice]

### Timeline
| Phase | Date | Action |
|-------|------|--------|
| Announce | T-90 (YYYY-MM-DD) | Release notes, changelog, docs |
| Warn | T-60 (YYYY-MM-DD) | Add runtime warnings |
| Migrate | T-30 (YYYY-MM-DD) | Help users migrate |
| Remove | T-0 (YYYY-MM-DD) | Delete deprecated code |
| Monitor | T+30 (YYYY-MM-DD) | Watch for issues |

### Migration Path
From: [current usage]
To: [new approach following architecture doc]

#### Step-by-step migration:
1. [Step 1]
2. [Step 2]
3. [Step 3]

#### Code examples:
```
// Before (deprecated)
[old code]

// After (recommended)
[new code following architecture patterns]
```

### Communication Plan
- [ ] Changelog: [version]
- [ ] Release notes: [version]
- [ ] Documentation: [update pages]
- [ ] Email: [stakeholders]
- [ ] In-app: [warning messages]
- [ ] Migration guide: [write guide]

### Risks & Mitigation
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | [H/M/L] | [H/M/L] | [Plan] |
| [Risk 2] | [H/M/L] | [H/M/L] | [Plan] |

### Rollback Plan
If deprecation causes issues:
- [ ] How to revert
- [ ] Fallback option
- [ ] Communication plan
```

### Gate
- [ ] Plan follows architecture doc
- [ ] Timeline defined
- [ ] Migration path clear
- [ ] Communication planned
- [ ] Risks identified
- [ ] Rollback plan exists

---

## Phase 3: MIGRATE

**Goal**: Help users migrate to the alternative

### Actions

1. **Announce deprecation** (T-90):

   Add to CHANGELOG.md:
   ```markdown
   ## [Version] - YYYY-MM-DD

   ### Deprecated
   - `[deprecated item]` is now deprecated and will be removed in [version/date]
     - Reason: [why]
     - Alternative: Use `[new item]` instead
     - Migration guide: [link to guide]
   ```

2. **Add deprecation markers in code** (T-60):

   TypeScript/JavaScript:
   ```typescript
   /**
    * @deprecated Use newFunction() instead. Will be removed in v2.0.0
    * @see newFunction
    */
   function oldFunction() {
     console.warn('oldFunction is deprecated. Use newFunction instead.');
     // existing implementation
   }
   ```

   Go:
   ```go
   // Deprecated: OldFunc is deprecated, use NewFunc instead.
   // It will be removed in v2.0.0.
   func OldFunc() {
       log.Println("WARNING: OldFunc is deprecated, use NewFunc")
       // existing implementation
   }
   ```

   PHP (Laravel):
   ```php
   /**
    * @deprecated 2.0.0 Use newMethod() instead
    */
   public function oldMethod() {
       trigger_error(
           'oldMethod is deprecated, use newMethod instead',
           E_USER_DEPRECATED
       );
       // existing implementation
   }
   ```

   Dart (Flutter):
   ```dart
   @Deprecated('Use newWidget instead. Will be removed in v2.0.0')
   class OldWidget extends StatelessWidget {
     // existing implementation
   }
   ```

3. **Update documentation** (T-60):
   - [ ] Mark deprecated in API docs
   - [ ] Add migration guide
   - [ ] Update examples to use new approach
   - [ ] Add deprecation notice banner
   - [ ] Update README/guides

4. **Create migration tools** (if needed):
   ```bash
   # Example: Automated migration script
   # TypeScript/JavaScript
   npx jscodeshift -t migrate-deprecated-api.js src/

   # Go
   go fix

   # Create custom migration scripts
   ```

5. **Proactive migration** (T-30):

   For internal code:
   ```bash
   # Find all usages
   grep -r "deprecated" --include="*.ts"

   # Migrate one by one
   # Test after each migration
   # Commit frequently
   ```

   For external users:
   - [ ] Email notifications with migration guide
   - [ ] Office hours / support sessions
   - [ ] Example migration PRs
   - [ ] FAQ document

6. **Monitor adoption**:
   ```bash
   # Track usage of deprecated code
   # Add metrics/logging if possible
   # Follow up with slow adopters
   ```

### Migration Checklist
```markdown
## Migration Progress

### Documentation
- [ ] CHANGELOG.md updated
- [ ] Release notes written
- [ ] Migration guide created
- [ ] API docs updated
- [ ] Examples updated

### Code Markers
- [ ] Deprecation decorators added
- [ ] Runtime warnings added
- [ ] IDE warnings visible
- [ ] Tests still passing

### Internal Migration
- [ ] Internal usages: [X/Y migrated]
- [ ] Tests updated
- [ ] Documentation updated

### External Communication
- [ ] Announcement sent
- [ ] Migration guide published
- [ ] Support channels ready
- [ ] FAQ prepared

### Adoption Tracking
- [ ] Metrics in place
- [ ] Adoption rate: [X%]
- [ ] Blockers identified
```

### Gate
- [ ] Deprecation announced
- [ ] Warnings in place
- [ ] Documentation updated
- [ ] Migration guide available
- [ ] Internal code migrated (or plan exists)
- [ ] External users notified
- [ ] Sufficient time given (per timeline)

---

## Phase 4: REMOVE

**Goal**: Safely delete the deprecated code

### Actions

1. **Pre-removal verification** (T-0):

   Check adoption:
   ```bash
   # Verify deprecation warnings are logged
   # Check metrics for usage
   # Confirm migration targets met
   ```

   Criteria for removal:
   - [ ] Timeline completed
   - [ ] Migration adoption > 80% (internal)
   - [ ] No critical blockers
   - [ ] Stakeholders notified
   - [ ] Alternative is stable

2. **Create removal branch**:
   ```bash
   git checkout -b remove/deprecated-[feature-name]
   ```

3. **Read architecture doc** for affected layers

4. **Remove deprecated code**:

   Remove in order (following architecture):
   ```
   1. Tests for deprecated code
   2. Deprecated implementation
   3. Deprecated interfaces/types
   4. Documentation references
   5. Migration scripts (if no longer needed)
   ```

   For each file:
   ```bash
   # Remove the deprecated code
   # Remove deprecation warnings
   # Remove related tests
   # Update imports/dependencies

   # Run tests after each removal
   [test command from architecture doc]

   # Commit if successful
   git add .
   git commit -m "remove: [what was removed]"
   ```

5. **Update version**:

   Breaking change requires major version bump:
   ```
   Semantic Versioning:
   - Major version: Breaking changes (X.0.0)
   - Minor version: New features backward compatible (0.X.0)
   - Patch version: Bug fixes (0.0.X)
   ```

6. **Update documentation**:
   - [ ] Remove from API docs
   - [ ] Archive migration guide (keep for reference)
   - [ ] Update CHANGELOG
   - [ ] Update version compatibility matrix
   - [ ] Update examples

### Removal Checklist
```markdown
## Removal Progress

### Code Removed
- [ ] Deprecated implementation: [files]
- [ ] Deprecated tests: [files]
- [ ] Deprecated types/interfaces: [files]
- [ ] Documentation: [pages]

### Architecture Compliance (from doc)
- [ ] Layer boundaries still respected
- [ ] Dependencies flow correctly
- [ ] No broken imports
- [ ] Clean build

### Testing
- [ ] All tests pass
- [ ] No references to deprecated code
- [ ] Integration tests pass
- [ ] E2E tests pass

### Documentation
- [ ] API docs updated
- [ ] CHANGELOG updated
- [ ] Migration guide archived
- [ ] Version bumped: [X.Y.Z]

### Build & Release
- [ ] Clean build
- [ ] No warnings
- [ ] Ready for release
```

### Gate
- [ ] All deprecated code removed
- [ ] Tests pass
- [ ] Documentation updated
- [ ] Version bumped appropriately
- [ ] No broken dependencies

---

## Phase 5: VERIFY

**Goal**: Ensure nothing is broken post-removal

### Actions

1. **Full test suite** (command from architecture doc):
   ```bash
   # Run all tests
   flutter test              # Flutter
   flutter test --coverage

   go test ./...             # Go
   go test -cover ./...

   bun test                  # React/Remix
   bun test --coverage

   php artisan test          # Laravel
   php artisan test --coverage
   ```

2. **Integration testing**:
   - [ ] Critical user flows work
   - [ ] No regressions
   - [ ] Performance unchanged
   - [ ] Error handling works

3. **Build verification**:
   ```bash
   # Clean build test
   rm -rf node_modules && npm install && npm run build  # Node
   go clean && go build ./...                            # Go
   flutter clean && flutter build                        # Flutter
   composer install && php artisan optimize             # Laravel
   ```

4. **Dependency check**:
   ```bash
   # Check for broken imports
   # Verify all dependencies resolve
   # No circular dependencies introduced
   ```

5. **Monitor after release** (T+30):
   - [ ] Error rates normal
   - [ ] Performance metrics stable
   - [ ] No spike in support requests
   - [ ] User feedback positive/neutral

6. **Handle issues**:

   If problems arise:
   ```markdown
   Severity assessment:
   🔴 Critical - Rollback immediately
   🟠 High - Hotfix within 24h
   🟡 Medium - Fix in next patch
   🟢 Low - Document workaround
   ```

### Verification Report
```markdown
## Post-Removal Verification

### Architecture Compliance: [Pass/Fail]
- Reference: [architecture doc path]
- Structure: [Pass/Fail]
- Dependencies: [Pass/Fail]
- Patterns: [Pass/Fail]

### Testing: [Pass/Fail]
| Test Type | Status | Coverage |
|-----------|--------|----------|
| Unit | [Pass/Fail] | [X%] |
| Integration | [Pass/Fail] | [X%] |
| E2E | [Pass/Fail] | [X%] |

### Build: [Pass/Fail]
- Clean build: [Pass/Fail]
- No warnings: [Pass/Fail]
- Dependencies: [Pass/Fail]

### Monitoring (T+30): [Pass/Fail]
| Metric | Before | After | Status |
|--------|--------|-------|--------|
| Error rate | X% | Y% | [✓/✗] |
| Performance | X ms | Y ms | [✓/✗] |
| Support tickets | X | Y | [✓/✗] |

### Issues Found
- [Issue 1]: [Severity] - [Status]
- [Issue 2]: [Severity] - [Status]

### Recommendation: [Success/Rollback/Hotfix Needed]
```

### Gate
- [ ] All tests pass
- [ ] Build successful
- [ ] No critical issues
- [ ] Metrics stable
- [ ] Stakeholders satisfied

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

### Deprecation Timeline Templates

#### Internal API
```
Week 0:  Announce + document
Week 2:  Add warnings
Week 4:  Migrate internal code
Week 6:  Remove
Week 10: Monitor
```

#### Public API
```
Month 0: Announce in minor release
Month 1: Add warnings + migration guide
Month 3: Help users migrate
Month 6: Remove in major release
Month 7: Monitor
```

#### Critical Security Issue
```
Day 0: Announce + provide alternative
Day 1: Add strong warnings
Day 3: Remove in patch release
Day 7: Monitor closely
```

### Deprecation Notice Templates

#### Code Comment
```typescript
/**
 * @deprecated since v1.5.0, will be removed in v2.0.0
 * Use newFunction() instead.
 *
 * Migration:
 * ```
 * // Before
 * oldFunction(x, y)
 *
 * // After
 * newFunction({ x, y })
 * ```
 *
 * @see newFunction
 */
```

#### CHANGELOG Entry
```markdown
### Deprecated
- `oldFunction()` - Use `newFunction()` instead. Will be removed in v2.0.0.
  - Reason: Inconsistent API design
  - Migration guide: https://docs.example.com/migrate-to-v2
```

#### Release Notes
```markdown
## Deprecations

### `oldFeature` is now deprecated

**What**: The `oldFeature` API is deprecated.

**Why**: It doesn't align with our architecture patterns and causes confusion.

**When**: Will be removed in v2.0.0 (estimated: YYYY-MM-DD)

**Migration**: Use `newFeature` instead:

```javascript
// Before
import { oldFeature } from 'package';
oldFeature.doSomething();

// After
import { newFeature } from 'package';
newFeature.doSomething();
```

**Need help?** See the [migration guide](link) or contact support.
```

#### Email Template
```
Subject: Deprecation Notice: [Feature Name] in [Product Name]

Hi [User],

We're writing to inform you about an upcoming change to [Product Name].

What's changing:
[Feature/API name] is being deprecated and will be removed in [version/date].

Why:
[Brief explanation]

What you need to do:
1. Review your usage of [deprecated feature]
2. Follow our migration guide: [link]
3. Update your code before [date]

Need help?
- Migration guide: [link]
- Support: [email]
- Office hours: [schedule]

Timeline:
- Today: Deprecation announced
- [Date]: Warnings added
- [Date]: Feature removed

Thank you,
[Team Name]
```

### Phase Summary

| Phase | Duration | Key Actions |
|-------|----------|-------------|
| IDENTIFY | 1-2 days | Analyze impact, read arch doc |
| PLAN | 3-5 days | Timeline, migration guide, communication |
| MIGRATE | 30-90 days | Warnings, help users migrate |
| REMOVE | 1-2 days | Delete code, update docs |
| VERIFY | 7-30 days | Test, monitor, support |

### Deprecation Strategies

#### Soft Deprecation
**Use when:**
- Non-critical feature
- Time for gradual migration
- Backward compatibility important
- External users affected

**Approach:**
- Add warnings but keep functional
- Provide migration period
- Remove in future major version

#### Hard Deprecation
**Use when:**
- Security vulnerability
- Critical bug
- Technical debt removal
- Internal-only code

**Approach:**
- Breaking change in next major version
- Shorter timeline
- Force migration

### Communication Timeline

```
T-90: Announce
├── Changelog
├── Release notes
├── Documentation
└── Email (if external)

T-60: Warn
├── Add runtime warnings
├── IDE warnings
├── Migration guide live
└── Reminder emails

T-30: Support
├── Help users migrate
├── Office hours
├── Example PRs
└── FAQ updates

T-0: Remove
├── Delete code
├── Major version bump
├── Final announcement
└── Monitor

T+30: Monitor
├── Check metrics
├── Handle issues
├── Collect feedback
└── Document learnings
```

### Success Criteria

Deprecation is successful when:
1. All stakeholders notified in advance
2. Migration path is clear and documented
3. Sufficient time given for migration
4. Deprecated code cleanly removed
5. No regressions introduced
6. Metrics remain stable post-removal
7. Minimal support burden
8. Architecture doc patterns followed

---

## Anti-Patterns to Avoid

### Silent Deprecation
```
DON'T: Remove without announcement
DON'T: No warnings or migration guide
DO: Clear communication at every step
```

### Rushed Timeline
```
DON'T: Remove before users can migrate
DON'T: Skip migration period
DO: Give adequate time based on impact
```

### No Alternative
```
DON'T: Deprecate without replacement
DON'T: Force users into worse solution
DO: Provide better alternative first
```

### Poor Communication
```
DON'T: Assume users read release notes
DON'T: One-time announcement only
DO: Multi-channel, repeated communication
```

### Breaking Without Warning
```
DON'T: Remove in minor/patch version
DON'T: Surprise breaking changes
DO: Follow semantic versioning
DO: Breaking changes only in major versions
```

### Ignoring Feedback
```
DON'T: Ignore migration blockers
DON'T: Proceed despite user concerns
DO: Listen and adjust timeline if needed
```
