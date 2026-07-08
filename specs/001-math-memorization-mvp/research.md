# Research: Math Memorization MVP

This document outlines the technical research, architecture design, and decisions made for the AntiGravity Mathematical Memorization MVP.

## Research Areas

### 1. KaTeX Integration in Next.js App Router

*   **Decision**: Use the native `katex` package and render equations directly to HTML strings using `katex.renderToString` within React Server Components (RSC) when possible, or Client Components using a custom `<KaTeXRenderer />` wrapper.
*   **Rationale**:
    *   **Performance**: Pre-rendering formulas on the server means zero client-side JavaScript is needed for math rendering, preventing layout shifts (CLS) and ensuring immediate, smooth visual load on mobile devices.
    *   **Lightweight**: Avoids pulling in heavy dependencies (like MathJax or complex third-party React wrappers that might run outdated KaTeX versions).
    *   **SEO-Friendly**: Math formulas are output as standard semantic HTML, which is crawlable and works instantly without JS.
*   **Alternatives Considered**:
    *   *MathJax*: Rejected due to slow rendering speeds and large bundle size (which violates AntiGravity's low cognitive load/kinetic experience principle).
    *   *react-katex*: A solid wrapper, but direct use of `katex` with `dangerouslySetInnerHTML` is simpler, has fewer dependencies, and integrates perfectly with Next.js Server Components.

### 2. Pedagogy & Timing Engine (React State Machine)

*   **Decision**: Implement a custom React hook `useGameEngine` that internally uses a state reducer (`useReducer`) representing the active game state.
*   **Rationale**:
    *   **State Machine**: The transitions between `EXPOSURE` -> `DISTRACTOR` -> `RECOVERY` are linear and time-driven. A reducer guarantees that state transitions (e.g. entering distractor, finishing level) are deterministic.
    *   **Timer Robustness**: Uses a combined `setInterval` and `performance.now()` mechanism to keep track of elapsed time accurately, ensuring that the 8-second distractor phase is exactly 8 seconds regardless of background throttle.
    *   **Clean Cleanup**: Standardizes interval clearings to prevent memory leaks during rapid screen transitions.
*   **Alternatives Considered**:
    *   *Multiple standalone useState hooks*: Rejected. Managing `phase`, `timeLeft`, and `isPaused` across separate hooks leads to synchronization bugs and race conditions.

### 3. Database Schema (Supabase & PostgreSQL)

*   **Decision**: Define a self-contained PostgreSQL schema using native ENUM types for channels (`aritmética`, `álgebra`, `física`) and level statuses (`active`, `locked`, `dx`). Use a self-referencing foreign key on `levels` (`prerequisite_level_id`) to control progression.
*   **Rationale**:
    *   **Data Integrity**: Handled at the database level. For example, a level status cannot be arbitrary; it must comply with the `level_status` ENUM.
    *   **Dynamic Unlocking**: When checking user progress, we query if the prerequisite level has an entry in `user_progress` for the logged-in user. If yes, the next level is unlocked.
    *   **Row-Level Security (RLS)**: Enforces that users can only read/write their own progress records, securing user data natively.
*   **Alternatives Considered**:
    *   *Storing progress as JSON in profile*: Rejected. Harder to query, lacks SQL constraints, and makes reporting/progression logic complex.

### 4. Folder Structure (Next.js App Router)

*   **Decision**: Organize the app using Next.js App Router groups to segregate Desktop Admin features and Mobile PWA views.
*   **Rationale**:
    *   **Clear Separation**: Admin controls are kept separate from the student app code, improving maintenance.
    *   **Layout Sharing**: The mobile shell can have a global bottom navbar or style theme without affecting the desktop view.
*   **Alternatives Considered**:
    *   *Single flat app folder*: Rejected because mixing admin desktop routes with PWA mobile routes creates messy layouts and increases route complexity.
