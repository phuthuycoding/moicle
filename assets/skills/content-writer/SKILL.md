---
name: content-writer
description: Create content writing strategy including blog posts, social media, newsletters, and SEO content plans. Use when user says "write content", "content strategy", "blog post", "social media content", "content plan", "seo content", "newsletter".
---

# Content Writer Skill

Structured workflow for creating comprehensive content strategy — from audience research and content pillars to SEO blog posts, social media plans, and newsletter campaigns.

## Workflow Overview

```
RESEARCH → PLAN → WRITE → OPTIMIZE → DISTRIBUTE
    │         │       │        │          │
    ▼         ▼       ▼        ▼          ▼
  Audience  Content  Draft   SEO &     Calendar
  & SEO     Pillars  Posts   Quality   & Channels
  Analysis  & Topics         Review
```

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| RESEARCH | @docs-writer | Document research findings |
| PLAN | @clean-architect | Structure content system |
| WRITE | @docs-writer | Write content pieces |
| OPTIMIZE | @security-audit | Check for sensitive content |
| DISTRIBUTE | @docs-writer | Distribution plan |

---

## Phase 1: RESEARCH

**Goal**: Understand audience, competitors, and SEO landscape.

### Actions

1. Gather content strategy requirements:

```
CONTENT STRATEGY BRIEF
======================

1. BRAND / PRODUCT
   - Name: [Product/Brand name]
   - Description: [One-line description]
   - Unique Value Proposition: [What makes it different]
   - Voice / Tone: [Professional / Casual / Technical / Friendly]

2. TARGET AUDIENCE
   - Primary audience: [Who]
   - Demographics: [Age, Role, Industry]
   - Pain points: [What problems do they have]
   - Where they consume content:
     [ ] Blog / Website
     [ ] X (Twitter)
     [ ] LinkedIn
     [ ] Dev.to / Hashnode / Medium
     [ ] Reddit
     [ ] YouTube
     [ ] Newsletter / Email
     [ ] Discord / Slack communities

3. GOALS
   - What do you want content to achieve?
     [ ] Brand awareness
     [ ] SEO traffic
     [ ] Lead generation
     [ ] User education
     [ ] Community building
     [ ] Thought leadership
   - Primary goal: [Answer]
   - Secondary goal: [Answer]

4. CURRENT STATE
   - Existing content? [Yes / No]
   - Blog exists? [Yes / No / URL]
   - Social media accounts? [List platforms]
   - Newsletter? [Yes / No]
   - Content frequency: [Current posting rate]

5. RESOURCES
   - Writers available: [Number / Solo]
   - Budget: [Answer]
   - Time per week for content: [Hours]

6. COMPETITORS
   - Competitor 1: [Name] — Content strengths: [Answer]
   - Competitor 2: [Name] — Content strengths: [Answer]
   - Competitor 3: [Name] — Content strengths: [Answer]
```

2. Conduct keyword / topic research:

```
SEO & TOPIC RESEARCH
====================

Target Keywords (by intent):

Informational (How-to / Education):
| Keyword               | Volume | Difficulty | Priority |
|-----------------------|--------|------------|----------|
| [keyword phrase]      | [est.] | [L/M/H]   | [P0-P2]  |
| [keyword phrase]      | [est.] | [L/M/H]   | [P0-P2]  |
| [keyword phrase]      | [est.] | [L/M/H]   | [P0-P2]  |

Navigational (Brand / Product):
| Keyword               | Volume | Difficulty | Priority |
|-----------------------|--------|------------|----------|
| [keyword phrase]      | [est.] | [L/M/H]   | [P0-P2]  |

Commercial (Comparison / Review):
| Keyword               | Volume | Difficulty | Priority |
|-----------------------|--------|------------|----------|
| [keyword phrase]      | [est.] | [L/M/H]   | [P0-P2]  |

Content Gap Analysis:
- Topics competitors cover that we don't: [List]
- Topics no one covers well: [List]
- Trending topics in our space: [List]
```

### Output

- Content Strategy Brief
- SEO & Topic Research document

### Gate

- [ ] Audience clearly defined
- [ ] Goals established
- [ ] Keyword research completed
- [ ] Competitor content analyzed
- [ ] Content gaps identified

---

## Phase 2: PLAN

**Goal**: Define content pillars, content types, and editorial plan.

### Actions

1. Define content pillars:

```
CONTENT PILLARS
===============

A content pillar is a core theme that all content maps back to.
Recommend 3-5 pillars.

┌─────────────────────────────────────────────────────────┐
│                    CONTENT PILLARS                       │
├──────────────┬──────────────┬────────────┬──────────────┤
│  PILLAR 1    │  PILLAR 2    │  PILLAR 3  │  PILLAR 4    │
│  [Name]      │  [Name]      │  [Name]    │  [Name]      │
│              │              │            │              │
│ [Topic A]    │ [Topic A]    │ [Topic A]  │ [Topic A]    │
│ [Topic B]    │ [Topic B]    │ [Topic B]  │ [Topic B]    │
│ [Topic C]    │ [Topic C]    │ [Topic C]  │ [Topic C]    │
│              │              │            │              │
│ Goal:        │ Goal:        │ Goal:      │ Goal:        │
│ [Educate/    │ [Inspire/    │ [Convert/  │ [Community/  │
│  Inform]     │  Motivate]   │  Sell]     │  Engage]     │
└──────────────┴──────────────┴────────────┴──────────────┘
```

2. Define content types and tiers:

```
CONTENT TYPES & TIERS
=====================

Tier 1: Flagship / Pillar Content (2000-3000 words)
Purpose: SEO authority, in-depth education
Frequency: [X per month]
Examples:
- "The Complete Guide to [Topic]"
- "[Topic] in [Year]: Everything You Need to Know"
- "How to [Achieve Goal] — Step by Step Guide"

| # | Title | Pillar | Target Keyword | Priority |
|---|-------|--------|----------------|----------|
| 1 | [Title] | [Pillar] | [Keyword] | P0 |
| 2 | [Title] | [Pillar] | [Keyword] | P0 |
| 3 | [Title] | [Pillar] | [Keyword] | P1 |
| 4 | [Title] | [Pillar] | [Keyword] | P1 |

─────────────────────────────────────

Tier 2: Supporting Content (1000-1500 words)
Purpose: Practical tutorials, how-to guides
Frequency: [X per month]
Examples:
- "Getting Started with [Feature]"
- "[Number] Ways to [Achieve Goal]"
- "[Tool/Feature] Tutorial for [Audience]"

| # | Title | Pillar | Target Keyword | Priority |
|---|-------|--------|----------------|----------|
| 1 | [Title] | [Pillar] | [Keyword] | P0 |
| 2 | [Title] | [Pillar] | [Keyword] | P1 |
| 3 | [Title] | [Pillar] | [Keyword] | P1 |

─────────────────────────────────────

Tier 3: Quick Content (500-800 words)
Purpose: Engagement, freshness, community
Frequency: [X per month]
Examples:
- "X Tips You Didn't Know About [Topic]"
- "Weekly Digest: [Topic] Updates"
- "[Feature] Spotlight: [Specific Feature]"

| # | Title | Pillar | Type |
|---|-------|--------|------|
| 1 | [Title] | [Pillar] | Tips |
| 2 | [Title] | [Pillar] | Update |
| 3 | [Title] | [Pillar] | Feature |
```

3. Plan social media content:

```
SOCIAL MEDIA CONTENT PLAN
==========================

Platform: X (Twitter)
─────────────────────
Content Mix:
├── [X]% Educational (tips, threads, how-to)
├── [X]% Product (features, updates, releases)
├── [X]% Community (replies, retweets, discussions)
└── [X]% Industry (trends, opinions, news)

Post Types & Frequency:
├── Daily tip tweet: [X/day]
├── Thread (deep dive): [X/week]
├── GIF/Video demo: [X/week]
├── Poll: [X/week]
└── Release announcement: [as needed]

Thread Ideas:
1. "[Hook] Here's how... 🧵"
2. "[Number] things about [topic] 🧵"
3. "[Contrarian take] Here's why... 🧵"

────────────────────────

Platform: LinkedIn
──────────────────
Content Mix:
├── [X]% Thought leadership
├── [X]% Case studies & tutorials
└── [X]% Product announcements

Frequency: [X posts/week]
Format: Text + image / carousel

────────────────────────

Platform: Dev.to / Hashnode / Medium
────────────────────────────────────
Frequency: [X articles/week]
Content: Repurpose Tier 1 & 2 blog posts
Cross-post strategy: [Canonical URL → own blog]
```

4. Plan newsletter:

```
NEWSLETTER PLAN
===============

Name: "[Newsletter Name]"
Frequency: [Weekly / Bi-weekly / Monthly]
Day: [Day of week]
Platform: [Mailchimp / Resend / ConvertKit / etc.]

Template:
├── Header: [Logo + Issue #]
├── Section 1: [Main story / Feature of the week]
├── Section 2: [Tutorial highlight]
├── Section 3: [Community / Tips]
├── Section 4: [Quick links / Resources]
└── Footer: [CTA + Social links + Unsubscribe]

Growth Strategy:
- Blog CTA: [Subscribe box on every post]
- Lead magnet: [Free resource in exchange for email]
- Social promotion: [Share each issue]
```

### Output

- Content Pillars document
- Content Types & Tiers with topic lists
- Social Media Content Plan
- Newsletter Plan

### Gate

- [ ] 3-5 content pillars defined
- [ ] Content tiers with specific titles planned
- [ ] Social media strategy per platform
- [ ] Newsletter template and schedule set
- [ ] User approved the content plan

---

## Phase 3: WRITE

**Goal**: Draft content pieces following templates and brand voice.

### Actions

1. For blog posts, follow this template:

```
BLOG POST TEMPLATE
==================

─── META ───
Title: [SEO-optimized title, max 60 chars]
Slug: [url-friendly-slug]
Meta Description: [150-160 chars, include keyword]
Target Keyword: [Primary keyword]
Secondary Keywords: [keyword2, keyword3]
Category: [Pillar name]
Tags: [tag1, tag2, tag3]
Tier: [1 / 2 / 3]
Word Count Target: [Range]

─── STRUCTURE ───

# [Title — H1, include primary keyword]

[Opening paragraph — Hook the reader. State the problem or
promise the value. 2-3 sentences. Include primary keyword
naturally.]

## [Section 1 — H2, include related keyword]

[Content for section 1. Use short paragraphs (2-4 sentences).
Include relevant examples, code snippets, or visuals.]

### [Subsection if needed — H3]

[Detailed content]

## [Section 2 — H2]

[Content for section 2]

## [Section 3 — H2]

[Content for section 3]

## [Conclusion / Summary]

[Wrap up key points. 2-3 sentences.]

[CTA: What should the reader do next?]

─── SEO CHECKLIST ───

- [ ] Primary keyword in title (H1)
- [ ] Primary keyword in first paragraph
- [ ] Primary keyword in at least one H2
- [ ] Primary keyword in meta description
- [ ] Secondary keywords used naturally
- [ ] Internal links to related content (2-3)
- [ ] External links to authoritative sources (1-2)
- [ ] Images with alt text
- [ ] Short paragraphs (max 4 sentences)
- [ ] Subheadings every 200-300 words
- [ ] Meta description 150-160 characters
- [ ] URL slug is short and keyword-rich
```

2. For social media posts, use templates:

```
SOCIAL MEDIA TEMPLATES
======================

── Tweet Template ──
[Hook — first line grabs attention]

[Value — key insight or tip]

[CTA — what to do next]

[Hashtags if applicable]

── Thread Template ──
1/ [Hook — bold statement or question]

2/ [Context — why this matters]

3/ [Point 1 — with example]

4/ [Point 2 — with example]

5/ [Point 3 — with example]

6/ [Summary + CTA]

── LinkedIn Post Template ──
[Hook line — pattern interrupt]

[Problem statement]

[Solution or insight]

[Supporting evidence or story]

[Key takeaway]

[CTA — question to drive comments]

#hashtag1 #hashtag2 #hashtag3
```

3. For newsletter, use template:

```
NEWSLETTER TEMPLATE
===================

Subject Line: [Curiosity-driven, max 50 chars]
Preview Text: [Complements subject, max 90 chars]

Hi [Name],

[Opening — personal, conversational, 1-2 sentences]

## [Main Story Title]

[2-3 paragraphs on the main topic]

[CTA button or link]

## Quick Tips

- [Tip 1]: [Brief explanation]
- [Tip 2]: [Brief explanation]
- [Tip 3]: [Brief explanation]

## From the Community

[Community highlight or user story]

## Resources

- [Resource 1](link) — [One-line description]
- [Resource 2](link) — [One-line description]

Until next time,
[Sign-off]

---
[Footer: Social links | Unsubscribe | Preferences]
```

### Output

Drafted content pieces ready for review

### Gate

- [ ] Content follows brand voice and tone
- [ ] Blog posts follow SEO template
- [ ] Social posts follow platform templates
- [ ] Newsletter follows template
- [ ] All content reviewed for accuracy

### Feedback Loop

If content needs revision → Edit based on feedback → Re-review

---

## Phase 4: OPTIMIZE

**Goal**: Review content for SEO, quality, and brand consistency.

### Actions

1. SEO optimization review:

```
SEO REVIEW CHECKLIST
====================

On-Page SEO:
- [ ] Title tag optimized (primary keyword + compelling)
- [ ] Meta description written (150-160 chars, keyword included)
- [ ] URL slug is clean and keyword-rich
- [ ] H1 contains primary keyword
- [ ] H2s contain related keywords
- [ ] Primary keyword density: 1-2% (not stuffed)
- [ ] Image alt tags descriptive and include keywords
- [ ] Internal links added (2-3 relevant links)
- [ ] External links to authority sources (1-2 links)
- [ ] Content length meets tier target

Readability:
- [ ] Short paragraphs (2-4 sentences max)
- [ ] Subheadings every 200-300 words
- [ ] Bullet points and lists where appropriate
- [ ] Active voice preferred
- [ ] Jargon explained or linked
- [ ] Reading level appropriate for audience

Technical:
- [ ] No broken links
- [ ] Images optimized for web (compressed)
- [ ] Code snippets formatted correctly
- [ ] Mobile-friendly formatting
- [ ] Schema markup considerations
```

2. Quality review:

```
CONTENT QUALITY CHECKLIST
=========================

Accuracy:
- [ ] Facts are correct and current
- [ ] Code examples tested and working
- [ ] Screenshots are up to date
- [ ] Links are valid
- [ ] No sensitive information exposed

Brand Voice:
- [ ] Tone matches brand guidelines
- [ ] Consistent terminology used
- [ ] Product name spelled correctly
- [ ] CTA aligns with brand messaging

Grammar & Style:
- [ ] No spelling errors
- [ ] No grammatical errors
- [ ] Consistent formatting
- [ ] Proper punctuation
- [ ] No plagiarism
```

### Output

Optimized content ready for publishing

### Gate

- [ ] SEO checklist passed
- [ ] Quality checklist passed
- [ ] Content approved by reviewer
- [ ] Ready for scheduling

---

## Phase 5: DISTRIBUTE

**Goal**: Create distribution calendar and track performance.

### Actions

1. Create editorial calendar:

```
EDITORIAL CALENDAR — [Month/Year]
===================================

WEEK 1: Theme — [Theme Name]
├── Mon: Blog — [Title] (Tier [X])
├── Tue: Twitter — Thread: [Topic]
├── Wed: LinkedIn — Post: [Topic]
├── Thu: Dev.to — Cross-post: [Title]
├── Fri: Newsletter — Issue #[X]
└── Daily: Twitter tip + engagement

WEEK 2: Theme — [Theme Name]
├── Mon: Blog — [Title] (Tier [X])
├── Tue: Twitter — Thread: [Topic]
├── Wed: LinkedIn — Post: [Topic]
├── Thu: Dev.to — Cross-post: [Title]
├── Fri: [Platform] — [Content]
└── Daily: Twitter tip + engagement

WEEK 3: Theme — [Theme Name]
[Continue pattern...]

WEEK 4: Theme — [Theme Name]
[Continue pattern...]

────────────────────────────────

REPURPOSING FLOW:
Blog Post → Twitter Thread → LinkedIn Post → Newsletter Feature → Dev.to Cross-post
```

2. Define KPIs:

```
CONTENT KPIs
============

Blog:
| Metric              | Target (Monthly) |
|---------------------|-------------------|
| Unique visitors     | [Target]          |
| Page views          | [Target]          |
| Avg time on page    | [Target]          |
| Bounce rate         | < [Target]%       |
| Keyword rankings    | Top 10 for [X]    |
| Backlinks gained    | [Target]          |

Social Media:
| Metric              | Target (Monthly) |
|---------------------|-------------------|
| Followers growth    | +[Target]         |
| Engagement rate     | [Target]%         |
| Impressions         | [Target]          |
| Link clicks         | [Target]          |
| Shares/Retweets     | [Target]          |

Newsletter:
| Metric              | Target            |
|---------------------|-------------------|
| Subscribers         | [Target]          |
| Open rate           | [Target]%         |
| Click rate          | [Target]%         |
| Unsubscribe rate    | < [Target]%       |

Conversion:
| Metric              | Target (Monthly) |
|---------------------|-------------------|
| Blog → Sign up      | [Target]          |
| Social → Website    | [Target]          |
| Newsletter → Action | [Target]          |
```

3. Define review cadence:

```
PERFORMANCE REVIEW
==================

Weekly:
- Social media engagement metrics
- Blog traffic snapshot
- Newsletter performance (if sent)

Monthly:
- Full traffic analysis
- Keyword ranking changes
- Content performance ranking (top 5 posts)
- Social follower growth
- Newsletter growth

Quarterly:
- Content audit (what's working, what's not)
- Pillar review (adjust if needed)
- Keyword strategy update
- Competitor content analysis
- Goal adjustment
```

### Output

- Editorial calendar (monthly)
- KPI tracking framework
- Performance review schedule

### Gate

- [ ] Editorial calendar created
- [ ] Content scheduled across all platforms
- [ ] KPIs defined with realistic targets
- [ ] Review cadence established
- [ ] User approved distribution plan

---

## Quick Reference

### Phase Summary

| Phase | Goal | Key Output |
|-------|------|------------|
| RESEARCH | Audience & SEO analysis | Strategy Brief & Keywords |
| PLAN | Pillars & content types | Editorial Plan |
| WRITE | Draft content pieces | Blog, Social, Newsletter drafts |
| OPTIMIZE | SEO & quality review | Polished content |
| DISTRIBUTE | Calendar & tracking | Publishing schedule & KPIs |

### Content Mix Rule of Thumb

```
70% — Educational / Value content
20% — Brand / Product content
10% — Community / Engagement content
```

### Success Criteria

- [ ] Content pillars align with business goals
- [ ] SEO keyword strategy in place
- [ ] Blog content calendar for 1+ months
- [ ] Social media plan per platform
- [ ] Newsletter template and schedule set
- [ ] All content follows brand voice
- [ ] SEO optimization applied to every piece
- [ ] Quality checklist passed
- [ ] Distribution calendar created
- [ ] KPIs defined and tracking ready
