// File: src/hooks/useGameData.ts
import { useState, useEffect } from 'react';
import charactersData from '../data/characters.json';
import combosDataRaw from '../data/combos.json';

/**
 * Interface for the new Combo Schema
 */
interface ComboReward {
  skills: Array<{
    name: string;
    level: number;
    verified: boolean;
  }>;
  stats: Record<string, any>;
}

interface ComboEntry {
  id: string; // Added for React rendering and lookup
  characters: string[];
  map: string;
  rewards: ComboReward;
}

export function useGameData() {
  const [allCharacters, setAllCharacters] = useState<string[]>([]);
  const [allCombos, setAllCombos] = useState<ComboEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    try {
      // 1. Process Character Names
      const charNames = Object.keys(charactersData);

      // 2. Process New Combo Object Schema
      // Transform { "CharA&CharB": { ... } } -> [ { id: "CharA&CharB", ... } ]
      const comboEntries: ComboEntry[] = Object.entries(combosDataRaw).map(([key, value]) => ({
        id: key,
        ...(value as any)
      }));

      if (isMounted) {
        setAllCharacters(charNames);
        setAllCombos(comboEntries);
        setError(null);
      }
    } catch (err: unknown) {
      if (isMounted) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load game data';
        setError(errorMessage);
        console.error('Data Transformation Error:', err);
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return { allCharacters, allCombos, isLoading, error };
}