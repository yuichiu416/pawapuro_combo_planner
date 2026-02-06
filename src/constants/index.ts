/**
 * Game positions constants based on Japanese source data.
 * These values match the character data in the raw_data folder.
 */
export const POSITIONS = [
  "投",
  "捕",
  "一",
  "二",
  "三",
  "遊",
  "外",
  "マ"
] as const;

/**
 * Character types or other game-specific constants.
 */
export const CHARACTER_TYPES = ["筋力", "敏捷", "技術", "変化球", "精神"] as const;

// TypeScript types derived from constants
export type Position = typeof POSITIONS[number];
export type CharacterType = typeof CHARACTER_TYPES[number];