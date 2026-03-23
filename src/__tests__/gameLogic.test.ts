import { describe, it, expect } from 'vitest';
import {
  getAvailableCombos,
  normalizeName,
  getSortedSkills,
  getComboCategory,
  calculateEffectiveSkills,
  PRIORITY,
} from '@/utils/gameLogic';

// Mock data for testing
const mockSkills = {
  走者釘付: { type: 'gold', category: 'pitcher' },
  サブポジ捕手: { type: 'gold', category: 'fielder' },
  普通技能: { type: 'blue', category: 'fielder' },
  投手一般: { type: 'blue', category: 'pitcher' },
};

describe('Utility: normalizeName', () => {
  it('should remove full-width and half-width spaces', () => {
    expect(normalizeName(' 猪狩 守 ')).toBe('猪狩守');
    expect(normalizeName('矢部　明雄')).toBe('矢部明雄'); // Full-width space
  });

  it('should handle null or undefined gracefully', () => {
    expect(normalizeName(null as any)).toBe('');
  });
});

describe('Logic: Skill Sorting (getSortedSkills)', () => {
  it('should prioritize Gold skills over Blue skills', () => {
    const skillCounts = {
      普通技能: 5,
      走者釘付: 1,
    };
    const result = getSortedSkills(skillCounts, mockSkills);
    expect(result[0].name).toBe('走者釘付');
    expect(result[0].isGold).toBe(true);
    expect(result[0].weight).toBe(PRIORITY.GOLD);
  });

  it('should sort by level when skill types are the same', () => {
    const skillCounts = {
      走者釘付: 1,
      サブポジ捕手: 3,
    };
    const result = getSortedSkills(skillCounts, mockSkills);
    // Both are Gold, but サブポジ捕手 is Lv3
    expect(result[0].name).toBe('サブポジ捕手');
  });

  it('should sort alphabetically if type and level are identical', () => {
    const skillCounts = {
      B_Skill: 1,
      A_Skill: 1,
    };
    const result = getSortedSkills(skillCounts, mockSkills);
    expect(result[0].name).toBe('A_Skill');
  });

  it('should handle missing skill definitions in mock data', () => {
    const skillCounts = { Unknown_Skill: 1 };
    const result = getSortedSkills(skillCounts, mockSkills);
    expect(result[0].isGold).toBe(false);
    expect(result[0].category).toBe('universal');
    expect(result[0].weight).toBe(PRIORITY.OTHER);
  });
});

describe('Logic: Combo Category (getComboCategory)', () => {
  it('should classify as pitcher if it grants a Pitcher Gold skill', () => {
    const combo = {
      rewards: { skills: [{ name: '走者釘付', level: 1 }] },
    };
    expect(getComboCategory(combo, mockSkills)).toBe('pitcher');
  });

  it('should classify as fielder if it grants a Fielder Gold skill', () => {
    const combo = {
      rewards: { skills: [{ name: 'サブポジ捕手', level: 1 }] },
    };
    expect(getComboCategory(combo, mockSkills)).toBe('fielder');
  });

  it('should default to fielder for Blue skills even if they are for pitchers', () => {
    const combo = {
      rewards: { skills: [{ name: '投手一般', level: 3 }] },
    };
    expect(getComboCategory(combo, mockSkills)).toBe('fielder');
  });

  it('should handle combos with no skill rewards', () => {
    const combo = { rewards: { skills: [] } };
    expect(getComboCategory(combo, mockSkills)).toBe('fielder');
  });
});

describe('Logic: Effective Skills (calculateEffectiveSkills)', () => {
  const mockCombo = {
    characters: ['猪狩守', '矢部明雄'],
    rewards: { skills: [{ name: '走者釘付', level: 1 }] },
  };
  const mockCharData = {
    猪狩守: { school: 'パワフル高校' },
  };

  it('should add +1 level when scenario bonus is active', () => {
    const result = calculateEffectiveSkills(mockCombo, 'パワフル高校', mockCharData);
    expect(result['走者釘付']).toBe(2);
  });

  it('should stay at base level when no scenario match', () => {
    const result = calculateEffectiveSkills(mockCombo, '他校', mockCharData);
    expect(result['走者釘付']).toBe(1);
  });

  it('should handle missing character data in scenario check', () => {
    const result = calculateEffectiveSkills(mockCombo, 'パワフル高校', {});
    expect(result['走者釘付']).toBe(1);
  });
});

describe('TDD: getAvailableCombos Fix', () => {
  const mockAllCombos = [
    { id: 1, name: 'Special Training', characters: ['猪狩守', '矢部明雄'] },
    { id: 2, name: 'Solo Combo', characters: ['友沢亮 '] },
  ];

  it('should match multiple combos if requirements are met', () => {
    const selected = ['猪狩守', '矢部明雄', '友沢亮'];
    const result = getAvailableCombos(mockAllCombos, selected);
    expect(result).toHaveLength(2);
  });
});
