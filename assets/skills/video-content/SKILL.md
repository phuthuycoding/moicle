---
name: video-content
description: Plan and produce video content strategy including scripts, storyboards, and production specs. Use when user says "create video", "video content", "video script", "video strategy", "youtube content", "video plan".
---

# Video Content Skill

Structured workflow for planning video content — from strategy and scripting to production specs and publishing schedule.

## Workflow Overview

```
STRATEGY → SCRIPT → STORYBOARD → PRODUCTION → PUBLISH
    │          │          │            │           │
    ▼          ▼          ▼            ▼           ▼
  Define    Write      Visual       Tech        Calendar
  Series    Scripts    Flow &      Specs &     & Platform
  & Goals   & Hooks   Scenes      Checklist   Distribution
```

## Recommended Agents

| Phase | Agent | Purpose |
|-------|-------|---------|
| STRATEGY | @docs-writer | Document content strategy |
| SCRIPT | @docs-writer | Write scripts and outlines |
| STORYBOARD | @docs-writer | Scene descriptions |
| PRODUCTION | @devops | Technical setup specs |
| PUBLISH | @docs-writer | Publishing calendar |

---

## Phase 1: STRATEGY

**Goal**: Define video content strategy, target audience, and series plan.

### Actions

1. Gather video strategy requirements from the user:

```
VIDEO CONTENT STRATEGY BRIEF
=============================

1. PURPOSE
   - What is the goal of your video content?
     [ ] Brand Awareness
     [ ] Product Education / Tutorials
     [ ] Community Building
     [ ] Lead Generation / Conversion
     [ ] Thought Leadership
   - Primary goal: [Answer]

2. TARGET AUDIENCE
   - Who will watch these videos?
   - Audience: [Answer]
   - Technical level: [Beginner / Intermediate / Advanced / Mixed]
   - Preferred language: [Answer]

3. PRODUCT / TOPIC
   - What product or topic are videos about?
   - Product: [Answer]
   - Key features to highlight: [Answer]
   - Unique selling points: [Answer]

4. PLATFORMS
   - Where will videos be published? (select all)
     [ ] YouTube (long-form)
     [ ] YouTube Shorts
     [ ] TikTok
     [ ] Instagram Reels
     [ ] LinkedIn
     [ ] X (Twitter)
     [ ] Website / Blog
     [ ] Dev.to / Hashnode

5. RESOURCES
   - Available equipment:
     [ ] Screen recording software
     [ ] Webcam / Camera
     [ ] Microphone
     [ ] Video editing software
     [ ] Animation tools
   - Budget: [Answer]
   - Team size: [Answer]

6. COMPETITORS / INSPIRATION
   - Channels or creators you admire:
     1. [Channel] - What you like: [Answer]
     2. [Channel] - What you like: [Answer]
   - Style preference: [Casual / Professional / Mix]
```

2. Define video series:

```
VIDEO SERIES PLAN
=================

Series 1: [Name] — [Type: Awareness / Education / Conversion]
├── Format: [Screen recording / Face cam / Animation / Mix]
├── Duration: [Length per video]
├── Frequency: [How often]
├── Platform: [Primary platform]
├── Episodes planned: [Number]
└── Videos:
    ├── EP01: [Title] — [Brief description]
    ├── EP02: [Title] — [Brief description]
    ├── EP03: [Title] — [Brief description]
    ├── EP04: [Title] — [Brief description]
    └── EP05: [Title] — [Brief description]

Series 2: [Name] — [Type]
├── Format: [Format]
├── Duration: [Length]
├── Frequency: [How often]
├── Platform: [Primary]
├── Episodes planned: [Number]
└── Videos:
    ├── EP01: [Title] — [Brief description]
    ├── EP02: [Title] — [Brief description]
    └── EP03: [Title] — [Brief description]

Series 3: [Name] — [Type: Shorts / Reels]
├── Format: [Format]
├── Duration: [15-60s]
├── Frequency: [How often]
├── Platform: [TikTok / Reels / Shorts]
├── Episodes planned: [Number]
└── Videos:
    ├── EP01: [Title] — [Brief description]
    ├── EP02: [Title] — [Brief description]
    └── EP03: [Title] — [Brief description]
```

### Output

- Video Content Strategy Brief
- Video Series Plan with episode list

### Gate

- [ ] Purpose and goals defined
- [ ] Target audience identified
- [ ] Platforms selected
- [ ] At least 2 video series planned
- [ ] Episode list for each series created

---

## Phase 2: SCRIPT

**Goal**: Write detailed scripts for each video.

### Actions

1. For each video, create a script using this template:

```
VIDEO SCRIPT
============

Title:    [Video Title]
Series:   [Series Name]
Episode:  [Number]
Duration: [Target length]
Platform: [Primary platform]
Type:     [Tutorial / Demo / Comparison / Tips / Story]

─────────────────────────────────────────

HOOK (0:00 - 0:10)
Goal: Grab attention in first 3 seconds

  [Visual]: [What appears on screen]
  [Audio]:  "[Exact words to say]"

  Hook Type: [Choose one]
  - Problem statement: "Are you tired of...?"
  - Bold claim: "This will change how you..."
  - Question: "Did you know...?"
  - Demo tease: "Watch what happens when..."

─────────────────────────────────────────

INTRO (0:10 - 0:30)
Goal: Set context and promise value

  [Visual]: [What appears on screen]
  [Audio]:  "[Exact words to say]"

  Key points to cover:
  - What this video is about
  - What viewer will learn/see
  - Why they should keep watching

─────────────────────────────────────────

MAIN CONTENT

Section 1: [Section Title] (0:30 - X:XX)

  [Visual]: [What appears on screen]
  [Action]: [What to demonstrate]
  [Audio]:  "[Narration/explanation]"

  Key Points:
  - [Point 1]
  - [Point 2]

  Commands/Code to show:
  ```
  [code or commands]
  ```

Section 2: [Section Title] (X:XX - X:XX)

  [Visual]: [What appears on screen]
  [Action]: [What to demonstrate]
  [Audio]:  "[Narration/explanation]"

  Key Points:
  - [Point 1]
  - [Point 2]

[Continue for each section...]

─────────────────────────────────────────

CONCLUSION (Last 15-30s)
Goal: Summarize and call to action

  [Visual]: [What appears on screen]
  [Audio]:  "[Exact words to say]"

  Summary points:
  - [Key takeaway 1]
  - [Key takeaway 2]

  Call to Action:
  - Primary CTA: [Subscribe / Try product / Visit link]
  - Secondary CTA: [Comment / Share / Next video]

─────────────────────────────────────────

METADATA

Title (SEO):       [YouTube/platform title, max 60 chars]
Description:       [2-3 sentence description]
Tags/Keywords:     [tag1, tag2, tag3, tag4, tag5]
Thumbnail Concept: [What the thumbnail should show]
End Screen:        [What to link to]
```

2. For short-form videos (Shorts/Reels/TikTok), use condensed format:

```
SHORT VIDEO SCRIPT
==================

Title:    [Title]
Duration: [15-60s]
Platform: [TikTok / Reels / Shorts]
Format:   [Vertical 9:16]

[0:00-0:03] HOOK
  [Visual]: [What appears]
  [Text overlay]: "[On-screen text]"
  [Audio]: "[Words or music]"

[0:03-0:XX] CONTENT
  [Visual]: [What appears]
  [Text overlay]: "[On-screen text]"
  [Audio]: "[Words or narration]"

[0:XX-0:XX] PAYOFF
  [Visual]: [Result/revelation]
  [Text overlay]: "[Final text]"
  [Audio]: "[Closing words]"

[End] CTA
  [Text overlay]: "Follow for more" / "[CTA text]"

Caption: [Platform caption with hashtags]
Hashtags: #tag1 #tag2 #tag3 #tag4 #tag5
Sound: [Original / Trending sound name]
```

### Output

Complete scripts for all planned videos

### Gate

- [ ] Each video has a complete script
- [ ] Hooks are compelling (first 3 seconds)
- [ ] Clear structure with timestamps
- [ ] CTAs included in every video
- [ ] SEO metadata defined

---

## Phase 3: STORYBOARD

**Goal**: Create visual flow and scene descriptions for each video.

### Actions

1. For each video, create a storyboard:

```
STORYBOARD
==========

Video: [Title]

Scene 1: [Scene Name]
┌─────────────────────────────┐
│ Timestamp: 0:00 - 0:10      │
│                              │
│ Visual: [Description of      │
│  what appears on screen]     │
│                              │
│ Text Overlay: [Any text]     │
│ Transition: [Cut/Fade/Zoom]  │
│ Audio: [Narration/Music]     │
└─────────────────────────────┘
        │
        ▼
Scene 2: [Scene Name]
┌─────────────────────────────┐
│ Timestamp: 0:10 - 0:30      │
│                              │
│ Visual: [Description]        │
│                              │
│ Text Overlay: [Any text]     │
│ Transition: [Type]           │
│ Audio: [Narration/Music]     │
└─────────────────────────────┘
        │
        ▼
[Continue for all scenes...]
```

2. Define visual style guide for the series:

```
VIDEO VISUAL STYLE GUIDE
========================

Screen Recording:
- Terminal theme: [Dark / Light / Custom]
- Terminal font size: [18-20px recommended]
- Browser: [Chrome / Firefox / etc.]
- Window arrangement: [Full screen / Split]
- Cursor highlight: [Yes / No]

Overlays & Graphics:
- Lower third: [Style description]
- Text overlays: [Font, Color, Position]
- Code highlights: [How to emphasize code]
- Arrow/pointer annotations: [Style]

Transitions:
- Between sections: [Cut / Crossfade / Zoom]
- Duration: [0.3s - 0.5s standard]

Intro Template:
- Duration: [3-5 seconds]
- Elements: [Logo animation + title]

Outro Template:
- Duration: [5-10 seconds]
- Elements: [Subscribe CTA + next video]

Thumbnail Template:
- Style: [Bold text + screenshot + face]
- Colors: [Brand colors]
- Font: [Bold, readable at small size]
- Layout: [Left text, right visual]
```

### Output

- Storyboard for each video
- Video visual style guide

### Gate

- [ ] All videos have scene-by-scene storyboards
- [ ] Visual style guide defined
- [ ] Transitions specified
- [ ] Overlay/graphic templates described
- [ ] Thumbnail template defined

---

## Phase 4: PRODUCTION

**Goal**: Define technical specs and create production checklist.

### Actions

1. Define production specifications:

```
PRODUCTION SPECS
================

Video Formats:
┌────────────────────────────────────────────────┐
│ Platform      │ Resolution │ Ratio │ FPS       │
├───────────────┼────────────┼───────┼───────────┤
│ YouTube       │ 1920x1080  │ 16:9  │ 60fps     │
│ YouTube Short │ 1080x1920  │ 9:16  │ 30fps     │
│ TikTok        │ 1080x1920  │ 9:16  │ 30fps     │
│ Instagram     │ 1080x1920  │ 9:16  │ 30fps     │
│ LinkedIn      │ 1920x1080  │ 16:9  │ 30fps     │
│ X/Twitter     │ 1920x1080  │ 16:9  │ 30fps     │
└────────────────────────────────────────────────┘

Audio:
- Format: AAC / WAV
- Sample rate: 48kHz
- Bitrate: 320kbps
- Noise reduction: Yes
- Music volume: -20dB under voice

Export Settings:
- Codec: H.264 / H.265
- Bitrate: 8-12 Mbps (1080p)
- Audio: AAC 320kbps
- Container: MP4
```

2. Create production checklist:

```
PRE-PRODUCTION CHECKLIST
========================

Before Recording:
- [ ] Script finalized and reviewed
- [ ] Storyboard ready
- [ ] Software/tools installed and configured
- [ ] Terminal theme set up (dark, font size 18+)
- [ ] Demo project/code prepared
- [ ] Test recording (audio + video quality)
- [ ] Close unnecessary apps and notifications
- [ ] Clear desktop/browser bookmarks bar

Recording:
- [ ] Screen recording started (correct resolution)
- [ ] Audio recording started (check levels)
- [ ] Face cam positioned (if applicable)
- [ ] Follow script scene by scene
- [ ] Pause between sections (for editing)
- [ ] Record each demo 2x (for best take)

Post-Production:
- [ ] Import footage into editor
- [ ] Rough cut (remove mistakes, pauses)
- [ ] Add intro/outro
- [ ] Add text overlays and annotations
- [ ] Add background music
- [ ] Color correction (if face cam)
- [ ] Add subtitles (Vietnamese + English)
- [ ] Export in correct format per platform
- [ ] Create thumbnail
- [ ] Write title, description, tags

Quality Check:
- [ ] Watch full video at 1x speed
- [ ] Audio clear and balanced
- [ ] Text readable on mobile
- [ ] No sensitive info visible (passwords, tokens)
- [ ] Subtitles accurate
- [ ] Links and CTAs correct
```

3. Recommend tools:

```
RECOMMENDED TOOLS
=================

Recording:
- OBS Studio (free) - Screen recording
- Asciinema - Terminal recording
- QuickTime (Mac) - Simple screen capture

Editing:
- DaVinci Resolve (free) - Professional editing
- CapCut (free) - Quick edits, shorts
- FFmpeg (free) - CLI video processing

Audio:
- Audacity (free) - Audio editing
- Noise reduction plugins

Graphics:
- Figma (free) - Thumbnails, overlays
- Canva (free) - Quick graphics

Subtitles:
- YouTube auto-captions + manual edit
- Subtitle Edit (free)

Music:
- YouTube Audio Library (free, royalty-free)
- Pixabay Music (free)
```

### Output

- Production specifications document
- Pre/post production checklists
- Tools recommendation

### Gate

- [ ] Technical specs defined per platform
- [ ] Production checklist created
- [ ] Tools identified and recommended
- [ ] Quality check process documented

---

## Phase 5: PUBLISH

**Goal**: Create publishing calendar and distribution plan.

### Actions

1. Create content calendar:

```
CONTENT CALENDAR — [Month/Year]
================================

WEEK 1: [Theme]
├── Mon: [Platform] — [Video Title] (Series: [Name])
├── Tue: [Platform] — [Video Title]
├── Wed: [Platform] — [Short Title] x3
├── Thu: [Platform] — [Video Title]
└── Fri: [Platform] — [Short Title]

WEEK 2: [Theme]
├── Mon: [Platform] — [Video Title]
├── Tue: [Platform] — [Video Title]
├── Wed: [Platform] — [Short Title] x3
├── Thu: [Platform] — [Video Title]
└── Fri: [Platform] — [Short Title]

WEEK 3: [Theme]
[Continue pattern...]

WEEK 4: [Theme]
[Continue pattern...]

────────────────────────────────────

POSTING SCHEDULE:
- YouTube long-form: [Day(s)], [Time] [Timezone]
- YouTube Shorts: [Day(s)], [Time]
- TikTok: [Day(s)], [Time]
- Instagram Reels: [Day(s)], [Time]
- LinkedIn: [Day(s)], [Time]
- X/Twitter: [Day(s)], [Time]
```

2. Define cross-posting strategy:

```
CROSS-POSTING STRATEGY
======================

One Video → Multiple Platforms:

Long-form Tutorial (8-12 min)
├── YouTube: Full video
├── Blog: Written tutorial version
├── X/Twitter: Key moment GIF + link
├── LinkedIn: Summary post + link
└── Clips: 3-5 short clips for Shorts/Reels/TikTok

Short Demo (30-60s)
├── YouTube Shorts: Vertical version
├── TikTok: With trending sound
├── Instagram Reels: With caption
├── X/Twitter: Direct upload
└── LinkedIn: Professional angle
```

3. Define KPIs and tracking:

```
VIDEO KPIs
==========

| Metric              | Target (Monthly) | Tool           |
|---------------------|-------------------|----------------|
| Total views         | [Target]          | Platform native |
| Watch time (hours)  | [Target]          | YouTube Studio  |
| Subscriber growth   | [Target]          | YouTube Studio  |
| Engagement rate     | [Target]%         | Platform native |
| Click-through rate  | [Target]%         | YouTube Studio  |
| Shorts views        | [Target]          | YouTube Studio  |
| TikTok followers    | [Target]          | TikTok Analytics|
| Website traffic     | [Target]          | Google Analytics|
```

### Output

- Monthly content calendar
- Cross-posting strategy
- KPI tracking sheet

### Gate

- [ ] Monthly calendar created
- [ ] Posting schedule with times and platforms
- [ ] Cross-posting strategy defined
- [ ] KPIs and targets set
- [ ] User approved the publishing plan

---

## Quick Reference

### Phase Summary

| Phase | Goal | Key Output |
|-------|------|------------|
| STRATEGY | Define goals & series | Content Strategy Brief |
| SCRIPT | Write video scripts | Complete scripts with hooks |
| STORYBOARD | Visual scene planning | Scene-by-scene flow |
| PRODUCTION | Tech specs & checklists | Production-ready specs |
| PUBLISH | Calendar & distribution | Publishing schedule |

### Success Criteria

- [ ] Video strategy aligned with business goals
- [ ] At least 2 video series planned
- [ ] Scripts written with compelling hooks
- [ ] Storyboards with visual flow
- [ ] Production specs per platform
- [ ] Quality checklist followed
- [ ] Publishing calendar created
- [ ] Cross-posting strategy defined
- [ ] KPIs set and tracking plan ready
