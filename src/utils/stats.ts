// src/utils/stats.ts

/** The 5 in-game stats, keyed by their Japanese display name (as used
 * throughout raw game data -- combos.json, links.json, etc). */
export type StatKey = '筋力' | '敏捷' | '技術' | '変化球' | '精神';

export const STAT_KEYS: StatKey[] = ['筋力', '敏捷', '技術', '変化球', '精神'];

/** Maps a Japanese stat name to its i18n key under the `stats` namespace
 * (see src/i18n/{ja,en,zh}.json), e.g. '筋力' -> t('stats.strength'). */
export const STAT_I18N_KEY: Record<StatKey, string> = {
  筋力: 'strength',
  敏捷: 'speed',
  技術: 'technique',
  変化球: 'breaking_ball',
  精神: 'spirit',
};
