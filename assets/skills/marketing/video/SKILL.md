---
name: marketing-video
description: Plan and produce video content strategy including scripts, storyboards, and production specs. Use when user says "create video", "video content", "video script", "video strategy", "youtube content", "video plan".
---

# Video Content Skill

Plan video content end-to-end: strategy, script, storyboard, production spec, publishing schedule.

## When to use this skill

- ✅ Planning a video series or campaign (multi-video)
- ✅ Need a script + storyboard + production spec for a single video
- ✅ Repurposing existing long-form into shorts / clips
- ❌ Just need ideas, not a plan → use `brainstorm`
- ❌ Want full marketing plan (logo + content + video) → use `/marketing`
- ❌ Writing a blog post or thread → use `/marketing:content`

---

## Workflow

```
STRATEGY → SCRIPT → STORYBOARD → PRODUCTION → PUBLISH
```

---

## Phase 1: STRATEGY

**Goal:** lock the audience, goal, channels, and series plan.

### Gather brief

Ask the user (skip what's already known):

| Field | Example |
|-------|---------|
| Primary goal (pick 1) | brand awareness / tutorial / lead gen / community / thought leadership |
| Audience | "Senior backend engineers evaluating Postgres tooling" |
| Channels (pick ≤3) | YouTube long / YouTube Shorts / TikTok / Reels / LinkedIn / X / Twitch |
| Cadence | "1 long video / week + 3 shorts" |
| Series concept | "From-zero series: build a SaaS in 10 episodes" |
| Tone | "Casual, technical, no fluff" |
| Existing assets | brand kit URL, prior videos, channel stats |

### Output: 1-page strategy

```markdown
## Video Strategy: {brand}
- Goal: {one line}
- Audience: {one line}
- Channels: {list, with primary marked}
- Cadence: {long-form + shorts schedule}
- Series: {2-4 series, each with theme + episode count target}
- Brand: {voice, colors, logo lockup}
```

### Gate
- [ ] Goal + audience confirmed by user
- [ ] Channels matched to where audience watches
- [ ] At least 1 series concept defined

---

## Phase 2: SCRIPT

**Goal:** write a script that holds attention from frame 1.

### Universal structure

```
HOOK (≤10 sec, ≤30 sec for long-form)
  - one of: contrarian claim / surprising number / pain question / curiosity gap
INTRO (≤15 sec)
  - what they'll get + why this person/channel
BODY
  - one idea per segment, each ≤90 sec for long-form, ≤15 sec for shorts
  - pattern interrupt every 30-45 sec (cut, b-roll, on-screen text)
PAYOFF
  - the answer / the demo / the result
CTA (≤10 sec)
  - one ask: subscribe, link, comment with X
```

### Hook examples (pick a type, write 3 variants)

| Type | Example |
|------|---------|
| Contrarian | "Everyone tells you to write tests first. Here's why I stopped." |
| Number | "I shipped 47 features last quarter with 1 engineer. Here's how." |
| Pain question | "Your DB is slow at 100k rows? That's a config issue, not a Postgres limit." |
| Curiosity gap | "There's a feature in Go that nobody uses but it solves your timeout bug." |

### Script length budget

| Format | Total | Hook | Body | CTA |
|--------|-------|------|------|-----|
| YouTube long | 8-15 min | 10-30 s | 7-13 min | 10-30 s |
| YouTube Short / Reel / TikTok | 30-60 s | ≤3 s | 25-50 s | ≤5 s |
| LinkedIn native | 1-3 min | ≤5 s | 50 s - 2 min 30 s | ≤10 s |

### Gate
- [ ] Hook tested by reading frame 1 aloud — would you keep watching?
- [ ] One idea per segment (no parallel threads)
- [ ] Pattern interrupt every ≤45 sec (long-form)
- [ ] CTA is one ask, not three

---

## Phase 3: STORYBOARD

**Goal:** visual plan that the editor / camera-op can execute without asking questions.

### Scene table (one row per cut)

| # | Time | Visual | Audio | Text overlay | Asset needed |
|---|------|--------|-------|--------------|--------------|
| 1 | 0:00-0:08 | Talking head, medium shot | Hook line | (none) | — |
| 2 | 0:08-0:25 | Screen recording: IDE | VO | "Step 1: install" | terminal recording |
| 3 | 0:25-0:40 | B-roll: server rack | VO | (none) | stock or own footage |

### Visual rules (project-wide)

- Aspect ratio: 16:9 (YouTube long) / 9:16 (shorts, Reels, TikTok) / 1:1 (LinkedIn native fallback)
- Captions ALWAYS burned in for shorts (most viewers watch muted)
- Brand bug in bottom-right (long-form only) for first 5 sec + last 10 sec
- Max 2 fonts (display + body)
- Stick to brand palette (link to logo guidelines if available)

### Gate
- [ ] One row per cut
- [ ] All assets listed and sourced (or "to record")
- [ ] Captions plan in place for muted viewing
- [ ] Aspect ratio matches the channel

---

## Phase 4: PRODUCTION

**Goal:** ship a production-ready file the publisher can upload without rework.

### Tech spec per channel

| Channel | Resolution | FPS | Codec | Max length | Notes |
|---------|-----------|-----|-------|-----------|-------|
| YouTube long | 1080p or 4K | 30 / 60 | H.264 | 12 h | Chapters required for >5 min |
| YouTube Shorts | 1080×1920 | 30 / 60 | H.264 | 60 s | Vertical |
| TikTok | 1080×1920 | 30 / 60 | H.264 | 10 min | Caption per scene |
| Instagram Reels | 1080×1920 | 30 | H.264 | 90 s | First frame = thumbnail |
| LinkedIn native | 1920×1080 / 1080×1080 | 30 | H.264 | 10 min | Captions burned in |
| X (Twitter) | 1280×720+ | 30 / 60 | H.264 | 2 min 20 s | Add caption file |

### Audio
- Voice: -3 dBFS peak, -16 LUFS integrated
- Music bed: -20 dBFS under voice, royalty-cleared (Epidemic, Artlist, or licensed)
- Cuts: trim every breath / um / "so" — tight pacing matters

### Pre-publish checklist
- [ ] Color graded (consistent across cuts)
- [ ] Audio levels normalized
- [ ] Captions / subtitles burned in (where required) and SRT file for accessibility
- [ ] Thumbnail designed (3 variants for A/B if YouTube)
- [ ] Title written (≤60 chars, includes primary keyword)
- [ ] Description with timestamps, CTAs, links

### Gate
- [ ] Tech spec matches target channel
- [ ] Thumbnail tested at small size (mobile feed)
- [ ] First 3 sec works without sound

---

## Phase 5: PUBLISH

**Goal:** get the video in front of the audience and measure.

### Per-channel adaptation

- **YouTube long:** publish + immediately pin a comment with key timestamps + first-hour engagement push
- **Shorts:** publish 3-5x/week for algorithm; don't link in description (kills reach)
- **TikTok:** publish in batches at 7 PM local; respond to first 10 comments within 1 hour
- **LinkedIn:** native upload (don't link YouTube); post in first hour of work day
- **X:** native video; thread = video + 3-5 text takeaways

### Cross-posting
- Cut shorts from long-form (3-5 per long video)
- Convert key insight into LinkedIn carousel + X thread
- Embed in blog post (boosts both)

### Tracking
- UTM tags on all description links: `?utm_source=youtube&utm_medium=video&utm_campaign={series}`
- Watch: average view duration, retention curve (cliff = where to cut next time), CTR on thumbnail
- Iterate: kill formats with <30% retention after 3 attempts

### Gate
- [ ] Adapted per channel (no copy-paste)
- [ ] UTMs applied
- [ ] Tracking dashboard updated

---

## Final Report

```markdown
## Video Plan: {brand / series}

### Strategy
- Goal: {one line}
- Audience: {one line}
- Channels: {primary + secondary}

### Videos Planned (next 4 weeks)
| # | Title | Format | Channel | Status |
|---|-------|--------|---------|--------|
| 1 | ... | long | YouTube | scripted |
| 2 | ... | short | Reels + TikTok + Shorts | storyboard |

### Production Backlog
- {script ready, awaiting recording}
- {recording done, awaiting edit}

### Metrics
- Baseline → Target per video and per series
```

---

## Hard Rules

- **Hook decides everything** — if first 3 sec doesn't work, nothing after matters
- **Captions for muted viewing** — most feed views are sound-off
- **One ask in the CTA** — multiple CTAs = zero conversions
- **Vertical for mobile-first channels** — never reupload 16:9 to TikTok / Shorts
- **Kill what doesn't work after 3 attempts** — don't keep producing for an audience that isn't there

---

## Related Skills

| When | Use |
|------|-----|
| Full marketing plan (logo + content + video) | `/marketing` |
| Need brand visuals first | `/marketing:logo` |
| Repurpose video → blog / threads | `/marketing:content` |
| Brainstorm video topics | `brainstorm` |

---

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| STRATEGY | `@docs-writer` | Document the strategy brief |
| SCRIPT | `@docs-writer` | Draft and tighten scripts |
| STORYBOARD | `@docs-writer` | Scene descriptions |
| PRODUCTION | `@devops` | Tech specs + encoding |
| PUBLISH | `@docs-writer` | Channel adaptations + tracking |
