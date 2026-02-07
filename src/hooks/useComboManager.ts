import { useMemo, useState, useEffect } from 'react';
import charactersDataRaw from '@/data/characters.json';
import combosDataRaw from '@/data/combos.json';
import mapsDataRaw from '@/data/maps.json';
import charactersMappingRaw from '@/data/character_mapping.json';
import { Character, Combo } from '@/types';

const charactersData = charactersDataRaw as Record<string, Character>;
const combosData = combosDataRaw as Record<string, Combo>;
const mapsData = mapsDataRaw as Record<string, any>;
const charactersMapping = charactersMappingRaw as any;

export const useComboManager = () => {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [selectedComboIds, setSelectedComboIds] = useState<Set<string>>(new Set());

  const characterMapping = useMemo(() => ({
    idToName: charactersMapping,
    data: charactersData
  }), []);

  useEffect(() => {
    setSelectedComboIds((prev) => {
      const next = new Set(prev);
      let changed = false;
      Object.entries(combosData).forEach(([id, combo]) => {
        const hasAll = combo.characters.every(name => selectedNames.has(name));
        if (hasAll && !next.has(id)) {
          next.add(id);
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [selectedNames]);

  const toggleCharacter = (name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleCombo = (comboId: string) => {
    const targetCombo = combosData[comboId];
    if (!targetCombo) return;

    setSelectedComboIds((prevCombos) => {
      const isActivating = !prevCombos.has(comboId);
      const nextCombos = new Set(prevCombos);

      if (isActivating) {
        nextCombos.add(comboId);
        // Add all characters belonging to this combo
        setSelectedNames((prevNames) => {
          const nextNames = new Set(prevNames);
          targetCombo.characters.forEach(c => nextNames.add(c));
          return nextNames;
        });
      } else {
        nextCombos.delete(comboId);
        setSelectedNames((prevNames) => {
          const nextNames = new Set(prevNames);
          
          targetCombo.characters.forEach(charName => {
            const isUsedByOtherActiveCombo = Array.from(nextCombos).some(id => 
              combosData[id]?.characters.includes(charName)
            );
            if (!isUsedByOtherActiveCombo) {
              nextNames.delete(charName);
            }
          });
          return nextNames;
        });
      }
      return nextCombos;
    });
  };

  const analysis = useMemo(() => {
    const stats: Record<string, number> = {};
    const skillsMap: Record<string, number> = {};
    
    selectedNames.forEach(name => {
      const char = charactersData[name];
      char?.rewards?.stats && Object.entries(char.rewards.stats).forEach(([s, v]) => {
        stats[s] = (stats[s] || 0) + v;
      });
    });

    selectedComboIds.forEach(id => {
      combosData[id]?.rewards?.skills?.forEach(sk => {
        skillsMap[sk.name] = (skillsMap[sk.name] || 0) + sk.level;
      });
    });

    return {
      stats,
      skills: Object.entries(skillsMap).map(([name, level]) => ({ name, level: Math.min(level, 5) })),
      missingCharacters: Array.from(selectedComboIds).flatMap(id => 
        combosData[id]?.characters.filter(c => !selectedNames.has(c)) || []
      ),
      totalSelectedCombos: selectedComboIds.size
    };
  }, [selectedNames, selectedComboIds]);

  return {
    ownedChars: selectedNames,
    toggleCharacter,
    selectedComboIds,
    toggleCombo,
    toggleAllByType: (type: 'pitcher' | 'fielder') => {
      setSelectedNames(prev => {
        const next = new Set(prev);
        Object.entries(charactersData).forEach(([n, c]) => {
          const isP = c.position === "投" || c.position === "マ";
          if ((type === 'pitcher' && isP) || (type === 'fielder' && !isP)) next.add(n);
        });
        return next;
      });
    },
    clearAll: () => { setSelectedNames(new Set()); setSelectedComboIds(new Set()); },
    analysis,
    libraryGroups: useMemo(() => {
      const withC: string[] = [], noC: string[] = [];
      const participants = new Set(Object.values(combosData).flatMap(c => c.characters));
      Object.keys(charactersData).forEach(n => participants.has(n) ? withC.push(n) : noC.push(n));
      return { withCombo: withC, noCombo: noC };
    }, []),
    mapsData,
    characterMapping
  };
};