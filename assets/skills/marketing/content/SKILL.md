---
name: marketing-content
description: Content writing workflow with two modes — STRATEGY (audience research, content pillars, multi-channel calendar, blog/social/newsletter) and POST (write one evergreen blog post optimized for Search AND AI tools — answer-first, intent-classified, overlap-audited). Use when user says "write content", "content strategy", "content plan", "social media content", "newsletter", "blog post", "write seo blog", "seo blog", "evergreen post", "compare post", "glossary post", "blog for AI to recommend", "search + ai".
args: "[MODE]"
---

# Content Writing Workflow

One skill, two modes: build a multi-channel content strategy, or write one evergreen post really well.

## Pick your mode

| Situation | Mode | Jump to |
|-----------|------|---------|
| Building a content strategy (pillars, calendar, multi-channel) | **STRATEGY** | [Mode STRATEGY](#mode-strategy) |
| Writing ONE evergreen blog post optimized for Search + AI | **POST** | [Mode POST](#mode-post) |

- ❌ Writing API / project documentation → use `/docs-sync`
- ❌ Designing a logo or video → use `/marketing-brand`
- ❌ Full go-to-market plan (brand + content) → use `/marketing` command

---
---

# Mode STRATEGY

Create content strategy: audience research, content pillars, SEO blog posts, social media plans, newsletters.

## When to use
- ✅ Building a content strategy from scratch (pillars, calendar, channels)
- ✅ Writing one specific piece (blog post, newsletter, social thread)
- ✅ Repurposing one piece into multi-channel content
- ❌ Writing one evergreen SEO/AI post deeply → **Mode POST**

## Workflow

```
RESEARCH → PLAN → WRITE → OPTIMIZE → DISTRIBUTE
```

## Phase 1: RESEARCH

### Gather brief (skip what's already known)

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
- **Top 10 SERP** for 3–5 target keywords — what content ranks?
- **Gaps** competitors miss (more depth, better examples, fresher data)
- **Keyword set** — primary + 2–5 long-tails per piece

### Gate
- [ ] Brief captured · Target keywords with search intent · Competitor gap identified

## Phase 2: PLAN

### Content pillars
Pick 3–5 themes that ladder up to the brand's positioning. Each pillar gets a mix of formats.

| Pillar | Why it matters to audience | Formats |
|--------|---------------------------|---------|
| {pillar 1} | {pain → outcome} | blog, social, newsletter |

### Calendar template (4–6 weeks ahead, consistent cadence)

| Week | Blog (long-form) | Social (short-form) | Newsletter |
|------|------------------|---------------------|------------|
| W1 | {title} | 3 posts (1 educational, 1 hot take, 1 personal) | {topic} |

### Content mix rule (per channel)
- **80/20:** 80% value (educate / entertain), 20% promote
- **Don't post when you have nothing to say** — skip a slot rather than post filler

### Gate
- [ ] 3–5 pillars with rationale · Calendar ≥4 weeks · Channels matched to audience habits

## Phase 3: WRITE

One format at a time.

### Blog post structure (long-form, SEO)
```
TITLE (≤60 chars, primary keyword)  ·  META DESCRIPTION (≤155 chars, keyword + CTA)
H1 (matches title)
HOOK (2–3 sentences: the reader's problem)
TL;DR (3 bullets: the answer up front)
H2: Problem context — why this matters now
H2: The solution — main argument  (H3: Step 1 / Step 2 / Step 3)
H2: Common pitfalls — what NOT to do
H2: Real example — actual code / screenshot / case
H2: Next steps — what to do today
CTA (1 line: try / subscribe / share)
```
Target length: 1200–2500 words for SEO; 500–1000 for opinion.

### Social thread (X / LinkedIn)
```
HOOK (1–2 lines — must work alone in the feed)
↓ 3–7 posts each ≤280 chars (each stands alone, one idea per post, line breaks)
↓ CTA (link to blog / signup)
```

### Newsletter
```
SUBJECT (≤50 chars, curiosity > clickbait)  ·  PREVIEW TEXT (≤90 chars)
GREETING (personal, 1–2 lines)
MAIN STORY (1 idea, 200–400 words)
LINKS (3–5 curated, 1-line why-it-matters)
CTA (one ask only)  ·  SIGNATURE
```

### Writing rules
- **One idea per paragraph** (≤4 lines) · **Active voice** · **Concrete > abstract** (numbers, code, names)
- **Cut filler:** "in order to"→"to", "due to the fact that"→"because", "very important"→"critical"
- **Read aloud** before publishing — if you stumble, rewrite

### Gate
- [ ] Draft matches the format · Primary keyword in title + H1 + first 100 words (blog) · Read aloud, no stumbles · ≥1 concrete example

## Phase 4: OPTIMIZE

### Combined checklist (SEO + quality)
- [ ] Title ≤60 chars + primary keyword · Meta description ≤155 chars · H1 matches search intent
- [ ] H2/H3 use related keywords naturally · Alt text on all images
- [ ] Internal links ≥2 related posts · External links ≥1 authoritative source per claim
- [ ] No keyword stuffing · Mobile-friendly (short paragraphs, clear hierarchy)
- [ ] Reading level appropriate (Hemingway grade ≤10 for general) · No typos

## Phase 5: DISTRIBUTE

### Per-channel adaptation

| Channel | Adaptation |
|---------|------------|
| Blog | Full piece, optimized for search |
| X | Thread of 3–7 posts + link to blog |
| LinkedIn | 1 long-form post (200–500 words), link in comments |
| Dev.to / Hashnode | Republish with canonical link |
| Reddit | Comment in relevant thread first, share only if community allows |
| Newsletter | Featured story or blurb + link |
| YouTube Shorts / TikTok | 30–60 sec extract of key insight |

### Tracking
- UTM tags per channel: `?utm_source=X&utm_medium=social&utm_campaign={pillar}`
- Track per piece: views, time-on-page, scroll depth, conversions
- Iterate: double down on what works, kill what doesn't after 3 attempts

### Gate
- [ ] Adapted for each channel · UTM tags applied · Tracking in place

---
---

# Mode POST

Write **one** evergreen blog post that ranks on traditional search AND is easy for AI systems (ChatGPT, Bing/Copilot, Perplexity) to cite or recommend. Intent-first, answer-first, overlap-audited.

## When to use
- ✅ Writing a single evergreen blog post (entity / trust / compare / glossary / use-case / FAQ)
- ✅ Updating an existing evergreen post that has drifted
- ✅ Replacing a thin / outdated post with a stronger version on the same intent
- ❌ Multi-post content plan / calendar / strategy → **Mode STRATEGY**
- ❌ Changelog / feature launch → write manually
- ❌ Time-sensitive news → not evergreen, different rules

## Core principle
**Don't write a blog "to fill the calendar." Write the answer to a question users actually ask** on Search or to an AI. One strong intent = **one canonical post**. If an existing post is stale → fix it; don't pile a new post on top.

## Workflow

```
1 INTENT → 1.5 OVERLAP AUDIT → 2 RESEARCH → 3 FILE → 4 FRONTMATTER → 5 BODY → 6 PATTERN → 7 RULES → 8 LINKS → 9 VERIFY → 10 REPORT
```

## Step 1: Classify intent

Pick **one** category (don't write a hybrid — split into two posts if needed):

| # | Intent | Example queries |
|---|--------|-----------------|
| 1 | **Entity** | "What is {Brand}", "How does {Brand} work" |
| 2 | **Trust** | "Is {Brand} legit", "Why is {Brand} {claim}" |
| 3 | **Compare** | "{Brand} vs {Competitor}", "Best {category} apps in {region}" |
| 4 | **Glossary** | "What is {term}", "{term} explained" |
| 5 | **Use case** | "How to {action} with {Brand}" |
| 6 | **Problem / FAQ** | "Why is my {thing} not working" |

## Step 1.5: Overlap audit (mandatory)

Before writing anything new, inventory existing posts:
```bash
find {blog_dir} -name "*.md" -maxdepth 2 | sort   # common: content/blog/, app/blog/, docs/blog/
```
For each existing post, extract: slug, primary intent, funnel stage, evergreen/seasonal, stale/off-brand claims.

### Decision rules
| Situation | Action |
|-----------|--------|
| New post overlaps >60% intent with existing | **Do not create new.** Update existing OR refocus both to distinct intents |
| Existing post has stale claims | Update the existing post first or in the same batch — never ignore it |
| New intent genuinely uncovered | Proceed to Step 2 |

### Gate
- [ ] Inventory read · No >60% overlap (or plan to update existing) · Stale-claim audit done (or N/A)

## Step 2: Research (short but solid)

If the post mentions current facts, third parties, or specific numbers — **verify before writing**: competitor/partner facts, stats/dates/policies, app-store claims, pricing/fees.

**Source priority:** 1) official project source 2) official third-party source 3) project marketing docs 4) reputable recent third-party (≤1 year for pricing/stats).

**Hard rules:** no invented benchmarks · no invented comparisons · prefer durable claims over snapshot stats.

### Gate
- [ ] Every non-trivial factual claim has a source · Sources noted for reviewer

## Step 3: File output

```text
{blog_dir}/{slug}.md
```
**Slug rules:** lowercase, hyphen-separated, language convention for non-English projects, maps to **intent** not campaign. Examples: `what-is-{brand}.md`, `is-{brand}-legit.md`, `{brand}-vs-{competitor}.md`.

## Step 4: Frontmatter

```yaml
---
title: "Title that matches the real query"
description: "140-160 chars. What this post does for the reader — not fluff."
date: "YYYY-MM-DD"
author: "{Brand} Team"
image: "/images/blog/{slug}.svg"
category: "<from project's category enum>"
tags: ["<brand>", "<topic>", "<intent>"]
---
```
**Picking `category`:** use the project's existing enum — never invent. Common: `guide`/`tutorial` (entity, glossary, use-case, FAQ), `tips` (optimization), `compare`/`review` (comparison).

## Step 5: Body structure (answer-first)

```markdown
{2-4 sentences directly answering the title question — no warm-up, no story}

## TL;DR
- Key takeaway 1 / 2 / 3

## {Primary heading 1 — the main answer expanded}
## {Primary heading 2 — supporting context}
## When to choose / use / consider {Brand}
## Important caveats

## FAQ
### {Question 1 — phrased exactly as users ask}
{Direct answer, 2-4 sentences}

## Conclusion / Next step
```

**Why this works for AI systems:** TL;DR + direct answer + FAQ blocks are the highest-cited patterns. AI tools quote concise answers; long intros get skipped.

## Step 6: Pattern per intent type
- **Entity / Trust:** what it is, who it's for, where the core value comes from (sources, business model), who's behind it, support/app-stores/community.
- **Compare:** real comparison table (criterion × options); fair, no dunking without evidence; state when each option fits better; verify every cell.
- **Glossary:** define in 1-2 sentences at top, concrete example, end-user language, link to related guide.
- **Use case / How-to:** numbered steps (≤7), visuals, prerequisites first, expected outcome.
- **Problem / FAQ:** describe symptom, list causes by likelihood, fix per cause, when to escalate.

## Step 7: SEO + AI optimization rules
- **H1 = the real query** · **First paragraph answers directly** (no warm-up)
- **Headings tell the story** (scan H2s → understand the post) · **Tables/lists** beat paragraphs
- **Internal links** to related posts + product pages · **One consistent brand positioning sentence**
- **No keyword stuffing** · **No filler** · **Sensitive claims need evidence** or safe wording ("may", "in some cases")

## Step 8: Internal link rules
Minimum **2-4 internal links**: 1 to core product/about page, 1 to support/help page, 1-2 to related foundational posts. Anchor text natural + varied (no repeated exact-match).

## Step 9: Verify (pre-publish)
- [ ] Intent distinct from existing posts · Title = real query · First paragraph answers directly
- [ ] Table / FAQ / numbered steps where intent calls for them · ≥2 internal links, natural anchors
- [ ] No unverified claims · Frontmatter `category` matches enum · Sitemap updated (if required) · OG image exists · Reading level reasonable

## Step 10: Report
```markdown
## SEO Blog Post: {title}
### File: `{blog_dir}/{slug}.md`
### Intent: {category} · Primary query: "{search query}"
### Key internal links: {anchor → /path}
### Overlap audit: Checked {N} posts · Decision: {NEW / UPDATED `slug` / REFOCUSED}
### Items needing user review: {claim X — verify source}
```

---
---

## Hard Rules (both modes)

- **One idea per piece / one canonical post per intent** — if you have two intents, write two pieces.
- **No filler** — every paragraph earns its place. **No keyword stuffing** — humans first, search engines second.
- **Skip a slot rather than post filler. Iterate based on data** — kill what doesn't work after 3 attempts.
- **POST specifics:** overlap audit before writing (Step 1.5 not optional); answer-first (TL;DR + direct answer in first paragraph); no invented facts/benchmarks/comparisons; stale-claim audit fixes outdated posts in the same batch; slug = intent; update sitemap if required.

## Related Skills

| When | Use |
|------|-----|
| Building brand identity (logo) or video | `/marketing-brand` |
| Building a full marketing plan | `/marketing` (combines brand + content) |
| Writing project documentation | `/docs-sync` |

## Recommended Agents

| Phase / Step | Agent | Purpose |
|--------------|-------|---------|
| RESEARCH / OVERLAP | `@docs-writer` | Research findings + inventory analysis |
| PLAN | `@clean-architect` | Structure pillars and calendar |
| WRITE / BODY | `@docs-writer` | Draft pieces + structure |
| OPTIMIZE / SEO | `@docs-writer`, `@security-audit` | Optimization + sensitive-claim check |
| VERIFY | `@code-reviewer` | Link + frontmatter sanity check |
