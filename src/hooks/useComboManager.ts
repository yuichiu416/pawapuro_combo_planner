import { useMemo, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase'; // Assuming you created this file
import charactersDataRaw from '@/data/characters.json';
import combosDataRaw from '@/data/combos.json';
import mapsDataRaw from '@/data/maps.json';
import charactersMappingRaw from '@/data/character_mapping.json';
import type { Character, Combo } from '@/types';

const charactersData = charactersDataRaw as Record<string, Character>;
const combosData = combosDataRaw as Record<string, Combo>;
const mapsData = mapsDataRaw as Record<string, any>;
const charactersMapping = charactersMappingRaw as any;

const FIXED_MEMBERS = ["パワプロ", "矢部明雄"]; 

export const useComboManager = () => {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set(FIXED_MEMBERS));
  const [selectedComboIds, setSelectedComboIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. HYDRATION: Load from Supabase on Mount
  useEffect(() => {
    const loadSavedData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_saves')
        .select('selected_names, selected_combos')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        // We still add FIXED_MEMBERS just in case the save got corrupted
        setSelectedNames(new Set([...FIXED_MEMBERS, ...data.selected_names]));
        setSelectedComboIds(new Set(data.selected_combos));
      }
    };

    loadSavedData();
  }, []);

  // 2. AUTO-SAVE: Debounced Save to Supabase
  useEffect(() => {
    const saveData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setIsSyncing(true);
      await supabase.from('user_saves').upsert({
        user_id: user.id,
        selected_names: Array.from(selectedNames),
        selected_combos: Array.from(selectedComboIds),
        updated_at: new Date().toISOString(),
      });
      setIsSyncing(false);
    };

    // Debounce: Wait 1.5 seconds after last change before saving
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveData();
    }, 1500);

    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [selectedNames, selectedComboIds]);

  const characterMapping = useMemo(() => ({
    idToName: charactersMapping,
    data: charactersData
  }), []);

  // Auto-activate combos based on selected characters
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
    if (FIXED_MEMBERS.includes(name)) return;
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
            if (!isUsedByOtherActiveCombo && !FIXED_MEMBERS.includes(charName)) {
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
    const missingSet = new Set<string>();
    
    let pCount = 0;
    let fCount = 0;
    let mCount = 0;

    selectedNames.forEach(name => {
      const char = charactersData[name];
      if (!char) return;

      if (char.rewards?.stats) {
        Object.entries(char.rewards.stats).forEach(([s, v]) => {
          stats[s] = (stats[s] || 0) + v;
        });
      }

      if (!FIXED_MEMBERS.includes(name)) {
        const pos = char.position?.trim();
        if (pos === "マ") mCount++;
        else if (pos === "投") pCount++;
        else fCount++; 
      }
    });

    selectedComboIds.forEach(id => {
      const combo = combosData[id];
      combo?.rewards?.skills?.forEach(sk => {
        skillsMap[sk.name] = (skillsMap[sk.name] || 0) + sk.level;
      });
      combo?.characters.forEach(c => {
        if (!selectedNames.has(c)) missingSet.add(c);
      });
    });

    const scoutCount = pCount + fCount;
    const totalRosterSize = scoutCount + FIXED_MEMBERS.length;
    const isScoutLimitValid = scoutCount <= 23;
    const isPValid = pCount >= 6 && pCount <= 8;
    const isMValid = mCount <= 3;

    return {
      stats,
      skills: Object.entries(skillsMap).map(([name, level]) => ({ name, level: Math.min(level, 5) })),
      missingCharacters: Array.from(missingSet),
      totalSelectedCombos: selectedComboIds.size,
      roster: {
        pitcher: pCount,
        fielder: fCount,
        manager: mCount,
        total: totalRosterSize, 
        isValid: isScoutLimitValid && isPValid && isMValid,
        errors: {
          total: !isScoutLimitValid,
          pitcher: !isPValid,
          manager: !isMValid,
          fielder: scoutCount > 23 && isPValid 
        }
      }
    };
  }, [selectedNames, selectedComboIds]);

  return {
    ownedChars: selectedNames,
    toggleCharacter,
    selectedComboIds,
    toggleCombo,
    isSyncing, // Export this so you can show a "Saving..." spinner in UI
    toggleAllByType: (type: 'pitcher' | 'fielder') => {
      setSelectedNames(prev => {
        const next = new Set(prev);
        Object.entries(charactersData).forEach(([n, c]) => {
          if (FIXED_MEMBERS.includes(n)) return; 
          const pos = c.position?.trim();
          const isPitcher = pos === "投";
          const isManager = pos === "マ";
          if (type === 'pitcher' && isPitcher) next.add(n);
          if (type === 'fielder' && !isPitcher && !isManager) next.add(n);
        });
        return next;
      });
    },
    clearAll: () => { 
      setSelectedNames(new Set(FIXED_MEMBERS)); 
      setSelectedComboIds(new Set()); 
    },
    analysis,
    libraryGroups: useMemo(() => {
      const withC: string[] = [], noC: string[] = [];
      const participants = new Set(Object.values(combosData).flatMap(c => c.characters));
      Object.keys(charactersData).forEach(n => {
        if (FIXED_MEMBERS.includes(n)) return; 
        participants.has(n) ? withC.push(n) : noC.push(n);
      });
      return { withCombo: withC, noCombo: noC };
    }, []),
    mapsData,
    characterMapping
  };
};