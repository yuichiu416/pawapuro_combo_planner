import { renderHook, act } from '@testing-library/react';
import { useComboManager } from '../../hooks/useComboManager';
import { describe, it, expect, vi } from 'vitest';

// 1. HOIST THE DATA
// This ensures mock data is ready before the hook is initialized
const { mockCombos, mockChars, mockMapping } = await vi.hoisted(async () => {
  const combos = await import('../../data/combos.json');
  const mapping = await import('../../data/character_mapping.json');
  
  const chars: any = {};
  // Generate 10 Pitchers (P1-P10)
  for (let i = 1; i <= 10; i++) chars[`P${i}`] = { position: "投" };
  // Generate 20 Fielders (F1-F20)
  for (let i = 1; i <= 20; i++) chars[`F${i}`] = { position: "外" };
  // Generate 5 Managers (M1-M5)
  for (let i = 1; i <= 5; i++) chars[`M${i}`] = { position: "マ" };
  
  // FIXED MEMBERS (Must match your character list)
  chars["パワプロ"] = { position: "内" };
  chars["矢部明雄"] = { position: "外" };

  return { 
    mockCombos: combos.default, 
    mockChars: chars, 
    mockMapping: mapping.default 
  };
});

// 2. MOCK MODULES
vi.mock('@/data/characters.json', () => ({ default: mockChars }));
vi.mock('@/data/combos.json', () => ({ default: mockCombos }));
vi.mock('@/data/character_mapping.json', () => ({ default: mockMapping }));
vi.mock('@/data/maps.json', () => ({ default: {} }));

describe('useComboManager Roster Validation', () => {
  
  it('should validate the minimum legal roster (6P, 15F scouts)', () => {
    const { result } = renderHook(() => useComboManager());

    act(() => {
      // 6 Pitchers + 15 Fielders = 21 Scouts
      for(let i = 1; i <= 6; i++) result.current.toggleCharacter(`P${i}`);
      for(let i = 1; i <= 15; i++) result.current.toggleCharacter(`F${i}`);
    });

    const { roster } = result.current.analysis;
    // 21 scouts + 2 fixed = 23 total
    expect(roster.total).toBe(23); 
    expect(roster.isValid).toBe(true);
    expect(roster.errors?.pitcher).toBe(false);
  });

  it('should validate the maximum legal roster (Total 25 characters)', () => {
    const { result } = renderHook(() => useComboManager());

    act(() => {
      // 8 Pitchers + 15 Fielders = 23 Scouts (+2 fixed = 25 total)
      for(let i = 1; i <= 8; i++) result.current.toggleCharacter(`P${i}`);
      for(let i = 1; i <= 15; i++) result.current.toggleCharacter(`F${i}`);
    });

    const { roster } = result.current.analysis;
    expect(roster.total).toBe(25);
    expect(roster.isValid).toBe(true);
  });

  it('should fail if Pitchers are below 6', () => {
    const { result } = renderHook(() => useComboManager());

    act(() => {
      // 5 Pitchers + 16 Fielders = 21 Scouts (Total 23, but Pitcher count is 5)
      for(let i = 1; i <= 5; i++) result.current.toggleCharacter(`P${i}`);
      for(let i = 1; i <= 16; i++) result.current.toggleCharacter(`F${i}`);
    });

    expect(result.current.analysis.roster.errors?.pitcher).toBe(true);
    expect(result.current.analysis.roster.isValid).toBe(false);
  });

  it('should fail if total character count exceeds 25', () => {
    const { result } = renderHook(() => useComboManager());

    act(() => {
      // 6 Pitchers + 18 Fielders = 24 Scouts (+2 fixed = 26 total)
      for(let i = 1; i <= 6; i++) result.current.toggleCharacter(`P${i}`);
      for(let i = 1; i <= 18; i++) result.current.toggleCharacter(`F${i}`);
    });

    expect(result.current.analysis.roster.total).toBe(26);
    expect(result.current.analysis.roster.errors?.total).toBe(true);
    expect(result.current.analysis.roster.isValid).toBe(false);
  });

  it('should treat Managers as a separate independent limit (0-3)', () => {
    const { result } = renderHook(() => useComboManager());

    act(() => {
      // Valid baseline (6P + 15F scouts)
      for(let i = 1; i <= 6; i++) result.current.toggleCharacter(`P${i}`);
      for(let i = 1; i <= 15; i++) result.current.toggleCharacter(`F${i}`);
      // Add 3 Managers
      for(let i = 1; i <= 3; i++) result.current.toggleCharacter(`M${i}`);
    });

    const { roster } = result.current.analysis;
    expect(roster.total).toBe(23); // Managers shouldn't bloat the 25-cap
    expect(roster.manager).toBe(3);
    expect(roster.errors?.manager).toBe(false);
    expect(roster.isValid).toBe(true);

    act(() => { result.current.toggleCharacter("M4"); });

    expect(result.current.analysis.roster.errors?.manager).toBe(true);
    expect(result.current.analysis.roster.isValid).toBe(false);
  });
});

describe('useComboManager Logic - Search & Filtering', () => {
  it('filters by character name', () => {
    const { result } = renderHook(() => useComboManager());
    const combos = mockCombos as Record<string, any>;

    const allIds = Object.keys(combos);
    const targetId = allIds[0];
    const searchTerm = combos[targetId].characters[0];

    act(() => { result.current.setSearchTerm(searchTerm); });
    expect(result.current.filteredComboIds).toContain(targetId);
  });

  it('filters based on skill names deep in rewards', () => {
    const { result } = renderHook(() => useComboManager());
    const combos = mockCombos as Record<string, any>;
    
    const comboEntry = Object.entries(combos).find(
      ([_, data]) => data.rewards?.skills && data.rewards.skills.length > 0
    );

    if (comboEntry) {
      const [id, data] = comboEntry;
      const skillName = data.rewards.skills[0].name;
      act(() => { result.current.setSearchTerm(skillName); });
      expect(result.current.filteredComboIds).toContain(id);
    }
  });

  it('resets when search term is cleared', () => {
    const { result } = renderHook(() => useComboManager());
    const totalCount = Object.keys(mockCombos).length;

    act(() => { result.current.setSearchTerm('NON_EXISTENT'); });
    expect(result.current.filteredComboIds.length).toBe(0);

    act(() => { result.current.setSearchTerm(''); });
    expect(result.current.filteredComboIds.length).toBe(totalCount);
  });
});