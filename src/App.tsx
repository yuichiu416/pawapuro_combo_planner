// src/App.tsx
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, MapPin, CheckCircle2, Trophy, UserPlus, XCircle, ShieldCheck, User 
} from 'lucide-react';
import { cn } from './utils/style';
import { useComboManager } from '@/hooks/useComboManager';
import { CharacterSidebar } from '@/components/CharacterSidebar';
import { RewardAnalysis } from '@/components/RewardAnalysis';
import characters from '@/data/characters.json';

const BASE_ASSET_PATH = '/assets/icons_split/';

const App: React.FC = () => {
  const { 
    ownedChars, toggleCharacter, selectedComboIds, toggleCombo, toggleAllByType,
    clearAll, analysis, libraryGroups, mapsData, characterMapping
  } = useComboManager();

  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState<string | null>(null);
  const [showPositionIcon, setShowPositionIcon] = useState(true);

  const getImagePath = (name: string, usePosIcon: boolean) => {
    const charEntry = characterMapping.idToName?.by_name[name];
    let img = charEntry?.img_standard || 'placeholder.png';
    if (usePosIcon && img !== 'placeholder.png') img = img.replace('.png', '_pos.png');
    return `${BASE_ASSET_PATH}${img}`;
  };

  const filteredLibrary = useMemo(() => {
    const filterFn = (name: string) => {
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      const charData = (characters as any)[name];
      const matchesPos = !posFilter || charData?.position === posFilter;
      return matchesSearch && matchesPos;
    };
    return {
      withCombo: libraryGroups.withCombo.filter(filterFn),
      noCombo: libraryGroups.noCombo.filter(filterFn)
    };
  }, [libraryGroups, searchTerm, posFilter]);

  return (
    <div className="flex h-screen bg-slate-100 text-[1.15em] text-slate-900 overflow-hidden font-medium">
      <CharacterSidebar 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        posFilter={posFilter} setPosFilter={setPosFilter}
        groups={filteredLibrary} ownedChars={ownedChars}
        onToggle={toggleCharacter} getImagePath={getImagePath}
      />

      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-12">
          <header className="flex justify-between items-end">
            <h1 className="text-4xl font-black italic uppercase flex items-center gap-4">
              <LayoutDashboard size={40} className="text-blue-600" /> Planner
            </h1>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowPositionIcon(!showPositionIcon)} 
                className={cn(
                  "px-5 py-2.5 border-2 rounded-2xl text-[11px] font-black flex items-center gap-2 transition-all", 
                  showPositionIcon ? "bg-white border-slate-200 text-slate-600" : "bg-blue-600 border-blue-600 text-white"
                )}
              >
                {showPositionIcon ? <ShieldCheck size={14} /> : <User size={14} />} 
                {showPositionIcon ? "POS ICON" : "NO. ICON"}
              </button>
              <button 
                onClick={() => toggleAllByType('pitcher')} 
                className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black hover:border-blue-400 flex items-center gap-2"
              >
                <Trophy size={14} className="text-blue-500" /> PITCHER
              </button>
              <button 
                onClick={() => toggleAllByType('fielder')} 
                className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black hover:border-orange-400 flex items-center gap-2"
              >
                <UserPlus size={14} className="text-orange-500" /> FIELDER
              </button>
              <button 
                onClick={clearAll} 
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[11px] font-black flex items-center gap-2"
              >
                <XCircle size={14} /> CLEAR
              </button>
            </div>
          </header>

          <div className="space-y-16">
            {Object.entries(mapsData).map(([mapName, data]) => (
              <section key={mapName} className="space-y-8">
                <div className="flex items-center gap-4">
                  <MapPin className="text-blue-600" size={28} />
                  <h2 className="font-black text-3xl italic uppercase">{mapName}</h2>
                </div>
                <div className="grid gap-6">
                  {data.combo_names?.map((names: string[]) => {
                    const comboId = names.join('&');
                    const isSelected = selectedComboIds.has(comboId);
                    return (
                      <div 
                        key={comboId} 
                        data-testid={`combo-card-${comboId}`}
                        onClick={() => toggleCombo(comboId)} 
                        className={cn(
                          "flex items-center gap-6 p-6 rounded-[3rem] border-4 bg-white cursor-pointer transition-all", 
                          isSelected ? "border-blue-500 shadow-xl" : "border-transparent hover:border-slate-200"
                        )}
                      >
                        <div className={cn(
                          "w-16 h-16 rounded-[2rem] flex items-center justify-center flex-shrink-0", 
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-300"
                        )}>
                          <CheckCircle2 size={32} />
                        </div>
                        <div className="flex gap-8 overflow-x-auto pb-2">
                          {names.map(name => (
                            <button 
                              key={name} 
                              data-testid={`combo-char-button-${name}`}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                toggleCharacter(name); 
                              }} 
                              className="flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer"
                            >
                              <div 
                                data-testid={`icon-highlight-wrapper-${name}`}
                                className={cn(
                                  "w-20 h-20 flex-shrink-0 relative rounded-[1.5rem] overflow-hidden transition-all duration-200 border-4",
                                  // OWNED STATE
                                  ownedChars.has(name) 
                                    ? [
                                        "border-emerald-500 bg-emerald-50 shadow-md",
                                        "group-hover:border-emerald-300 group-hover:shadow-lg group-hover:brightness-110" 
                                      ]
                                    // UNOWNED STATE
                                    : [
                                        "border-transparent bg-slate-100 opacity-40",
                                        "group-hover:opacity-100 group-hover:border-blue-400 group-hover:shadow-lg"
                                      ]
                                )}
                              >
                                <img 
                                  src={getImagePath(name, showPositionIcon)} 
                                  className="absolute inset-0 w-full h-full object-cover" 
                                  alt={name} 
                                />
                              </div>

                              <span className={cn(
                                "text-[12px] font-black uppercase transition-colors duration-200", 
                                ownedChars.has(name) 
                                  ? "text-emerald-700 group-hover:text-emerald-500" 
                                  : "text-slate-400 group-hover:text-blue-600"
                              )}>
                                {name}
                              </span>
                            </button>
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
      <RewardAnalysis analysis={analysis} />
    </div>
  );
};

export default App;