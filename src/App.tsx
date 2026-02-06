import React, { useState } from 'react';
import { LayoutDashboard, MapPin, CheckCircle2, Trophy, UserPlus, XCircle, ShieldCheck, User } from 'lucide-react';
import { cn } from './utils/style';
import { useComboManager } from '@/hooks/useComboManager';
import { CharacterSidebar } from '@/components/CharacterSidebar';
import { RewardAnalysis } from '@/components/RewardAnalysis';
import characters from '@/data/characters.json';

const BASE_ASSET_PATH = '/assets/icons_split/';

const App: React.FC = () => {
  const { 
    ownedChars, 
    toggleCharacter, 
    selectedComboIds, 
    toggleCombo, 
    toggleAllByType,
    clearAll,
    analysis,
    libraryGroups,
    mapsData,
    characterMapping
  } = useComboManager();

  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState<string | null>(null);
  const [showPositionIcon, setShowPositionIcon] = useState(false);
  const getImagePath = (name: string, usePosIcon: boolean) => {
    let img = characterMapping.idToName?.by_name[name]?.img_standard;
    if (!img) return '/assets/placeholder.png';
    if (usePosIcon) img = img.replace('.png', '_pos.png');
    return `${BASE_ASSET_PATH}${img}`;
  };
  const filteredLibrary = {
    withCombo: libraryGroups.withCombo.filter(name => {
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Retrieve the actual position from the data source using the name
      const charData = (characters as any)[name];
      const matchesPos = !posFilter || charData?.position === posFilter;
      
      return matchesSearch && matchesPos;
    }),
    
    noCombo: libraryGroups.noCombo.filter(name => {
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Retrieve the actual position from the data source using the name
      const charData = (characters as any)[name];
      const matchesPos = !posFilter || charData?.position === posFilter;
      
      return matchesSearch && matchesPos;
    })
  };

  return (
    <div className="flex h-screen bg-slate-100 text-[1.15em] text-slate-900 overflow-hidden font-medium">
      <CharacterSidebar 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        posFilter={posFilter}
        setPosFilter={setPosFilter}
        groups={filteredLibrary}
        ownedChars={ownedChars}
        onToggle={toggleCharacter}
        getImagePath={getImagePath}
      />

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
              <button onClick={clearAll} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[11px] font-black cursor-pointer flex items-center gap-2 transition-colors">
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
                    // Unique ID based on participants, used for testing and selection
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
                          {names.map(name => (
                            <div key={name} className="flex flex-col items-center gap-2 flex-shrink-0">
                              <img 
                                src={getImagePath(name, showPositionIcon)} 
                                className={cn(
                                  "w-20 h-20 rounded-[1.5rem] border-4 transition-all object-cover", 
                                  ownedChars.has(name) ? "border-emerald-500 scale-105" : "border-white bg-slate-50 opacity-40"
                                )} 
                                alt={name} 
                              />
                              <span 
                                data-testid={`combo-character-name-${name}`} 
                                className={cn(
                                  "text-[12px] font-black uppercase text-center", 
                                  ownedChars.has(name) ? "text-emerald-700" : "text-slate-400"
                                )}
                              >
                                {name}
                              </span>
                            </div>
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

      {/* Ensure this component internally uses data-testid="analysis-panel" */}
      <RewardAnalysis analysis={analysis} />
    </div>
  );
};

export default App;