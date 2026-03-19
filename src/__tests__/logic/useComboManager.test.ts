import { renderHook, act } from '@testing-library/react';
import { useComboManager } from '../../hooks/useComboManager';
import { describe, it, expect, vi } from 'vitest';

// Mock data with enough variety to test all limits
vi.mock('@/data/characters.json', () => ({
  default: {
    ...Array.from({ length: 10 }).reduce((acc, _, i) => ({ ...acc, [`P${i+1}`]: { position: "投" } }), {}),
    ...Array.from({ length: 20 }).reduce((acc, _, i) => ({ ...acc, [`F${i+1}`]: { position: "外" } }), {}),
    ...Array.from({ length: 5 }).reduce((acc, _, i) => ({ ...acc, [`M${i+1}`]: { position: "マ" } }), {}),
    "パワプロ": { position: "内" },
    "矢部 明雄": { position: "外" }
  }
}));

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
    expect(roster.errors.pitcher).toBe(false);
  });

  it('should validate the maximum legal roster (8P, 15F or 6P, 17F)', () => {
    const { result } = renderHook(() => useComboManager());

    act(() => {
      // 8 Pitchers + 15 Fielders = 23 Scouts
      for(let i = 1; i <= 8; i++) result.current.toggleCharacter(`P${i}`);
      for(let i = 1; i <= 15; i++) result.current.toggleCharacter(`F${i}`);
    });

    const { roster } = result.current.analysis;
    expect(roster.total).toBe(25); // Hard cap
    expect(roster.isValid).toBe(true);
  });

  it('should fail if Pitchers are below 6', () => {
    const { result } = renderHook(() => useComboManager());

    act(() => {
      // 5 Pitchers + 16 Fielders = 21 Scouts (Total is fine, but Pitcher count is not)
      for(let i = 1; i <= 5; i++) result.current.toggleCharacter(`P${i}`);
      for(let i = 1; i <= 16; i++) result.current.toggleCharacter(`F${i}`);
    });

    expect(result.current.analysis.roster.errors.pitcher).toBe(true);
    expect(result.current.analysis.roster.isValid).toBe(false);
  });

  it('should fail if Fielders exceed the total scout limit of 23', () => {
    const { result } = renderHook(() => useComboManager());

    act(() => {
      // 6 Pitchers (Valid) + 18 Fielders = 24 Scouts (Invalid total)
      for(let i = 1; i <= 6; i++) result.current.toggleCharacter(`P${i}`);
      for(let i = 1; i <= 18; i++) result.current.toggleCharacter(`F${i}`);
    });

    expect(result.current.analysis.roster.total).toBe(26);
    expect(result.current.analysis.roster.errors.total).toBe(true);
    expect(result.current.analysis.roster.isValid).toBe(false);
  });

  it('should treat Managers as a separate independent limit (0-3)', () => {
    const { result } = renderHook(() => useComboManager());

    act(() => {
      // 7 Pitchers + 15 Fielders = 22 Scouts
      for(let i = 1; i <= 7; i++) result.current.toggleCharacter(`P${i}`);
      for(let i = 1; i <= 15; i++) result.current.toggleCharacter(`F${i}`);
      // 3 Managers
      for(let i = 1; i <= 3; i++) result.current.toggleCharacter(`M${i}`);
    });

    const { roster } = result.current.analysis;
    // Total should stay 24 (22 scouts + 2 fixed). Managers don't add to .total
    expect(roster.total).toBe(24);
    expect(roster.manager).toBe(3);
    expect(roster.isValid).toBe(true);

    act(() => {
      // Add a 4th manager
      result.current.toggleCharacter("M4");
    });

    expect(result.current.analysis.roster.errors.manager).toBe(true);
    expect(result.current.analysis.roster.isValid).toBe(false);
  });
});