/**
 * Game mechanics constants and utility functions.
 * All logic is decoupled from UI for testability.
 */

export const PRIORITY = {
  GOLD: 1000,
  OTHER: 0
};

/**
 * Removes whitespace and full-width spaces from character names or skill names.
 */
export const normalizeName = (name: string): string => 
  name?.replace(/[\s\u3000]/g, '') || "";

/**
 * Extracts skill metadata based on the provided JSON structure.
 * Returns 'universal' as default category if skill is not found.
 */
export const getSkillInfo = (skillName: string, skillsData: Record<string, any>) => {
  const normalized = normalizeName(skillName);
  const s = skillsData[normalized];
  
  if (!s) {
    return { isGold: false, category: 'universal', weight: 0 };
  }
  
  const isGold = s.type === 'gold';
  return {
    isGold,
    category: s.category || 'universal',
    weight: isGold ? PRIORITY.GOLD : PRIORITY.OTHER
  };
};

/**
 * Calculates effective skill levels considering scenario bonuses.
 * In 2024/2025/2026 mechanics, matching a scenario often grants +1 to skill levels.
 */
export const calculateEffectiveSkills = (
  combo: any, 
  activeScenario: string, 
  charData: Record<string, any>
): Record<string, number> => {
  const effectiveSkills: Record<string, number> = {};
  
  // Verify if any character in the combo belongs to the currently active scenario school
  const hasScenarioBonus = combo.characters?.some((charName: string) => {
    const normalized = normalizeName(charName);
    return charData[normalized]?.school === activeScenario;
  }) || false;

  const bonus = hasScenarioBonus ? 1 : 0;

  combo.rewards?.skills?.forEach((skill: any) => {
    // Add bonus to the base level defined in the combo
    effectiveSkills[skill.name] = skill.level + bonus;
  });

  return effectiveSkills;
};

/**
 * Processes and sorts skills accumulated from selected combos.
 * Priority: 1. Gold Status, 2. Skill Level, 3. Alphabetical Name (A-Z).
 */
export const getSortedSkills = (skillMap: Record<string, number>, skillsData: Record<string, any>) => {
  return Object.entries(skillMap).map(([name, level]) => {
    const info = getSkillInfo(name, skillsData);
    return { name, level, ...info };
  }).sort((a, b) => 
    b.weight - a.weight || 
    b.level - a.level || 
    a.name.localeCompare(b.name)
  );
};

/**
 * Classifies a combo as 'pitcher' or 'fielder'.
 * Returns 'pitcher' only if it provides a gold skill specifically for pitchers.
 */
export const getComboCategory = (combo: any, skillsData: Record<string, any>): 'pitcher' | 'fielder' => {
  const rewards = combo.rewards?.skills || [];
  const hasPitcherGold = rewards.some((s: any) => {
    const info = getSkillInfo(s.name, skillsData);
    return info.category === 'pitcher' && info.isGold;
  });
  return hasPitcherGold ? 'pitcher' : 'fielder';
};