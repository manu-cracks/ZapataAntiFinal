# Quickstart Validation Guide: Math Memorization MVP

This guide documents the procedures to set up the development environment and manually validate that the MVP functions according to requirements.

## 1. Prerequisites & Setup

Ensure the following environments are set up:
- **Node.js**: v18.0.0 or higher
- **Supabase**: Access to a Supabase project (with PostgreSQL and a Storage bucket named `analogy-images`)

### Dependency Installation

The core dependencies for this project are:
- `next`: ^14.0.0 (using App Router)
- `@supabase/supabase-js`: ^2.39.0
- `katex`: ^0.16.9 (for native equations rendering)
- `lucide-react`: ^0.300.0 (icons)
- `tailwindcss`: ^3.3.0

Run the initialization commands in the workspace:
```bash
npm install katex @supabase/supabase-js lucide-react
npm install -D tailwindcss postcss autoprefixer
```

---

## 2. Validation Scenarios

Follow these manual testing scenarios to verify implementation correctness.

### Scenario A: Responsive Learning Path Routing (Mobile/PWA Focus)
*   **Purpose**: Verify the vertical path of levels renders correctly for Aritmética, Álgebra, and Física, and that "dx" modules display correctly.
*   **Prerequisites**: Seed database with at least one active, one locked, and one "dx" level (see [data-model.md](data-model.md)).
*   **Steps**:
    1. Open the application on a mobile screen size.
    2. Navigate to `/path` (Learning Path view).
    3. Verify that the three channels render vertically, with primary interaction buttons situated in the bottom 33% of the viewport (thumb-friendly UX).
    4. Click the "dx" level:
        *   **Expected**: Bottom sheet pops up informing the user that the module is under development; no page transition occurs.
    5. Click the "locked" level:
        *   **Expected**: The level is visually locked, has no hover effect, and clicking it does nothing.
    6. Click the "active" level:
        *   **Expected**: Launches the Game Engine and transitions to `/game/[level_id]`.

### Scenario B: Game Timing Engine Transitions
*   **Purpose**: Verify the three-phase timing loop runs exactly as specified.
*   **Steps**:
    1. Select an active level to start.
    2. **Fase 1 (Exposición)** starts:
        *   Validate that the math formula displays as pure vector text via KaTeX.
        *   Verify the timer counts down from 30 seconds.
        *   Click "Listo" before the timer expires.
        *   **Expected**: Transition to Fase 2 immediately.
    3. **Fase 2 (Distractor - Shell Game)** starts:
        *   Verify the page changes to the 3-cup game immediately.
        *   Verify that a timer runs for exactly 8 seconds.
        *   Verify the user is unable to bypass or skip this phase.
        *   **Expected**: Automatic transition to Fase 3 when the timer hits 0.
    4. **Fase 3 (Recuperación)** starts:
        *   Verify the original math formula is hidden.
        *   Verify the screen displays a real-life analogy with 4 multiple-choice options.
        *   Select a wrong option:
            *   **Expected**: The Neural Energy bar drops, the incorrect option highlights neutrally (non-punitive), and a growth-mindset prompt tells you to try again.
        *   Select the correct option:
            *   **Expected**: Success screen displays (kinetic celebration), progress is saved in Supabase, and navigation goes back to the Learning Path.

### Scenario C: Admin Desktop Editor
*   **Purpose**: Verify validation of LaTeX syntax before persistence.
*   **Steps**:
    1. Open `/admin` on a desktop viewport.
    2. Write an invalid LaTeX formula (e.g., missing closing bracket `\frac{a}{b`).
        *   **Expected**: KaTeX validation triggers, showing a warning indicating malformed syntax. The "Save" button is disabled.
    3. Correct the formula to `\frac{a}{b}`.
        *   **Expected**: Real-time render compiles correctly, displaying the formula in vector math text. The "Save" button becomes active.
