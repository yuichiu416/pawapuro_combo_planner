import { renderHook, act } from '@testing-library/react';
import { useComboManager } from '../../hooks/useComboManager';
import { describe, it, expect, vi } from 'vitest';

// 1. MATCH THE HOOK'S FIXED MEMBERS EXACTLY
// Note: Ensure the spelling matches your actual characters.json (e.g., "矢部 明雄" vs "矢部明雄")
const FIXED = ["パワプロ", "矢部 明雄"];

vi.mock('@/data/characters.json', () => {
  const mockChars: any = {};
  // Generate 10 Pitchers (P1-P10)
  for (let i = 1; i <= 10; i++) mockChars[`P${i}`] = { position: "投" };
  // Generate 20 Fielders (F1-F20)
  for (let i = 1; i <= 20; i++) mockChars[`F${i}`] = { position: "外" };
  // Generate 5 Managers (M1-M5)
  for (let i = 1; i <= 5; i++) mockChars[`M${i}`] = { position: "マ" };
  
  // Add Fixed Members
  mockChars["パワプロ"] = { position: "内" };
  mockChars["矢部 明雄"] = { position: "外" };
  
  return { default: mockChars };
});

// Mock other data to prevent undefined errors
vi.mock('@/data/combos.json', () => ({ default: {} }));
vi.mock('@/data/maps.json', () => ({ default: {} }));
vi.mock('@/data/character_mapping.json', () => ({ default: {} }));

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
      // 5 Pitchers + 16 Fielders = 21 Scouts (Total 23 is fine, but Pitcher count is 5)
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
    // Managers don't count toward the 25-character cap
    expect(roster.total).toBe(23); 
    expect(roster.manager).toBe(3);
    expect(roster.errors?.manager).toBe(false);
    expect(roster.isValid).toBe(true);

    act(() => {
      // Add 4th manager -> Should trigger error
      result.current.toggleCharacter("M4");
    });

    expect(result.current.analysis.roster.errors?.manager).toBe(true);
    expect(result.current.analysis.roster.isValid).toBe(false);
  });
});