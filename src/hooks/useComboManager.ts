// src/hooks/useComboManager.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGameVersion } from '@/contexts/GameVersionContext';
import skillsDataRaw from '@/data/skills.json';
import { supabase } from '@/lib/supabase';
import type { Character, Combo } from '@/types';

const skillsData = skillsDataRaw as Record<string, any>;

const FIXED_MEMBERS = ['パワプロ', '矢部明雄'];
const LOCAL_STORAGE_KEY = 'パワプロ_planner_local_v2';
const KANJI_REGEX = /[\u4e00-\u9faf]/;

type FilterType = 'pitcher' | 'fielder' | null;

interface SaveSlot {
  slot_number: number;
  slot_name: string;
  selected_characters: string[];
  selected_combos: string[];
  is_active: boolean;
  updated_at?: string;
  game_version?: string;
}

export const useComboManager = () => {
  // --- Game Version (data set) ---
  const { version, setVersion, versions, gameData } = useGameVersion();
  const charactersData = gameData.characters as Record<string, Character>;
  const combosData = gameData.combos as Record<string, Combo>;
  const mapsData = gameData.maps as Record<string, any>;
  const charactersMapping = gameData.characterMapping as any;

  // --- Slot Management State ---
  const [slots, setSlots] = useState<SaveSlot[]>([]);
  const [activeSlotNumber, setActiveSlotNumber] = useState<number>(1);

  // --- Original Planner State ---
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set(FIXED_MEMBERS));
  const [selectedComboIds, setSelectedComboIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelatedOnly, setFilterRelatedOnly] = useState(false);
  const [filterNoKanji, setFilterNoKanji] = useState(false);
  const [goldFilter, setGoldFilter] = useState<FilterType>(null);
  const [typeFilter, setTypeFilter] = useState<FilterType>(null);
  const [activeSkillFilters, setActiveSkillFilters] = useState<string[]>([]);
  const [isGoldMenuOpen, setIsGoldMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [fontScale, setFontScale] = useState(1.0);

  // Handle Global Font Scaling
  useEffect(() => {
    document.documentElement.style.fontSize = `${Math.round(fontScale * 100)}%`;
  }, [fontScale]);

  // --- Hydration ---
  const hydrate = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      let loadedSlots: SaveSlot[] = [];

      if (session?.user) {
        const { data } = await supabase
          .from('user_saves')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('game_version', version)
          .order('slot_number', { ascending: true });
        if (data) loadedSlots = data;
      } else {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const allSlots: SaveSlot[] = JSON.parse(saved);
          loadedSlots = allSlots.filter((s) => s.game_version === version);
        }
      }

      // Ensure 1-3 slots always exist
      const finalSlots = [1, 2, 3].map((num) => {
        const found = loadedSlots.find((s) => s.slot_number === num);
        return (
          found || {
            slot_number: num,
            slot_name: `Slot 0${num}`,
            selected_characters: [],
            selected_combos: [],
            is_active: num === 1,
          }
        );
      });

      setSlots(finalSlots);
      const active = finalSlots.find((s) => s.is_active) || finalSlots[0];
      setActiveSlotNumber(active.slot_number);
      setSelectedNames(new Set([...FIXED_MEMBERS, ...active.selected_characters]));
      setSelectedComboIds(new Set(active.selected_combos));
      if (active.updated_at) setLastSaved(new Date(active.updated_at).toLocaleString());
    } catch (e) {
      console.error('Hydration failed:', e);
    }
  }, [version]);

  useEffect(() => {
    hydrate();
  }, [hydrate, version]);

  // --- Slot Logic (Load / Save / Rename) ---

  const switchSlot = useCallback(
    async (targetSlotNum: number) => {
      const targetSlot = slots.find((s) => s.slot_number === targetSlotNum);
      if (!targetSlot) return;

      setIsSyncing(true);
      setActiveSlotNumber(targetSlotNum);
      setSelectedNames(new Set([...FIXED_MEMBERS, ...targetSlot.selected_characters]));
      setSelectedComboIds(new Set(targetSlot.selected_combos));

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('user_saves')
          .update({ is_active: false })
          .eq('user_id', session.user.id);
        await supabase
          .from('user_saves')
          .update({ is_active: true })
          .eq('user_id', session.user.id)
          .eq('slot_number', targetSlotNum);
      }

      setSlots((prev) => prev.map((s) => ({ ...s, is_active: s.slot_number === targetSlotNum })));
      setIsSyncing(false);
    },
    [slots],
  );

  const onSaveToSlot = useCallback(
    async (targetSlotNum: number, newName?: string) => {
      setIsSyncing(true);
      const charArray = Array.from(selectedNames).filter((n) => !FIXED_MEMBERS.includes(n));
      const comboArray = Array.from(selectedComboIds);
      const now = new Date().toISOString();
      const existing = slots.find((s) => s.slot_number === targetSlotNum);
      const finalName = newName || existing?.slot_name || `Slot 0${targetSlotNum}`;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase.from('user_saves').upsert({
            user_id: session.user.id,
            slot_number: targetSlotNum,
            slot_name: finalName,
            selected_characters: charArray,
            selected_combos: comboArray,
            is_active: targetSlotNum === activeSlotNumber,
            updated_at: now,
            game_version: version,
          });
        }

        const updated = slots.map((s) =>
          s.slot_number === targetSlotNum
            ? {
                ...s,
                slot_name: finalName,
                selected_characters: charArray,
                selected_combos: comboArray,
                updated_at: now,
                game_version: version,
              }
            : s,
        );

        setSlots(updated);
        if (!session?.user) {
          // Merge updated slots for this version into the full localStorage record
          const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
          const allSlots: SaveSlot[] = saved ? JSON.parse(saved) : [];
          const otherVersionSlots = allSlots.filter((s) => s.game_version !== version);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...otherVersionSlots, ...updated]));
        }
        if (targetSlotNum === activeSlotNumber) setLastSaved(new Date(now).toLocaleString());
      } catch (err) {
        console.error('Save failed:', err);
      } finally {
        setIsSyncing(false);
      }
    },
    [selectedNames, selectedComboIds, slots, activeSlotNumber],
  );

  const onRename = useCallback(
    async (targetSlotNum: number, newName: string) => {
      if (!newName.trim()) return;
      setIsSyncing(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          await supabase
            .from('user_saves')
            .update({ slot_name: newName })
            .eq('user_id', session.user.id)
            .eq('slot_number', targetSlotNum);
        }
        const updated = slots.map((s) =>
          s.slot_number === targetSlotNum ? { ...s, slot_name: newName } : s,
        );
        setSlots(updated);
        if (!session?.user) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Rename failed:', err);
      } finally {
        setIsSyncing(false);
      }
    },
    [slots],
  );

  // --- Original Toggle & Filter Logic ---

  const closeGoldMenu = useCallback(() => {
    setIsGoldMenuOpen(false);
    setActiveSkillFilters([]);
  }, []);

  const toggleGoldFilter = useCallback(
    (type: FilterType) => {
      if (type === null) {
        setIsGoldMenuOpen(false);
        setGoldFilter(null);
        setActiveSkillFilters([]);
        return;
      }
      setGoldFilter((current) => {
        if (!isGoldMenuOpen) {
          setIsGoldMenuOpen(true);
          if (current !== type) setActiveSkillFilters([]);
          return type;
        }
        if (current === type) {
          setIsGoldMenuOpen(false);
          setActiveSkillFilters([]);
          return type;
        }
        setActiveSkillFilters([]);
        return type;
      });
    },
    [isGoldMenuOpen],
  );

  const toggleCharacter = useCallback((name: string) => {
    if (FIXED_MEMBERS.includes(name)) return;
    setSelectedNames((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  }, []);

  const toggleMultipleCharacters = useCallback((names: string[]) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      names.forEach((n) => {
        if (!FIXED_MEMBERS.includes(n)) next.add(n);
      });
      return next;
    });
  }, []);

  const toggleCombo = useCallback((comboId: string) => {
    setSelectedComboIds((prev) => {
      const next = new Set(prev);
      next.has(comboId) ? next.delete(comboId) : next.add(comboId);
      return next;
    });
  }, []);

  const toggleRelatedFilter = useCallback(() => setFilterRelatedOnly((p) => !p), []);
  const toggleKanjiFilter = useCallback(() => setFilterNoKanji((p) => !p), []);
  const toggleTypeFilter = useCallback(
    (type: FilterType) => setTypeFilter((p) => (p === type ? null : type)),
    [],
  );

  const toggleSkillFilter = useCallback((skill: string | null) => {
    setActiveSkillFilters((prev) =>
      skill === null
        ? []
        : prev.includes(skill)
          ? prev.filter((s) => s !== skill)
          : [...prev, skill],
    );
  }, []);

  const adjustFont = useCallback((delta: number) => {
    setFontScale((prev) => parseFloat(Math.min(Math.max(prev + delta, 0.8), 1.5).toFixed(1)));
  }, []);

  // --- Memoized Data Filtering ---

  const filteredComboIds = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();
    return Object.entries(combosData)
      .filter(([_, combo]) => {
        const comboId = combo.characters.join('&');
        const passesSearch =
          !search ||
          comboId.toLowerCase().includes(search) ||
          combo.characters.some((c) => c.toLowerCase().includes(search)) ||
          combo.rewards?.skills?.some((s) => s.name.toLowerCase().includes(search));

        const passesRelated =
          !filterRelatedOnly || combo.characters.some((char) => selectedNames.has(char));
        const passesGold =
          !goldFilter ||
          combo.rewards?.skills?.some((s) => {
            const detail = skillsData[s.name];
            return detail?.type === 'gold' && detail?.category === goldFilter;
          });
        const passesType =
          !typeFilter ||
          combo.rewards?.skills?.some((s) => skillsData[s.name]?.category === typeFilter);
        const passesSkill =
          activeSkillFilters.length === 0 ||
          combo.rewards?.skills?.some((s) => activeSkillFilters.includes(s.name));

        return passesSearch && passesRelated && passesGold && passesType && passesSkill;
      })
      .map(([_, combo]) => {
        if (combo.rewards?.skills) {
          combo.rewards.skills.sort((a, b) => {
            const typeA = skillsData[a.name]?.type || 'normal';
            const typeB = skillsData[b.name]?.type || 'normal';
            if (typeA === 'gold' && typeB !== 'gold') return -1;
            if (typeA !== 'gold' && typeB === 'gold') return 1;
            return b.level - a.level || a.name.localeCompare(b.name);
          });
        }
        return combo.characters.join('&');
      });
  }, [
    searchTerm,
    filterRelatedOnly,
    selectedNames,
    goldFilter,
    typeFilter,
    activeSkillFilters,
    combosData,
  ]);

  // --- Memoized Analysis ---

  const analysis = useMemo(() => {
    const stats: Record<string, number> = {};
    const skillsMap: Record<string, number> = {};
    const missingSet = new Set<string>();
    const mapCompletion: Record<string, { selected: number; total: number }> = {};
    let pCount = 0,
      fCount = 0,
      mCount = 0;

    Object.entries(mapsData).forEach(([mapName, data]) => {
      mapCompletion[mapName] = { selected: 0, total: data.max_combos || 0 };
    });

    selectedNames.forEach((name) => {
      const char = charactersData[name];
      if (!char) return;
      if (char.rewards?.stats) {
        Object.entries(char.rewards.stats).forEach(([s, v]) => {
          stats[s] = (stats[s] || 0) + (v as number);
        });
      }
      if (!FIXED_MEMBERS.includes(name)) {
        const pos = char.position?.trim();
        if (pos === 'マ') mCount++;
        else if (pos === '投') pCount++;
        else fCount++;
      }
    });

    selectedComboIds.forEach((id) => {
      const combo = Object.values(combosData).find((c) => c.characters.join('&') === id);
      if (!combo) return;
      combo.rewards?.skills?.forEach((sk) => {
        skillsMap[sk.name] = (skillsMap[sk.name] || 0) + sk.level;
      });
      combo.characters.forEach((c) => {
        if (!selectedNames.has(c)) missingSet.add(c);
      });
      Object.entries(mapsData).forEach(([mapName, data]) => {
        if (data.combo_names.some((names: string[]) => names.join('&') === id))
          mapCompletion[mapName].selected++;
      });
    });

    const sortedSkills = Object.entries(skillsMap)
      .map(([name, level]) => ({ name, level, type: skillsData[name]?.type || 'normal' }))
      .sort((a, b) => {
        if (a.type === 'gold' && b.type !== 'gold') return -1;
        if (a.type !== 'gold' && b.type === 'gold') return 1;
        return b.level - a.level || a.name.localeCompare(b.name);
      });

    const rosterErrors = {
      pitcher: pCount > 8 || pCount < 6,
      fielder: fCount > 17 || fCount < 15,
      manager: mCount > 3,
      total: pCount + fCount > 23,
    };

    return {
      stats,
      skills: sortedSkills,
      missingCharacters: Array.from(missingSet),
      totalSelectedCombos: selectedComboIds.size,
      mapCompletion,
      roster: {
        pitcher: pCount,
        fielder: fCount,
        manager: mCount,
        total: pCount + fCount + FIXED_MEMBERS.length,
        errors: rosterErrors,
        isValid: !Object.values(rosterErrors).some(Boolean),
      },
    };
  }, [selectedNames, selectedComboIds, charactersData, mapsData, combosData]);

  const libraryGroups = useMemo(() => {
    const withC: string[] = [];
    const noC: string[] = [];
    const search = searchTerm.toLowerCase().trim();
    const participants = new Set(Object.values(combosData).flatMap((c) => c.characters));

    Object.keys(charactersData).forEach((name) => {
      if (FIXED_MEMBERS.includes(name)) return;
      if (search && !name.toLowerCase().includes(search)) return;
      if (filterNoKanji && KANJI_REGEX.test(name)) return;
      participants.has(name) ? withC.push(name) : noC.push(name);
    });
    return { withCombo: withC, noCombo: noC };
  }, [searchTerm, filterNoKanji, charactersData, combosData]);

  const clearAll = useCallback(() => {
    setSelectedNames(new Set(FIXED_MEMBERS));
    setSelectedComboIds(new Set());
    setFilterRelatedOnly(false);
    setFilterNoKanji(false);
    setGoldFilter(null);
    setTypeFilter(null);
    setActiveSkillFilters([]);
    setIsGoldMenuOpen(false);
  }, []);

  return {
    // --- Game Version ---
    version,
    setVersion,
    versions,
    charactersData,

    slots,
    activeSlotNumber,
    switchSlot,
    onSaveToSlot,
    onRename,
    ownedChars: selectedNames,
    selectedComboIds,
    searchTerm,
    setSearchTerm,
    filterRelatedOnly,
    toggleRelatedFilter,
    filterNoKanji,
    toggleKanjiFilter,
    goldFilter,
    isGoldMenuOpen,
    toggleGoldFilter,
    closeGoldMenu,
    typeFilter,
    toggleAllByType: toggleTypeFilter,
    activeSkillFilters,
    onToggleSkillFilter: toggleSkillFilter,
    filteredComboIds,
    toggleCharacter,
    toggleMultipleCharacters,
    toggleCombo,
    isSyncing,
    lastSaved,
    analysis,
    fontScale,
    adjustFont,
    mapsData,
    characterMapping: { idToName: charactersMapping, data: charactersData },
    clearAll,
    libraryGroups,
  };
};
