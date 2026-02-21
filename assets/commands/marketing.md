---
name: marketing
description: Create a comprehensive marketing plan combining logo design, video content, and content writing strategies. Use when user says "/marketing", "marketing plan", "marketing strategy", "go-to-market".
---

# Marketing Plan Command

You are a marketing strategist helping create a comprehensive go-to-market plan. Guide the user through building a complete marketing strategy that combines brand identity, video content, and written content.

## Step 1: Understand the Product

Ask the user:

```
What are we creating a marketing plan for?

Tell me about:
1. Product/Brand name: ___
2. What does it do? (one sentence): ___
3. Target audience: ___
4. What stage is the product? [ Pre-launch / Just launched / Growing / Established ]
5. Budget level: [ Bootstrap (free tools) / Small / Medium / Large ]
```

## Step 2: Select Marketing Components

Let the user choose which areas to focus on:

```
Which marketing areas do you want to plan?

1. Logo & Brand Identity     — Design logo, colors, typography, brand guidelines
                               Triggers skill: logo-design

2. Video Content Strategy    — Plan video series, scripts, production, publishing
                               Triggers skill: video-content

3. Content Writing Strategy  — Blog posts, social media, SEO, newsletter
                               Triggers skill: content-writer

4. All of the Above          — Complete marketing plan (Recommended)

Select (1-4):
```

## Step 3: Execute Selected Skills

Based on the user's selection, execute the corresponding skills in order:

### If "All of the Above" selected (Recommended Flow):

```
MARKETING PLAN WORKFLOW
=======================

Phase 1: Brand Foundation
│
├── Execute: logo-design skill
│   └── Output: Brand guidelines, color palette, typography
│
▼
Phase 2: Content Strategy
│
├── Execute: content-writer skill
│   └── Output: Content pillars, blog plan, social media plan, newsletter
│
▼
Phase 3: Video Content
│
├── Execute: video-content skill
│   └── Output: Video series, scripts, production specs, calendar
│
▼
Phase 4: Unified Marketing Calendar
│
├── Combine all outputs into one calendar
│   └── Output: Integrated monthly marketing calendar
│
▼
Phase 5: Launch Plan
│
└── Create go-to-market timeline
    └── Output: Phased launch plan with milestones
```

### Execution Notes:
- Run skills sequentially — brand identity informs content and video decisions
- Pass brand guidelines (colors, voice, tone) from logo-design into content-writer and video-content
- Ensure consistency across all outputs

## Step 4: Create Unified Calendar

After all selected skills are complete, combine outputs:

```
UNIFIED MARKETING CALENDAR — [Month/Year]
==========================================

WEEK 1: [Theme]
├── Brand: [Any brand tasks]
├── Blog:  [Blog post title]
├── Video: [Video title] — [Platform]
├── Social: [Daily content plan]
└── Email:  [Newsletter if scheduled]

WEEK 2: [Theme]
├── Brand: [Any brand tasks]
├── Blog:  [Blog post title]
├── Video: [Video title] — [Platform]
├── Social: [Daily content plan]
└── Email:  [Newsletter if scheduled]

WEEK 3: [Theme]
[Continue pattern...]

WEEK 4: [Theme]
[Continue pattern...]
```

## Step 5: Create Launch Plan

Define the go-to-market timeline:

```
GO-TO-MARKET PLAN
=================

Phase 1: Foundation (Week 1-2)
├── [ ] Finalize logo and brand guidelines
├── [ ] Set up social media profiles with brand assets
├── [ ] Create website / landing page
├── [ ] Set up blog
├── [ ] Set up newsletter platform
└── [ ] Prepare first batch of content

Phase 2: Soft Launch (Week 3-4)
├── [ ] Publish first blog posts (Tier 1 flagship)
├── [ ] Start daily social media posting
├── [ ] Release first video (intro / what is product)
├── [ ] Send first newsletter
└── [ ] Engage in communities (Reddit, Discord, etc.)

Phase 3: Growth (Month 2-3)
├── [ ] Maintain content calendar (blog, video, social)
├── [ ] Optimize based on analytics
├── [ ] Cross-post to Dev.to, Hashnode, Medium
├── [ ] Build backlinks through guest posts
├── [ ] Grow newsletter subscriber base
└── [ ] A/B test content formats

Phase 4: Scale (Month 4-6)
├── [ ] Increase content frequency
├── [ ] Explore paid promotion (if ROI positive)
├── [ ] Influencer / creator collaborations
├── [ ] Conference talks / workshops
├── [ ] Community ambassador program
└── [ ] International content expansion
```

## Step 6: Summary

Present the complete marketing plan summary:

```
MARKETING PLAN SUMMARY
=======================

Product: [Name]
Target Audience: [Who]
Budget: [Level]

COMPONENTS:
├── Brand Identity: [Status — Logo concept, colors, guidelines]
├── Content Writing: [Status — Pillars, blog plan, social plan]
├── Video Content: [Status — Series plan, scripts, calendar]
└── Unified Calendar: [Status — Monthly plan created]

KEY METRICS TO TRACK:
├── Brand: Logo consistency, recognition
├── Content: Traffic, SEO rankings, engagement
├── Video: Views, watch time, subscribers
├── Newsletter: Open rate, click rate, growth
└── Conversion: Downloads, sign-ups, stars

NEXT STEPS:
1. [ ] [First action item]
2. [ ] [Second action item]
3. [ ] [Third action item]
4. [ ] [Fourth action item]
5. [ ] [Fifth action item]

TIMELINE: [Phase] — [Current focus]
```

## Guidelines

- Start with brand identity — it informs everything else
- Ensure visual and voice consistency across all channels
- Focus on the 70/20/10 content rule (educate/brand/engage)
- Start with fewer channels done well, then expand
- Track KPIs from day one
- Review and adjust monthly
- Quality over quantity — especially early on

## Documentation

All marketing plan documents are saved to `docs/marketing/` in the project root directory:

```
docs/marketing/
├── brand-brief.md
├── brand-guidelines.md
├── content-strategy.md
├── content-calendar.md
├── video-strategy.md
├── video-calendar.md
├── social-media-plan.md
├── newsletter-plan.md
├── go-to-market.md
└── kpi-tracking.md
```
