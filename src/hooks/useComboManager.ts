// src/hooks/useComboManager.ts
import { useMemo, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import charactersDataRaw from '@/data/characters.json';
import combosDataRaw from '@/data/combos.json';
import mapsDataRaw from '@/data/maps.json';
import skillsDataRaw from '@/data/skills.json';
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
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let loadedChars: string[] = [];
        let loadedCombos: string[] = [];

        if (session?.user) {
          const { data } = await supabase.from('user_saves').select('*').eq('user_id', session.user.id).maybeSingle();
          if (data) {
            loadedChars = data.selected_characters || [];
            loadedCombos = data.selected_combos || [];
            if (data.updated_at) setLastSaved(new Date(data.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        } else {
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            loadedChars = parsed.characters || [];
            loadedCombos = parsed.combos || [];
          }
        }
        setSelectedNames(new Set([...FIXED_MEMBERS, ...loadedChars]));
        setSelectedComboIds(new Set(loadedCombos));
      } catch (e) { console.error(e); }
    };
    hydrate();
  }, []);

  const handleSave = useCallback(async () => {
    setIsSyncing(true);
    const charArray = Array.from(selectedNames).filter(n => !FIXED_MEMBERS.includes(n));
    const comboArray = Array.from(selectedComboIds);
    const now = new Date().toISOString();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('user_saves').upsert({ user_id: session.user.id, selected_characters: charArray, selected_combos: comboArray, updated_at: now });
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ characters: charArray, combos: comboArray, updated_at: now }));
      }
      setLastSaved(new Date(now).toLocaleString());
    } catch (err) { console.error(err); } finally { setIsSyncing(false); }
  }, [selectedNames, selectedComboIds]);

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
            const usedByOther = Array.from(nextCombos).some(id => combosData[id]?.characters.includes(charName));
            if (!usedByOther && !FIXED_MEMBERS.includes(charName)) nextNames.delete(charName);
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
    let pCount = 0, fCount = 0, mCount = 0;

    Object.entries(mapsData).forEach(([mapName, data]) => {
      mapCompletion[mapName] = { selected: 0, total: data.max_combos || 0 };
    });

    selectedNames.forEach(name => {
      const char = charactersData[name];
      if (!char) return;
      if (char.rewards?.stats) Object.entries(char.rewards.stats).forEach(([s, v]) => { stats[s] = (stats[s] || 0) + v; });
      if (!FIXED_MEMBERS.includes(name)) {
        const pos = char.position?.trim();
        if (pos === "マ") mCount++; else if (pos === "投") pCount++; else fCount++;
      }
    });

    selectedComboIds.forEach(id => {
      const combo = combosData[id];
      if (!combo) return;
      combo.rewards?.skills?.forEach(sk => { skillsMap[sk.name] = (skillsMap[sk.name] || 0) + sk.level; });
      combo.characters.forEach(c => { if (!selectedNames.has(c)) missingSet.add(c); });
      Object.entries(mapsData).forEach(([mapName, data]) => {
        if (data.combo_names.some((names: string[]) => names.join('&') === id)) mapCompletion[mapName].selected++;
      });
    });

    // ✨ Updated Sorting: Gold skills ALWAYS first, then Blue/Normal, then sort by level
    const sortedSkills = Object.entries(skillsMap).map(([name, level]) => ({
      name,
      level: Math.min(level, 5),
      type: skillsData[name]?.type || 'normal'
    })).sort((a, b) => {
      if (a.type === 'gold' && b.type !== 'gold') return -1;
      if (a.type !== 'gold' && b.type === 'gold') return 1;
      return b.level - a.level;
    });

    const rosterErrors = {
      pitcher: pCount > 8 || pCount < 6,
      fielder: fCount > 17 || fCount < 15,
      manager: mCount > 3, // ✨ Manager limit error check
      total: (pCount + fCount) > 23
    };

    return {
      stats,
      skills: sortedSkills,
      missingCharacters: Array.from(missingSet),
      totalSelectedCombos: selectedComboIds.size,
      mapCompletion,
      roster: {
        pitcher: pCount, fielder: fCount, manager: mCount,
        total: pCount + fCount + FIXED_MEMBERS.length,
        errors: rosterErrors, // ✨ Added for tests
        isValid: !rosterErrors.pitcher && !rosterErrors.fielder && !rosterErrors.manager && !rosterErrors.total
      }
    };
  }, [selectedNames, selectedComboIds]);

  return {
    ownedChars: selectedNames,
    selectedComboIds,
    searchTerm,
    setSearchTerm,
    filteredComboIds: useMemo(() => {
      const search = searchTerm.toLowerCase().trim();
      if (!search) return Object.keys(combosData);

      return Object.entries(combosData)
        .filter(([id, combo]) => {
          const nameMatch = id.toLowerCase().includes(search);
          const charMatch = combo.characters.some(c => c.toLowerCase().includes(search));
          // FIXED: Ensure we check the .name property of each skill in the rewards array
          const skillMatch = combo.rewards?.skills?.some(s => 
            s.name.toLowerCase().includes(search)
          );
          
          return nameMatch || charMatch || skillMatch;
        })
        .map(([id]) => id);
    }, [searchTerm]),
    toggleCharacter,
    toggleCombo,
    isSyncing,
    lastSaved,
    handleSave,
    analysis,
    mapsData,
    characterMapping: { idToName: charactersMapping, data: charactersData },
    clearAll: useCallback(() => { 
      setSelectedNames(new Set(FIXED_MEMBERS)); 
      setSelectedComboIds(new Set()); 
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Ensures guest data is also wiped
    }, []),
    toggleAllByType: (type: 'pitcher' | 'fielder') => {
    const targetType = type === 'pitcher' ? 'pitcher' : 'fielder';
    
    // 1. Find all combo IDs that give a Gold Skill for this type
    const goldComboIds = Object.entries(combosData)
      .filter(([_, combo]) => {
        return combo.rewards?.skills?.some(skill => {
          const detail = skillsData[skill.name];
          // Must be a gold skill AND match the requested type
          return detail?.type === 'gold' && detail?.category === targetType;
        });
      })
      .map(([id]) => id);

    if (goldComboIds.length === 0) return;

    // 2. Determine if we are selecting or deselecting
    // If all identified gold combos are already selected, we turn them off.
    // Otherwise, we turn them all on.
    const allAlreadySelected = goldComboIds.every(id => selectedComboIds.has(id));

    if (allAlreadySelected) {
      // DESELECT: We need to reuse your existing toggleCombo logic for each ID
      // or manually batch the removal to handle character dependencies.
      goldComboIds.forEach(id => {
        if (selectedComboIds.has(id)) toggleCombo(id);
      });
    } else {
      // SELECT: Add all missing gold combos
      goldComboIds.forEach(id => {
        if (!selectedComboIds.has(id)) toggleCombo(id);
      });
    }
  },
    libraryGroups: useMemo(() => {
      const withC: string[] = [], noC: string[] = [], search = searchTerm.toLowerCase().trim();
      const participants = new Set(Object.values(combosData).flatMap(c => c.characters));
      Object.keys(charactersData).forEach(name => {
        if (FIXED_MEMBERS.includes(name) || (search && !name.toLowerCase().includes(search))) return;
        participants.has(name) ? withC.push(name) : noC.push(name);
      });
      return { withCombo: withC, noCombo: noC };
    }, [searchTerm])
  };
};