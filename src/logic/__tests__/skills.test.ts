import { describe, it, expect } from 'vitest';
import { getSortedSkills } from '@/utils/gameLogic';

/**
 * Mock data for skill definitions.
 * Categorized by type (gold/blue) and position (pitcher/fielder).
 */
const mockSkillsData = {
  "走者釘付": { type: "gold", category: "pitcher" },
  "サブポジ捕手": { type: "gold", category: "fielder" },
  "打たれ強さ": { type: "blue", category: "pitcher" }
};

describe('Logic: Skill Sorting functionality', () => {
  it('should prioritize gold skills over blue skills regardless of level', () => {
    // Input mapping: Skill Name -> Level
    const input = {
      "打たれ強さ": 5, // Blue skill (Lv. 5)
      "走者釘付": 1    // Gold skill (Lv. 1)
    };
    
    const result = getSortedSkills(input, mockSkillsData);
    
    // Gold skill must be the first element
    expect(result[0].name).toBe("走者釘付");
    expect(result[0].isGold).toBe(true);
  });

  it('should sort by level in descending order if both skills are gold', () => {
    const input = {
      "走者釘付": 1,
      "サブポジ捕手": 3
    };
    
    const result = getSortedSkills(input, mockSkillsData);
    
    // Higher level (3) should come before lower level (1)
    expect(result[0].name).toBe("サブポジ捕手");
    expect(result[0].level).toBe(3);
  });

  it('should handle unknown skills gracefully by treating them as blue/universal', () => {
    const input = { "NonExistentSkill": 1 };
    
    const result = getSortedSkills(input, mockSkillsData);
    
    // Verify fallback behavior: no crash, default to non-gold
    expect(result.length).toBe(1);
    expect(result[0].isGold).toBe(false);
    expect(result[0].category).toBe('universal');
  });
});