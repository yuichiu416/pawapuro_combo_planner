// src/__tests__/utils/skills.test.ts
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/data/skills.json', () => ({
  default: {
    '根性◯': { name: '根性◯', type: 'blue', description: 'ある程度で我慢する' },
    ド根性: { name: 'ド根性', type: 'gold', description: '早めに我慢する' },
    サブポジ三塁: { type: 'green', description: '三塁を守れる' }, // no `name` field on purpose
  },
}));
vi.mock('@/data/skills_en.json', () => ({
  default: {
    '根性◯': { name: 'Guts', description: 'Endures to some extent' },
    // ド根性 intentionally omitted -- simulates an untranslated skill
  },
}));
vi.mock('@/data/skills_zh.json', () => ({
  default: {
    '根性◯': { name: '毅力', description: '' }, // name present, description blank on purpose
  },
}));

const { getLocalizedSkillDescription, getLocalizedSkillName } = await import('@/utils/skills');

describe('getLocalizedSkillName', () => {
  it('returns the Japanese name when language is ja', () => {
    expect(getLocalizedSkillName('根性◯', 'ja')).toBe('根性◯');
  });

  it('returns the English name when a translation exists', () => {
    expect(getLocalizedSkillName('根性◯', 'en')).toBe('Guts');
  });

  it('returns the Chinese name when a translation exists', () => {
    expect(getLocalizedSkillName('根性◯', 'zh')).toBe('毅力');
  });

  it('falls back to the Japanese key when the requested language has no entry for this skill', () => {
    expect(getLocalizedSkillName('ド根性', 'en')).toBe('ド根性');
  });

  it('falls back to the Japanese key when the skill has no `name` field at all', () => {
    expect(getLocalizedSkillName('サブポジ三塁', 'ja')).toBe('サブポジ三塁');
  });

  it('falls back to Japanese data when the language is not one of ja/en/zh', () => {
    expect(getLocalizedSkillName('根性◯', 'fr')).toBe('根性◯');
  });

  it('falls back to the key itself when the skill does not exist anywhere', () => {
    expect(getLocalizedSkillName('存在しないスキル', 'ja')).toBe('存在しないスキル');
  });
});

describe('getLocalizedSkillDescription', () => {
  it('returns the localized description when present', () => {
    expect(getLocalizedSkillDescription('根性◯', 'en')).toBe('Endures to some extent');
  });

  it('falls back to the Japanese description when the localized one is blank', () => {
    expect(getLocalizedSkillDescription('根性◯', 'zh')).toBe('ある程度で我慢する');
  });

  it('falls back to the Japanese description when the language has no entry for this skill', () => {
    expect(getLocalizedSkillDescription('ド根性', 'en')).toBe('早めに我慢する');
  });

  it('returns an empty string when no description exists anywhere', () => {
    expect(getLocalizedSkillDescription('存在しないスキル', 'ja')).toBe('');
  });
});
