// src/contexts/GameVersionContext.tsx
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Character, Combo, GameMap, LinkData } from '@/types';

// Static imports for all current versions. With only 2 versions the bundle
// overhead is acceptable (~360KB each gzipped ~80KB). When a 3rd version is
// added, switch to the dynamic-import pattern in loadVersionData() and remove
// the static imports for older versions.
import characterMapping_2024_2025 from '@/data/2024-2025/character_mapping.json';
import characters_2024_2025 from '@/data/2024-2025/characters.json';
import combos_2024_2025 from '@/data/2024-2025/combos.json';
import links_2024_2025 from '@/data/2024-2025/links.json';
import maps_2024_2025 from '@/data/2024-2025/maps.json';

import characterMapping_2026_2027 from '@/data/2026-2027/character_mapping.json';
import characters_2026_2027 from '@/data/2026-2027/characters.json';
import combos_2026_2027 from '@/data/2026-2027/combos.json';
import links_2026_2027 from '@/data/2026-2027/links.json';
import maps_2026_2027 from '@/data/2026-2027/maps.json';

/**
 * All supported game versions. To add a new version:
 * 1. Drop JSON files into src/data/<version>/
 * 2. Import them above (static) or add a case to loadVersionData() (dynamic)
 * 3. Add an entry to STATIC_VERSION_DATA below
 * 4. Add the version string here (oldest → newest)
 */
export const GAME_VERSIONS = ['2024-2025', '2026-2027'] as const;
export type GameVersion = (typeof GAME_VERSIONS)[number];

export interface VersionGameData {
  characters: Record<string, Character>;
  combos: Record<string, Combo>;
  maps: Record<string, GameMap>;
  characterMapping: any;
  links: Record<string, LinkData>;
}

const STATIC_VERSION_DATA: Record<GameVersion, VersionGameData> = {
  '2024-2025': {
    characters: characters_2024_2025 as Record<string, Character>,
    combos: combos_2024_2025 as Record<string, Combo>,
    maps: maps_2024_2025 as Record<string, GameMap>,
    characterMapping: characterMapping_2024_2025,
    links: links_2024_2025 as Record<string, LinkData>,
  },
  '2026-2027': {
    characters: characters_2026_2027 as Record<string, Character>,
    combos: combos_2026_2027 as Record<string, Combo>,
    maps: maps_2026_2027 as Record<string, GameMap>,
    characterMapping: characterMapping_2026_2027,
    links: links_2026_2027 as Record<string, LinkData>,
  },
};

// Future: when adding a 3rd+ version, add it here with dynamic imports
// and remove its static import above.
// async function loadVersionData(version: GameVersion): Promise<VersionGameData> {
//   switch (version) {
//     case '2028-2029': {
//       const [characters, combos, maps, mapping] = await Promise.all([...]);
//       return { ... };
//     }
//   }
// }

const STORAGE_KEY = 'パワプロ_planner_game_version';

const isGameVersion = (value: string | null): value is GameVersion =>
  !!value && (GAME_VERSIONS as readonly string[]).includes(value);

const DEFAULT_VERSION = GAME_VERSIONS[GAME_VERSIONS.length - 1];

interface GameVersionContextValue {
  version: GameVersion;
  setVersion: (version: GameVersion) => void;
  versions: readonly GameVersion[];
  gameData: VersionGameData;
  isLoading: boolean;
}

const DEFAULT_CONTEXT_VALUE: GameVersionContextValue = {
  version: DEFAULT_VERSION,
  setVersion: () => {},
  versions: GAME_VERSIONS,
  gameData: STATIC_VERSION_DATA[DEFAULT_VERSION],
  isLoading: false,
};

const GameVersionContext = createContext<GameVersionContextValue>(DEFAULT_CONTEXT_VALUE);

export const GameVersionProvider: React.FC<{
  children: React.ReactNode;
  initialVersion?: GameVersion;
}> = ({ children, initialVersion }) => {
  const [version, setVersionState] = useState<GameVersion>(() => {
    if (initialVersion) return initialVersion;
    if (typeof window === 'undefined') return DEFAULT_VERSION;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isGameVersion(stored) ? stored : DEFAULT_VERSION;
  });

  // isLoading is always false with static imports — kept for API compatibility
  // so consumers are ready when dynamic imports are introduced.
  const isLoading = false;
  const gameData = useMemo(() => STATIC_VERSION_DATA[version], [version]);

  const setVersion = useCallback((next: GameVersion) => {
    setVersionState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore — localStorage unavailable in private browsing
    }
  }, []);

  useEffect(() => {
    document.title = `パワプロ ${version} コンボプランナー`;
  }, [version]);

  const value = useMemo<GameVersionContextValue>(
    () => ({ version, setVersion, versions: GAME_VERSIONS, gameData, isLoading }),
    [version, gameData, setVersion],
  );

  return <GameVersionContext.Provider value={value}>{children}</GameVersionContext.Provider>;
};

export const useGameVersion = (): GameVersionContextValue => useContext(GameVersionContext);
