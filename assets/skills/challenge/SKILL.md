---
name: challenge
description: A fast self-critique nudge — re-examine the thing you just did (or the selected/named code) with a skeptical eye and report what could be better, WITHOUT self-congratulating. Lighter than /review-code SELF; it is a single pass, not a full review process. Use when the user says "challenge", "rethink", "check kĩ hơn", "soi lại", "phản biện", "tối ưu chưa", "is this optimal", "double check this", "any duplication", "có lặp code không", "did I overengineer", "second-guess this", "review what you just did".
---

# Challenge — Self-Critique Pass

A short, honest re-examination of the work in scope. The whole point is to **push back on your own output** instead of accepting it. You are the skeptic reviewing your own code, not the author defending it.

## What's in scope

Pick the target in this order:

1. **Selected / named code** — if the user selected lines or named a file/function/change, critique exactly that.
2. **The change you just made** — otherwise, critique the code you produced or edited most recently in this session (check the working diff if unsure).

If neither is clear, ask one line: "Soi cái gì — thay đổi vừa rồi hay chỗ nào cụ thể?" — then proceed.

## The one rule

> **Do not conclude "it's fine / already optimal" without evidence.** Assume something can be better and go find it. If after a genuine pass nothing real turns up, say so plainly and state what you checked — do not pad with fake concerns, and do not praise the code.

No sycophancy. No "great job, but…". Just: here is what I'd change and why.

## Pass — run every lens, keep only real hits

Go through each lens on the in-scope code. For each, either cite a concrete spot or move on silently.

| Lens | Ask |
|------|-----|
| **Simpler** | Is there a shorter / more direct way? Am I solving a problem I don't have? Any premature abstraction, needless layer, config, or generality? |
| **Duplication (DRY)** | Is this logic already implemented elsewhere in the codebase? Did I repeat a block that should be one helper? (Search before claiming "no dup".) |
| **Optimal** | Redundant work, N+1, re-fetch, re-compute in a loop, unnecessary allocation? Is the data structure the right one? |
| **Correctness edges** | Null / empty / boundary / large input / concurrent access / partial failure — which path did I not handle? |
| **Error handling** | Any swallowed error (empty catch, ignored return)? Failures must surface clearly and be logged, not muffled. |
| **Naming & footprint** | Misleading names? Did I rename/move things I didn't need to? Is any file getting too big / doing too much? |
| **Tests** | Is the risky path actually covered, or just the happy one? |

## Output

Keep it tight. For each real finding:

```
⚠️ <one-line problem>  ·  <file:line>
   → <concrete fix>
```

Then end with exactly one of:

- **Findings exist** → list them worst-first, then ask: "Áp dụng mấy cái này không?" (do not auto-edit).
- **Genuinely nothing** → "Đã soi <các lens> trên <scope>, không thấy vấn đề thực sự. Điểm cần lưu ý nếu mở rộng sau: <1 dòng, nếu có>." State what you searched so the "clean" verdict is earned, not assumed.

## Boundaries

- ❌ Full architecture / DDD audit with scoring → use `/review-code` (ARCHITECT mode).
- ❌ Reviewing a whole PR / branch to post to GitHub → use `/review-code` (PR mode).
- ❌ Actually implementing the fixes now → this skill *proposes*; apply only after the user says go.
