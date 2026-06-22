---
name: marketing-brand
description: Brand asset workflow with two modes — LOGO (produce a logo + brand identity specification: concepts, color palette, typography, guidelines) and VIDEO (plan video content end-to-end: strategy, script, storyboard, production spec, publishing). Use when user says "design logo", "create logo", "brand identity", "logo concept", "visual identity", "create video", "video content", "video script", "video strategy", "youtube content", "video plan".
args: "[MODE]"
---

# Brand Asset Workflow

One skill for visual + motion brand assets. Pick the mode that matches your deliverable.

## Pick your mode

| Situation | Mode | Jump to |
|-----------|------|---------|
| Logo + brand identity specification (concepts, colors, type, guidelines) | **LOGO** | [Mode LOGO](#mode-logo) |
| Video content plan (strategy, script, storyboard, production, publish) | **VIDEO** | [Mode VIDEO](#mode-video) |

- ❌ Writing blog / social / newsletter → use `/marketing-content`
- ❌ Full go-to-market plan (brand + content + video) → use `/marketing` command

---
---

# Mode LOGO

Produce a logo + brand identity **specification** that a designer can execute (or you can use as a direct prompt to a generative tool). Output is a brand guidelines doc, not finished art.

## When to use
- ✅ Brand new identity (no existing logo)
- ✅ Rebrand / refresh of an existing logo + guidelines
- ✅ Need a deliverable spec for a designer to execute
- ❌ Just need a quick icon variation → use a design tool directly
- ❌ Video-specific visuals → **Mode VIDEO**

## Workflow

```
DISCOVER → CONCEPT → DESIGN → REFINE → DELIVER
```

## Phase 1: DISCOVER (30 min)

### Discovery brief (skip what's known)

| Field | Example |
|-------|---------|
| Name + tagline | "Acme — DevOps for indie teams" |
| 3-5 personality adjectives | "modern, technical, irreverent, sharp, friendly" |
| Primary audience | "Solo / small-team backend engineers" |
| Industry | "Developer tools / SaaS" |
| Competitors (3-5) | + 1 line each on what their logo says |
| Style direction (pick 1-2) | minimal / wordmark / monogram / abstract mark / illustrative / mascot |
| What to AVOID | "no cliché cloud icons, no gradients on the mark" |
| Where it lives | favicon + GitHub avatar + landing hero + dark/light + print |
| Color hints | "must work in single-color print + on dark UI" |
| Budget for the brand | "MVP — logo + 1 palette + 2 fonts" vs "full system" |

### Gate
- [ ] Personality adjectives captured · Competitor scan done · Style direction narrowed to 1-2 · Avoid-list captured

## Phase 2: CONCEPT — propose 3 distinct directions

Same concept in 3 colors ≠ 3 concepts. Each concept must have:

```markdown
## Concept {N}: {short name}
**Direction:** {wordmark / monogram / abstract mark / etc.}
**Rationale:** Why this matches brand personality + audience. Cite 2-3 adjectives.
**Differentiation:** What competitor it does NOT look like, and why that matters.
**ASCII sketch** (rough — shape, not pixel-perfect)
**Inspiration:** 2-3 reference links
**Risks:** What could go wrong (e.g., "monogram unreadable below 24px")
```

**Variety rules:** different *form* (wordmark vs mark vs combo) · different *feel* (geometric vs hand-drawn vs typographic) · different *complexity*.

### Gate
- [ ] 3 concepts, each with rationale + differentiation + risk · **User selected ONE**

## Phase 3: DESIGN — flesh out the chosen concept

### 3.1 Logo construction
- **Lockup:** primary (wordmark / mark / combination / stacked), secondary, icon-only (favicon, avatar)
- **Geometry:** grid + proportions · **Clear space:** minimum · **Minimum size:** digital (e.g. 24px) + print (e.g. 8mm)

### 3.2 Color palette
Primary + secondary + neutrals. Every color in HEX, RGB, HSL, CMYK (print), WCAG AA contrast vs white + black (pass/fail), Tailwind token name.

| Token | HEX | RGB | HSL | Use |
|-------|-----|-----|-----|-----|
| `--brand-primary` | #0F172A | 15,23,42 | 222 47% 11% | logo, headlines |
| `--brand-accent` | #14B8A6 | 20,184,166 | 173 80% 40% | CTA, links |
| `--neutral-fg` | #1F2937 | 31,41,55 | 220 26% 14% | body text |
| `--neutral-bg` | #F8FAFC | 248,250,252 | 210 40% 98% | page bg |

### 3.3 Typography
1 display + 1 body font (or 1 font in 2 weights): family + fallback stack, weights, pairing rationale (1 line), license (open / Google Fonts / commercial).

### 3.4 Voice
3 voice attributes (e.g., "direct, witty, never corporate-speak") + 3 do / 3 don't examples.

### Gate
- [ ] All lockup variants specified · Palette has WCAG notes · Typography has rationale + license · Voice has do/don't

## Phase 4: REFINE

Test against real use (write down result for each):
- [ ] Favicon at 16×16 — still recognizable?
- [ ] On dark background — still works?
- [ ] Single-color print (black-only) — still readable?
- [ ] Next to 2-3 competitor logos — stands out?
- [ ] At 100% scale on hero — carries the page?

If >2 rounds of changes → consider re-concepting (Phase 2).

### Gate
- [ ] All 5 scenarios tested · User approved final version

## Phase 5: DELIVER — brand guidelines doc

### `brand-guidelines.md` skeleton
```markdown
# {Brand} Brand Guidelines
## Logo — lockups (SVG + PNG), clear space + min size, wrong uses
## Color — token table, usage rules, accessibility (contrast)
## Typography — stack, hierarchy (H1/H2/H3/body), web vs print
## Voice — attributes + sample headline / body / CTA copy
## Examples — 1 hero, 1 card, 1 button with the brand applied
```

### Asset checklist (hand to designer / dev)
- [ ] `logo-primary.svg` + `.png` (1x, 2x, 4x) · `logo-secondary` · `logo-mark`
- [ ] `favicon.ico` (16,32,48), `apple-touch-icon.png` (180×180), `og-image.png` (1200×630)
- [ ] Social avatars: 400×400 + cover per platform (Twitter 1500×500, LinkedIn 1128×191)
- [ ] Color tokens: `colors.css` + `tailwind.config.js` snippet · Brand guidelines `.md` / PDF

### Gate
- [ ] Guidelines doc written · Asset checklist exists · Developer-ready tokens (CSS / Tailwind) included

## Hard Rules (LOGO)
- **3 *distinct* concepts in Phase 2** — same concept in 3 colors = lazy.
- **WCAG AA contrast minimum** on text colors. **Mark must read at 16px** — if not, redesign.
- **No gradient on the primary mark** — gradients don't print, fax, or embroider well.
- **License-clean fonts only**.

---
---

# Mode VIDEO

Plan video content end-to-end: strategy, script, storyboard, production spec, publishing schedule.

## When to use
- ✅ Planning a video series or campaign (multi-video)
- ✅ Need a script + storyboard + production spec for a single video
- ✅ Repurposing existing long-form into shorts / clips
- ❌ Just need ideas, not a plan → use `/brainstorm`
- ❌ Writing a blog post or thread → use `/marketing-content`

## Workflow

```
STRATEGY → SCRIPT → STORYBOARD → PRODUCTION → PUBLISH
```

## Phase 1: STRATEGY

### Gather brief (skip what's known)

| Field | Example |
|-------|---------|
| Primary goal (pick 1) | brand awareness / tutorial / lead gen / community / thought leadership |
| Audience | "Senior backend engineers evaluating Postgres tooling" |
| Channels (pick ≤3) | YouTube long / Shorts / TikTok / Reels / LinkedIn / X / Twitch |
| Cadence | "1 long video / week + 3 shorts" |
| Series concept | "From-zero series: build a SaaS in 10 episodes" |
| Tone | "Casual, technical, no fluff" |
| Existing assets | brand kit URL, prior videos, channel stats |

### Output: 1-page strategy
```markdown
## Video Strategy: {brand}
- Goal / Audience / Channels (primary marked) / Cadence / Series (2-4, each theme + episode target) / Brand (voice, colors, logo lockup)
```

### Gate
- [ ] Goal + audience confirmed · Channels matched to where audience watches · ≥1 series concept

## Phase 2: SCRIPT

### Universal structure
```
HOOK (≤10 sec, ≤30 sec long-form): contrarian claim / surprising number / pain question / curiosity gap
INTRO (≤15 sec): what they'll get + why this person/channel
BODY: one idea per segment (≤90 sec long-form, ≤15 sec shorts); pattern interrupt every 30-45 sec
PAYOFF: the answer / demo / result
CTA (≤10 sec): one ask
```

### Hook examples (pick a type, write 3 variants)
| Type | Example |
|------|---------|
| Contrarian | "Everyone tells you to write tests first. Here's why I stopped." |
| Number | "I shipped 47 features last quarter with 1 engineer. Here's how." |
| Pain question | "Your DB is slow at 100k rows? That's a config issue, not a Postgres limit." |
| Curiosity gap | "There's a Go feature nobody uses but it solves your timeout bug." |

### Script length budget
| Format | Total | Hook | Body | CTA |
|--------|-------|------|------|-----|
| YouTube long | 8-15 min | 10-30 s | 7-13 min | 10-30 s |
| Short / Reel / TikTok | 30-60 s | ≤3 s | 25-50 s | ≤5 s |
| LinkedIn native | 1-3 min | ≤5 s | 50 s-2.5 min | ≤10 s |

### Gate
- [ ] Hook tested by reading frame 1 aloud · One idea per segment · Pattern interrupt every ≤45 sec (long-form) · CTA is one ask

## Phase 3: STORYBOARD

### Scene table (one row per cut)
| # | Time | Visual | Audio | Text overlay | Asset needed |
|---|------|--------|-------|--------------|--------------|
| 1 | 0:00-0:08 | Talking head, medium | Hook line | (none) | — |
| 2 | 0:08-0:25 | Screen recording: IDE | VO | "Step 1: install" | terminal recording |

### Visual rules (project-wide)
- Aspect ratio: 16:9 (YT long) / 9:16 (shorts, Reels, TikTok) / 1:1 (LinkedIn fallback)
- Captions ALWAYS burned in for shorts (most watch muted)
- Brand bug bottom-right (long-form) first 5 sec + last 10 sec · Max 2 fonts · Stick to brand palette

### Gate
- [ ] One row per cut · All assets listed/sourced · Captions plan for muted viewing · Aspect ratio matches channel

## Phase 4: PRODUCTION

### Tech spec per channel
| Channel | Resolution | FPS | Codec | Max length | Notes |
|---------|-----------|-----|-------|-----------|-------|
| YouTube long | 1080p / 4K | 30/60 | H.264 | 12 h | Chapters for >5 min |
| YouTube Shorts | 1080×1920 | 30/60 | H.264 | 60 s | Vertical |
| TikTok | 1080×1920 | 30/60 | H.264 | 10 min | Caption per scene |
| Instagram Reels | 1080×1920 | 30 | H.264 | 90 s | First frame = thumbnail |
| LinkedIn native | 1920×1080 / 1080×1080 | 30 | H.264 | 10 min | Captions burned in |
| X (Twitter) | 1280×720+ | 30/60 | H.264 | 2 min 20 s | Add caption file |

### Audio
- Voice: -3 dBFS peak, -16 LUFS integrated · Music bed: -20 dBFS under voice, royalty-cleared
- Cuts: trim every breath / um / "so" — tight pacing matters

### Pre-publish checklist
- [ ] Color graded · Audio normalized · Captions burned in (where required) + SRT for accessibility
- [ ] Thumbnail (3 variants for A/B if YouTube) · Title (≤60 chars + keyword) · Description with timestamps, CTAs, links

### Gate
- [ ] Tech spec matches channel · Thumbnail tested at small size · First 3 sec works without sound

## Phase 5: PUBLISH

### Per-channel adaptation
- **YouTube long:** publish + pin comment with timestamps + first-hour engagement push
- **Shorts:** 3-5x/week for algorithm; don't link in description (kills reach)
- **TikTok:** batches at 7 PM local; respond to first 10 comments within 1 hour
- **LinkedIn:** native upload (don't link YouTube); first hour of work day
- **X:** native video; thread = video + 3-5 text takeaways

### Cross-posting
Cut shorts from long-form (3-5 per long video) · convert key insight into LinkedIn carousel + X thread · embed in blog post.

### Tracking
- UTM tags on description links: `?utm_source=youtube&utm_medium=video&utm_campaign={series}`
- Watch: average view duration, retention curve (cliff = where to cut next), thumbnail CTR
- Iterate: kill formats with <30% retention after 3 attempts

### Gate
- [ ] Adapted per channel · UTMs applied · Tracking dashboard updated

## Hard Rules (VIDEO)
- **Hook decides everything** — if first 3 sec doesn't work, nothing after matters.
- **Captions for muted viewing** — most feed views are sound-off.
- **One ask in the CTA** — multiple CTAs = zero conversions.
- **Vertical for mobile-first channels** — never reupload 16:9 to TikTok / Shorts.
- **Kill what doesn't work after 3 attempts**.

---
---

## Related Skills

| When | Use |
|------|-----|
| Write content with the brand (blog / social / newsletter) | `/marketing-content` |
| Full marketing plan (brand + content + video) | `/marketing` command |
| Brainstorm video / brand topics | `/brainstorm` |
| Document brand guidelines as a doc | `/docs-sync` |

## Recommended Agents

| Mode / Phase | Agent | Purpose |
|--------------|-------|---------|
| LOGO discover / deliver | `@docs-writer` | Brand brief + guidelines doc |
| LOGO concept / design | `@clean-architect`, `@docs-writer` | System structure + spec docs |
| VIDEO strategy / script | `@docs-writer` | Strategy brief + tighten scripts |
| VIDEO storyboard | `@docs-writer` | Scene descriptions |
| VIDEO production | `@devops` | Tech specs + encoding |
