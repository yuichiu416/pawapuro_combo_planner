// src/__tests__/utils/stats.test.ts
import { describe, expect, it } from 'vitest';
import en from '@/i18n/en.json';
import ja from '@/i18n/ja.json';
import zh from '@/i18n/zh.json';
import { STAT_I18N_KEY, STAT_KEYS } from '@/utils/stats';

describe('STAT_KEYS', () => {
  it('contains exactly the 5 in-game stats, in the conventional display order', () => {
    expect(STAT_KEYS).toEqual(['筋力', '敏捷', '技術', '変化球', '精神']);
  });
});

describe('STAT_I18N_KEY', () => {
  it('has an entry for every stat in STAT_KEYS', () => {
    for (const key of STAT_KEYS) {
      expect(STAT_I18N_KEY[key]).toBeDefined();
    }
  });

  it('every mapped i18n key actually exists in each locale file (catches drift if a stats.* key is renamed)', () => {
    for (const i18nKey of Object.values(STAT_I18N_KEY)) {
      expect(ja.stats).toHaveProperty(i18nKey);
      expect(en.stats).toHaveProperty(i18nKey);
      expect(zh.stats).toHaveProperty(i18nKey);
    }
  });

  it('maps 筋力 to strength, matching the Japanese source in ja.json', () => {
    expect(STAT_I18N_KEY['筋力']).toBe('strength');
    expect(ja.stats.strength).toBe('筋力');
  });
});
