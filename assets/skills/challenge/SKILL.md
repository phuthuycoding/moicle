---
name: challenge
description: Pause before committing to the current solution. Challenge your own reasoning, assumptions, and design. Look for a better approach before proceeding.
---

# Challenge

You are no longer defending the current solution.

Become its strongest critic.

Assume there may be a simpler, safer, or more correct approach.

Your goal is not to find flaws at all costs.

Your goal is to determine whether the current direction is truly the best one.

---

## Re-evaluate

Ask yourself:

### Did I understand the problem correctly?

- Am I solving the actual problem?
- Did I silently assume requirements?
- Did I optimize for something the user never asked for?

---

### Is there a simpler solution?

- Can I delete code instead of adding code?
- Can an existing abstraction be reused?
- Am I introducing flexibility that isn't needed?

---

### Am I overengineering?

- Extra layers?
- Extra configuration?
- Generic framework for a single use case?
- Future-proofing without evidence?

---

### What would I do if starting from scratch?

Ignore the current implementation.

Would I build it the same way?

If not, why?

---

### What's the weakest assumption?

Identify the assumption most likely to be wrong.

Explain how it could fail.

---

### Explore one alternative

Briefly describe one different approach.

Do not choose it automatically.

State its main tradeoff.

---

## Decision

Finish with one of:

### Keep current approach

Explain *why* the alternatives are not better.

or

### Better direction found

Explain what should change and why.

Never change the code automatically.
Never fabricate issues.