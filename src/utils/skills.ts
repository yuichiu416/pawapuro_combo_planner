// src/utils/skills.ts
import skillsDataEn from '@/data/skills_en.json';
import skillsDataJa from '@/data/skills.json';
import skillsDataZh from '@/data/skills_zh.json';

const skillsDataJaTyped = skillsDataJa as Record<string, any>;

const LOCALE_SKILLS: Record<string, Record<string, any>> = {
  ja: skillsDataJaTyped,
  en: skillsDataEn as Record<string, any>,
  zh: skillsDataZh as Record<string, any>,
};

/**
 * Looks up a skill's localized display name for the given language.
 * The Japanese key is always the canonical identifier used across all game
 * data (skills.json, combos.json, links.json); this only affects what's
 * *shown*. Falls back to the Japanese key itself when a translation isn't
 * filled in yet for that language/skill.
 */
export function getLocalizedSkillName(jaKey: string, language: string): string {
  const localized = (LOCALE_SKILLS[language] ?? skillsDataJaTyped)[jaKey];
  return localized?.name || jaKey;
}

/** Same fallback behavior as getLocalizedSkillName, for the description field. */
export function getLocalizedSkillDescription(jaKey: string, language: string): string {
  const localized = (LOCALE_SKILLS[language] ?? skillsDataJaTyped)[jaKey] ?? {};
  return localized.description || skillsDataJaTyped[jaKey]?.description || '';
}
