# Implementation Plan: Math Memorization MVP

**Branch**: `001-math-memorization-mvp` | **Date**: 2026-07-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from [spec.md](spec.md)

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

We are building a Full-Stack Mathematical Memorization web app under the AntiGravity ecosystem.
- **Frontend**: Next.js App Router providing a responsive Mobile-First Learning Path (PWA) and a Desktop Admin Panel.
- **Database/Auth/Storage**: Supabase handles user records, level definitions, progress tracking, and assets (analogy images).
- **Core Engine**: A custom React reducer-based timer hook (`useGameEngine`) manages the 3-phase timing loop (30s Exposure -> 8s Shell Game Distractor -> Free Time Active Recall Multiple Choice).
- **Rendering**: Math equations are rendered natively in vector text via KaTeX.

## Technical Context

**Language/Version**: TypeScript / React 18 / Next.js 14 (App Router)

**Primary Dependencies**: `katex`, `@supabase/supabase-js`, `lucide-react`, `tailwindcss`

**Storage**: PostgreSQL (Supabase) + Supabase Storage (bucket: `analogy-images`)

**Testing**: N/A (Keep it simple, no unit tests requested in spec)

**Target Platform**: Mobile (PWA) / Desktop (Admin Panel)

**Project Type**: Full-Stack Web Application

**Performance Goals**: Page load under 1.5 seconds, phase transition latency < 100ms

**Constraints**: Bottom-third mobile navigation, zero punitive colors/screens, KaTeX render validation in Admin Panel

**Scale/Scope**: Initial MVP focusing on three learning channels (Aritmética, Álgebra, Física) and a desktop admin panel.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Gate 1: Estética Espacial y Enfoque No Punitivo**: PASS. UI components utilize smooth transitions and CSS-based float animations. Standard error screens are replaced with Neural Energy indicator bars and positive messaging.
- **Gate 2: Ciclo de Aprendizaje en Tres Fases**: PASS. The game logic follows the sequential phase flow with automated time constraints (30s max for Exposure, 8s fixed for Shell Game distractor, free time for Recovery).
- **Gate 3: Renderizado Matemático con KaTeX**: PASS. No equations are rendered using static image assets. KaTeX compiles LaTeX markup on both the server and client.
- **Gate 4: Diseño Mobile-First Centrado en el Pulgar**: PASS. Interactive controls (including bottom sheets and multiple-choice responses) are placed in the bottom 33% of the mobile screen.
- **Gate 5: Estado Especial "dx"**: PASS. Módulos in development will render with 40% opacity, `border-dashed` border, a maintenance icon, and will open a bottom sheet blocking access when tapped.

## Project Structure

### Documentation (this feature)

```text
specs/001-math-memorization-mvp/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/
│   └── api-contracts.md # Phase 1 output (/speckit-plan command)
└── checklists/
    └── requirements.md  # Spec Quality Checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (mobile)/
│   │   ├── path/                # Learning path view
│   │   └── game/[levelId]/      # Timing game engine screen
│   ├── (desktop)/
│   │   └── admin/               # Desktop admin panel
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── bottom-sheet.tsx
│   │   ├── energy-bar.tsx
│   │   └── katex-renderer.tsx
│   ├── game/
│   │   ├── exposure-phase.tsx
│   │   ├── distractor-phase.tsx # Shell Game (3 cups)
│   │   └── recovery-phase.tsx   # Multiple choice
│   └── learning-path/
│       ├── channel-column.tsx
│       └── level-node.tsx
├── hooks/
│   └── useGameEngine.ts
├── lib/
│   ├── supabase.ts
│   └── utils.ts
└── types/
    └── index.ts
```

**Structure Decision**: Next.js App Router project grouping pages under route groups `(mobile)` and `(desktop)` to segregate the PWA mobile views and desktop admin dashboards.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations detected.
