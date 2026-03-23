import { describe, it, expect } from 'vitest';
import { getCategorizedChars } from '@/utils/charHelper';

describe('charHelper: getCategorizedChars', () => {
  const mockChars = {
    猪狩守: { position: 'pitcher' },
    矢部明雄: { position: 'fielder' },
    友沢亮: { position: 'fielder' },
    GenericPlayer: { position: 'fielder' },
  };

  const mockCombos = [
    { char_names: ['猪狩守', '矢部明雄'] },
    { char_names: ['友沢亮 '] }, // Testing trailing space
  ];

  it('should categorize characters into hasCombo and noCombo based on combo participation', () => {
    const { hasCombo, noCombo } = getCategorizedChars(mockChars, mockCombos, 'all');

    expect(hasCombo).toContain('猪狩守');
    expect(hasCombo).toContain('矢部明雄');
    expect(hasCombo).toContain('友沢亮');
    expect(noCombo).toContain('GenericPlayer');
    expect(noCombo).not.toContain('猪狩守');
  });

  it('should filter by specific position (e.g., pitcher)', () => {
    const { hasCombo, noCombo } = getCategorizedChars(mockChars, mockCombos, 'pitcher');

    // Only 猪狩守 is a pitcher with a combo
    expect(hasCombo).toContain('猪狩守');
    expect(hasCombo).not.toContain('矢部明雄');
    expect(noCombo).toHaveLength(0);
  });

  it('should handle character name trimming to match combo data', () => {
    const { hasCombo } = getCategorizedChars(mockChars, mockCombos, 'all');
    // Verifies that '友沢亮 ' in combo matches '友沢亮' in character list
    expect(hasCombo).toContain('友沢亮');
  });

  it('should return empty arrays when no characters match the position filter', () => {
    const { hasCombo, noCombo } = getCategorizedChars(mockChars, mockCombos, 'catcher');
    expect(hasCombo).toHaveLength(0);
    expect(noCombo).toHaveLength(0);
  });

  it('should handle empty input data gracefully', () => {
    const { hasCombo, noCombo } = getCategorizedChars({}, [], 'all');
    expect(hasCombo).toEqual([]);
    expect(noCombo).toEqual([]);
  });
});
