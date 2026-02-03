import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, MapPin, CheckCircle2, Search,
  Trophy, UserPlus, XCircle, Users, Sparkles
} from 'lucide-react';
import { cn } from './utils/style';
import { 
  normalizeName, 
  getSortedSkills, 
  getComboCategory 
} from './utils/gameLogic';

// Data
import mapsDataRaw from './data/maps.json';
import combosDataRaw from './data/combos.json';
import charactersDataRaw from './data/characters.json';
import skillsDataRaw from './data/skills.json';
import characterMappingRaw from './data/character_mapping.json';

const mapsData = mapsDataRaw as Record<string, any>;
const combosData = combosDataRaw as any[];
const charactersData = charactersDataRaw as Record<string, any>;
const skillsData = skillsDataRaw as Record<string, any>;
const characterMapping = characterMappingRaw as any;

const App: React.FC = () => {
  const [targetComboIdxs, setTargetComboIdxs] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState<string | null>(null);
  const [ownedChars, setOwnedChars] = useState<string[]>(() => [
    normalizeName('クロン'), normalizeName('姫野カレン'), normalizeName('雉田直實')
  ]);

  const toggleCombo = (names: string[]) => {
    const targetNNames = names.map(normalizeName);
    const idx = combosData.findIndex(c => {
      const cNNames = c.char_names?.map(normalizeName) || [];
      return cNNames.length === targetNNames.length && targetNNames.every(n => cNNames.includes(n));
    });
    if (idx !== -1) {
      setTargetComboIdxs(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    }
  };

  const selectAllByType = (type: 'pitcher' | 'fielder') => {
    const newIdxs = new Set(targetComboIdxs);
    combosData.forEach((combo, idx) => {
      if (getComboCategory(combo, skillsData) === type) newIdxs.add(idx);
    });
    setTargetComboIdxs(Array.from(newIdxs));
  };

  const analysis = useMemo(() => {
    const summary = { pitchers: 0, fielders: 0, managers: 0, skills: [] as any[] };
    const skillMap: Record<string, number> = {};

    targetComboIdxs.forEach(idx => {
      combosData[idx]?.rewards?.skills?.forEach((s: any) => {
        skillMap[s.name] = (skillMap[s.name] || 0) + (s.level || 0);
      });
    });

    summary.skills = getSortedSkills(skillMap, skillsData);

    ownedChars.forEach(n => {
      const char = Object.values(charactersData).find(c => normalizeName(c.name) === n);
      if (char?.position === '投') summary.pitchers++;
      else if (char?.position?.includes('マネ')) summary.managers++;
      else if (char) summary.fielders++;
    });

    return summary;
  }, [targetComboIdxs, ownedChars]);

  const libraryGroups = useMemo(() => {
    const all = Object.keys(charactersData).filter(name => {
      const matchesSearch = name.includes(searchTerm);
      const matchesPos = !posFilter || charactersData[name].position.includes(posFilter);
      return matchesSearch && matchesPos;
    });
    const comboNames = new Set(combosData.flatMap(c => c.char_names?.map(normalizeName) || []));
    return {
      withCombo: all.filter(n => comboNames.has(normalizeName(n))),
      noCombo: all.filter(n => !comboNames.has(normalizeName(n)))
    };
  }, [searchTerm, posFilter]);

  return (
    <div className="flex h-screen bg-slate-100 text-[1.15em] text-slate-900 overflow-hidden font-medium">
      {/* Sidebar - Characters */}
      <aside className="w-[420px] bg-white border-r border-slate-200 flex flex-col shadow-xl z-20">
        <div className="p-8 border-b border-slate-100 space-y-6">
          <div className="flex items-center gap-3 text-blue-600 font-black text-2xl italic uppercase"><Users /> Characters</div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl font-bold focus:outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['投', '捕', '一', '二', '三', '遊', '外', 'マネ'].map(pos => (
              <button 
                key={pos} onClick={() => setPosFilter(posFilter === pos ? null : pos)}
                className={cn("px-3 py-2 rounded-xl text-[10px] font-black border-2", posFilter === pos ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100 text-slate-400")}
              >
                {pos === 'マネ' ? 'MGR' : pos}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {libraryGroups.withCombo.map(name => (
            <button 
              key={name} onClick={() => setOwnedChars(prev => prev.includes(normalizeName(name)) ? prev.filter(n => n !== normalizeName(name)) : [...prev, normalizeName(name)])}
              className={cn("w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all", ownedChars.includes(normalizeName(name)) ? "bg-emerald-50 border-emerald-200" : "bg-white border-transparent hover:bg-slate-50")}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                <img src={`/assets/icons_split/${characterMapping.by_name[normalizeName(name)]?.img_standard}`} className={cn("w-full h-full object-cover", !ownedChars.includes(normalizeName(name)) && "grayscale opacity-40")} alt="" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase">{charactersData[name].position}</p>
                <p className={cn("text-lg font-black", ownedChars.includes(normalizeName(name)) ? "text-emerald-700" : "text-slate-700")}>{name}</p>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="flex justify-between items-end">
            <h1 className="text-4xl font-black italic uppercase flex items-center gap-4"><LayoutDashboard size={40} className="text-blue-600" /> Planner</h1>
            <div className="flex gap-3">
              <button onClick={() => selectAllByType('pitcher')} className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black hover:border-blue-400 flex items-center gap-2"><Trophy size={14} className="text-blue-500" /> PITCHER</button>
              <button onClick={() => selectAllByType('fielder')} className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black hover:border-orange-400 flex items-center gap-2"><UserPlus size={14} className="text-orange-500" /> FIELDER</button>
              <button onClick={() => setTargetComboIdxs([])} className="px-5 py-2.5 bg-rose-500 text-white rounded-2xl text-[11px] font-black flex items-center gap-2"><XCircle size={14} /> CLEAR</button>
            </div>
          </div>

          <div className="space-y-16">
            {Object.entries(mapsData).map(([mapName, data]) => (
              <section key={mapName} className="space-y-8">
                <div className="flex items-center gap-4"><MapPin className="text-blue-600" size={28} /><h2 className="font-black text-3xl italic uppercase">{mapName}</h2></div>
                <div className="grid gap-6">
                  {data.combo_names?.map((names: string[], cIdx: number) => {
                    const isSelected = targetComboIdxs.some(idx => combosData[idx]?.char_names?.every((n: any) => names.map(normalizeName).includes(normalizeName(n))));
                    return (
                      <div key={cIdx} onClick={() => toggleCombo(names)} className={cn("flex items-center gap-6 p-6 rounded-[3rem] border-4 bg-white cursor-pointer transition-all", isSelected ? "border-blue-500 shadow-xl" : "border-transparent hover:border-slate-200")}>
                        <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center", isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-300")}><CheckCircle2 size={32} /></div>
                        <div className="flex gap-6">
                          {names.map(name => (
                            <img key={name} src={`/assets/icons_split/${characterMapping.by_name[normalizeName(name)]?.img_standard}`} className={cn("w-20 h-20 rounded-[1.5rem] border-4", ownedChars.includes(normalizeName(name)) ? "border-emerald-500" : "border-white bg-slate-50 opacity-40")} alt={name} />
                          ))}
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

      {/* Rewards Side Panel */}
      <aside className="w-[420px] bg-slate-900 p-10 flex flex-col text-white shadow-2xl">
        <h3 className="text-amber-500 text-xs font-black tracking-widest uppercase mb-10 italic flex items-center gap-2"><Sparkles size={16} /> Master Rewards</h3>
        
        <div className="grid grid-cols-3 gap-4 mb-12">
          <StatBox label="Pitch" val={analysis.pitchers} />
          <StatBox label="Field" val={analysis.fielders} />
          <StatBox label="Mgr" val={analysis.managers} />
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {analysis.skills.map(skill => (
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
          ))}
        </div>
      </aside>
    </div>
  );
};

const StatBox = ({ label, val }: any) => (
  <div className="bg-slate-800/50 p-4 rounded-2xl border-2 border-slate-800 text-center">
    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{label}</p>
    <p className="text-2xl font-black">{val}</p>
  </div>
);

export default App;