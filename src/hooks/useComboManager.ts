// src/hooks/useComboManager.ts
import { useMemo, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import charactersDataRaw from '@/data/characters.json';
import combosDataRaw from '@/data/combos.json';
import mapsDataRaw from '@/data/maps.json';
import skillsDataRaw from '@/data/skills.json'; // Added for sorting logic
import charactersMappingRaw from '@/data/character_mapping.json';
import type { Character, Combo } from '@/types';

const charactersData = charactersDataRaw as Record<string, Character>;
const combosData = combosDataRaw as Record<string, Combo>;
const mapsData = mapsDataRaw as Record<string, any>;
const skillsData = skillsDataRaw as Record<string, any>;
const charactersMapping = charactersMappingRaw as any;

const FIXED_MEMBERS = ["パワプロ", "矢部明雄"]; 
const LOCAL_STORAGE_KEY = 'pawapuro_planner_local_v1';

export const useComboManager = () => {
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set(FIXED_MEMBERS));
  const [selectedComboIds, setSelectedComboIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);

  // --- PERSISTENCE ---
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

  useEffect(() => {
    const loadSavedData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
        loadFromLocalStorage();
      }
      setTimeout(() => { isInitialLoad.current = false; }, 500);
    };
    loadSavedData();
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) return;
    const saveData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      saveLocally();
      if (!user) return;
      
      setIsSyncing(true);
      await supabase.from('user_saves').upsert({
        user_id: user.id,
        selected_characters: Array.from(selectedNames).filter(n => !FIXED_MEMBERS.includes(n)),
        selected_combos: Array.from(selectedComboIds),
        updated_at: new Date().toISOString(),
      });
      setIsSyncing(false);
    };

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(saveData, 2000);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [selectedNames, selectedComboIds]);

  // --- CORE LOGIC ---
  const toggleCharacter = (name: string) => {
    if (FIXED_MEMBERS.includes(name)) return;
    setSelectedNames((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
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
        setSelectedNames(prev => new Set([...prev, ...targetCombo.characters]));
      } else {
        nextCombos.delete(comboId);
        setSelectedNames((prevNames) => {
          const nextNames = new Set(prevNames);
          targetCombo.characters.forEach(charName => {
            const usedByOther = Array.from(nextCombos).some(id => 
              combosData[id]?.characters.includes(charName)
            );
            if (!usedByOther && !FIXED_MEMBERS.includes(charName)) nextNames.delete(charName);
          });
          return nextNames;
        });
      }
      return nextCombos;
    });
  };

  // --- SEARCH & FILTER LOGIC ---
  const filteredComboIds = useMemo(() => {
    const allComboEntries = Object.entries(combosData);
    const lowerSearch = searchTerm.toLowerCase().trim();
    
    if (!lowerSearch) return allComboEntries.map(([id]) => id);

    return allComboEntries
      .filter(([id, combo]) => {
        const nameMatch = id.toLowerCase().includes(lowerSearch);
        const charMatch = combo.characters.some(c => c.toLowerCase().includes(lowerSearch));
        const skillMatch = combo.rewards?.skills?.some(s => 
          s.name.toLowerCase().includes(lowerSearch)
        );
        const itemMatch = combo.rewards?.items?.some(i => 
            i.name.toLowerCase().includes(lowerSearch)
        );
        
        return nameMatch || charMatch || !!skillMatch || !!itemMatch;
      })
      .map(([id]) => id);
  }, [searchTerm]);

  const libraryGroups = useMemo(() => {
    const withC: string[] = [], noC: string[] = [];
    const participants = new Set(Object.values(combosData).flatMap(c => c.characters));
    const lowerSearch = searchTerm.toLowerCase().trim();
    const filteredSet = new Set(filteredComboIds);

    Object.keys(charactersData).forEach(name => {
      if (FIXED_MEMBERS.includes(name)) return; 
      
      if (lowerSearch) {
        const nameMatch = name.toLowerCase().includes(lowerSearch);
        const comboMatch = Array.from(filteredSet).some(id => 
            combosData[id].characters.includes(name)
        );
        if (!nameMatch && !comboMatch) return;
      }

      participants.has(name) ? withC.push(name) : noC.push(name);
    });

    return { withCombo: withC, noCombo: noC };
  }, [searchTerm, filteredComboIds]);

  // --- ANALYTICS ---
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
        Object.entries(char.rewards.stats).forEach(([s, v]) => { stats[s] = (stats[s] || 0) + v; });
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

    return {
      stats,
      skills: Object.entries(skillsMap)
        .map(([name, level]) => ({ 
          name, 
          level: Math.min(level, 5),
          type: skillsData[name]?.type || 'normal' // Look up skill type for sorting
        }))
        .sort((a, b) => {
          // Priority 1: Gold skills at the top
          if (a.type === 'gold' && b.type !== 'gold') return -1;
          if (a.type !== 'gold' && b.type === 'gold') return 1;
          
          // Priority 2: Higher level skills first
          if (b.level !== a.level) return b.level - a.level;
          
          // Priority 3: Alphabetical order
          return a.name.localeCompare(b.name);
        }),
      missingCharacters: Array.from(missingSet),
      totalSelectedCombos: selectedComboIds.size,
      mapCompletion,
      roster: {
        pitcher: pCount, 
        fielder: fCount, 
        manager: mCount,
        total: scoutCount + FIXED_MEMBERS.length,
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
    searchTerm,
    setSearchTerm,
    filteredComboIds, 
    toggleCharacter,
    toggleCombo,
    isSyncing,
    analysis,
    mapsData,
    characterMapping: { idToName: charactersMapping, data: charactersData },
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
          const pos = char.position?.trim();
          if (type === 'pitcher') return pos === '投';
          if (type === 'manager') return pos === 'マ';
          return pos !== '投' && pos !== 'マ';
        });

        const allSelected = charsOfType.every(name => next.has(name));
        charsOfType.forEach(name => {
          if (allSelected) { 
            if (!FIXED_MEMBERS.includes(name)) next.delete(name); 
          } else {
            next.add(name);
          }
        });
        return next;
      });
    },
    libraryGroups
  };
};