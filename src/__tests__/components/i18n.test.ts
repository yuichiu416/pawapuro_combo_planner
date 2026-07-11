// src/__tests__/i18n/i18n.test.ts
// TDD: these tests define what the i18n system must do.
// Run with: npx vitest run src/__tests__/i18n/i18n.test.ts

import { describe, expect, it, beforeEach } from 'vitest';
import i18n from '@/i18n/config';

describe('i18n configuration', () => {
  it('initializes with Japanese as default language', () => {
    expect(i18n.language).toBe('ja');
  });

  it('supports all three target languages', () => {
    const supported = i18n.options.supportedLngs as string[];
    expect(supported).toContain('ja');
    expect(supported).toContain('en');
    expect(supported).toContain('zh');
  });

  it('translates a key in Japanese', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('nav.combo_planner')).toBe('コンボプランナー');
  });

  it('translates a key in English', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('nav.combo_planner')).toBe('Combo Planner');
  });

  it('translates a key in Chinese', async () => {
    await i18n.changeLanguage('zh');
    expect(i18n.t('nav.combo_planner')).toBe('連擊規劃器');
  });

  it('falls back to key if translation missing', async () => {
    await i18n.changeLanguage('ja');
    expect(i18n.t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('translates stat names in Japanese', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('stats.strength')).toBe('筋力');
    expect(i18n.t('stats.speed')).toBe('敏捷');
    expect(i18n.t('stats.technique')).toBe('技術');
    expect(i18n.t('stats.breaking_ball')).toBe('変化球');
    expect(i18n.t('stats.spirit')).toBe('精神');
  });

  it('translates stat names in English', async () => {
    await i18n.changeLanguage('en');
    expect(i18n.t('stats.strength')).toBe('Strength');
    expect(i18n.t('stats.speed')).toBe('Agility');
    expect(i18n.t('stats.technique')).toBe('Technique');
    expect(i18n.t('stats.breaking_ball')).toBe('Breaking Ball');
    expect(i18n.t('stats.spirit')).toBe('Spirit');
  });

  it('translates stat names in Chinese', async () => {
    await i18n.changeLanguage('zh');
    expect(i18n.t('stats.strength')).toBe('筋力');
    expect(i18n.t('stats.speed')).toBe('敏捷');
  });

  it('translates position names', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('positions.pitcher')).toBe('投手');
    expect(i18n.t('positions.catcher')).toBe('捕手');
    expect(i18n.t('positions.manager')).toBe('マネージャー');
  });

  it('translates UI labels in Japanese', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('ui.save')).toBe('保存');
    expect(i18n.t('ui.clear')).toBe('クリア');
    expect(i18n.t('ui.search_placeholder')).toBe('名前・スキルで検索');
    expect(i18n.t('ui.active_roster')).toBe('選手登録');
    expect(i18n.t('ui.combos_found')).toBe('コンボ数');
  });

  it('translates difficulty labels', () => {
    i18n.changeLanguage('ja');
    expect(i18n.t('difficulty.rookie')).toBe('ルーキー');
    expect(i18n.t('difficulty.normal')).toBe('ノーマル');
    expect(i18n.t('difficulty.expert')).toBe('達人');
  });
});
