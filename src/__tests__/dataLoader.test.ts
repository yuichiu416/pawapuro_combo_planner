// src/__tests__/dataLoader.test.ts
import { renderHook, waitFor, cleanup } from '@testing-library/react';
import { useGameData } from '@/hooks/useGameData';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Explicitly mock using the static mock JSON files
vi.mock('@/data/characters.json', () => import('./fixtures/characters.mock.json'));
vi.mock('@/data/combos.json', () => import('./fixtures/combos.mock.json'));
vi.mock('@/data/maps.json', () => import('./fixtures/maps.mock.json'));
vi.mock('@/data/skills.json', () => import('./fixtures/skills.mock.json'));
vi.mock('@/data/character_mapping.json', () => import('./fixtures/character_mapping.mock.json'));

// 2. Import the actual JSON data for our expectations
import charactersMock from './fixtures/characters.mock.json';
import combosMock from './fixtures/combos.mock.json';

describe('useGameData Hook Integration', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('populates data from master fixtures correctly', async () => {
    const { result } = renderHook(() => useGameData());

    // Wait for loading to finish
    await waitFor(() => expect(result.current.isLoading).toBe(false), { timeout: 2000 });
    
    // Now we compare against the ACTUAL mock file content length
    const expectedCount = Object.keys(charactersMock).length;
    
    // Use a descriptive error message if it fails
    expect(result.current.allCharacters.length).toBe(expectedCount);
    
    expect(result.current.allCharacters).toContain("郡司知将");
    expect(result.current.allCharacters).toContain("エミリ");
  });

  it('verifies combo count matches mock file', async () => {
    const { result } = renderHook(() => useGameData());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const expectedComboCount = Object.keys(combosMock).length;
    expect(result.current.allCombos).toHaveLength(expectedComboCount);
  });
});