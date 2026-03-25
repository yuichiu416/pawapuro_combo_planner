import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { supabase } from '@/lib/supabase';
import { useComboManager } from '../../hooks/useComboManager';

// 1. HOIST THE DATA
const { mockCombos, mockChars, mockMapping, mockSkills } = await vi.hoisted(async () => {
  const combos = await import('../fixtures/combos.mock.json');
  const mapping = await import('../fixtures/character_mapping.mock.json');

  // Define a localized skills DB so the hook can resolve Tier types
  const skills = {
    パワーヒッター: { name: 'パワーヒッター', type: 'gold', category: 'fielder' },
    一球入魂: { name: '一球入魂', type: 'gold', category: 'fielder' },
    ハイボールヒッター: { name: 'ハイボールヒッター', type: 'blue', category: 'fielder' },
    広角打法: { name: '広角打法', type: 'blue', category: 'fielder' },
    '窮地◯': { name: '窮地◯', type: 'blue', category: 'fielder' },
    '国際大会◯': { name: '国際大会◯', type: 'blue', category: 'fielder' },
  };

  const chars: any = {};
  // Generate 10 Pitchers (P1-P10)
  for (let i = 1; i <= 10; i++) chars[`P${i}`] = { position: '投' };
  // Generate 20 Fielders (F1-F20)
  for (let i = 1; i <= 20; i++) chars[`F${i}`] = { position: '外' };
  // Generate 5 Managers (M1-M5)
  for (let i = 1; i <= 5; i++) chars[`M${i}`] = { position: 'マ' };

  // FIXED MEMBERS
  chars['パワプロ'] = { position: '内' };
  chars['矢部明雄'] = { position: '外' };

  // Support Chars for the real combo IDs
  chars['マキシマム池田クリスティン'] = { position: '内' };
  chars['エミリ'] = { position: 'マネージャー' };
  chars['金丸信二'] = { position: '内' };
  chars['東条秀明'] = { position: '三' };

  return {
    mockCombos: combos.default,
    mockChars: chars,
    mockMapping: mapping.default,
    mockSkills: skills,
  };
});

// 2. MOCK MODULES
vi.mock('@/data/characters.json', () => ({ default: mockChars }));
vi.mock('@/data/combos.json', () => ({ default: mockCombos }));
vi.mock('@/data/character_mapping.json', () => ({ default: mockMapping }));
vi.mock('@/data/skills.json', () => ({ default: mockSkills }));
vi.mock('@/data/maps.json', () => ({ default: {} }));

// 3. MOCK SUPABASE
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
      })),
      upsert: vi.fn(),
    })),
  },
}));

const LOCAL_STORAGE_KEY = 'パワプロ_planner_local_v1';

describe('useComboManager Roster Validation', () => {
  it('should validate the minimum legal roster (6P, 15F scouts)', () => {
    const { result } = renderHook(() => useComboManager());
    act(() => {
      for (let i = 1; i <= 6; i++) result.current.toggleCharacter(`P${i}`);
      for (let i = 1; i <= 15; i++) result.current.toggleCharacter(`F${i}`);
    });
    const { roster } = result.current.analysis;
    expect(roster.total).toBe(23); // 21 scouts + 2 fixed
    expect(roster.isValid).toBe(true);
    expect(roster.errors?.pitcher).toBe(false);
  });

  it('should validate the maximum legal roster (Total 25 characters)', () => {
    const { result } = renderHook(() => useComboManager());
    act(() => {
      for (let i = 1; i <= 8; i++) result.current.toggleCharacter(`P${i}`);
      for (let i = 1; i <= 15; i++) result.current.toggleCharacter(`F${i}`);
    });
    const { roster } = result.current.analysis;
    expect(roster.total).toBe(25);
    expect(roster.isValid).toBe(true);
  });

  it('should fail if Pitchers are below 6', () => {
    const { result } = renderHook(() => useComboManager());
    act(() => {
      for (let i = 1; i <= 5; i++) result.current.toggleCharacter(`P${i}`);
      for (let i = 1; i <= 16; i++) result.current.toggleCharacter(`F${i}`);
    });
    expect(result.current.analysis.roster.errors?.pitcher).toBe(true);
    expect(result.current.analysis.roster.isValid).toBe(false);
  });

  it('should fail if total character count exceeds 25', () => {
    const { result } = renderHook(() => useComboManager());
    act(() => {
      for (let i = 1; i <= 6; i++) result.current.toggleCharacter(`P${i}`);
      for (let i = 1; i <= 18; i++) result.current.toggleCharacter(`F${i}`);
    });
    expect(result.current.analysis.roster.total).toBe(26);
    expect(result.current.analysis.roster.errors?.total).toBe(true);
  });

  it('should treat Managers as a separate independent limit (0-3)', () => {
    const { result } = renderHook(() => useComboManager());
    act(() => {
      for (let i = 1; i <= 6; i++) result.current.toggleCharacter(`P${i}`);
      for (let i = 1; i <= 15; i++) result.current.toggleCharacter(`F${i}`);
      for (let i = 1; i <= 3; i++) result.current.toggleCharacter(`M${i}`);
    });
    const { roster } = result.current.analysis;
    expect(roster.manager).toBe(3);
    expect(roster.isValid).toBe(true);

    act(() => {
      result.current.toggleCharacter('M4');
    });
    expect(result.current.analysis.roster.errors?.manager).toBe(true);
    expect(result.current.analysis.roster.isValid).toBe(false);
  });
});

describe('useComboManager Logic - Search & Filtering', () => {
  it('filters by character name', () => {
    const { result } = renderHook(() => useComboManager());
    act(() => {
      result.current.setSearchTerm('エミリ');
    });
    expect(result.current.filteredComboIds).toContain('マキシマム池田クリスティン&エミリ');
  });

  it('filters based on skill names deep in rewards', () => {
    const { result } = renderHook(() => useComboManager());
    act(() => {
      result.current.setSearchTerm('広角打法');
    });
    expect(result.current.filteredComboIds).toContain('金丸信二&東条秀明');
  });

  it('resets when search term is cleared', () => {
    const { result } = renderHook(() => useComboManager());
    const totalCount = Object.keys(mockCombos).length;
    act(() => {
      result.current.setSearchTerm('NON_EXISTENT');
    });
    expect(result.current.filteredComboIds.length).toBe(0);
    act(() => {
      result.current.setSearchTerm('');
    });
    expect(result.current.filteredComboIds.length).toBe(totalCount);
  });
});

describe('useComboManager Analysis Sorting Logic', () => {
  it('strictly groups ALL gold skills above ALL non-gold skills', () => {
    const { result } = renderHook(() => useComboManager());

    act(() => {
      // Ensure we pick combos that actually exist in your mock/data
      // and provide a mix of gold and normal skills
      result.current.toggleCombo('マキシマム池田クリスティン&エミリ');
      result.current.toggleCombo('金丸信二&東条秀明');
    });

    const skills = result.current.analysis.skills;

    // 1. Verify data exists
    const goldSkills = skills.filter((s) => s.type === 'gold');
    const normalSkills = skills.filter((s) => s.type !== 'gold');
    expect(goldSkills.length).toBeGreaterThan(0);
    expect(normalSkills.length).toBeGreaterThan(0);

    // 2. The Logic Check:
    // Find the index of the first non-gold skill
    const firstNonGoldIndex = skills.findIndex((s) => s.type !== 'gold');

    // Find if ANY gold skill exists AFTER that index
    const goldSkillAfterNormal = skills.slice(firstNonGoldIndex).some((s) => s.type === 'gold');

    // 3. Assertions
    expect(skills[0].type).toBe('gold');
    expect(goldSkillAfterNormal).toBe(false); // No gold should be found once we hit the normal section
  });

  it('sorts by level (descending) within the same color tier', () => {
    const { result } = renderHook(() => useComboManager());
    act(() => {
      result.current.toggleCombo('金丸信二&東条秀明'); // 広角打法 LV.5
      result.current.toggleCombo('マキシマム池田クリスティン&エミリ'); // 窮地◯ LV.3
    });

    const skills = result.current.analysis.skills;
    const blueSkills = skills.filter((s) => s.type === 'blue');
    const indexKoukaku = blueSkills.findIndex((s) => s.name === '広角打法');
    const indexKyuchi = blueSkills.findIndex((s) => s.name === '窮地◯');

    expect(indexKoukaku).toBeLessThan(indexKyuchi);
    expect(blueSkills[indexKoukaku].level).toBe(5);
  });
});

describe('useComboManager Persistence - Cloud & Local', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('should save to LocalStorage when handleSave is called without a session', async () => {
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null } });
    const { result } = renderHook(() => useComboManager());

    act(() => {
      result.current.toggleCharacter('P1');
    });

    await act(async () => {
      await result.current.handleSave();
    });

    const stored = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    expect(stored.characters).toContain('P1');
    expect(stored.characters).not.toContain('パワプロ'); // Fixed members filtered out
  });

  it('should save to Supabase when handleSave is called with a session', async () => {
    const mockUser = { id: 'test-user-id' };
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: { user: mockUser } } });

    const upsertSpy = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ upsert: upsertSpy });

    const { result } = renderHook(() => useComboManager());

    act(() => {
      result.current.toggleCharacter('F1');
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(upsertSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'test-user-id',
        selected_characters: ['F1'],
      }),
    );
  });

  it('should wipe state on clearAll', async () => {
    const { result } = renderHook(() => useComboManager());

    act(() => {
      result.current.toggleCharacter('P1');
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ characters: ['P1'] }));
    });

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.ownedChars.has('P1')).toBe(false);
    expect(result.current.ownedChars.has('パワプロ')).toBe(true);
  });

  it('should hydrate from LocalStorage for guests', async () => {
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null } });

    const savedData = { characters: ['M1'], combos: [] };
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedData));

    const { result } = renderHook(() => useComboManager());

    // Wait for the hydrate useEffect
    await waitFor(() => {
      expect(result.current.ownedChars.has('M1')).toBe(true);
    });
  });
});

describe('useComboManager - Kanji Filtering', () => {
  it('should filter out characters with Kanji when filterNoKanji is active', () => {
    const { result } = renderHook(() => useComboManager());

    // 1. Initial state: Both should be in the library groups
    expect(result.current.libraryGroups.withCombo).toContain('金丸信二'); // Kanji
    expect(result.current.libraryGroups.withCombo).toContain('エミリ'); // Katakana

    // 2. Activate Kanji Filter
    act(() => {
      result.current.toggleKanjiFilter();
    });

    // 3. Assert: Kanji names should be gone, Katakana/Hiragana should remain
    expect(result.current.libraryGroups.withCombo).not.toContain('金丸信二');
    expect(result.current.libraryGroups.withCombo).toContain('エミリ');
  });

  it('should filter combos where participants contain Kanji', () => {
    const { result } = renderHook(() => useComboManager());

    // Activate filter
    act(() => {
      result.current.toggleKanjiFilter();
    });

    // A combo like "矢部&パワプロ" contains Kanji, so it should be filtered out
    const containsKanjiCombo = result.current.filteredComboIds.some((id) => id.includes('矢部'));

    expect(containsKanjiCombo).toBe(false);
  });
});

it('manages owned characters correctly', () => {
  const { result } = renderHook(() => useComboManager());

  // Initial state should be empty
  expect(result.current.ownedChars.size).toBe(2);

  // Add a character
  act(() => {
    result.current.toggleCharacter('豬狩守');
  });

  expect(result.current.ownedChars.has('豬狩守')).toBe(true);
  expect(result.current.ownedChars.size).toBe(3);

  // Remove the character
  act(() => {
    result.current.toggleCharacter('豬狩守');
  });
  expect(result.current.ownedChars.has('豬狩守')).toBe(false);
});
