// src/contexts/GameVersionContext.tsx
import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Character, Combo, GameMap } from '@/types';

// 2024-2025 dataset
import characterMapping_2024_2025 from '@/data/2024-2025/character_mapping.json';
import characters_2024_2025 from '@/data/2024-2025/characters.json';
import combos_2024_2025 from '@/data/2024-2025/combos.json';
import maps_2024_2025 from '@/data/2024-2025/maps.json';

// 2026-2027 dataset
import characterMapping_2026_2027 from '@/data/2026-2027/character_mapping.json';
import characters_2026_2027 from '@/data/2026-2027/characters.json';
import combos_2026_2027 from '@/data/2026-2027/combos.json';
import maps_2026_2027 from '@/data/2026-2027/maps.json';

/**
 * All supported game versions. To add a new version:
 * 1. Drop the new characters/combos/maps/character_mapping JSON files into
 *    src/data/<version>/
 * 2. Import them above
 * 3. Add an entry to GAME_DATA below
 * 4. Add the version string to this array (oldest → newest — default and dropdown order derive from this)
 */
export const GAME_VERSIONS = ['2024-2025', '2026-2027'] as const;
export type GameVersion = (typeof GAME_VERSIONS)[number];

export interface VersionGameData {
  characters: Record<string, Character>;
  combos: Record<string, Combo>;
  maps: Record<string, GameMap>;
  characterMapping: any;
}

const GAME_DATA: Record<GameVersion, VersionGameData> = {
  '2024-2025': {
    characters: characters_2024_2025 as Record<string, Character>,
    combos: combos_2024_2025 as Record<string, Combo>,
    maps: maps_2024_2025 as Record<string, GameMap>,
    characterMapping: characterMapping_2024_2025,
  },
  '2026-2027': {
    characters: characters_2026_2027 as Record<string, Character>,
    combos: combos_2026_2027 as Record<string, Combo>,
    maps: maps_2026_2027 as Record<string, GameMap>,
    characterMapping: characterMapping_2026_2027,
  },
};

const STORAGE_KEY = 'パワプロ_planner_game_version';

const isGameVersion = (value: string | null): value is GameVersion =>
  !!value && (GAME_VERSIONS as readonly string[]).includes(value);

interface GameVersionContextValue {
  version: GameVersion;
  setVersion: (version: GameVersion) => void;
  versions: readonly GameVersion[];
  gameData: VersionGameData;
}

const DEFAULT_CONTEXT_VALUE: GameVersionContextValue = {
  version: GAME_VERSIONS[GAME_VERSIONS.length - 1],
  setVersion: () => {},
  versions: GAME_VERSIONS,
  gameData: GAME_DATA[GAME_VERSIONS[GAME_VERSIONS.length - 1]],
};

const GameVersionContext = createContext<GameVersionContextValue>(DEFAULT_CONTEXT_VALUE);

export const GameVersionProvider: React.FC<{
  children: React.ReactNode;
  initialVersion?: GameVersion;
}> = ({ children, initialVersion }) => {
  const [version, setVersionState] = useState<GameVersion>(() => {
    if (initialVersion) return initialVersion;
    if (typeof window === 'undefined') return GAME_VERSIONS[GAME_VERSIONS.length - 1];
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isGameVersion(stored) ? stored : GAME_VERSIONS[GAME_VERSIONS.length - 1];
  });

  const setVersion = useCallback((next: GameVersion) => {
    setVersionState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable (e.g. private browsing) - ignore.
    }
  }, []);

  // Keep the browser tab title in sync with the active version.
  useEffect(() => {
    document.title = `パワプロ ${version} Combo Planner`;
  }, [version]);

  const gameData = useMemo(() => GAME_DATA[version], [version]);

  const value = useMemo<GameVersionContextValue>(
    () => ({ version, setVersion, versions: GAME_VERSIONS, gameData }),
    [version, gameData, setVersion],
  );

  return <GameVersionContext.Provider value={value}>{children}</GameVersionContext.Provider>;
};

export const useGameVersion = (): GameVersionContextValue => useContext(GameVersionContext);
