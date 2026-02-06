import { useMemo, useState } from 'react';
import charactersDataRaw from '@/data/characters.json';
import combosDataRaw from '@/data/combos.json';
import mapsDataRaw from '@/data/maps.json';
import charactersMappingRaw from '@/data/character_mapping.json';
import { Character, Combo } from '@/types';

const charactersData = charactersDataRaw as Record<string, Character>;
const combosData = combosDataRaw as Record<string, Combo>;
const mapsData = mapsDataRaw as Record<string, any>;
const idToNameMapping = charactersMappingRaw as Record<string, string>;

export const useComboManager = () => {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [selectedComboIds, setSelectedComboIds] = useState<Set<string>>(new Set());

  // Correctly mapping IDs to Names and providing data access
  const characterMapping = useMemo(() => ({
    idToName: idToNameMapping,
    data: charactersData
  }), []);

  const toggleCharacter = (name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleCombo = (comboId: string) => {
    setSelectedComboIds((prev) => {
      const next = new Set(prev);
      if (next.has(comboId)) next.delete(comboId);
      else next.add(comboId);
      return next;
    });
  };

  const libraryGroups = useMemo(() => {
    const withCombo: string[] = [];
    const noCombo: string[] = [];
    const comboParticipants = new Set(
      Object.values(combosData).flatMap(c => c.characters)
    );

    Object.keys(charactersData).forEach(name => {
      if (comboParticipants.has(name)) withCombo.push(name);
      else noCombo.push(name);
    });

    return { withCombo, noCombo };
  }, []);

  const activeCombos = useMemo(() => {
    const results: Record<string, Combo> = {};
    Object.entries(combosData).forEach(([id, combo]) => {
      const isMet = combo.characters.every(charName => selectedNames.has(charName));
      if (isMet) results[id] = combo;
    });
    return results;
  }, [selectedNames]);

  const analysis = useMemo(() => {
    const stats: Record<string, number> = {};
    const skillsMap: Record<string, number> = {};
    const MAX_SKILL_LEVEL = 5;

    selectedNames.forEach(name => {
      const char = charactersData[name];
      if (char?.rewards?.stats) {
        Object.entries(char.rewards.stats).forEach(([stat, val]) => {
          stats[stat] = (stats[stat] || 0) + val;
        });
      }
    });

    Object.values(activeCombos).forEach(combo => {
      combo.rewards.skills.forEach(skill => {
        skillsMap[skill.name] = (skillsMap[skill.name] || 0) + skill.level;
      });
    });

    const skills = Object.entries(skillsMap).map(([name, level]) => ({
      name,
      level
    }));

    const overflowSkills = skills
      .filter(s => s.level > MAX_SKILL_LEVEL)
      .map(s => s.name);

    return { stats, skills, overflowSkills };
  }, [selectedNames, activeCombos]);

  const toggleAllByType = (type: 'pitcher' | 'fielder') => {
    const next = new Set(selectedNames);
    Object.entries(charactersData).forEach(([name, char]) => {
      const isPitcher = char.position === "投";
      const isManager = char.position === "マ";
      const isFielder = !isPitcher && !isManager;
      
      if ((type === 'pitcher' && isPitcher) || (type === 'fielder' && isFielder)) {
        next.add(name);
      }
    });
    setSelectedNames(next);
  };

  return {
    ownedChars: selectedNames,
    toggleCharacter,
    selectedComboIds,
    toggleCombo,
    toggleAllByType,
    clearAll: () => {
      setSelectedNames(new Set());
      setSelectedComboIds(new Set());
    },
    analysis,
    libraryGroups,
    mapsData,
    characterMapping
  };
};