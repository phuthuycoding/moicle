---
name: documentation
description: "Generate project documentation including README, API references, architecture guides, and contributing guides by scanning the codebase and architecture references. Use when documenting, writing docs, generating documentation, or when user says 'document', 'generate docs', 'write docs', 'create documentation', 'update docs'."
user-invocable: true
triggers:
  - document
  - generate docs
  - write docs
  - create documentation
  - update docs
  - documenting
  - writing docs
---

# Documentation Workflow

Scan a codebase against its architecture references, then generate accurate, complete project documentation (README, API, Architecture, Contributing guides).

## IMPORTANT: Read Architecture First

**Before writing documentation, read the appropriate architecture reference:**

- Global: `~/.claude/architecture/` (clean-architecture.md, flutter-mobile.md, react-frontend.md, go-backend.md, laravel-backend.md, remix-fullstack.md, monorepo.md)
- Project-specific: `.claude/architecture/` (overrides global if present)

**Documentation must accurately reflect the architecture and patterns used in the codebase.**

## Workflow

```
SCAN → ANALYZE → GENERATE → REVIEW → (feedback loop back to GENERATE)
```

---

## Phase 1: SCAN

**Goal**: Identify what documentation exists and what's missing.

1. Detect project stack and read the corresponding architecture doc
2. Scan codebase structure:
   ```bash
   tree -L 3 -I 'node_modules|vendor|dist|build'
   find . -name "*.md" -o -name "README*"
   ```
3. Identify documentation gaps: README, API docs, architecture docs, setup guides, developer guides, database schema, configuration reference, deployment guides

### Gate
- [ ] Architecture doc read
- [ ] Codebase structure understood
- [ ] Documentation gaps identified with priorities

---

## Phase 2: ANALYZE

**Goal**: Plan content and outlines for each document.

1. Re-read architecture doc for documentation standards
2. For each planned document, define: purpose, audience, content outline, source files to reference
3. Ensure outlines align with architecture doc patterns

### Gate
- [ ] Each document has clear purpose and audience
- [ ] Content outlines complete
- [ ] Source information identified

---

## Phase 3: GENERATE

**Goal**: Write complete, accurate documentation.

1. Read architecture doc for patterns and conventions
2. Use actual code examples from codebase — not invented placeholders
3. Follow stack-specific commands from architecture doc
4. For each document type, include the essentials:

   **README**: Project overview, tech stack, quick start, installation, project structure (from architecture doc), usage examples, configuration, development commands, architecture summary, contributing basics

   **API docs**: Base URL, authentication, all endpoints with request/response schemas, error codes, rate limiting, usage examples

   **Architecture docs**: System overview with diagrams (Mermaid), layer structure from architecture doc, data flow, design patterns, database schema, testing strategy, deployment

   **Contributing guide**: Prerequisites, setup, architecture reference, development workflow, coding standards, commit conventions, PR process

### Gate
- [ ] All planned documents generated
- [ ] Code examples are accurate and from actual codebase
- [ ] All paths, commands, and links are correct
- [ ] Formatting consistent

---

## Phase 4: REVIEW

**Goal**: Verify documentation accuracy and completeness.

1. **Architecture compliance**: Documentation reflects actual architecture, patterns match code, directory structures match
2. **Accuracy**: All commands work, code examples compile/run, file paths exist, links resolve
3. **Completeness**: All sections filled, no TODO markers left, all endpoints/features documented
4. **Quality**: Clear, concise, appropriate for audience, consistent formatting

### Feedback Loop
If issues found → return to GENERATE → fix issues → re-review
