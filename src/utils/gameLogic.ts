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
 * Logic Fix: Filters combos where EVERY required character is present in selectedChars.
 * Handles whitespace normalization to prevent matching errors.
 */
export const getAvailableCombos = (allCombos: any[], selectedChars: string[]) => {
  if (!allCombos || !selectedChars) return [];

  // 1. Normalize all selected characters once
  const normalizedSelected = new Set(
    selectedChars.map(c => normalizeName(c))
  );

  return allCombos.filter(combo => {
    // 2. Ensure combo has a valid characters array
    const requiredChars = combo.characters || combo.char_names || [];
    
    if (requiredChars.length === 0) return false;

    // 3. Every single required character must be in the selected Set
    return requiredChars.every((charName: string) => 
      normalizedSelected.has(normalizeName(charName))
    );
  });
};
/**
 * Calculates effective skill levels considering scenario bonuses.
 */
export const calculateEffectiveSkills = (
  combo: any, 
  activeScenario: string, 
  charData: Record<string, any>
): Record<string, number> => {
  const effectiveSkills: Record<string, number> = {};
  
  const hasScenarioBonus = combo.characters?.some((charName: string) => {
    const normalized = normalizeName(charName);
    return charData[normalized]?.school === activeScenario;
  }) || false;

  const bonus = hasScenarioBonus ? 1 : 0;

  combo.rewards?.skills?.forEach((skill: any) => {
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
 */
export const getComboCategory = (combo: any, skillsData: Record<string, any>): 'pitcher' | 'fielder' => {
  const rewards = combo.rewards?.skills || [];
  const hasPitcherGold = rewards.some((s: any) => {
    const info = getSkillInfo(s.name, skillsData);
    return info.category === 'pitcher' && info.isGold;
  });
  return hasPitcherGold ? 'pitcher' : 'fielder';
};