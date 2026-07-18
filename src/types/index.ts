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
  type: 'gold' | 'blue' | 'red' | 'green' | 'normal';
  category?: 'pitcher' | 'fielder' | 'all';
  description: string;
}

export interface LinkPrerequisiteSkill {
  name: string;
  level: number;
  verified: boolean;
}

export interface LinkUpgrade {
  from: { name: string; level: number; type: SkillMetadata['type'] | null };
  to: { name: string; type: SkillMetadata['type'] | null };
}

/**
 * コツコツリンク data for a single character. Two shapes, distinguished by
 * `format`:
 *  - 'upgrade': the common case -- achieving `condition` upgrades a blue
 *    prerequisite skill (in `prerequisite_skills`, at a required level) into
 *    a gold skill (named in `granted_skills`). `upgrades` pairs them up by
 *    position when the counts line up 1:1; entries with an `or`-alternative
 *    on the granted side (represented as a nested string[] within
 *    `granted_skills`) can't be confidently paired and are left out of
 *    `upgrades`.
 *  - 'descriptive': no trigger condition at all, just two tagged groups of
 *    skills the character already has (gold and blue tier). ~18 rows in the
 *    2026-2027 sheet are this shape; `skill_groups` holds them, everything
 *    else in the 'upgrade'-only fields is empty.
 */
export interface LinkData {
  format: 'upgrade' | 'descriptive';
  condition: string | null;
  granted_skills: (string | string[])[];
  prerequisite_skills: LinkPrerequisiteSkill[];
  upgrades: LinkUpgrade[];
  skill_groups?: string[][];
  stats: Record<string, number>;
  note: string | null;
  raw: string;
  source: 'tournament' | 'headhunting';
  round?: string | null;
  school?: string | null;
  route?: string | null;
  location?: string | null;
}
