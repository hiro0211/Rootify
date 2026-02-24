The refactoring plan is complete at `automation/plans/task_006refactor.md`.

## Summary of the Plan

I read **every source file and test file** in the Rootify codebase and identified **9 concrete issues** ranked by severity. The plan is organized into **5 phases** with **18 ordered implementation steps**:

### Phase A: Extract Shared Styles (5 steps)
- Create `src/shared/styles/shadows.ts` — eliminates shadow duplication across 10+ components
- Add missing color constants (`LOCKED_BG`, `MUTED_BG`, `ACCENT_LIGHT`, `WHITE`) to centralize 15+ hardcoded color literals
- Create `src/shared/constants/app.ts` — centralizes magic numbers for quiz timing, spaced repetition, and app data

### Phase B: Eliminate Duplicate Code (3 steps)
- Consolidate `feedbackService.ts` to use the existing `haptics` lib (fixes duplicate expo-haptics wrappers + connects settings)
- Merge `getReviewDueWords` from the duplicate `spacedRepetition.ts` into `reviewService.ts`, then delete the duplicate
- Replace all magic numbers with named constants

### Phase C: Fix Zustand Selector (1 step)
- Fix `useMasteryDistribution` to use a selector instead of subscribing to the entire store

### Phase D: Verified no action needed (progressive service kept as-is)

### Phase E: Minor Quality (3 steps)
- Extract 7-parameter `renderCard` function into proper `QuizSelectionCard` component
- Move all inline styles to StyleSheet
- Remove dead `adjustedStreak` variable

**Net result**: 3 new files, ~20 modified files, 2 deleted files. All existing tests preserved (with 2 test files updated for new mocks).
