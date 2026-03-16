---
name: sync-docs
description: Sync documentation workflow - reads codebase and docs folder to generate structured output docs with architecture, use cases, diagrams, and README index. Includes automated review loop. Use when user says "sync docs", "sync documentation", "generate docs", "update docs sync", "doc sync".
---

# Sync Docs Workflow

Automated workflow that reads codebase and existing docs to generate a complete, structured documentation output with architecture overview, use case diagrams, and a README index linking all sub-files.

## Workflow Overview

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ 1. SCAN  │──▶│2. GENERATE──▶│ 3. REVIEW │──▶│4. COMPLETE│
└──────────┘   └──────────┘   └──────────┘   └──────────┘
                     ▲              │
                     │   Feedback   │
                     └──────────────┘
                   (loop until pass)
```

**Key**: Phase 3 REVIEW automatically loops back to Phase 2 GENERATE if issues are found. The loop continues until all checks pass.

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
- docs/business.md (business overview - ngôn ngữ nghiệp vụ, không technical)
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

## Phase 2: GENERATE

**Goal**: Generate all documentation files with proper structure

### Output Structure

```
docs/
├── README.md                    # Index - links to all sub-files
├── business.md                  # Business overview - ngôn ngữ nghiệp vụ, không technical
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
- [Business Overview](./business.md) - Tổng quan nghiệp vụ, mục tiêu, đối tượng sử dụng

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

File này viết hoàn toàn bằng ngôn ngữ nghiệp vụ. KHÔNG chứa code, KHÔNG chứa tên class/function, KHÔNG chứa thuật ngữ technical. Đối tượng đọc là stakeholder, product owner, business analyst - những người không cần biết code.

```markdown
# [Project Name] - Tổng Quan Nghiệp Vụ

## Sản phẩm là gì?

[2-3 đoạn mô tả sản phẩm bằng ngôn ngữ thường ngày. Giải thích sản phẩm giải quyết vấn đề gì, cho ai, tại sao cần nó.]

## Đối tượng sử dụng

### [Vai trò 1] - ví dụ: Người dùng cuối
- **Là ai**: [mô tả]
- **Nhu cầu**: [họ cần gì từ sản phẩm]
- **Họ làm gì trên hệ thống**: [các hành động chính]

### [Vai trò 2] - ví dụ: Quản trị viên
- **Là ai**: [mô tả]
- **Nhu cầu**: [họ cần gì]
- **Họ làm gì trên hệ thống**: [các hành động chính]

## Quy trình nghiệp vụ chính

### [Quy trình 1] - ví dụ: Đăng ký và sử dụng lần đầu
[Mô tả từng bước quy trình từ góc nhìn người dùng. Không đề cập API, database hay bất kỳ chi tiết kỹ thuật nào.]

1. [Bước 1 - người dùng làm gì]
2. [Bước 2 - hệ thống phản hồi gì]
3. [Bước N]

### [Quy trình 2] - ví dụ: Đặt hàng
[Tương tự - mô tả từ góc nhìn nghiệp vụ]

## Các tính năng chính

| Tính năng | Mô tả | Ai sử dụng |
|-----------|--------|-------------|
| [Tính năng 1] | [giải thích bằng ngôn ngữ nghiệp vụ] | [vai trò] |
| [Tính năng 2] | [giải thích] | [vai trò] |

## Quy tắc nghiệp vụ

Các quy tắc quan trọng mà hệ thống tuân theo:

1. **[Quy tắc 1]**: [giải thích - ví dụ: "Mỗi đơn hàng phải có ít nhất 1 sản phẩm"]
2. **[Quy tắc 2]**: [giải thích - ví dụ: "Người dùng chỉ được hoàn trả trong vòng 7 ngày"]
3. **[Quy tắc N]**: [giải thích]

## Mối quan hệ giữa các đối tượng nghiệp vụ

[Mô tả bằng text các mối quan hệ chính, ví dụ:]
- Một **khách hàng** có thể tạo nhiều **đơn hàng**
- Một **đơn hàng** chứa nhiều **sản phẩm**
- Một **sản phẩm** thuộc về một **danh mục**

## Luồng giá trị (Value Flow)

[Mô tả cách sản phẩm tạo ra giá trị cho từng đối tượng:]

- **Đối với [vai trò 1]**: [giá trị họ nhận được]
- **Đối với [vai trò 2]**: [giá trị họ nhận được]
- **Đối với doanh nghiệp**: [giá trị business nhận được]

## Thuật ngữ nghiệp vụ (Glossary)

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| [Thuật ngữ 1] | [giải thích trong ngữ cảnh sản phẩm] |
| [Thuật ngữ 2] | [giải thích] |
```

**QUAN TRỌNG khi viết business.md**:
- KHÔNG dùng từ: API, endpoint, database, repository, controller, service, model, schema, query, migration, route, middleware, component, module, class, function, method, interface, type
- KHÔNG có code block nào
- KHÔNG reference file path hay tên file code
- Viết như đang giải thích cho người không biết lập trình
- Dùng ngôn ngữ business domain của project (ví dụ: "đơn hàng" thay vì "Order entity", "người dùng" thay vì "User model")
- Extract business rules từ code logic (validation, conditions, constraints) và diễn đạt bằng ngôn ngữ nghiệp vụ

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
- [ ] `docs/business.md` chứa KHÔNG có thuật ngữ technical (API, endpoint, database, repository, controller, service, model, schema, query, migration, route, middleware, component, module, class, function, method, interface, type)
- [ ] `docs/business.md` KHÔNG có code block nào
- [ ] `docs/business.md` KHÔNG reference file path
- [ ] Quy trình nghiệp vụ được mô tả đầy đủ từ góc nhìn người dùng
- [ ] Quy tắc nghiệp vụ được extract đúng từ logic trong code
- [ ] Glossary có đầy đủ thuật ngữ domain

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
Generate → Review → Pass? → Complete
                  → Fail? → Fix → Review again (max 3x)
```

## Success Criteria

Documentation sync is complete when:
1. Business overview viết hoàn toàn bằng ngôn ngữ nghiệp vụ, không technical
2. All codebase features are documented as use cases
3. Architecture accurately reflects codebase
4. Every use case has a sequence diagram
5. README.md links to all sub-files
6. All file paths and names match actual codebase
7. All mermaid diagrams are valid
8. Review loop passed all checks
