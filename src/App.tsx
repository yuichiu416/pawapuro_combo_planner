import React, { useState, useMemo, useCallback } from 'react';
import { 
  LayoutDashboard, MapPin, CheckCircle2, Search,
  Trophy, UserPlus, XCircle, Users, Sparkles, ShieldCheck, User
} from 'lucide-react';
import { cn } from './utils/style';
import { 
  normalizeName, 
  getSortedSkills, 
  getComboCategory 
} from './utils/gameLogic';

// Data imports
import mapsDataRaw from './data/maps.json';
import combosDataRaw from './data/combos.json';
import charactersDataRaw from './data/characters.json';
import skillsDataRaw from './data/skills.json';
import characterMappingRaw from './data/character_mapping.json';

// --- Interfaces ---
interface SkillReward {
  name: string;
  level: number;
}

interface Combo {
  characters: string[];
  map: string;
  rewards: {
    skills: SkillReward[];
  };
}

interface Character {
  position: string;
  originalName: string;
}

interface SkillAnalysis {
  name: string;
  level: number;
  isGold: boolean;
  category: string;
}

// --- Constants ---
const POSITIONS = ['投', '捕', '一', '二', '三', '遊', '外', 'マネ'];
const BASE_ASSET_PATH = '/assets/icons_split/';

// --- Type Casting & Sanitization ---
const mapsData = (mapsDataRaw || {}) as Record<string, { combo_names: string[][] }>;
const combosData = (combosDataRaw || {}) as Record<string, Combo>;
const charactersData = (charactersDataRaw || {}) as Record<string, { position: string }>;
const characterMapping = (characterMappingRaw || { by_name: {} }) as { 
  by_name: Record<string, { img_standard: string }> 
};

const App: React.FC = () => {
  // --- States ---
  const [selectedComboIds, setSelectedComboIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState<string | null>(null);
  const [showPositionIcon, setShowPositionIcon] = useState(false);
  
  const [ownedChars, setOwnedChars] = useState<Set<string>>(() => new Set([
    normalizeName('クロン'), 
    normalizeName('姫野カレン'), 
    normalizeName('雉田直実')
  ]));

  // --- Helpers ---
  const getImagePath = (name: string, usePosIcon: boolean) => {
    const normalized = normalizeName(name);
    let img = characterMapping.by_name[normalized]?.img_standard;
    if (!img) return '/assets/placeholder.png';
    // Fix: Ensure we handle extension replacement correctly
    if (usePosIcon) img = img.replace('.png', '_pos.png');
    return `${BASE_ASSET_PATH}${img}`;
  };

  // --- Memos ---
  const normalizedCharData = useMemo(() => {
    const map: Record<string, Character> = {};
    Object.entries(charactersData).forEach(([name, data]) => {
      map[normalizeName(name)] = { ...data, originalName: name };
    });
    return map;
  }, []);

  const comboCategories = useMemo(() => {
    const groups = { pitcher: [] as string[], fielder: [] as string[] };
    Object.entries(combosData).forEach(([id, combo]) => {
      const cat = getComboCategory(combo, skillsDataRaw);
      if (cat === 'pitcher') groups.pitcher.push(id);
      if (cat === 'fielder') groups.fielder.push(id);
    });
    return groups;
  }, []);

  const analysis = useMemo(() => {
    const summary = { pitchers: 0, fielders: 0, managers: 0, skills: [] as SkillAnalysis[] };
    const skillMap: Record<string, number> = {};

    selectedComboIds.forEach(id => {
      const combo = combosData[id];
      if (combo?.rewards?.skills) {
        combo.rewards.skills.forEach((s) => {
          skillMap[s.name] = (skillMap[s.name] || 0) + s.level;
        });
      }
    });

    summary.skills = getSortedSkills(skillMap, skillsDataRaw);

    ownedChars.forEach(nName => {
      const char = normalizedCharData[nName];
      if (!char) return;
      if (char.position === '投') summary.pitchers++;
      else if (char.position?.includes('マネ')) summary.managers++;
      else summary.fielders++;
    });

    return summary;
  }, [selectedComboIds, ownedChars, normalizedCharData]);

  const libraryGroups = useMemo(() => {
  // 1. Pre-calculate the set of characters that have combos (Normalized)
  const comboNamesSet = new Set<string>();
  Object.values(combosData).forEach(c => {
    if (c?.characters) {
      c.characters.forEach(char => {
        const normalized = normalizeName(char);
        if (normalized) comboNamesSet.add(normalized);
      });
    }
  });

  const normalizedSearch = searchTerm.trim().toLowerCase();

  // 2. Filter and Partition in one pass for better performance
  const withCombo: string[] = [];
  const noCombo: string[] = [];
  Object.keys(charactersData).forEach(name => {
    const charData = charactersData[name];
    const normalizedName = normalizeName(name);

    // Filter Logic
    const matchesSearch = name.toLowerCase().includes(normalizedSearch);
    const matchesPos = !posFilter || (charData?.position || '').includes(posFilter);

    if (matchesSearch && matchesPos) {
      if (comboNamesSet.has(normalizedName)) {
        withCombo.push(name);
        if(name === 'クロン') {
          console.log(normalizedName, matchesSearch, matchesPos);
        }
      } else {
        noCombo.push(name);
      }
    }
  });
  return { withCombo, noCombo };
}, [searchTerm, posFilter]);

  // --- Handlers ---
  const toggleCombo = useCallback((comboId: string) => {
    setSelectedComboIds(prev => {
      const next = new Set(prev);
      if (next.has(comboId)) next.delete(comboId);
      else next.add(comboId);
      return next;
    });
  }, []);

  const toggleAllByType = (type: 'pitcher' | 'fielder') => {
    const targetIds = comboCategories[type];
    if (!targetIds.length) return;
    
    setSelectedComboIds(prev => {
      const next = new Set(prev);
      const allSelected = targetIds.every(id => prev.has(id));
      if (allSelected) targetIds.forEach(id => next.delete(id));
      else targetIds.forEach(id => next.add(id));
      return next;
    });
  };

  const toggleCharacter = (name: string) => {
    const nName = normalizeName(name);
    setOwnedChars(prev => {
      const next = new Set(prev);
      if (next.has(nName)) next.delete(nName);
      else next.add(nName);
      return next;
    });
  };

  // Shared Render Component for Character Items
  const renderCharacterList = (names: string[], title: string, subColor: string) => (
    <div className="space-y-4">
      <h4 className={cn("text-xs font-black uppercase tracking-widest px-2", subColor)}>
        {title} ({names.length})
      </h4>
      {names.map(name => {
        const isOwned = ownedChars.has(normalizeName(name));
        const charData = charactersData[name];
        return (
          <button 
            key={name} onClick={() => toggleCharacter(name)}
            className={cn(
              "w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all cursor-pointer", 
              isOwned ? "bg-emerald-50 border-emerald-200" : "bg-white border-transparent hover:bg-slate-50"
            )}
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
              <img 
                src={getImagePath(name, false)} 
                className={cn("w-full h-full object-cover", !isOwned && "grayscale opacity-40")} 
                alt={name}
                onError={(e) => (e.currentTarget.src = '/assets/placeholder.png')}
              />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase">{charData?.position || '?'}</p>
              <p data-testid={`character-selector-character-name-${name}`} className={cn("text-lg font-black", isOwned ? "text-emerald-700" : "text-slate-700")}>{name}</p>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-100 text-[1.15em] text-slate-900 overflow-hidden font-medium">
      {/* Sidebar - Character Library */}
<aside className="w-[420px] bg-white border-r border-slate-200 flex flex-col shadow-xl z-20">
        <div className="p-8 border-b border-slate-100 space-y-6">
          <div className="flex items-center gap-3 text-blue-600 font-black text-2xl italic uppercase">
            <Users /> Characters
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Search..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl font-bold focus:outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map(pos => (
              <button 
                key={pos} onClick={() => setPosFilter(posFilter === pos ? null : pos)}
                className={cn(
                  "px-3 py-2 rounded-xl text-[10px] font-black border-2 transition-colors cursor-pointer", 
                  posFilter === pos ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                )}
              >
                {pos === 'マネ' ? 'MGR' : pos}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {libraryGroups.withCombo.length === 0 && libraryGroups.noCombo.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic">No characters matching filters</div>
          ) : (
            <>
              {/* Render With Combo Group */}
              {libraryGroups.withCombo.length > 0 && 
                renderCharacterList(libraryGroups.withCombo, "Combos Available", "text-blue-500")}
              
              {/* Render Without Combo Group */}
              {libraryGroups.noCombo.length > 0 && 
                renderCharacterList(libraryGroups.noCombo, "No Combos", "text-slate-400")}
            </>
          )}
        </div>
      </aside>

      {/* Main Content - Combo Planner */}
      <main data-testid="planner-main" className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="flex justify-between items-end">
            <h1 className="text-4xl font-black italic uppercase flex items-center gap-4">
              <LayoutDashboard size={40} className="text-blue-600" /> Planner
            </h1>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPositionIcon(!showPositionIcon)}
                className={cn(
                  "px-5 py-2.5 border-2 rounded-2xl text-[11px] font-black flex items-center gap-2 cursor-pointer transition-all",
                  showPositionIcon ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600"
                )}
              >
                {showPositionIcon ? <ShieldCheck size={14} /> : <User size={14} />} 
                {showPositionIcon ? "POS ICON" : "STD ICON"}
              </button>
              <button onClick={() => toggleAllByType('pitcher')} className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black hover:border-blue-400 cursor-pointer flex items-center gap-2">
                <Trophy size={14} className="text-blue-500" /> PITCHER
              </button>
              <button onClick={() => toggleAllByType('fielder')} className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black hover:border-orange-400 cursor-pointer flex items-center gap-2">
                <UserPlus size={14} className="text-orange-500" /> FIELDER
              </button>
              <button onClick={() => setSelectedComboIds(new Set())} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[11px] font-black cursor-pointer flex items-center gap-2 transition-colors">
                <XCircle size={14} /> CLEAR
              </button>
            </div>
          </div>

          <div className="space-y-16">
            {Object.entries(mapsData).map(([mapName, data]) => (
              <section key={mapName} className="space-y-8">
                <div className="flex items-center gap-4">
                  <MapPin className="text-blue-600" size={28} />
                  <h2 className="font-black text-3xl italic uppercase">{mapName}</h2>
                </div>
                <div className="grid gap-6">
                  {data.combo_names?.map((names, cIdx) => {
                    const comboId = names.join('&');
                    const isSelected = selectedComboIds.has(comboId);

                    return (
                      <div 
                        key={`${mapName}-${cIdx}`}
                        data-testid={`combo-card-${comboId}`}
                        onClick={() => toggleCombo(comboId)} 
                        className={cn(
                          "flex items-center gap-6 p-6 rounded-[3rem] border-4 bg-white cursor-pointer transition-all", 
                          isSelected ? "border-blue-500 shadow-xl" : "border-transparent hover:border-slate-200"
                        )}
                      >
                        <div className={cn(
                          "w-16 h-16 rounded-[2rem] flex items-center justify-center transition-colors flex-shrink-0", 
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-300"
                        )}>
                          <CheckCircle2 size={32} />
                        </div>
                        <div className="flex gap-8 overflow-x-auto pb-2">
                          {names.map(name => {
                            const isCharOwned = ownedChars.has(normalizeName(name));
                            return (
                              <div key={name} className="flex flex-col items-center gap-2 flex-shrink-0">
                                <img 
                                  src={getImagePath(name, showPositionIcon)} 
                                  className={cn(
                                    "w-20 h-20 rounded-[1.5rem] border-4 transition-all object-cover", 
                                    isCharOwned ? "border-emerald-500 scale-105" : "border-white bg-slate-50 opacity-40"
                                  )} 
                                  alt={name} 
                                  onError={(e) => (e.currentTarget.src = '/assets/placeholder.png')}
                                />
                                <span className={cn(
                                  "text-[12px] font-black uppercase tracking-tight text-center max-w-[80px]",
                                  isCharOwned ? "text-emerald-700" : "text-slate-400"
                                )}
                                  data-testid={`combo-character-name-${name}`}
                                >
                                  {name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      {/* Right Side Panel - Analysis/Rewards */}
      <aside className="w-[420px] bg-slate-900 p-10 flex flex-col text-white shadow-2xl">
        <h3 className="text-amber-500 text-xs font-black tracking-widest uppercase mb-10 italic flex items-center gap-2">
          <Sparkles size={16} /> Master Rewards
        </h3>
        
        <div className="grid grid-cols-3 gap-4 mb-12">
          <StatBox label="Pitch" val={analysis.pitchers} />
          <StatBox label="Field" val={analysis.fielders} />
          <StatBox label="Mgr" val={analysis.managers} />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {analysis.skills.length > 0 ? (
            analysis.skills.map((skill) => (
              <div 
                key={skill.name} 
                className={cn(
                  "flex items-center justify-between p-5 rounded-3xl border-l-8 transition-all duration-300",
                  skill.isGold 
                    ? "bg-gradient-to-br from-amber-600/40 via-amber-900/20 to-slate-900 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                    : "bg-slate-800/50 border-slate-700"
                )}
              >
                <div className="flex items-center gap-4">
                  {skill.isGold && <Trophy size={20} className="text-amber-400" />}
                  <div>
                    <p className={cn("font-black tracking-tight", skill.isGold ? "text-amber-100 text-xl" : "text-white text-base")}>
                      {skill.name}
                    </p>
                    <p className="text-[10px] text-slate-500 font-black uppercase">{skill.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-black mr-1 uppercase text-blue-400">Lv</span>
                  <span className={cn("text-3xl font-black italic", skill.isGold ? "text-amber-400" : "text-white")}>
                    {skill.level}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-slate-500 py-10 italic text-sm">Select combos to see rewards</div>
          )}
        </div>
      </aside>
    </div>
  );
};

const StatBox = ({ label, val }: { label: string, val: number }) => (
  <div className="bg-slate-800/50 p-4 rounded-2xl border-2 border-slate-800 text-center">
    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{label}</p>
    <p className="text-2xl font-black">{val}</p>
  </div>
);

export default App;