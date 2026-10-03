# AI Constitution

## Purpose

This document defines the non-negotiable principles that every AI assistant working on the XcelerateAI Command Center must follow.

These principles override implementation preferences and generic software best practices whenever they conflict.

---

# Mission

The XcelerateAI Command Center is a Learning Operating System.

Its purpose is to transform structured bootcamp data into an engaging, scalable, motivating and world-class learning experience.

The software exists to improve learning outcomes.

Every technical decision must support that objective.

---

# Core Principles

## 1. Learning First

If a technical shortcut reduces learning quality, do not implement it.

Learning quality is always more important than implementation convenience.

---

## 2. Human Learning

The learner must understand concepts through practice.

AI assists.

AI does not replace learning.

---

## 3. Scalability

Never implement solutions that only work for a single bootcamp.

Everything should be designed to support unlimited future bootcamps.

---

## 4. Extensibility

Avoid hardcoded assumptions.

The platform should be capable of supporting new learning models without architectural rewrites.

---

## 5. Simplicity

Complexity should exist inside the software architecture.

The learner should experience simplicity.

---

## 6. Maintainability

Choose solutions that remain understandable months and years later.

Future contributors should easily understand why a decision was made.

---

## 7. Premium Experience

The Command Center should feel premium.

Animations, interactions and visual polish should reinforce learning rather than distract from it.

---

# AI Behaviour

Before making architectural decisions:

- Explain the reasoning.
- Explain trade-offs.
- Wait for approval before major structural changes.

---

# Never Assume

Never assume:

- a specific bootcamp exists
- Elliot is mandatory
- every bootcamp has identical structure
- every mission requires the same amount of detail

---

# Protected Design Principles

Do not redesign these without explicit approval:

- cockpit philosophy
- mission-first learning flow
- JSON-driven architecture
- progression system
- roadmap philosophy
- one-section-at-a-time learning

---

# Technical Principles

Never:

- hardcode bootcamp-specific logic
- tightly couple frontend to backend
- sacrifice extensibility for convenience
- duplicate architecture unnecessarily

Always prefer reusable systems.

---

# Learning Principles

Confusion should come from solving problems.

Never from understanding instructions.

The learner should always understand:

- what they are building
- why they are building it
- what success looks like

## Skill Check and Quiz Work

Whenever creating, regenerating, reviewing, validating, or repairing Skill Checks, curriculum quiz questions, multiple-choice assessments, or learner knowledge checks, read and follow [`SKILL_CHECK_AUTHORING_STANDARD.md`](./SKILL_CHECK_AUTHORING_STANDARD.md) in full.

That standard is authoritative for assessment quality. Do not generate assessments from templates or curriculum metadata alone: first inspect the relevant competencies, assigned Study, Studio activity, Build, prerequisites, and intended learning outcomes. Where older informal quiz-generation behavior conflicts with the explicit standard, the standard governs unless a higher repository authority explicitly says otherwise.

---

# Final Rule

When in doubt:

Choose the option that creates a better learning experience.
