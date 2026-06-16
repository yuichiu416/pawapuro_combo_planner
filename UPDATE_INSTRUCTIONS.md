# How to apply this update

This zip contains every new/changed file for the game-version toggle feature,
with the same folder structure as the repo (rooted at `src/`). Extract it into
your project root and let it overwrite/add files.

## 1. New files
- `src/contexts/GameVersionContext.tsx`
- `src/components/VersionToggle.tsx`
- `src/data/2024-2025/characters.json`
- `src/data/2024-2025/combos.json`
- `src/data/2024-2025/maps.json`
- `src/data/2024-2025/character_mapping.json`
- `src/data/2026-2027/characters.json`         <- placeholder copy of 2024-2025
- `src/data/2026-2027/combos.json`             <- placeholder copy of 2024-2025
- `src/data/2026-2027/maps.json`               <- placeholder copy of 2024-2025
- `src/data/2026-2027/character_mapping.json`  <- placeholder copy of 2024-2025
- `TODO_VERSION_TOGGLE.md` (follow-up items, repo root)

If you already created `src/data/2026-2027/*.json` locally (your screenshot
showed these as untracked "U" files), keep yours if they already have real
2026-2027 data - otherwise these placeholder copies will let the toggle work
without crashing until you fill in the real data.

## 2. Modified files (overwrite existing)
- `src/App.tsx`
- `src/main.tsx`
- `src/hooks/useComboManager.ts`
- `src/components/MapSection.tsx`
- `src/components/RewardAnalysis.tsx`
- `src/components/CharacterSidebar/CharacterSidebar.tsx`
- `src/__tests__/logic/useComboManager.test.ts`
- `src/__tests__/logic/useComboSorting.test.ts`
- `src/__tests__/components/CharacterSidebar.test.tsx`
- `src/__tests__/components/RewardAnalysis.test.tsx`

## 3. Delete these (now moved into `src/data/2024-2025/`)
- `src/data/characters.json`
- `src/data/combos.json`
- `src/data/maps.json`
- `src/data/character_mapping.json`

`src/data/skills.json` is unchanged and stays where it is (shared across
versions).

## 4. After applying
```
npm install   # if needed
npx tsc --noEmit   # should pass clean
npx vitest run     # 77 passed, same 10 pre-existing env failures
```

The "10 pre-existing env failures" (App.*, Header, several integration tests)
fail because there's no `.env` with Supabase credentials in this sandbox -
they should pass fine in your local environment where `.env` is configured.

## What changed (quick recap)
- The "パワプロ 2024-2025" title is now "パワプロ" + a small dropdown showing
  the active version. Click it to switch between 2024-2025 / 2026-2027.
- All character/combo/map/mapping data is now loaded per-version via
  `GameVersionContext`, persisted to localStorage, and reflected in the page
  title (`document.title`).
- `skills.json` stays shared across versions (unchanged).
