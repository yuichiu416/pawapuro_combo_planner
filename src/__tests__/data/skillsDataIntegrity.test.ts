// src/__tests__/data/skillsDataIntegrity.test.ts
// TDD: skills.json (ja) is the canonical key source. skills_en.json / skills_zh.json
// must use the exact same dict keys, or a translation silently falls back to
// Japanese even though a (now-orphaned) translated entry exists under the wrong key.
// Run with: npx vitest run src/__tests__/data/skillsDataIntegrity.test.ts

import { describe, expect, it } from 'vitest';
import skillsJa from '@/data/skills.json';
import skillsEn from '@/data/skills_en.json';
import skillsZh from '@/data/skills_zh.json';

const jaKeys = new Set(Object.keys(skillsJa));

describe('skill translation key alignment', () => {
  it('has no skills_en.json keys missing from skills.json', () => {
    const orphaned = Object.keys(skillsEn).filter((k) => !jaKeys.has(k));
    expect(orphaned).toEqual([]);
  });

  it('has no skills_zh.json keys missing from skills.json', () => {
    const orphaned = Object.keys(skillsZh).filter((k) => !jaKeys.has(k));
    expect(orphaned).toEqual([]);
  });

  it('translates every ja skill name in skills_en.json', () => {
    const missing = Object.keys(skillsJa).filter((k) => !(k in skillsEn));
    expect(missing).toEqual([]);
  });

  it('translates every ja skill name in skills_zh.json', () => {
    const missing = Object.keys(skillsJa).filter((k) => !(k in skillsZh));
    expect(missing).toEqual([]);
  });
});
