---
name: docs-content
description: Create content writing strategy including blog posts, social media, newsletters, and SEO content plans. Use when user says "write content", "content strategy", "blog post", "social media content", "content plan", "seo content", "newsletter".
---

# Content Writer

Workflow for creating content strategy: audience research, content pillars, SEO blog posts, social media plans, newsletters.

## When to use this skill

- ✅ Building a content strategy from scratch (pillars, calendar, channels)
- ✅ Writing one specific piece (blog post, newsletter, social thread)
- ✅ Repurposing one piece into multi-channel content
- ❌ Writing API / project documentation → use `/docs:write` or `/docs:sync`
- ❌ Writing release notes / changelog → use git history + manual
- ❌ Designing a video → use `/docs:video`

---

## Workflow

```
RESEARCH → PLAN → WRITE → OPTIMIZE → DISTRIBUTE
```

---

## Phase 1: RESEARCH

**Goal:** understand audience, competitors, and SEO landscape.

### Gather brief
Ask the user for (skip what's already known):

| Field | Example |
|-------|---------|
| Brand / Product | "Acme — DevOps platform for indie teams" |
| Voice / Tone | "Casual but technical, no marketing fluff" |
| Primary audience | "Solo / small-team DevOps engineers" |
| Pain points | "Too many tools, none integrate well" |
| Goals (pick ≤2) | SEO traffic, lead gen, brand awareness, education, community, thought leadership |
| Current channels | Blog / X / LinkedIn / Dev.to / YouTube / Newsletter / Discord |
| Competitors | 3–5 names + what they do well |

### Audience & SEO research
- **Search intent** for the topic (informational / navigational / transactional / commercial)
- **Top 10 SERP** results for 3–5 target keywords — what content ranks?
- **Gaps** competitors miss (more depth, better examples, fresher data)
- **Keyword set** — primary + 2–5 long-tails per piece

### Gate
- [ ] Brief captured (skip fields already covered in conversation)
- [ ] Target keywords with search intent identified
- [ ] Competitor gap identified

---

## Phase 2: PLAN

**Goal:** define content pillars + calendar.

### Content pillars
Pick 3–5 themes that ladder up to the brand's positioning. Each pillar gets a mix of formats.

| Pillar | Why it matters to audience | Formats |
|--------|---------------------------|---------|
| {pillar 1} | {pain → outcome} | blog, social, newsletter |
| {pillar 2} | ... | ... |

### Calendar template
Plan 4–6 weeks ahead. Use a consistent cadence.

| Week | Blog (long-form) | Social (short-form) | Newsletter |
|------|------------------|---------------------|------------|
| W1 | {title} | 3 posts (1 educational, 1 hot take, 1 personal) | {topic} |
| W2 | ... | ... | ... |

### Content mix rule (per channel)
- **80/20:** 80% value (educate / entertain), 20% promote
- **Don't post when you have nothing to say** — skip a slot rather than post filler

### Gate
- [ ] 3–5 pillars defined with audience rationale
- [ ] Calendar drafted for ≥4 weeks
- [ ] Channels matched to audience habits

---

## Phase 3: WRITE

**Goal:** draft the actual content. One format at a time.

### Blog post structure (long-form, SEO)

```
TITLE (≤60 chars, includes primary keyword)
META DESCRIPTION (≤155 chars, includes primary keyword + CTA)

H1 (matches title or close variant)

HOOK (2–3 sentences: the problem the reader has)

TL;DR (3 bullets: the answer up front)

H2: Problem context — why this matters now
H2: The solution — your main argument / approach
   H3: Step 1 / Aspect 1
   H3: Step 2
   H3: Step 3
H2: Common pitfalls — what NOT to do
H2: Real example — actual code / screenshot / case
H2: Next steps — what to do today

CTA (1 line: try the product / subscribe / share)
```

Target length: 1200–2500 words for SEO; 500–1000 for opinion pieces.

### Social thread (X / LinkedIn)

```
HOOK (1–2 lines — must work alone in the feed)
↓
3–7 posts each ≤280 chars
- Each post stands alone if shared
- One idea per post
- Use line breaks
↓
CTA (link to blog / signup)
```

### Newsletter

```
SUBJECT (≤50 chars, curiosity > clickbait)
PREVIEW TEXT (≤90 chars, complements subject)

GREETING (personal, 1–2 lines)

MAIN STORY (1 idea, 200–400 words)

LINKS (3–5 curated, with 1-line why-it-matters)

CTA (one ask only)

SIGNATURE
```

### Writing rules
- **One idea per paragraph** (≤4 lines)
- **Active voice** ("the API returns" not "is returned by the API")
- **Concrete > abstract** (numbers, code, screenshots, names)
- **Cut filler:** "in order to" → "to", "due to the fact that" → "because", "very important" → "critical"
- **Read aloud** before publishing — if you stumble, rewrite

### Gate
- [ ] Draft matches the format's structure
- [ ] Primary keyword in title + H1 + first 100 words (blog)
- [ ] Read aloud — no stumbles
- [ ] At least 1 concrete example (number, code, screenshot, name)

---

## Phase 4: OPTIMIZE

**Goal:** make the content perform.

### Combined checklist (SEO + quality)
- [ ] Title ≤60 chars, includes primary keyword
- [ ] Meta description ≤155 chars
- [ ] H1 matches search intent
- [ ] H2/H3 use related keywords naturally
- [ ] Alt text on all images
- [ ] Internal links to ≥2 related posts
- [ ] External links to ≥1 authoritative source per major claim
- [ ] No keyword stuffing (read naturally)
- [ ] Mobile-friendly: short paragraphs, clear hierarchy
- [ ] Reading level appropriate for audience (Hemingway grade ≤10 for general)
- [ ] No typos (run a checker)

### Gate
- [ ] All checklist items pass (or explicit waiver)

---

## Phase 5: DISTRIBUTE

**Goal:** get the content in front of the right people.

### Per-channel adaptation

| Channel | Adaptation |
|---------|------------|
| Blog | Full piece, optimized for search |
| X | Thread of 3–7 posts pulling key insights + link to blog |
| LinkedIn | 1 long-form post (200–500 words), no link in body (link in comments) |
| Dev.to / Hashnode | Republish blog with canonical link to original |
| Reddit | Comment in relevant thread first, then share post only if community allows |
| Newsletter | Featured story or short blurb + link |
| YouTube Shorts / TikTok | 30–60 sec extract of key insight |

### Tracking
- UTM tags per channel: `?utm_source=X&utm_medium=social&utm_campaign={pillar}`
- Track per piece: views, time-on-page, scroll depth, conversions
- Iterate: double down on what works, kill what doesn't after 3 attempts

### Gate
- [ ] Adapted for each chosen channel
- [ ] UTM tags applied
- [ ] Tracking in place

---

## Final Report

```markdown
## Content Plan: {brand / campaign}

### Strategy
- Pillars: {list}
- Audience: {one line}
- Goal: {primary}

### Calendar (next 4 weeks)
{table}

### Pieces Drafted
| Title | Format | Status | Channel |
|-------|--------|--------|---------|
| ... | blog | published | site + X + LinkedIn |

### Metrics to Watch
- {KPI 1, baseline → target}
- {KPI 2}
```

---

## Hard Rules

- **One idea per piece** — if you have two, write two pieces
- **No filler** — every paragraph earns its place
- **No keyword stuffing** — write for humans first, search engines second
- **Skip a slot rather than post filler**
- **Iterate based on data** — kill what doesn't work after 3 attempts

---

## Related Skills

| When | Use |
|------|-----|
| Building brand identity (logo + colors) | `/docs:logo` |
| Creating video scripts / storyboards | `/docs:video` |
| Building a full marketing plan | `/marketing` (combines all three) |
| Writing project documentation | `/docs:write` |

---

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| RESEARCH | `@docs-writer` | Document research findings |
| PLAN | `@clean-architect` | Structure pillars and calendar |
| WRITE | `@docs-writer` | Draft pieces |
| OPTIMIZE | `@security-audit` | Check for sensitive content / claims |
| DISTRIBUTE | `@docs-writer` | Channel adaptations |
