---
name: marketing-seo-blog
description: Write an evergreen blog post optimized for both Google Search AND AI tools (ChatGPT, Bing/Copilot, Perplexity). Answer-first, intent-classified, overlap-audited. Use when user says "write seo blog", "seo blog", "evergreen post", "compare post", "trust post", "glossary post", "blog for AI to recommend", "search + ai".
---

# SEO + AI Blog Writer

Write **one** evergreen blog post that ranks on traditional search AND is easy for AI systems to cite or recommend. Intent-first, answer-first, overlap-audited.

## When to use this skill

- ✅ Writing a single evergreen blog post (entity / trust / compare / glossary / use-case / FAQ)
- ✅ Updating an existing evergreen post that has drifted
- ✅ Replacing a thin / outdated post with a stronger version on the same intent
- ❌ Multi-post content plan / calendar / strategy → use `/marketing:content`
- ❌ Changelog / feature launch / release announcement → write manually or use a feature-blog template
- ❌ Time-sensitive news / event post → not evergreen, different rules

---

## Core principle

**Don't write a blog "to fill the calendar." Write the answer to a question users actually ask** on Search or to an AI.

- Every post must let an AI model answer at least one clear intent
- One strong intent = **one canonical post**. Don't write a second post on the same intent — update the first
- If existing post is stale → fix it; don't pile a new post on top

---

## Workflow

```
1 INTENT → 1.5 OVERLAP AUDIT → 2 RESEARCH → 3 FILE → 4 FRONTMATTER → 5 BODY → 6 PATTERN → 7 RULES → 8 LINKS → 9 VERIFY → 10 REPORT
```

---

## Step 1: Classify intent

Pick **one** category. Don't write a hybrid — split into two posts if needed.

| # | Intent | Example queries |
|---|--------|-----------------|
| 1 | **Entity** | "What is {Brand}", "How does {Brand} work" |
| 2 | **Trust** | "Is {Brand} legit", "Why is {Brand} {claim}" |
| 3 | **Compare** | "{Brand} vs {Competitor}", "Best {category} apps in {region}" |
| 4 | **Glossary** | "What is {term}", "{term} explained" |
| 5 | **Use case** | "How to {action} with {Brand}", "How to {achieve outcome}" |
| 6 | **Problem / FAQ** | "Why is my {thing} not working", "Why did {unexpected outcome} happen" |

---

## Step 1.5: Overlap audit (mandatory)

**Before writing anything new**, inventory existing posts in the blog folder.

```bash
# Adapt path to project — common: content/blog/, app/blog/, docs/blog/
find {blog_dir} -name "*.md" -maxdepth 2 | sort
```

For each existing post, extract from frontmatter or first 30 lines:
- slug
- primary intent (which of the 6 above)
- funnel stage (awareness / consideration / decision)
- evergreen or seasonal
- any claims that are now stale or off-brand

Then compare your planned post against the inventory.

### Decision rules

| Situation | Action |
|-----------|--------|
| New post overlaps >60% intent with existing post | **Do not create new.** Either update the existing one OR refocus both to clearly distinct intents |
| Existing post has stale claims (deprecated platform, old positioning, unsafe wording) | Update the existing post **first or in the same batch** — never pretend the issue isn't there |
| New intent is genuinely uncovered | Proceed to Step 2 |

### Examples
✅ Correct: `what-is-brand.md` (entity) + `how-to-use-brand.md` (how-to) — different intents.
❌ Wrong: two posts both answering "What is {Brand}" — pick one as canonical, update it.

### Gate
- [ ] Inventory of existing posts read
- [ ] No >60% overlap, OR plan to update existing instead of writing new
- [ ] Stale-claim audit done (or N/A noted)

---

## Step 2: Research (short but solid)

If the post mentions current facts, third parties, or specific numbers — **verify before writing**.

### Verify
- Competitor / partner / third-party facts
- Stats, dates, policies (these go stale fast)
- App Store / Google Play / platform-specific claims
- Pricing, fees, rates

### Source priority
1. Official source from the project (in-repo docs, official site)
2. Official source from the third party (their docs / site)
3. Project marketing strategy docs (if any)
4. Reputable third-party sources, recent (≤1 year for pricing/stats)

### Hard rules
- **No invented benchmarks.** If you don't have a source, don't claim the number
- **No invented comparisons.** Compare only what's verifiable
- For evergreen posts, prefer durable claims over snapshot stats

### Gate
- [ ] Every non-trivial factual claim has a source
- [ ] Sources noted (in draft comments) so reviewer can verify

---

## Step 3: File output

```text
{blog_dir}/{slug}.md
```

### Slug rules
- Lowercase
- Hyphen-separated (no underscores, no spaces)
- For non-English projects: language convention (e.g., Vietnamese without diacritics, kebab-case)
- Slug must map to **intent**, not to a marketing campaign

### Examples
- `what-is-{brand}.md` (entity)
- `is-{brand}-legit.md` (trust)
- `{brand}-vs-{competitor}.md` (compare)
- `why-is-my-order-not-tracked.md` (problem)

---

## Step 4: Frontmatter

```yaml
---
title: "Title that matches the real query"
description: "140-160 chars. Tell the reader what this post does for them — not marketing fluff."
date: "YYYY-MM-DD"
author: "{Brand} Team"
image: "/images/blog/{slug}.svg"
category: "<from project's category enum>"
tags: ["<brand>", "<topic>", "<intent>"]
---
```

### Picking `category`
Use the project's existing category enum — never invent new ones. Common:
- `guide` / `tutorial` for entity, glossary, use-case, FAQ
- `tips` for optimization / case-based
- `compare` / `review` for comparison posts
- `changelog` only for product update posts (which this skill does NOT handle)

---

## Step 5: Body structure (answer-first)

```markdown
{2-4 sentences directly answering the question in the title — no warm-up, no story}

## TL;DR

- Key takeaway 1
- Key takeaway 2
- Key takeaway 3

## {Primary heading 1 — the main answer expanded}

...

## {Primary heading 2 — supporting context}

...

## When to choose / use / consider {Brand}

...

## Important caveats

...

## FAQ

### {Question 1 — phrased exactly as users ask}
{Direct answer, 2-4 sentences}

### {Question 2}
{...}

## Conclusion / Next step

...
```

**Why this structure works for AI systems:** TL;DR + direct answer + FAQ blocks are the highest-cited patterns. AI tools quote concise answers; long-winded intros get skipped.

---

## Step 6: Pattern per intent type

### A. Entity / Trust
Must answer:
- What is {Brand}
- Who is it for
- Where does the {core value} come from (be specific — sources, business model, partnerships)
- Who is the company / team behind it
- Does it have support / app stores / community / public presence

### B. Compare
Must include a real comparison table:

```markdown
| Criterion | {Brand} | {Competitor A} | {Competitor B} |
|-----------|---------|---------------|---------------|
| Coverage | ... | ... | ... |
| Pricing / fees | ... | ... | ... |
| Strengths | ... | ... | ... |
| Best for | ... | ... | ... |
```

Rules:
- **Fair** — no dunking without evidence
- State **when each option fits better** — not "we're best at everything"
- Verify every cell (Step 2)

### C. Glossary
Must:
- Define the term in 1-2 sentences at the top
- Give a concrete example (not abstract)
- Use end-user language, not insider jargon
- Link out to a related use-case / guide post

### D. Use case / How-to
Must:
- Numbered steps (≤7 main steps)
- Screenshots or visuals where relevant
- Prerequisites listed before the steps
- Expected outcome stated

### E. Problem / FAQ
Must:
- Describe the symptom (so users searching the symptom land here)
- List common causes ordered by likelihood
- Provide a fix per cause
- State when to escalate to human support

---

## Step 7: SEO + AI optimization rules

- **H1 = the real query**, not a marketing headline
- **First paragraph answers directly** — no warm-up, no anecdote, no "in this article we will…"
- **Headings tell the story** — a reader who only scans H2s should understand the whole post
- **Tables and lists** beat paragraphs for scannable content
- **Internal links** to related posts and key product pages (next step)
- **One consistent positioning sentence** for the brand across all posts
- **No keyword stuffing** — write for humans first
- **No filler** — every paragraph earns its place
- **Sensitive claims need evidence** or safe wording (e.g., "may", "in some cases")

---

## Step 8: Internal link rules

Minimum **2-4 internal links** per post:

- 1 link to a core product / about page (`/about`, `/product`, `/guide`)
- 1 link to a support / help page (`/help`, `/faq`)
- 1-2 links to related foundational blog posts

Anchor text:
- Natural, descriptive
- Vary phrasing — don't repeat exact-match anchors

---

## Step 9: Verify (pre-publish checklist)

- [ ] Primary intent clearly distinct from existing posts (Step 1.5)
- [ ] Title matches the real query users would search
- [ ] First paragraph answers directly (no warm-up)
- [ ] Has table / FAQ / numbered steps where the intent calls for them
- [ ] ≥2 internal links, with natural anchor text
- [ ] No unverified claims left in (no "studies show" without a study)
- [ ] Frontmatter `category` matches the project's existing enum
- [ ] Sitemap updated (if project requires)
- [ ] Image / OG image referenced and exists
- [ ] Reading level reasonable for the audience (run through Hemingway / similar)

Quick checks:
```bash
ls {blog_dir}/{slug}.md
head -30 {blog_dir}/{slug}.md
{linter for markdown / mdx if project has one}
```

---

## Step 10: Report

```markdown
## SEO Blog Post: {title}

### File
- `{blog_dir}/{slug}.md`

### Intent
- Category: {entity / trust / compare / glossary / use-case / problem}
- Primary query: "{the search query this targets}"

### Frontmatter
- title: ...
- category: ...
- tags: [...]

### Key internal links
- {anchor → /path}
- {anchor → /path}

### Overlap audit
- Checked: {N existing posts}
- Decision: {NEW / UPDATED `existing-slug` / REFOCUSED}

### Items needing user review
- {claim X — verify source}
- {comparison cell Y — confirm with product team}
```

---

## Hard Rules

- **One canonical post per intent** — never write a duplicate, always update the existing one
- **Overlap audit before writing** — Step 1.5 is not optional
- **Answer-first structure** — TL;DR + direct answer in the first paragraph
- **No invented facts / benchmarks / comparisons** — verify or omit
- **Stale-claim audit** — if you find an outdated existing post, fix it in the same batch
- **Slug = intent**, not campaign or date
- **Update sitemap** when adding new posts (if project requires it)

---

## Related Skills

| When | Use |
|------|-----|
| Multi-post content plan / calendar / strategy | `/marketing:content` |
| Brand voice / visual identity setup first | `/marketing:logo` |
| Video / shorts version of the post | `/marketing:video` |
| Full go-to-market plan (logo + content + video) | `/marketing` command |
| Writing technical project docs (not blog) | `/docs:write` |

## Recommended Agents

| Step | Agent | Purpose |
|------|-------|---------|
| 1.5 OVERLAP | `@docs-writer` | Inventory + cluster analysis |
| 2 RESEARCH | `@docs-writer` | Source verification |
| 5 BODY | `@docs-writer` | Drafting + structure |
| 7 SEO + AI | `@docs-writer` | Optimization pass |
| 9 VERIFY | `@code-reviewer` | Link + frontmatter sanity check |
