// src/App.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, Loader2, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useComboManager } from '@/hooks/useComboManager';
import { CharacterSidebar } from '@/components/CharacterSidebar';
import { RewardAnalysis } from '@/components/RewardAnalysis';
import { MapSection } from '@/components/MapSection';
import { Header } from '@/components/Header';
import { AuthButton } from '@/components/AuthButton';
import { Footer } from '@/components/Footer';
import { cn } from '@/utils/style';
import characters from '@/data/characters.json';

const BASE_ASSET_PATH = '/assets/icons_split/';

const Logo = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <div className={cn(
    "flex items-center pt-4 pb-2 shrink-0 transition-all duration-300",
    isCollapsed ? "justify-center px-0" : "gap-3 px-6"
  )}>
    <div className="w-10 h-10 flex items-center justify-center shrink-0">
      <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
    </div>
    {!isCollapsed && (
      <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
        <span className="font-black italic text-xl tracking-tighter text-slate-900 uppercase leading-none whitespace-nowrap">
          Pawapuro 2024-2025
        </span>
        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest whitespace-nowrap">
          Combo Planner
        </span>
      </div>
    )}
  </div>
);

const App: React.FC = () => {
  // --- DATA & LOGIC ---
  const { 
    ownedChars, 
    toggleCharacter, 
    selectedComboIds, 
    toggleCombo, 
    toggleAllByType,
    clearAll, 
    analysis, 
    mapsData, 
    characterMapping,
    searchTerm, 
    setSearchTerm, 
    filteredComboIds,
    handleSave, 
    isSyncing, 
    lastSaved,
    libraryGroups
  } = useComboManager();

  // --- UI STATE ---
  const [posFilter, setPosFilter] = useState<string | null>(null);
  const [mapFilter, setMapFilter] = useState<string | null>(null);
  const [showPositionIcon, setShowPositionIcon] = useState(true);
  const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const getImagePath = (name: string, usePosIcon: boolean) => {
    const charEntry = characterMapping.idToName?.by_name[name];
    let img = charEntry?.img_standard || 'placeholder.png';
    if (usePosIcon && img !== 'placeholder.png') img = img.replace('.png', '_pos.png');
    return `${BASE_ASSET_PATH}${img}`;
  };

  const filteredLibrary = useMemo(() => {
    const filterFn = (name: string) => {
      const charData = (characters as any)[name];
      return (!posFilter || charData?.position === posFilter) && 
             (!mapFilter || charData?.encounter_map === mapFilter);
    };
    return { 
      withCombo: libraryGroups.withCombo.filter(filterFn), 
      noCombo: libraryGroups.noCombo.filter(filterFn) 
    };
  }, [libraryGroups, posFilter, mapFilter]);

  const allMapNames = useMemo(() => Object.keys(mapsData), [mapsData]);
  const allExpanded = expandedMaps.size === allMapNames.length && allMapNames.length > 0;

  return (
    // Changed to flex-col to allow footer to sit at the bottom of the viewport
    <div className="flex flex-col h-screen bg-slate-100 text-[1.15em] text-slate-900 overflow-hidden font-medium">
      
      {/* TOP SECTION: Sidebars + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <aside className={cn(
          "relative bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20", 
          isSidebarCollapsed ? "w-20" : "w-[24rem]"
        )}>
          <Logo isCollapsed={isSidebarCollapsed} />
          <button
            data-testid="sidebar-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className="absolute top-12 -right-4 z-50 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:text-blue-600 transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <div className={cn(
            "h-full w-[24rem] overflow-hidden transition-opacity duration-300", 
            isSidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          )}>
            <CharacterSidebar 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              posFilter={posFilter} 
              setPosFilter={setPosFilter} 
              mapFilter={mapFilter} 
              setMapFilter={setMapFilter} 
              groups={filteredLibrary} 
              ownedChars={ownedChars} 
              onToggle={toggleCharacter} 
              getImagePath={getImagePath} 
            />
          </div>
        </aside>

        {/* MAIN SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-10 bg-slate-50 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-12">
            <Header 
              showPositionIcon={showPositionIcon} 
              setShowPositionIcon={setShowPositionIcon} 
              toggleAllByType={toggleAllByType} 
              clearAll={clearAll} 
              onExpandAll={() => setExpandedMaps(new Set(allMapNames))} 
              onCollapseAll={() => setExpandedMaps(new Set())} 
              allExpanded={allExpanded} 
            />

            <div className="space-y-16">
              {Object.entries(mapsData).map(([mapName, data]) => {
                const mapCombos = data.combo_names
                  .map((n: string[]) => n.join('&'))
                  .filter((id: string) => filteredComboIds?.includes(id));

                if (mapFilter && mapName !== mapFilter) return null;
                
                return (
                  <MapSection 
                    key={mapName} 
                    mapName={mapName} 
                    combos={mapCombos} 
                    searchTerm={searchTerm} 
                    selectedComboIds={selectedComboIds} 
                    toggleCombo={toggleCombo} 
                    ownedChars={ownedChars} 
                    toggleCharacter={toggleCharacter} 
                    getImagePath={getImagePath} 
                    showPositionIcon={showPositionIcon} 
                    progress={analysis?.mapCompletion?.[mapName]} 
                    isExpanded={expandedMaps.has(mapName) || mapFilter === mapName || !!searchTerm} 
                    onToggle={() => setExpandedMaps(prev => {
                      const n = new Set(prev);
                      n.has(mapName) ? n.delete(mapName) : n.add(mapName);
                      return n;
                    })} 
                  />
                );
              })}
            </div>
          </div>
        </main>
        
        {/* RIGHT SIDEBAR */}
        <aside className={cn(
          "relative bg-white border-l border-slate-200 transition-all duration-300 flex flex-col z-20", 
          isAnalysisCollapsed ? "w-0 border-l-0" : "w-[26rem]"
        )}>
          <button 
            onClick={() => setIsAnalysisCollapsed(!isAnalysisCollapsed)} 
            className={cn(
              "absolute top-12 z-50 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-md hover:text-blue-600 transition-colors", 
              isAnalysisCollapsed ? "right-2" : "-left-4"
            )}
          >
            {isAnalysisCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>

          {!isAnalysisCollapsed && (
            <div className="h-full w-[26rem] flex flex-col animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="p-6 border-b border-slate-100 space-y-4 bg-slate-50/50">
                <AuthButton />
                <div className="space-y-3">
                  <button 
                    onClick={handleSave} 
                    disabled={isSyncing} 
                    className={cn(
                      "w-full flex items-center justify-center gap-2 p-3 rounded-2xl font-black italic uppercase text-xs transition-all shadow-lg active:scale-95 disabled:opacity-50", 
                      isLoggedIn ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100" : "bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200"
                    )}
                  >
                    {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {isSyncing ? 'Saving...' : isLoggedIn ? 'Cloud Sync' : 'Save Locally'}
                  </button>
                  {lastSaved && (
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock size={10} /> Last synced: {lastSaved}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <RewardAnalysis
                  analysis={analysis}
                  getImagePath={getImagePath}
                />
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* FULL WIDTH FOOTER: Now sits outside the main content area */}
      <Footer />
    </div>
  );
};

export default App;