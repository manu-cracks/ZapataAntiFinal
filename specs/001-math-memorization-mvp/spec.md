# Feature Specification: Math Memorization MVP

**Feature Branch**: `001-math-memorization-mvp`

**Created**: 2026-07-07

**Status**: Draft

**Input**: User description: "MVP requirements including learning path navigation with channels, Supabase DB schema, 3-phase game timer engine."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Learning Path Navigation and Level States (Priority: P1)

As a student, I want to view a vertical roadmap representing my learning progression across Aritmética, Álgebra, and Física, so that I can see my progress and select my next challenge.

**Why this priority**: Core entry point of the application. Allows users to navigate and interact with the content.

**Independent Test**: The learning path must render three columns/channels, correctly showing levels with distinct visual treatments for "active", "locked", and "dx" states. Clicking "dx" must trigger a non-punitive bottom sheet warning.

**Acceptance Scenarios**:

1. **Given** a user has completed the prerequisite level, **When** they view the learning path, **Then** the next level status is "active", allowing interaction.
2. **Given** a user hasn't completed prerequisites, **When** they view the learning path, **Then** the subsequent level status is "locked", blocking interaction.
3. **Given** a level is under development, **When** they view the learning path, **Then** it shows as "dx" (40% translucent, dashed border, maintenance icon), and clicking it opens a Bottom Sheet explaining it is in progress.

---

### User Story 2 - Three-Phase Memorization Game Engine (Priority: P2)

As a student, I want to experience a timed cycle of exposure, distraction, and active recall, so that I can commit formulas to long-term memory.

**Why this priority**: This is the core cognitive mechanism of the AntiGravity learning system.

**Independent Test**: Selecting an active level launches the timer engine, validating phase transitions: exposure (with skip) -> distractor (exactly 8 seconds) -> recovery (free time recall).

**Acceptance Scenarios**:

1. **Given** a user starts a level, **When** Fase 1 begins, **Then** the formula is rendered tipographically via KaTeX with a 30-second countdown and a "Listo" button.
2. **Given** the user clicks "Listo" or 30 seconds pass, **When** transitioning to Fase 2, **Then** a high-intensity distractor game (Shell Game / 3 Cups) runs for exactly 8 seconds.
3. **Given** the 8-second distractor ends, **When** transitioning to Fase 3, **Then** the user is presented with a real-life analogy with the formula hidden, and must select the correct answer from 4 multiple-choice options.

---

### User Story 3 - Database Persistence & Learning Path Mapping (Priority: P3)

As a student, I want my level progression and status records to be persisted under my authenticated account, so that my learning history is saved between sessions and devices.

**Why this priority**: Essential for session persistence and progression mechanics.

**Independent Test**: Completing a level successfully triggers database updates, updating the next level's state from "locked" to "active" in subsequent loads.

**Acceptance Scenarios**:

1. **Given** a logged-in user finishes Fase 3, **When** they submit a correct recall response, **Then** their level completion state is saved, and the next level is unlocked.
2. **Given** a logged-in user, **When** the app loads, **Then** the learning path is populated dynamically from the persisted database records.

---

### Edge Cases

- **Session Interruption**: If the user exits the app during the distractor (Fase 2) or exposure (Fase 1), the session resets, returning them to the learning path without saving progress.
- **Formulas failing to load**: If KaTeX processing fails, the system must display the raw formula text in a clean, readable fallback format without throwing an error or halting the flow.
- **Offline Mode**: If the user loses internet connection, level progress should be cached locally and synced once connection is re-established.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST structure the learning path into independent channels: Aritmética, Álgebra, and Física (active), plus Geometría, Trigonometría, Razonamiento Matemático, and Química (visually locked with a "Próximamente" badge and cursor-not-allowed).
- **FR-002**: The system MUST support level states: "active", "locked", and "dx".
- **FR-003**: The mobile UI MUST render "dx" levels with 40% opacity, a dashed border, a maintenance icon, and block interaction using an informative Bottom Sheet.
- **FR-004**: All mathematical formulas MUST be rendered natively as text using KaTeX. Static image equations are strictly forbidden.
- **FR-005**: The system MUST automate the 3-phase game loop:
  - Fase 1 (Exposición): max 30s, displays formula, provides "Listo" skip button.
  - Fase 2 (Distractor): exactly 8s, high-intensity visual/motor Shell Game (3 cups).
  - Fase 3 (Recuperación): free time, presents real-life analogy, formula is hidden.
- **FR-006**: Mobile navigation controls and main interactive buttons MUST be placed within the bottom third of the screen, and the learning path columns MUST implement a collapsible accordion layout organized in a responsive 2-column grid (`grid-cols-2`) to prevent vertical scrolling fatigue and optimize mobile ergonomics.
- **FR-007**: Error states MUST NOT use red colors or punitive text (e.g., "Error", "Incorrecto"). The UI MUST utilize kinetic/neural energy bars and encouraging growth-mindset feedback.
- **FR-008**: The database MUST store: channels, levels, states, real-life analogies, and user progress logs.
- **FR-009**: The system MUST implement a Shell Game (3 cups) as the Phase 2 distractor mechanic, requiring high cognitive focus shift.
- **FR-010**: The active recall validation in Phase 3 MUST be a Multiple Choice mechanic, where the user selects the correct formula or value from 4 options.
- **FR-011**: The system MUST require user authentication via full email and password signup/login using Supabase Auth.
- **FR-012**: The system MUST enforce single administrator security roles, where only the official email `enzocostareyes@gmail.com` can access `/admin`. Access must be secured at the database level with RLS.
- **FR-013**: All media assets uploaded via the Admin panel MUST be optimized client-side and converted to `.webp` format before uploading to the `analogias-imagenes` storage bucket.
- **FR-014**: The student's course progression percentages MUST be calculated dynamically on-demand using a relational Postgres function (`public.obtener_progreso_cursos`) to count completed levels against total levels per channel, ensuring immediate consistency when new levels are published.

### Key Entities *(include if feature involves data)*

- **User**: Represens the student. Authenticated via Supabase Auth (email/password).
- **Channel**: Represents a learning track (e.g., Aritmética). Has name and description.
- **Level**: Represents a unit of study. Belongs to a Channel. Contains a math formula (KaTeX string), state ("active", "locked", "dx"), prerequisite level reference, and order index.
- **Analogy**: Represents the real-world application of a formula. Contains visual asset reference (stored in storage) and recall question.
- **UserProgress**: Tracks completion of levels. Contains user reference, level reference, completion timestamp, and achieved energy score.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The learning path page loads and displays all level states within 1.5 seconds on standard mobile networks.
- **SC-002**: 100% of mathematical equations render as vector text (KaTeX) without horizontal layout breaking on mobile devices.
- **SC-003**: The transition from Fase 1 to Fase 2, and from Fase 2 to Fase 3 occurs automatically with less than 100ms latency.
- **SC-004**: Zero instances of punitive terminology ("Error", "Incorrecto") or red screen indicators appear in user-facing error interfaces.
- **SC-005**: 95% of first-time users can navigate and launch a level using only their thumb without resizing or shifting hands.

## Assumptions

- Users have basic internet connectivity for fetching Supabase records and assets.
- Mobile devices support standard touch actions and modern browser engines (PWA support).
- Math formulas are defined in standard LaTeX format suitable for KaTeX parsing.
