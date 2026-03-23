import { describe, it, expect } from 'vitest';
import { normalizeName, getSkillInfo, getSortedSkills, getComboCategory } from '@/utils/gameLogic';

// Standardized Mock Data for the Baseline
const mockSkillsData = {
  走者釘付: { type: 'gold', category: 'pitcher' },
  サブポジ捕手: { type: 'gold', category: 'fielder' },
  打たれ強さ: { type: 'blue', category: 'pitcher' },
  回復: { type: 'blue', category: 'universal' },
};

describe('Core Engine: Baseline Tests', () => {
  describe('Normalization', () => {
    it('should handle various space types in names', () => {
      expect(normalizeName(' 猪狩 守 ')).toBe('猪狩守');
      expect(normalizeName('矢部　明雄')).toBe('矢部明雄'); // Full-width
    });

    it('should return an empty string for null/undefined', () => {
      expect(normalizeName(null as any)).toBe('');
      expect(normalizeName(undefined as any)).toBe('');
    });
  });

  describe('Skill Info Retrieval', () => {
    it('should identify gold skills and assign high priority weight', () => {
      const info = getSkillInfo('走者釘付', mockSkillsData);
      expect(info.isGold).toBe(true);
      expect(info.weight).toBeGreaterThan(0);
    });

    it('should fallback to universal/blue for missing skills', () => {
      const info = getSkillInfo('NewSkill2026', mockSkillsData);
      expect(info.isGold).toBe(false);
      expect(info.category).toBe('universal');
    });
  });

  describe('Advanced Sorting (The Heart of the App)', () => {
    it('should sort by: Gold > Level > Alphabetical', () => {
      const input = {
        回復: 5, // Blue, Lv 5
        走者釘付: 1, // Gold, Lv 1
        サブポジ捕手: 3, // Gold, Lv 3
      };

      const result = getSortedSkills(input, mockSkillsData);

      // 1st: Gold & Higher Level
      expect(result[0].name).toBe('サブポジ捕手');
      // 2nd: Gold & Lower Level
      expect(result[1].name).toBe('走者釘付');
      // 3rd: Blue (even if higher level)
      expect(result[2].name).toBe('回復');
    });
  });

  describe('Combo Categorization', () => {
    it('should tag combo as pitcher ONLY if it gives a Pitcher Gold skill', () => {
      const pitcherCombo = {
        rewards: { skills: [{ name: '走者釘付', level: 1 }] },
      };
      const fielderCombo = {
        rewards: { skills: [{ name: '打たれ強さ', level: 3 }] }, // Blue pitcher skill
      };

      expect(getComboCategory(pitcherCombo, mockSkillsData)).toBe('pitcher');
      expect(getComboCategory(fielderCombo, mockSkillsData)).toBe('fielder');
    });
  });
});
