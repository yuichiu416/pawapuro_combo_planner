// src/hooks/useComboManager.ts
import { useMemo, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
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
const LOCAL_STORAGE_KEY = 'pawapuro_planner_local_v1';

export const useComboManager = () => {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set(FIXED_MEMBERS));
  const [selectedComboIds, setSelectedComboIds] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  // --- PERSISTENCE HELPERS ---
  
  const saveLocally = () => {
    const data = {
      selected_characters: Array.from(selectedNames).filter(n => !FIXED_MEMBERS.includes(n)),
      selected_combos: Array.from(selectedComboIds),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    return data.updated_at;
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const { selected_characters, selected_combos } = JSON.parse(saved);
        setSelectedNames(new Set([...FIXED_MEMBERS, ...(selected_characters || [])]));
        setSelectedComboIds(new Set(selected_combos || []));
        return true;
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
    return false;
  };

  // 1. HYDRATION: Priority -> Supabase, Fallback -> LocalStorage
  useEffect(() => {
    const loadSavedData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // No user? Try loading from browser storage
        loadFromLocalStorage();
        isInitialLoad.current = false;
        return;
      }

      const { data, error } = await supabase
        .from('user_saves')
        .select('selected_characters, selected_combos')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && !error) {
        setSelectedNames(new Set([...FIXED_MEMBERS, ...(data.selected_characters || [])]));
        setSelectedComboIds(new Set(data.selected_combos || []));
      } else {
        // If logged in but no cloud data, check local as a secondary fallback
        loadFromLocalStorage();
      }
      
      setTimeout(() => { isInitialLoad.current = false; }, 500);
    };

    loadSavedData();
  }, []);

  // 2. AUTO-SAVE: Debounced Cloud Save
  useEffect(() => {
    if (isInitialLoad.current) return;

    const saveData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Always save locally as a background backup, even if logged in
      saveLocally();

      if (!user) return;

      setIsSyncing(true);
      const { error } = await supabase.from('user_saves').upsert({
        user_id: user.id,
        selected_characters: Array.from(selectedNames).filter(n => !FIXED_MEMBERS.includes(n)),
        selected_combos: Array.from(selectedComboIds),
        updated_at: new Date().toISOString(),
      });

      if (error) console.error("Auto-save failed:", error.message);
      setIsSyncing(false);
    };

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveData();
    }, 2000);

    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [selectedNames, selectedComboIds]);

  // 3. LOGIC & MAPPING
  const characterMapping = useMemo(() => ({
    idToName: charactersMapping,
    data: charactersData
  }), []);

  // Auto-activate combos logic
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
    const mapCompletion: Record<string, { selected: number; total: number }> = {};
    
    let pCount = 0; let fCount = 0; let mCount = 0;

    Object.entries(mapsData).forEach(([mapName, data]) => {
      mapCompletion[mapName] = { selected: 0, total: data.max_combos || 0 };
    });

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
      if (!combo) return;

      combo.rewards?.skills?.forEach(sk => {
        skillsMap[sk.name] = (skillsMap[sk.name] || 0) + sk.level;
      });

      combo.characters.forEach(c => {
        if (!selectedNames.has(c)) missingSet.add(c);
      });

      Object.entries(mapsData).forEach(([mapName, data]) => {
        const isMatch = data.combo_names.some((names: string[]) => 
          names.length === combo.characters.length && 
          names.every(n => combo.characters.includes(n))
        );
        if (isMatch) mapCompletion[mapName].selected++;
      });
    });

    const scoutCount = pCount + fCount;
    const totalRosterSize = scoutCount + FIXED_MEMBERS.length;

    return {
      stats,
      skills: Object.entries(skillsMap).map(([name, level]) => ({ name, level: Math.min(level, 5) })),
      missingCharacters: Array.from(missingSet),
      totalSelectedCombos: selectedComboIds.size,
      mapCompletion,
      roster: {
        pitcher: pCount, fielder: fCount, manager: mCount,
        total: totalRosterSize,
        isValid: scoutCount <= 23 && pCount >= 6 && pCount <= 8 && fCount >= 15 && fCount <= 17 && mCount <= 3 ,
        errors: {
          total: scoutCount > 23,
          pitcher: pCount < 6 || pCount > 8,
          fielder: fCount < 15 || fCount > 17,
          manager: mCount > 3
        }
      }
    };
  }, [selectedNames, selectedComboIds]);

  return {
    ownedChars: selectedNames,
    setOwnedChars: setSelectedNames,
    selectedComboIds,
    setSelectedComboIds,
    toggleCharacter,
    toggleCombo,
    isSyncing,
    analysis,
    mapsData,
    characterMapping,
    saveLocally, 
    clearAll: () => { 
      setSelectedNames(new Set(FIXED_MEMBERS)); 
      setSelectedComboIds(new Set()); 
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    },
    toggleAllByType: (type: 'pitcher' | 'fielder' | 'manager', currentChars: string[]) => {
      setSelectedNames(prev => {
        const next = new Set(prev);
        const charsOfType = currentChars.filter(name => {
          const char = charactersData[name];
          if (!char) return false;
          if (type === 'pitcher') return char.position?.trim() === '投';
          if (type === 'manager') return char.position?.trim() === 'マ';
          return char.position?.trim() !== '投' && char.position?.trim() !== 'マ';
        });

        const allSelected = charsOfType.every(name => next.has(name));
        if (allSelected) {
          charsOfType.forEach(name => {
            if (!FIXED_MEMBERS.includes(name)) next.delete(name);
          });
        } else {
          charsOfType.forEach(name => next.add(name));
        }
        return next;
      });
    },
    libraryGroups: useMemo(() => {
      const withC: string[] = [], noC: string[] = [];
      const participants = new Set(Object.values(combosData).flatMap(c => c.characters));
      Object.keys(charactersData).forEach(n => {
        if (FIXED_MEMBERS.includes(n)) return; 
        participants.has(n) ? withC.push(n) : noC.push(n);
      });
      return { withCombo: withC, noCombo: noC };
    }, [])
  };
};