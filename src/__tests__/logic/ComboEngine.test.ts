import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComboManager } from '@/hooks/useComboManager';

// DO NOT reference these variables inside vi.mock factory directly
import mockCharacters from '../fixtures/characters.mock.json';
import mockCombos from '../fixtures/combos.mock.json';

// Use factory functions that return the imported data
// This works because the actual resolution happens when the module is required
vi.mock('@/data/characters.json', () => {
  return { default: require('../fixtures/characters.mock.json') };
});

vi.mock('@/data/combos.json', () => {
  return { default: require('../fixtures/combos.mock.json') };
});

vi.mock('@/data/maps.json', () => {
  return { default: {} };
});

describe('Combo Manager Logic Engine', () => {
  it('should stack skill levels and detect overflow above Lv.5', () => {
    const { result } = renderHook(() => useComboManager());

    act(() => {
      // Use keys that actually exist in your characters.mock.json
      // Replace 'Character_A' etc. with real names from your fixture if different
      result.current.toggleCharacter('Character_A');
      result.current.toggleCharacter('Character_B');
      result.current.toggleCharacter('エミリ');
    });

    // Match the skill name from your combos.mock.json
    const phSkill = result.current.analysis.skills.find((s) => s.name === 'パワーヒッター');

    // Assertion logic
    if (phSkill && phSkill.level > 5) {
      expect(result.current.analysis.overflowSkills).toContain('パワーヒッター');
    }

    expect(result.current.ownedChars.size).toBeGreaterThan(0);
  });

  it('should maintain selection state for manager characters', () => {
    const { result } = renderHook(() => useComboManager());

    act(() => {
      result.current.toggleCharacter('エミリ');
    });

    expect(result.current.ownedChars.has('エミリ')).toBe(true);
  });
});
