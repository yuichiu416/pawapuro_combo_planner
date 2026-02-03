import { describe, it, expect } from 'vitest';
import { calculateEffectiveSkills } from '@/utils/gameLogic';

const mockSkills = {
  "走者釘付": { type: "gold", category: "pitcher" }
};

const mockCombo = {
  characters: ["猪狩守", "台場達也"],
  rewards: { skills: [{ name: "走者釘付", level: 1 }] }
};

// Character data identifying who belongs to which school
const mockChars = {
  "台場達也": { school: "Kaito" },
  "猪狩守": { school: "Akatsuki" }
};

describe('Logic: Scenario Bonuses', () => {
  it('should add +1 level to skills if a character belongs to the active scenario', () => {
    const activeScenario = "Kaito";
    const result = calculateEffectiveSkills(mockCombo, activeScenario, mockChars);
    
    // 台場達也 is from Kaito, so the combo reward gets +1 level
    // Original level 1 + Bonus 1 = 2
    expect(result["走者釘付"]).toBe(2);
  });

  it('should not add bonus if scenario does not match', () => {
    const activeScenario = "Powerful_High";
    const result = calculateEffectiveSkills(mockCombo, activeScenario, mockChars);
    
    // No match, level remains 1
    expect(result["走者釘付"]).toBe(1);
  });
});