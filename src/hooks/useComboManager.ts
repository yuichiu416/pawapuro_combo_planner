// src/hooks/useComboManager.ts
import { useCallback, useEffect, useMemo, useState } from 'react';
import charactersMappingRaw from '@/data/character_mapping.json';
import charactersDataRaw from '@/data/characters.json';
import combosDataRaw from '@/data/combos.json';
import mapsDataRaw from '@/data/maps.json';
import skillsDataRaw from '@/data/skills.json';
import { supabase } from '@/lib/supabase';
import type { Character, Combo } from '@/types';

// Types & Constants
const charactersData = charactersDataRaw as Record<string, Character>;
const combosData = combosDataRaw as Record<string, Combo>;
const mapsData = mapsDataRaw as Record<string, any>;
const skillsData = skillsDataRaw as Record<string, any>;
const charactersMapping = charactersMappingRaw as any;

const FIXED_MEMBERS = ['パワプロ', '矢部明雄'];
const LOCAL_STORAGE_KEY = 'パワプロ_planner_local_v1';
const KANJI_REGEX = /[\u4e00-\u9faf]/;

type FilterType = 'pitcher' | 'fielder' | null;

export const useComboManager = () => {
  // --- State: Selections ---
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set(FIXED_MEMBERS));
  const [selectedComboIds, setSelectedComboIds] = useState<Set<string>>(new Set());

  // --- State: Filters & UI ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRelatedOnly, setFilterRelatedOnly] = useState(false);
  const [filterNoKanji, setFilterNoKanji] = useState(false);
  const [goldFilter, setGoldFilter] = useState<FilterType>(null);
  const [typeFilter, setTypeFilter] = useState<FilterType>(null);
  const [activeSkillFilter, setActiveSkillFilter] = useState<string | null>(null);

  // --- State: System ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [fontScale, setFontScale] = useState(1.0);

  // --- Effect: Font Scaling ---
  useEffect(() => {
    document.documentElement.style.fontSize = `${Math.round(fontScale * 100)}%`;
  }, [fontScale]);

  // --- Effect: Hydration ---
  useEffect(() => {
    const hydrate = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        let loadedChars: string[] = [];
        let loadedCombos: string[] = [];

        if (session?.user) {
          const { data } = await supabase
            .from('user_saves')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();

          if (data) {
            loadedChars = data.selected_characters || [];
            loadedCombos = data.selected_combos || [];
            if (data.updated_at) {
              setLastSaved(new Date(data.updated_at).toLocaleString());
            }
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
      } catch (e) {
        console.error('Hydration failed:', e);
      }
    };
    hydrate();
  }, []);

  // --- Callbacks: Persistence ---
  const handleSave = useCallback(async () => {
    setIsSyncing(true);
    const charArray = Array.from(selectedNames).filter((n) => !FIXED_MEMBERS.includes(n));
    const comboArray = Array.from(selectedComboIds);
    const now = new Date().toISOString();

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('user_saves').upsert({
          user_id: session.user.id,
          selected_characters: charArray,
          selected_combos: comboArray,
          updated_at: now,
        });
      } else {
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify({
            characters: charArray,
            combos: comboArray,
            updated_at: now,
          }),
        );
      }
      setLastSaved(new Date(now).toLocaleString());
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [selectedNames, selectedComboIds]);

  // --- Callbacks: Toggles ---
  const toggleCharacter = useCallback((name: string) => {
    if (FIXED_MEMBERS.includes(name)) return;
    setSelectedNames((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
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
  const toggleGoldFilter = useCallback(
    (type: FilterType) => setGoldFilter((p) => (p === type ? null : type)),
    [],
  );
  const toggleTypeFilter = useCallback(
    (type: FilterType) => setTypeFilter((p) => (p === type ? null : type)),
    [],
  );
  const toggleSkillFilter = useCallback(
    (skill: string) => setActiveSkillFilter((p) => (p === skill ? null : skill)),
    [],
  );

  const adjustFont = useCallback((delta: number) => {
    setFontScale((prev) => parseFloat(Math.min(Math.max(prev + delta, 0.8), 1.5).toFixed(1)));
  }, []);

  // --- Memo: Filtering & Sorting Logic ---
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
          !activeSkillFilter || combo.rewards?.skills?.some((s) => s.name === activeSkillFilter);

        return passesSearch && passesRelated && passesGold && passesType && passesSkill;
      })
      .map(([_, combo]) => {
        // Sort individual combo rewards before returning
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
  }, [searchTerm, filterRelatedOnly, selectedNames, goldFilter, typeFilter, activeSkillFilter]);

  // --- Memo: Global Analysis ---
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
        if (data.combo_names.some((names: string[]) => names.join('&') === id)) {
          mapCompletion[mapName].selected++;
        }
      });
    });

    const sortedSkills = Object.entries(skillsMap)
      .map(([name, level]) => ({
        name,
        level,
        type: skillsData[name]?.type || 'normal',
      }))
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
  }, [selectedNames, selectedComboIds]);

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
  }, [searchTerm, filterNoKanji]);

  const clearAll = useCallback(() => {
    setSelectedNames(new Set(FIXED_MEMBERS));
    setSelectedComboIds(new Set());
    setFilterRelatedOnly(false);
    setFilterNoKanji(false);
    setGoldFilter(null);
    setTypeFilter(null);
    setActiveSkillFilter(null);
  }, []);

  return {
    ownedChars: selectedNames,
    selectedComboIds,
    searchTerm,
    setSearchTerm,
    filterRelatedOnly,
    toggleRelatedFilter,
    filterNoKanji,
    toggleKanjiFilter,
    goldFilter,
    toggleGoldFilter,
    typeFilter,
    toggleAllByType: toggleTypeFilter,
    activeSkillFilter,
    onToggleSkillFilter: toggleSkillFilter,
    filteredComboIds,
    toggleCharacter,
    toggleCombo,
    isSyncing,
    lastSaved,
    handleSave,
    analysis,
    fontScale,
    adjustFont,
    mapsData,
    characterMapping: { idToName: charactersMapping, data: charactersData },
    clearAll,
    libraryGroups,
  };
};
