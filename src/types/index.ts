export type Position = '一' | '二' | '三' | '遊' | '外' | '捕' | '投' | 'マ';

export interface RewardSkill {
  name: string;
  level: number;
  verified: boolean;
}

export interface CharacterRewards {
  skills: RewardSkill[];
  stats: Record<string, number>;
}

export interface Character {
  name: string;
  position: Position;
  encounter_map: string;
  rewards?: CharacterRewards; // Optional because Managers don't have this
  description?: string; // Managers have this
}

export interface CharacterMapping {
  id: number;
  name: string;
  img_standard: string;
  img_pos: string;
}

export interface Combo {
  characters: string[];
  map: string;
  rewards: {
    skills: RewardSkill[];
    stats: Record<string, number>;
  };
}

export interface GameMap {
  max_combos: number;
  combo_names: string[][];
}

export interface SkillMetadata {
  name: string;
  type: 'gold' | 'normal';
  category: 'pitcher' | 'fielder' | 'common';
  description: string;
}
