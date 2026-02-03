// src/logic/skillUtils.ts

export const PRIORITY = { GOLD: 1000, OTHER: 0 };

export const getSkillInfo = (skillName: string, skillsData: any) => {
  const s = skillsData[skillName];
  if (!s) return { isGold: false, category: 'unknown', weight: 0 };
  
  const isGold = s.type === 'gold';
  return {
    isGold,
    category: s.category,
    weight: isGold ? PRIORITY.GOLD : PRIORITY.OTHER
  };
};

export const sortSkills = (skills: any[], skillsData: any) => {
  return [...skills].sort((a, b) => {
    const infoA = getSkillInfo(a.name, skillsData);
    const infoB = getSkillInfo(b.name, skillsData);
    
    // 1. Weight (Gold first)
    // 2. Level (Higher first)
    // 3. Alphabetical
    return (infoB.weight - infoA.weight) || 
           (b.level - a.level) || 
           a.name.localeCompare(b.name);
  });
};