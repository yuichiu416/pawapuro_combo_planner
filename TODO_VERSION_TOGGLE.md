# TODO: Game Version Toggle - Follow-up Work

Tracking items deferred while landing the initial 2024-2025 / 2026-2027 version toggle.

## 1. Saved teams aren't version-tagged (Supabase + localStorage)

**Problem:** `selected_characters` and `selected_combos` (in the Supabase `user_saves`
table and the local storage fallback) are arrays of character names and
`name&name` combo IDs. These are version-specific. If a character is renamed,
removed, or a combo changes between game versions, a save created under one
version could reference characters/combos that don't exist in another version.

**Current behavior:** `useComboManager`'s `analysis` memo already guards against
missing characters (`if (!char) return;`), so the app won't crash - but stats/
rewards/roster counts will silently look "wrong" if a loaded save references
characters that don't exist in the active version's `characters.json`.

**Suggested fix when we get here:**
- Add a `game_version` column to the Supabase `user_saves` table.
- Add a `gameVersion` field to the local storage save object
  (`パワプロ_planner_local_v2`).
- When loading a slot, if its `game_version` doesn't match the currently
  selected version, either:
  - auto-switch the active version to match the save, or
  - warn the user and/or filter out characters/combos that don't exist in the
    current version.
- Existing saves with no `game_version` field should be treated as `2024-2025`
  for backwards compatibility.

## 2. Asset versioning

New characters in 2026-2027 will need new icon sprites in
`public/assets/icons_split/`. Since `character_mapping.json` maps names -> IDs
-> icon filenames, and IDs could shift between versions, icons likely need to
live under version-specific subfolders (or the mapping needs to point at full
paths per version). Revisit once real 2026-2027 character data exists.

## 3. Bundle size / code splitting

`GameVersionContext` currently statically imports both versions' JSON at build
time (~360KB each). Fine for 2 versions, but as more versions accumulate this
should move to dynamic `import()` per version so only the active version's
data is downloaded.

## 4. Reset selections on version switch

Currently switching versions does NOT reset `selectedNames` /
`selectedComboIds`. Since 2026-2027 is currently a copy of 2024-2025 this is a
non-issue today, but once the data diverges, switching versions with an
existing selection could carry over characters/combos that don't exist in the
new version (see #1 - same root cause, same fix covers both).
