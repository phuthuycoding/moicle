---
name: sync-docs
description: Sync documentation workflow - reads codebase and docs folder to generate structured output docs with architecture, use cases, diagrams, and README index. Includes automated review loop. Use when user says "sync docs", "sync documentation", "generate docs", "update docs sync", "doc sync".
---

# Sync Docs Workflow

Automated workflow that reads codebase and existing docs to generate a complete, structured documentation output with architecture overview, use case diagrams, and a README index linking all sub-files.

## Workflow Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ 1. SCAN  │──▶│1.5 CONFIRM──▶│2. GENERATE──▶│ 3. REVIEW │──▶│4. COMPLETE│
└──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                    ▲              │
                                    │   Feedback   │
                                    └──────────────┘
                                  (loop until pass)
```

**Key**: Phase 1.5 CONFIRM asks user to choose between REFACTOR (full restructure) or UPDATE (keep structure, update & link only). Phase 3 REVIEW automatically loops back to Phase 2 GENERATE if issues are found.

---

## Phase 1: SCAN

**Goal**: Read and understand the entire codebase and existing docs

### Actions

1. **Identify project stack**:
   - Check `package.json`, `go.mod`, `pubspec.yaml`, `composer.json`, etc.
   - Determine primary language and framework

2. **Read existing documentation**:
   ```bash
   # Find all doc files
   find . -name "*.md" -not -path "*/node_modules/*" -not -path "*/vendor/*" -not -path "*/.dart_tool/*" | sort

   # Find existing docs folder
   ls -la docs/ 2>/dev/null
   ```

3. **Map codebase structure**:
   ```bash
   # Get directory tree (exclude build artifacts)
   tree -L 4 -I 'node_modules|vendor|dist|build|.dart_tool|.git' --dirsfirst
   ```

4. **Identify key components**:
   - Entry points (main files, routes, controllers)
   - Domain/business logic (services, use cases, models)
   - Data layer (repositories, database, APIs)
   - Configuration files
   - Test files

5. **Extract use cases** from the codebase:
   - Read route definitions, controller methods, service methods
   - Identify distinct user-facing features/flows
   - Group related functionality into use cases

6. **Read architecture files** (if exist):
   ```bash
   ls .claude/architecture/*.md 2>/dev/null
   ls ~/.claude/architecture/*.md 2>/dev/null
   ```

### Output
```markdown
## Scan Results

### Stack: [identified stack]
### Architecture: [identified pattern]

### Existing Docs
- [list of existing .md files and their status]

### Identified Use Cases
1. [Use Case 1] - [brief description]
2. [Use Case 2] - [brief description]
3. [Use Case N] - [brief description]

### Key Components
- Entry Points: [list]
- Business Logic: [list]
- Data Layer: [list]
- Config: [list]

### Docs Output Plan
- docs/README.md (index)
- docs/business.md (business overview - non-technical, business language only)
- docs/architecture.md
- docs/use-cases/[usecase-name].md (per use case)
- docs/diagrams/ (embedded in use case files via mermaid)
```

### Gate
- [ ] Codebase fully scanned
- [ ] Use cases identified
- [ ] Existing docs read
- [ ] Output plan defined

---

## Phase 1.5: CONFIRM

**Goal**: Ask the user how they want to handle docs before generating.

### Actions

1. **Present scan results** from Phase 1 to the user (current structure, identified use cases, docs plan)

2. **Ask the user**:
   ```
   How would you like to proceed with the docs?

   1. Refactor - Restructure docs into the standard template (docs/README.md, business.md, architecture.md, use-cases/) and relink everything
   2. Update & Link only - Keep the current docs structure as-is, only update content and fix linking

   (Choose 1 or 2)
   ```

3. **Based on the choice, set the mode for Phase 2**:
   - **REFACTOR mode (choice 1)**: Run Phase 2 GENERATE in full - create new structure, migrate useful content from old docs into the new template, remove/replace old doc files that are no longer needed
   - **UPDATE mode (choice 2)**: Run Phase 2 in update-only mode - preserve existing file/folder structure, only update content inside existing files to match current code, add/fix links between files, add mermaid diagrams where missing, DO NOT move/rename/delete existing files

### Gate
- [ ] User has chosen a mode (REFACTOR or UPDATE)
- [ ] Mode is recorded for Phase 2 to handle accordingly

---

## Phase 2: GENERATE

**Goal**: Generate all documentation files based on the selected mode from Phase 1.5

### Mode Selection

- **REFACTOR mode**: Create an entirely new docs structure following the template below. If old docs exist, migrate useful content into the new structure. May remove/replace old files.
- **UPDATE mode**: Preserve the existing file/folder structure. Only perform:
  - Update content in existing doc files to match current code
  - Add/fix links between files (relative links)
  - Add mermaid diagrams to existing files where missing
  - Add new files ONLY when there are undocumented use cases/features
  - DO NOT move, rename, or delete existing files
  - Ensure there is 1 index file (README.md or existing index) linking to all docs

> **The templates below apply fully to REFACTOR mode. For UPDATE mode, use them as content/format reference only — do NOT force the structure.**

### Output Structure

```
docs/
├── README.md                    # Index - links to all sub-files
├── business.md                  # Business overview - non-technical, business language only
├── architecture.md              # Architecture overview + system diagram
└── use-cases/
    ├── [use-case-1].md          # Use case doc + sequence diagram
    ├── [use-case-2].md          # Use case doc + sequence diagram
    └── [use-case-N].md          # Use case doc + sequence diagram
```

### 2.1 Generate `docs/README.md` (Index)

```markdown
# [Project Name] Documentation

> Auto-generated documentation synced from codebase.

## Overview

[1-2 paragraph project description derived from codebase]

## Table of Contents

### Business
- [Business Overview](./business.md) - Business overview, goals, target users

### Architecture
- [Architecture Overview](./architecture.md) - System architecture, layers, and patterns

### Use Cases
- [Use Case 1](./use-cases/use-case-1.md) - [brief description]
- [Use Case 2](./use-cases/use-case-2.md) - [brief description]
- [Use Case N](./use-cases/use-case-n.md) - [brief description]

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | [language] |
| Framework | [framework] |
| Database | [database] |
| Other | [key deps] |

## Quick Links

- [Business Overview](./business.md)
- [Architecture Diagram](./architecture.md#system-diagram)
- [Use Case Diagrams](./use-cases/)
```

### 2.2 Generate `docs/business.md` (Business Overview)

This file is written entirely in business language. NO code, NO class/function names, NO technical jargon. Target audience: stakeholders, product owners, business analysts - people who don't need to know the code.

```markdown
# [Project Name] - Business Overview

## What is this product?

[2-3 paragraphs describing the product in everyday language. Explain what problem it solves, for whom, and why it's needed.]

## Target Users

### [Role 1] - e.g., End User
- **Who**: [description]
- **Needs**: [what they need from the product]
- **What they do**: [key actions on the system]

### [Role 2] - e.g., Administrator
- **Who**: [description]
- **Needs**: [what they need]
- **What they do**: [key actions on the system]

## Core Business Processes

### [Process 1] - e.g., Registration and first-time use
[Describe each step from the user's perspective. No mention of API, database, or any technical details.]

1. [Step 1 - what the user does]
2. [Step 2 - how the system responds]
3. [Step N]

### [Process 2] - e.g., Placing an order
[Same approach - describe from a business perspective]

## Key Features

| Feature | Description | Used by |
|---------|-------------|---------|
| [Feature 1] | [explain in business language] | [role] |
| [Feature 2] | [explain] | [role] |

## Business Rules

Key rules the system follows:

1. **[Rule 1]**: [explain - e.g., "Every order must contain at least 1 product"]
2. **[Rule 2]**: [explain - e.g., "Users can only request a refund within 7 days"]
3. **[Rule N]**: [explain]

## Business Entity Relationships

[Describe key relationships in plain text, e.g.:]
- A **customer** can create multiple **orders**
- An **order** contains multiple **products**
- A **product** belongs to a **category**

## Value Flow

[Describe how the product creates value for each stakeholder:]

- **For [role 1]**: [value they receive]
- **For [role 2]**: [value they receive]
- **For the business**: [value the business receives]

## Business Glossary

| Term | Definition |
|------|-----------|
| [Term 1] | [explain in the product's context] |
| [Term 2] | [explain] |
```

**IMPORTANT rules for business.md**:
- DO NOT use words like: API, endpoint, database, repository, controller, service, model, schema, query, migration, route, middleware, component, module, class, function, method, interface, type
- NO code blocks whatsoever
- NO file path references or code file names
- Write as if explaining to someone who doesn't know programming
- Use the project's business domain language (e.g., "order" instead of "Order entity", "user" instead of "User model")
- Extract business rules from code logic (validation, conditions, constraints) and express them in business language

### 2.3 Generate `docs/architecture.md` (Technical)

```markdown
# Architecture Overview

## System Diagram

\`\`\`mermaid
graph TB
    [Generate actual system architecture diagram based on codebase layers]
\`\`\`

## Layers

### [Layer 1 Name]
- **Location**: `[directory path]`
- **Responsibility**: [what this layer does]
- **Key Files**: [list important files]

### [Layer 2 Name]
[same structure]

## Directory Structure

\`\`\`
[actual project directory tree with annotations]
\`\`\`

## Dependencies Between Layers

\`\`\`mermaid
graph LR
    [Show dependency direction between layers]
\`\`\`

## Design Patterns Used
- [Pattern 1]: [where and why]
- [Pattern 2]: [where and why]

## Data Flow

\`\`\`mermaid
flowchart LR
    [Show how data flows through the system]
\`\`\`
```

### 2.4 Generate Use Case Files (`docs/use-cases/[name].md`)

Generate ONE file per use case:

```markdown
# [Use Case Name]

## Overview

[Description of what this use case does from user perspective]

## Actors
- [Actor 1]: [role]
- [Actor 2]: [role]

## Flow

### Main Flow

1. [Step 1]
2. [Step 2]
3. [Step N]

### Sequence Diagram

\`\`\`mermaid
sequenceDiagram
    participant [Actor]
    participant [Component1]
    participant [Component2]
    participant [DataStore]

    [Actor]->>[Component1]: [action]
    [Component1]->>[Component2]: [action]
    [Component2]->>[DataStore]: [action]
    [DataStore]-->>[Component2]: [response]
    [Component2]-->>[Component1]: [response]
    [Component1]-->>[Actor]: [response]
\`\`\`

## Related Files

| File | Purpose |
|------|---------|
| `[path/to/file]` | [what it does in this use case] |
| `[path/to/file]` | [what it does in this use case] |

## Error Cases

| Error | Cause | Handling |
|-------|-------|----------|
| [Error 1] | [cause] | [how handled] |

## Notes

- [Any important implementation details]
```

### Generation Rules

1. **Diagrams MUST be mermaid** - embedded in markdown, not external files
2. **Every use case MUST have a sequence diagram** showing the actual flow through code
3. **Architecture MUST have a system diagram** showing layers/components
4. **README MUST link to every sub-file** with working relative links
5. **Use actual file paths** from codebase, not placeholders
6. **Use actual class/function names** from codebase
7. **If existing docs/ folder has content**, merge/update rather than overwrite useful information

### Gate
- [ ] docs/README.md generated with all links
- [ ] docs/business.md generated with pure business language (no technical terms)
- [ ] docs/architecture.md generated with system diagram
- [ ] All use case files generated with sequence diagrams
- [ ] All links are relative and correct
- [ ] All diagrams use mermaid syntax

---

## Phase 3: REVIEW (Automated Loop)

**Goal**: Verify generated docs are complete and accurate. Loop back to GENERATE if issues found.

### Review Checklist

Run through ALL checks below. If ANY check fails, fix and re-check.

#### 3.1 Structure Check
- [ ] `docs/README.md` exists and has all links
- [ ] `docs/business.md` exists
- [ ] `docs/architecture.md` exists with system diagram
- [ ] Each identified use case has its own file in `docs/use-cases/`
- [ ] All relative links in README.md point to existing files

#### 3.2 Business Check
- [ ] `docs/business.md` contains NO technical jargon (API, endpoint, database, repository, controller, service, model, schema, query, migration, route, middleware, component, module, class, function, method, interface, type)
- [ ] `docs/business.md` has NO code blocks
- [ ] `docs/business.md` does NOT reference file paths
- [ ] Business processes are fully described from the user's perspective
- [ ] Business rules are correctly extracted from code logic
- [ ] Glossary contains all domain-specific terms

#### 3.3 Content Check
- [ ] Architecture diagram reflects actual codebase layers
- [ ] Each use case sequence diagram matches actual code flow
- [ ] File paths referenced in docs actually exist in codebase
- [ ] Class/function names in diagrams match actual code
- [ ] No placeholder text like `[TODO]`, `[TBD]`, `[placeholder]`
- [ ] No template markers like `{name}`, `[name]` left unfilled

#### 3.4 Completeness Check
- [ ] Every major feature/flow has a use case doc
- [ ] Architecture doc covers all layers found in codebase
- [ ] README links to ALL generated sub-files
- [ ] Diagrams are syntactically valid mermaid

#### 3.5 Consistency Check
- [ ] Naming is consistent across all docs
- [ ] Same component uses same name everywhere
- [ ] File naming convention is consistent (kebab-case)

### Review Process

```
FOR each check in checklist:
  IF check FAILS:
    1. Note the issue
    2. Fix it (go back to relevant GENERATE sub-step)
    3. Re-run ALL checks from the beginning
  IF all checks PASS:
    Proceed to Phase 4
```

### Review Output
```markdown
## Review Results - Iteration [N]

### Checks Passed: [X/total]
### Checks Failed: [Y/total]

### Issues Found
1. [issue] → [fix applied]
2. [issue] → [fix applied]

### Status: [PASS - proceed to Phase 4 / FAIL - re-running Phase 2]
```

**IMPORTANT**: Do NOT proceed to Phase 4 until ALL checks pass. Maximum 3 iterations - if still failing after 3 loops, report remaining issues and proceed.

---

## Phase 4: COMPLETE

**Goal**: Final output and summary

### Actions

1. **List all generated files**:
   ```bash
   find docs/ -name "*.md" | sort
   ```

2. **Print summary**:
   ```markdown
   ## Sync Docs Complete

   ### Generated Files
   - docs/README.md (index)
   - docs/business.md (business overview)
   - docs/architecture.md
   - docs/use-cases/[list all]

   ### Use Cases Documented: [count]
   ### Diagrams Generated: [count]
   ### Review Iterations: [count]

   ### How to Use
   Start at `docs/README.md` - it links to everything.
   ```

3. **Read the docs/ folder one final time** to confirm everything is in order

### Gate
- [ ] All files verified
- [ ] Summary provided
- [ ] User informed of output location

---

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| SCAN | `@clean-architect` | Identify architecture patterns |
| SCAN | `@code-reviewer` | Understand code structure |
| GENERATE | `@docs-writer` | Write documentation |
| REVIEW | `@code-reviewer` | Verify accuracy |

---

## Quick Reference

### Trigger Phrases
- "sync docs"
- "sync documentation"
- "generate structured docs"
- "update docs sync"
- "create docs from codebase"
- "doc sync"

### Output Structure
```
docs/
├── README.md          # Index with links
├── business.md        # Business overview (non-technical)
├── architecture.md    # System overview + diagram
└── use-cases/
    └── *.md           # One per use case + sequence diagram
```

### Diagram Types Used
| Where | Diagram Type | Purpose |
|-------|-------------|---------|
| architecture.md | `graph TB` | System architecture |
| architecture.md | `graph LR` | Layer dependencies |
| architecture.md | `flowchart LR` | Data flow |
| use-cases/*.md | `sequenceDiagram` | Use case flow |

### Review Loop
```
Scan → Confirm (Refactor/Update?) → Generate → Review → Pass? → Complete
                                                      → Fail? → Fix → Review again (max 3x)
```

## Success Criteria

Documentation sync is complete when:
1. Business overview written entirely in business language, no technical jargon
2. All codebase features are documented as use cases
3. Architecture accurately reflects codebase
4. Every use case has a sequence diagram
5. README.md links to all sub-files
6. All file paths and names match actual codebase
7. All mermaid diagrams are valid
8. Review loop passed all checks
