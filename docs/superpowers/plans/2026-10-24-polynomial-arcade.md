# Polynomial Arcade Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver colourful polynomial games with active skills and flexible attendance, with a live 32-student verification.
**Architecture:** Extend the existing pure match reducer and transactional API; keep skill constants browser-safe. Original SVG arena and CSS themes reuse current game state and maths rendering.
**Tech Stack:** Existing Next.js 16, TypeScript, React, Firebase and Playwright; no new dependencies.
**Spec:** docs/superpowers/specs/2026-10-24-polynomial-arcade-design.md

## Global constraints
English UI in copy.ts; public-code-only NumSprite research; preserve existing school content, server marking and anonymous student access. User explicitly authorises live simulation. Tests use own rooms only.

## Review focus
- Duplicate skill activation or concurrent opposing pulls must not duplicate energy or shield effects.
- A late join during a solved/partly answered round must not block the original student or receive free credit.
- Empty seats must not prevent solo progression; zero-player rooms cannot start.
- Legacy active rooms must render and play without new fields.
- Four answers, skill costs and team status remain legible on 360px phones and an eight-group projector.

## Tasks
- [x] 1. Attempt baseline production 32-browser simulation; record quota failure in round 12. Owner requests local continuation; fresh live completion remains pending quota.
- [x] 2. Write failing unit checks in tests/unit/polynomial-tug-skills.test.ts and extend tests/challenges/polynomial-tug.test.ts. Implement types.ts, skills.ts, game.ts, server/polynomialTug.ts and API actions; pass unit/emulator checks.
- [x] 3. Redesign Rope.tsx and Tug UI/CSS, add a SkillTray, update Quest art/style and copy. Verify joined-player counts, queued late joins, skill activation and accessible four-choice layout.
- [ ] 4. Run integration/browser regression, lint/types/build, inspect screenshots. Publish only the verified scope through existing GitHub integration; verify Vercel READY and live flows.

## Operational addition
Production quota failure requires own-match reads for seated pupils, short coalesced read caching, no negative membership cache, backoff on service quota, and no polling after completed student games. Writes remain fresh transactions. Evidence and rulings: 2026-10-24-polynomial-arcade-ledger.md.
