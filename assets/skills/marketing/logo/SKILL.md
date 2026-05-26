---
name: marketing-logo
description: Generate comprehensive logo design specifications, brand identity guidelines, and visual concepts. Use when user says "design logo", "create logo", "brand identity", "logo concept", "visual identity".
---

# Logo Design Skill

Produce a logo + brand identity **specification** that a designer can execute (or you can use as a direct prompt to a generative tool). Output is a brand guidelines doc, not finished art.

## When to use this skill

- ✅ Brand new identity (no existing logo)
- ✅ Rebrand / refresh of an existing logo + guidelines
- ✅ Need a deliverable spec for a designer to execute
- ❌ Just need a quick icon variation → use a design tool directly
- ❌ Full marketing plan (logo + content + video) → use `/marketing`
- ❌ Video-specific visuals → use `/marketing:video`

---

## Workflow

```
DISCOVER → CONCEPT → DESIGN → REFINE → DELIVER
```

---

## Phase 1: DISCOVER (30 min)

**Goal:** capture brand intent before sketching.

### Discovery brief

Ask the user (skip what's known):

| Field | Example |
|-------|---------|
| Name + tagline | "Acme — DevOps for indie teams" |
| 3-5 personality adjectives | "modern, technical, irreverent, sharp, friendly" |
| Primary audience | "Solo / small-team backend engineers" |
| Industry | "Developer tools / SaaS" |
| Competitors (3-5) | + 1 line each on what their logo says about them |
| Style direction (pick 1-2) | minimal / wordmark / monogram / abstract mark / illustrative / mascot |
| What to AVOID | "no cliché cloud icons, no gradients on the mark" |
| Where it lives | favicon + GitHub avatar + landing hero + dark / light themes + print |
| Color hints | "must work in single-color print + on dark UI" |
| Budget for the brand | "MVP — logo + 1 palette + 2 fonts" vs "full system" |

### Gate
- [ ] Personality adjectives captured (forces concept differentiation)
- [ ] Competitor scan done (don't accidentally copy)
- [ ] Style direction narrowed to 1-2
- [ ] Avoid-list captured

---

## Phase 2: CONCEPT — propose 3 directions

**Goal:** present 3 *distinct* concepts. Same concept in 3 colors ≠ 3 concepts.

Each concept must have:

```markdown
## Concept {N}: {short name}

**Direction:** {wordmark / monogram / abstract mark / etc.}
**Rationale:** Why this matches the brand personality + audience. Cite 2-3 adjectives.
**Differentiation:** What competitor it does NOT look like, and why that matters.
**ASCII sketch** (rough — describes shape, not pixel-perfect):
```
   ___________
  | A C M E   |
  |___________|
```
**Inspiration:** 2-3 reference links (existing logos, styles)
**Risks:** What could go wrong (e.g., "monogram unreadable below 24px")
```

### Concept variety rules
- Different *form* (wordmark vs mark vs combination)
- Different *feel* (geometric vs hand-drawn vs typographic)
- Different *complexity* (minimal vs detailed)

### Gate
- [ ] 3 concepts presented
- [ ] Each has rationale + differentiation + risk
- [ ] **User selected ONE** (or asked for hybrid — repeat phase)

---

## Phase 3: DESIGN — flesh out the chosen concept

**Goal:** produce specifications a designer can build.

### 3.1 Logo construction

```markdown
### Logo: {name}

**Lockup**
- Primary: {wordmark / mark / mark + wordmark side-by-side / stacked}
- Secondary (when primary doesn't fit): {variant}
- Icon-only (favicon, avatar): {variant}

**Geometry**
- Grid: {e.g., "8-unit grid, mark fits in 8x8 square"}
- Proportions: {e.g., "wordmark cap-height = 5 units; mark = 8 units; gap = 2 units"}

**Clear space**
- Minimum: {e.g., "1 cap-height on all sides"}

**Minimum size**
- Digital: {e.g., "24px height"}
- Print: {e.g., "8mm height"}
```

### 3.2 Color palette

Pick a primary + secondary + neutrals. Provide every color in:
- HEX, RGB, HSL
- CMYK (for print)
- WCAG AA contrast against white and against black (note pass / fail)
- Tailwind variable name (if relevant)

```markdown
| Token | HEX | RGB | HSL | Use |
|-------|-----|-----|-----|-----|
| `--brand-primary`   | #0F172A | 15,23,42  | 222 47% 11% | logo, headlines |
| `--brand-accent`    | #14B8A6 | 20,184,166 | 173 80% 40% | CTA, links |
| `--neutral-fg`      | #1F2937 | 31,41,55  | 220 26% 14% | body text |
| `--neutral-bg`      | #F8FAFC | 248,250,252 | 210 40% 98% | page bg |
```

### 3.3 Typography

Pick 1 display + 1 body font (or 1 font in 2 weights). Note:
- Family + fallback stack
- Weights used (display, body, light)
- Pairing rationale (1 line)
- License (open / Google Fonts / commercial)

### 3.4 Voice
- 3 voice attributes (e.g., "direct, witty, never corporate-speak")
- 3 do / 3 don't examples (1 line each)

### Gate
- [ ] All lockup variants specified
- [ ] Palette has WCAG contrast notes
- [ ] Typography choice has rationale + license
- [ ] Voice has do/don't examples

---

## Phase 4: REFINE

**Goal:** test the design against real use, iterate.

### Test scenarios (write down result for each)
- [ ] Favicon at 16×16 — still recognizable?
- [ ] On dark background — does it still work?
- [ ] Single-color print (black-only fax test) — still readable?
- [ ] Next to 2-3 competitor logos — does it stand out?
- [ ] At 100% scale on hero — does it carry the page?

### Feedback loop
- Present to user with each scenario
- Capture changes requested
- If >2 rounds of changes → consider re-concepting (Phase 2)

### Gate
- [ ] All 5 scenarios tested
- [ ] User approved final version

---

## Phase 5: DELIVER — brand guidelines doc

**Goal:** ship a single doc + asset list a designer / dev can use.

### `brand-guidelines.md` skeleton

```markdown
# {Brand} Brand Guidelines

## Logo
- {Primary, secondary, icon lockups as files: SVG + PNG}
- Clear space + min size rules
- Wrong uses (with examples: don't recolor, don't squish, don't add effects)

## Color
- Token table from Phase 3.2
- Usage rules (when primary vs accent)
- Accessibility (contrast notes)

## Typography
- Stack from Phase 3.3
- Hierarchy: H1/H2/H3/body sizes
- Web vs print

## Voice
- From Phase 3.4
- Sample headline + body + CTA copy

## Examples
- 1 hero, 1 card, 1 button shown with the brand applied
```

### Asset checklist (what to hand to designer / dev)

- [ ] `logo-primary.svg` + `logo-primary.png` (1x, 2x, 4x)
- [ ] `logo-secondary.svg` + `.png`
- [ ] `logo-mark.svg` + `.png`
- [ ] `favicon.ico` (16, 32, 48), `apple-touch-icon.png` (180×180), `og-image.png` (1200×630)
- [ ] Social avatars: square 400×400 + cover per platform (Twitter 1500×500, LinkedIn 1128×191, etc.)
- [ ] Color tokens: `colors.css` (CSS variables) + `tailwind.config.js` snippet (if Tailwind)
- [ ] Brand guidelines PDF or `.md`

### Gate
- [ ] Guidelines doc written
- [ ] Asset checklist exists (even if generation is by a designer)
- [ ] Developer-ready tokens included (CSS / Tailwind)

---

## Hard Rules

- **3 *distinct* concepts in Phase 2** — same concept in 3 colors = lazy
- **WCAG AA contrast minimum** on text colors
- **Mark must read at 16px** — if it doesn't, redesign, don't compromise
- **No gradient on the primary mark** — gradients don't print, don't fax, don't embroider well
- **License-clean fonts only** — no "found on the internet" type

---

## Related Skills

| When | Use |
|------|-----|
| Full marketing plan (logo + content + video) | `/marketing` |
| Write content with the brand | `/marketing:content` |
| Create video with the brand | `/marketing:video` |
| Document brand guidelines as a doc | `/docs:write` |

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| DISCOVER | `@docs-writer` | Capture brand brief |
| CONCEPT | `@clean-architect` | Structure the system |
| DESIGN | `@docs-writer` | Spec documents |
| DELIVER | `@docs-writer` | Brand guidelines doc |
