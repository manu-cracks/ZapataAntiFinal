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

**Storage & Media Optimization**:
- Database: PostgreSQL (Supabase)
- Storage Bucket Oficial: `analogias-imagenes`
- Regla de Arquitectura de Media: Toda imagen subida desde el Panel Admin debe ser transformada localmente en el cliente a formato `.webp` (calidad 0.8) antes de su carga, para optimizar el espacio en disco de Supabase Storage y el rendimiento de carga en el cliente móvil.

**Seguridad y Control de Roles**:
- Administrador único oficial: `enzocostareyes@gmail.com`.
- El control de acceso está delegado a la base de datos mediante la función `public.es_administrador()` y las tablas de perfiles, garantizando un blindaje estricto por RLS en las tablas `niveles` y `progreso_usuarios` (basado en `auth.uid()`).

**Arquitectura de la UI y Cursos Dinámicos**:
- La entidad "Cursos" (canales) es dinámica y se almacena en la tabla `public.canales` de la base de datos (con soporte para estados `active` y `dx` para desarrollo/bloqueo).
- El Panel Administrativo se rige bajo una arquitectura segmentada por pestañas (tabs) que filtra los niveles según el curso seleccionado, garantizando la escalabilidad del MVP.
- Al crear un nuevo nivel, el formulario preselecciona automáticamente el curso correspondiente a la pestaña activa.
- La Ruta de Aprendizaje del alumno implementa un diseño de acordeón colapsado por defecto, organizado en una cuadrícula bicolumna responsiva (`grid-cols-2`) para optimizar el espacio visual y la ergonomía táctil en dispositivos móviles, reduciendo significativamente el scroll vertical. Los cursos activos muestran sus niveles, mientras que los cursos marcados como "En Desarrollo" (`dx`) se renderizan al final de la lista, sutilmente opacados, con la etiqueta "Próximamente" y bloqueo de interacción.
- El progreso de los usuarios en cada curso se calcula en tiempo real bajo demanda mediante la función de base de datos `public.obtener_progreso_cursos(user_id_param UUID)`, dividiendo los niveles completados entre el total de niveles por canal. Esto elimina el almacenamiento estático de porcentajes y garantiza la consistencia del progreso al añadir o remover niveles desde el panel administrativo.

**Testing**: N/A (Keep it simple, no unit tests requested in spec)

**Target Platform**: Mobile (PWA) / Desktop (Admin Panel)

**Performance Goals**: Page load under 1.5 seconds, phase transition latency < 100ms

**Constraints**: Bottom-third mobile navigation, zero punitive colors/screens, KaTeX render validation in Admin Panel

**Scale/Scope**: MVP ampliado con soporte dinámico para la creación y visualización de cursos ilimitados, segmentados por categorías, y gestionados desde un panel de control jerárquico.

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

## Production Environment Configuration

> [!IMPORTANT]
> **Supabase Auth Configuration for Vercel Deployment**:
> To ensure sessions and cookies are handled correctly and Row Level Security (RLS) policies using `auth.uid()` work in production:
> 1. Go manually to the **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
> 2. Under **Site URL**, or by adding in **Redirect URLs**, configure the official production deployment URL:
>    `https://zapata-anti-final.vercel.app/**`
> 
> This configuration allows Supabase to securely sign in and redirect users back to the Vercel domain, avoiding origin mismatch errors and token rejections.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations detected.
