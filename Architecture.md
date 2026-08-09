# XcelerateAI Command Center

## Architecture Guide

---

# Purpose

This document describes the technical architecture of the XcelerateAI Command Center.

It exists to help developers and AI assistants understand the current system before implementing changes.

---

# Technology Stack

Frontend

- React
- Vite
- React Router
- TailwindCSS

Development

- Git
- GitHub
- Docker
- WSL2
- VS Code

Future

- Backend API
- Database
- Authentication
- Cloud synchronization

---

# Current Architecture

Current application is frontend-first.

Data is primarily stored locally.

Backend infrastructure has not yet been introduced.

Phase 9 begins backend development.

---

# Folder Philosophy

Organize by responsibility.

Example:

src/

components/
pages/
context/
hooks/
utils/
assets/

Avoid deeply nested folders unless they improve clarity.

---

# State Management

Current global state is managed through React Context.

Avoid unnecessary global state.

Local component state should remain local whenever practical.

Future backend synchronization should integrate cleanly without major rewrites.

---

# Routing

React Router handles page navigation.

Pages should remain independent where possible.

Avoid tightly coupling page logic.

---

# Components

Components should be:

- reusable
- composable
- readable
- focused on one responsibility

Large components should be broken into smaller reusable pieces.

---

# UI Principles

Cockpit aesthetic.

Premium appearance.

Minimal interface.

Whitespace is intentional.

No unnecessary decoration.

---

# Styling

TailwindCSS.

Avoid inline styling unless necessary.

Prefer reusable utility patterns.

Maintain consistency.

---

# Data Philosophy

Application logic belongs inside the application.

JSON should describe learning content.

Do not place application logic inside roadmap JSON.

---

# Backend Philosophy

Backend should eventually provide:

- authentication
- cloud save
- synchronization
- user profiles
- roadmap storage
- backup storage
- API endpoints

Frontend should remain usable with minimal architectural disruption.

---

# Performance

Prioritize:

- simplicity
- maintainability
- responsiveness

Avoid premature optimization.

Measure before optimizing.

---

# Error Handling

Never use browser alerts.

Use reusable cockpit UI components.

Current feedback components include:

- StatusBanner
- ConfirmAction
- LoadingIndicator
- InlineStatus

---

# Security

Never expose secrets.

Environment variables belong in .env.

Future authentication should follow modern security practices.

---

# Git Philosophy

Feature branches.

Release branches.

Main branch remains stable.

Every significant feature should have a dedicated branch.

---

# AI Development Rules

Before making changes:

1. Read PROJECT_GUIDE.md
2. Read ARCHITECTURE.md
3. Scan the repository
4. Understand existing architecture

Never make architectural changes without explicit approval.

Always explain:

- why a change is needed
- benefits
- possible risks

---

# Current Objective

Current repository represents the stable frontend foundation.

Upcoming work focuses on transforming the application into a cloud-backed learning platform while preserving the existing user experience.
