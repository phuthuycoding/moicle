---
name: logo-design
description: Generate comprehensive logo design specifications, brand identity guidelines, and visual concepts. Use when user says "design logo", "create logo", "brand identity", "logo concept", "visual identity".
---

# Logo Design Skill

Structured workflow for creating professional logo design specifications, brand guidelines, and visual identity systems.

## Workflow Overview

```
DISCOVER → CONCEPT → DESIGN → REFINE → DELIVER
    │          │         │        │         │
    ▼          ▼         ▼        ▼         ▼
  Brand    3 Logo    Specify   Iterate   Final
  Audit    Concepts  Colors    Based on  Assets &
  & Brief           & Type    Feedback  Guidelines
```

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| DISCOVER | @docs-writer | Document brand brief |
| CONCEPT | @clean-architect | Structure design system |
| DESIGN | @docs-writer | Specification documents |
| DELIVER | @docs-writer | Brand guidelines document |

---

## Phase 1: DISCOVER

**Goal**: Understand the brand, audience, and design requirements.

### Actions

1. Gather brand information from the user:

```
BRAND DISCOVERY BRIEF
=====================

Project Name: [Name]
Tagline/Slogan: [If any]

1. BRAND PERSONALITY
   - What 3-5 adjectives describe your brand?
     Examples: Modern, Playful, Professional, Minimal, Bold, Elegant
   - Adjectives: [Answer]

2. TARGET AUDIENCE
   - Who is your primary audience?
   - Age range: [Answer]
   - Industry: [Answer]
   - Technical level: [Answer]

3. COMPETITORS
   - List 2-3 competitors or brands you admire:
     1. [Brand] - What you like: [Answer]
     2. [Brand] - What you like: [Answer]
     3. [Brand] - What you like: [Answer]

4. STYLE PREFERENCES
   - Preferred style? (select all that apply)
     [ ] Minimal / Clean
     [ ] Geometric / Abstract
     [ ] Illustrative / Detailed
     [ ] Typographic / Wordmark
     [ ] Mascot / Character
     [ ] Vintage / Retro
     [ ] Futuristic / Tech

5. COLOR PREFERENCES
   - Any must-have colors? [Answer]
   - Any colors to avoid? [Answer]
   - Mood: [Warm / Cool / Neutral / Vibrant]

6. USAGE CONTEXT
   - Where will the logo be used? (select all)
     [ ] Website / Web app
     [ ] Mobile app
     [ ] Social media
     [ ] Print materials
     [ ] Merchandise
     [ ] CLI / Terminal
     [ ] npm / Package registry

7. EXISTING ASSETS
   - Do you have existing brand elements? [Yes/No]
   - If yes, what to keep? [Answer]
```

2. Research competitor logos and industry visual trends
3. Document findings in brand brief

### Output

Brand Discovery Brief document saved to `docs/logo/brand-brief.md`

### Gate

- [ ] Brand personality defined (3-5 adjectives)
- [ ] Target audience identified
- [ ] Style preferences selected
- [ ] Color preferences noted
- [ ] Usage context listed

---

## Phase 2: CONCEPT

**Goal**: Generate 3 distinct logo concepts with rationale.

### Actions

1. Based on the Brand Brief, create 3 logo concepts
2. Each concept must include:
   - Concept name and theme
   - ASCII/text representation of the logo idea
   - Design rationale (why this works for the brand)
   - Mood and feel description

3. Present concepts using this template:

```
LOGO CONCEPTS
=============

CONCEPT A: [Name]
─────────────────
Theme: [Theme description]

Visual:
┌──────────────────────────────┐
│                              │
│   [ASCII representation]     │
│                              │
└──────────────────────────────┘

Description:
- Icon: [What the icon represents]
- Typography: [Font style suggestion]
- Style: [Geometric/Organic/Minimal/etc.]

Rationale:
[Why this concept fits the brand personality and audience]

Variants:
- Full logo (icon + text)
- Icon only (for small sizes)
- Text only (wordmark)

───────────────────────────────

CONCEPT B: [Name]
─────────────────
[Same structure as above]

───────────────────────────────

CONCEPT C: [Name]
─────────────────
[Same structure as above]

───────────────────────────────

RECOMMENDATION: Concept [X] because [reason]
```

4. Ask user to select preferred concept or provide feedback

### Output

3 concept presentations with rationale

### Gate

- [ ] 3 distinct concepts created
- [ ] Each has visual representation
- [ ] Each has clear rationale
- [ ] User selected preferred concept

### Feedback Loop

If user wants changes → Refine concepts → Re-present

---

## Phase 3: DESIGN

**Goal**: Develop the selected concept into a full design specification.

### Actions

1. Define the complete color palette:

```
COLOR PALETTE
=============

Primary Colors:
┌────────────────────────────────────────────────┐
│  [HEX]  [Name]      - [Usage description]     │
│  [HEX]  [Name]      - [Usage description]     │
└────────────────────────────────────────────────┘

Secondary Colors:
┌────────────────────────────────────────────────┐
│  [HEX]  [Name]      - [Usage description]     │
│  [HEX]  [Name]      - [Usage description]     │
└────────────────────────────────────────────────┘

Neutral Colors:
┌────────────────────────────────────────────────┐
│  [HEX]  [Name]      - [Usage description]     │
│  [HEX]  [Name]      - [Usage description]     │
│  [HEX]  [Name]      - [Usage description]     │
└────────────────────────────────────────────────┘

Gradients:
- Primary: [HEX] → [HEX] (direction)
- Accent:  [HEX] → [HEX] (direction)

Accessibility:
- Contrast ratio (text on bg): [ratio] (WCAG AA: 4.5:1)
- Contrast ratio (large text): [ratio] (WCAG AA: 3:1)
```

2. Define typography:

```
TYPOGRAPHY
==========

Logo Font:      [Font Name] [Weight]
Heading Font:   [Font Name] [Weight]
Body Font:      [Font Name] [Weight]
Code/Mono Font: [Font Name] [Weight]

Font Pairing Rationale: [Why these fonts work together]

Fallback Stack:
- Headings: [Font], [Fallback1], [Fallback2], sans-serif
- Body:     [Font], [Fallback1], [Fallback2], sans-serif
- Code:     [Font], [Fallback1], monospace
```

3. Define logo construction and spacing:

```
LOGO CONSTRUCTION
=================

Clear Space:
- Minimum clear space = [X] times the height of the icon
- No other elements should enter the clear space

Minimum Sizes:
- Digital: [X]px width minimum
- Print:  [X]mm width minimum

Logo Versions:
1. Full Logo (horizontal) - Icon + Wordmark
2. Full Logo (stacked)    - Icon above Wordmark
3. Icon Only              - For small spaces, favicons
4. Wordmark Only          - Text-only version

Color Versions:
1. Full color (on light background)
2. Full color (on dark background)
3. Single color (black)
4. Single color (white/reversed)
```

### Output

Complete design specification document

### Gate

- [ ] Color palette defined with hex values
- [ ] Typography selected with rationale
- [ ] Logo construction rules defined
- [ ] All logo versions specified
- [ ] Accessibility checked

---

## Phase 4: REFINE

**Goal**: Iterate on the design based on user feedback and create usage guidelines.

### Actions

1. Present complete design spec to user
2. Gather feedback and iterate
3. Create Do's and Don'ts:

```
LOGO USAGE GUIDELINES
=====================

DO:
✓ Use the logo with adequate clear space
✓ Use approved color versions only
✓ Maintain aspect ratio when scaling
✓ Use on backgrounds with sufficient contrast

DON'T:
✗ Stretch or distort the logo
✗ Change the logo colors
✗ Add effects (shadows, gradients, outlines)
✗ Place on busy/low-contrast backgrounds
✗ Rotate the logo
✗ Rearrange logo elements
```

4. Define social media sizing:

```
SOCIAL MEDIA SIZES
==================

| Platform   | Type           | Size (px)    |
|-----------|----------------|--------------|
| GitHub    | Avatar          | 500x500      |
| GitHub    | Social Preview  | 1280x640     |
| npm       | Package Icon    | 256x256      |
| X/Twitter | Profile         | 400x400      |
| X/Twitter | Header          | 1500x500     |
| LinkedIn  | Logo            | 300x300      |
| LinkedIn  | Banner          | 1128x191     |
| YouTube   | Profile         | 800x800      |
| YouTube   | Banner          | 2560x1440    |
| Instagram | Profile         | 320x320      |
| Favicon   | Browser Tab     | 32x32        |
| PWA Icon  | App Icon        | 512x512      |
```

### Output

Refined design with usage guidelines

### Gate

- [ ] User approved final design
- [ ] Do's and Don'ts documented
- [ ] Social media sizes specified
- [ ] All feedback addressed

### Feedback Loop

If user wants more changes → Return to relevant section → Re-present

---

## Phase 5: DELIVER

**Goal**: Create the final brand guidelines document and asset list.

### Actions

1. Compile everything into a Brand Guidelines document:

```
BRAND GUIDELINES
================

1. Brand Overview
   - Mission / Vision
   - Brand Personality
   - Tagline

2. Logo
   - Primary Logo
   - Logo Versions
   - Construction & Clear Space
   - Minimum Sizes
   - Do's and Don'ts

3. Color Palette
   - Primary Colors
   - Secondary Colors
   - Neutral Colors
   - Gradients
   - Accessibility Notes

4. Typography
   - Font Families
   - Font Pairing
   - Usage Hierarchy

5. Applications
   - Website
   - Social Media
   - Documentation
   - CLI / Terminal
   - Print Materials

6. Asset Checklist
   - [ ] logo-full.svg (vector)
   - [ ] logo-icon.svg (vector)
   - [ ] logo-full-light.png (1200x400)
   - [ ] logo-full-dark.png (1200x400)
   - [ ] logo-icon-512.png (512x512)
   - [ ] logo-icon-256.png (256x256)
   - [ ] favicon.ico (32x32)
   - [ ] social-preview.png (1280x640)
   - [ ] brand-guidelines.pdf
```

2. Save brand guidelines to `docs/logo/brand-guidelines.md`
3. Create implementation notes for developers:

```
DEVELOPER IMPLEMENTATION
========================

CSS Variables:
--color-primary:    [HEX];
--color-secondary:  [HEX];
--color-accent:     [HEX];
--color-bg-light:   [HEX];
--color-bg-dark:    [HEX];
--color-text:       [HEX];
--font-heading:     '[Font]', sans-serif;
--font-body:        '[Font]', sans-serif;
--font-mono:        '[Font]', monospace;

Tailwind Config (if applicable):
colors: {
  primary: '[HEX]',
  secondary: '[HEX]',
  accent: '[HEX]',
}
```

### Output

- `docs/logo/brand-brief.md` - Discovery brief
- `docs/logo/brand-guidelines.md` - Full brand guidelines
- `docs/logo/implementation.md` - Developer implementation notes

### Gate

- [ ] Brand guidelines document complete
- [ ] All assets listed with specifications
- [ ] Developer implementation notes created
- [ ] User approved final deliverables

---

## Quick Reference

### Phase Summary

| Phase | Goal | Key Output |
|-------|------|------------|
| DISCOVER | Understand the brand | Brand Brief |
| CONCEPT | Generate 3 ideas | 3 Logo Concepts |
| DESIGN | Full design spec | Color, Typography, Construction |
| REFINE | Iterate & guidelines | Usage Guidelines |
| DELIVER | Final documentation | Brand Guidelines |

### Success Criteria

- [ ] Brand discovery completed with user input
- [ ] 3 distinct logo concepts presented
- [ ] User selected and approved final concept
- [ ] Complete color palette with hex values
- [ ] Typography system defined
- [ ] Logo construction rules documented
- [ ] Usage Do's and Don'ts created
- [ ] Social media sizes specified
- [ ] Brand guidelines document delivered
- [ ] Developer implementation notes provided
