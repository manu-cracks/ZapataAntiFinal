# Tasks: Math Memorization MVP

**Input**: Design documents from `/specs/001-math-memorization-mvp/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: N/A (No automated unit tests requested in specification. Manual validation is tracked via quickstart.md validation scenarios.)

**Organization**: Tasks are grouped by logical phase and user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Contains exact file paths in descriptions.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and base layout setups.

- [x] T001 Initialize the Next.js application structure with App Router in `src/app/`
- [x] T002 Configure tailwind.config.js for custom styles (opacity, border styles) in `tailwind.config.js`
- [x] T003 [P] Setup Supabase connection configuration and clients in `src/lib/supabase.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database schema with Row Level Security (RLS) policies.

- [x] T004 Setup Database schema and ENUM types (channel_type, level_status) in `supabase/migrations/20260707_init_schema.sql`
- [x] T005 [P] Implement tables levels, analogies, and user_progress in `supabase/migrations/20260707_init_schema.sql`
- [x] T006 [P] Enable Row Level Security (RLS) and configure policies using auth.uid() in `supabase/migrations/20260707_init_schema.sql`
- [x] T007 Insert seed data for the 9 base levels (7 active, 2 dx) in `supabase/migrations/20260707_init_schema.sql`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Learning Path Navigation (Priority: P1)

**Goal**: Mobile-friendly vertical path showing levels and channels, supporting active/locked/dx states.

- [x] T008 [P] [US1] Create TypeScript interfaces for Channel, Level, and UserProgress in `src/types/index.ts`
- [x] T009 [P] [US1] Create custom Bottom Sheet UI component in `src/components/ui/bottom-sheet.tsx`
- [x] T010 [US1] Create Level Node component displaying status with Tailwind styles in `src/components/learning-path/level-node.tsx`
- [x] T011 [US1] Create Channel Column layout in `src/components/learning-path/channel-column.tsx`
- [x] T012 [US1] Implement server side route to fetch levels from Supabase in `src/app/api/levels/route.ts`
- [x] T013 [US1] Build the main path container page in `src/app/(mobile)/path/page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable.

---

## Phase 4: User Story 2 - Three-Phase Game Timer Engine (Priority: P2)

**Goal**: Complete game sequence (30s Exposure -> 8s Distractor -> Free Time Recovery).

- [x] T014 [P] [US2] Create KaTeX Math rendering component in `src/components/ui/katex-renderer.tsx`
- [x] T015 [P] [US2] Create React state reducer/hook useGameEngine in `src/hooks/useGameEngine.ts`
- [x] T016 [US2] Implement Fase 1 Exposure UI view in `src/components/game/exposure-phase.tsx`
- [x] T017 [US2] Implement Fase 2 Distractor UI view (3 cups) in `src/components/game/distractor-phase.tsx`
- [x] T018 [US2] Implement Fase 3 Recovery UI view in `src/components/game/recovery-phase.tsx`
- [x] T019 [US2] Implement Neural Energy Bar component in `src/components/ui/energy-bar.tsx`
- [x] T020 [US2] Connect timing views and energy bar in `src/app/(mobile)/game/[levelId]/page.tsx`

**Checkpoint**: User Stories 1 and 2 should work independently on local mocked session.

---

## Phase 5: User Story 3 - Database Persistence & Progression (Priority: P3)

**Goal**: Save completed level scores and secure authentication.

- [x] T021 [P] [US3] Setup Supabase Auth layout in `src/app/(mobile)/auth/page.tsx`
- [x] T022 [US3] Implement server route/action to save completion progress in `src/app/api/progress/route.ts`
- [x] T023 [US3] Integrate Auth checks to lock/unlock levels dynamically in `src/app/(mobile)/path/page.tsx`

**Checkpoint**: Full mobile student flow is complete and persisted.

---

## Phase 6: Desktop Admin Panel (Priority: P4)

**Goal**: Management console with live KaTeX preview.

- [x] T024 [P] [ADMIN] Create admin desktop layout page in `src/app/(desktop)/admin/page.tsx`
- [x] T025 [ADMIN] Implement level creation/edit form in `src/components/admin/level-form.tsx`
- [x] T026 [ADMIN] Implement live KaTeX rendering preview component in `src/components/admin/katex-preview.tsx`

**Checkpoint**: Both Mobile Student view and Desktop Admin view are complete.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: System validation and mobile tuning.

- [x] T027 Run quickstart.md validation scenarios to verify end-to-end functionality in `specs/001-math-memorization-mvp/quickstart.md`
- [x] T028 Optimize layout for mobile web browsers and build PWA config in `src/app/layout.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup. Blocks User Story phases.
- **User Stories**: All depend on Foundational completion.
  - US1 (P1) -> US2 (P2) -> US3 (P3) -> Admin (P4).
- **Polish (Phase 7)**: Depends on all implementation phases.

### Parallel Opportunities

- Setup tasks (T001, T002, T003) can be worked in parallel.
- Foundational tasks (T005, T006) can be worked in parallel.
- Story 1 model and UI utilities (T008, T009) can run in parallel.
- Story 2 math rendering and hooks (T014, T015) can run in parallel.

---

## Implementation Strategy

### MVP First (User Stories 1-3)

1. Complete Setup and Foundational database migrations.
2. Build Mobile Learning path (US1).
3. Build the 3-phase timing engine with mock records (US2).
4. Connect database writes via Supabase Auth and APIs to save progress (US3).
5. Perform manual end-to-end validation.
