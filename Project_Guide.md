# XcelerateAI Command Center

## Project Guide (AI & Developer Reference)

---

# Purpose

XcelerateAI Command Center is a cockpit-style learning operating system designed to guide learners through structured bootcamps.

It is NOT a generic LMS.

It is NOT a task manager.

It is an execution platform that turns learning roadmaps into daily missions, tracks progress, stores evidence, and eventually synchronizes across devices.

---

# Product Vision

The Command Center should feel like entering the cockpit of an advanced spacecraft.

Everything should communicate:

- clarity
- focus
- momentum
- mission control
- premium quality

Never clutter.

Never childish.

Never "shopping website."

---

# Primary Objectives

The platform should allow users to:

- Import learning roadmaps
- Execute daily missions
- Track weekly progress
- Save proof of work
- Build projects
- Track blockers
- Review checkpoints
- Export backups
- Synchronize progress (future backend)
- Support multiple bootcamps
- Scale cleanly

---

# Design Philosophy

Every feature should satisfy:

✔ Clean
✔ Minimal
✔ Premium
✔ Fast
✔ Responsive
✔ Cockpit aesthetic

Avoid unnecessary animations.

Avoid clutter.

Whitespace is intentional.

---

# UX Principles

Never use:

- browser alert()
- browser confirm()
- browser prompt()

Instead use reusable cockpit UI components.

Current UI primitives include:

- StatusBanner
- ConfirmAction
- LoadingIndicator
- InlineStatus

---

# Development Philosophy

Prefer:

Small reusable components.

Readable code.

Simple architecture.

Avoid duplication.

Avoid premature optimization.

Build for future scalability.

---

# Coding Standards

- Prefer composition over duplication.
- Keep components modular.
- Mobile-first responsive design.
- Keep naming consistent.
- Never break existing UX.
- Every major feature should be reusable.

---

# Git Workflow

Feature work happens on dedicated branches.

Merge into release branch.

Release branch eventually merges into main.

Never work directly on main.

---

# Current Status

Current milestone:

Phase 8B.5 complete.

Phase 9 beginning.

Current repository is stable.

Build passes successfully.

---

# Upcoming Major Phase

Phase 9 introduces backend infrastructure.

Goals include:

- Authentication
- Database
- API
- Cloud synchronization
- Persistent storage
- Docker development environment

---

# Future Improvements (Do Not Implement Yet)

These ideas are intentionally postponed until the backend is complete.

Examples include:

- Engineering Hint system
- Prerequisite detection
- Improved onboarding guidance
- Enhanced JSON schema
- Premium UI polish
- Additional cockpit refinements

These will be revisited after backend completion.

---

# JSON Philosophy

Roadmaps should describe learning.

They should not contain application logic.

The application should interpret JSON.

JSON should remain modular and extensible.

---

# Role of AI

AI assistants should:

- preserve architecture
- avoid unnecessary rewrites
- prioritize maintainability
- explain major changes
- respect existing design decisions

Never redesign the project without explicit approval.

---

# First Task for AI

Before making any code changes:

1. Read the repository.
2. Understand the architecture.
3. Produce a report including:

- folder structure
- architecture summary
- reusable components
- current data flow
- possible bugs
- duplicated code
- scalability concerns
- technical debt
- opportunities for refactoring

Do NOT edit any files.

Do NOT create commits.

Do NOT modify code.

Only produce a comprehensive analysis report.

Wait for approval before implementation.
