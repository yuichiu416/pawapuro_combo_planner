// src/App.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Save, Loader2, Clock, SearchX } from 'lucide-react';
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
        <span className="font-black italic text-2xl tracking-tighter text-slate-900 uppercase leading-none whitespace-nowrap">
          Pawapuro 2024-2025
        </span>
        <span className="text-sm font-bold text-blue-600 uppercase tracking-widest whitespace-nowrap">
          Combo Planner
        </span>
      </div>
    )}
  </div>
);

const App: React.FC = () => {
  // --- DATA & LOGIC FROM HOOK ---
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
    filteredComboIds = [], 
    filterRelatedOnly,
    toggleRelatedFilter,
    filterNoKanji,      // ✨ Destructured
    toggleKanjiFilter,  // ✨ Destructured
    handleSave, 
    isSyncing, 
    lastSaved,
    libraryGroups = { withCombo: [], noCombo: [] },
    fontScale = 1.0,
    adjustFont,
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

  // The hook already handles searchTerm and filterNoKanji internally for libraryGroups.
  // This local useMemo just applies the additional Pos/Map UI filters.
  const filteredLibrary = useMemo(() => {
    if (!libraryGroups?.withCombo) return { withCombo: [], noCombo: [] };

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

  const handleToggleRelated = () => {
    const nextValue = !filterRelatedOnly;
    toggleRelatedFilter(); 
    if (nextValue) {
      setExpandedMaps(new Set(allMapNames));
    }
  };

  return (
    <div 
      className="flex flex-col h-screen bg-slate-100 text-slate-900 overflow-hidden font-medium" 
      style={{ fontSize: `${fontScale}rem` }}
    >
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT SIDEBAR: Character Selection */}
        <aside className={cn(
          "relative bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20", 
          isSidebarCollapsed ? "w-20" : "w-[24rem]"
        )}>
          <Logo isCollapsed={isSidebarCollapsed} />
          
          <button
            data-testid="sidebar-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
            className={cn(
              "absolute top-12 -right-4 z-50 w-8 h-8 flex items-center justify-center transition-all duration-200",
              "bg-slate-800 text-white rounded-full shadow-md hover:bg-slate-900 hover:scale-110 active:scale-95",
              "border-2 border-white"
            )}
          >
            {isSidebarCollapsed ? <ChevronRight size={18} strokeWidth={3} /> : <ChevronLeft size={18} strokeWidth={3} />}
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
              filterNoKanji={filterNoKanji}         // ✨ Passed to Sidebar
              toggleKanjiFilter={toggleKanjiFilter} // ✨ Passed to Sidebar
              groups={filteredLibrary} 
              ownedChars={ownedChars} 
              onToggle={toggleCharacter} 
              getImagePath={getImagePath} 
            />
          </div>
        </aside>

        {/* MAIN CONTENT: Combo Maps */}
        <main className="flex-1 overflow-y-auto p-10 bg-slate-50 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-12">
            <Header 
              showPositionIcon={showPositionIcon} 
              setShowPositionIcon={setShowPositionIcon} 
              filterRelatedOnly={filterRelatedOnly}
              toggleRelatedFilter={handleToggleRelated} 
              toggleAllByType={toggleAllByType} 
              clearAll={clearAll} 
              onExpandAll={() => setExpandedMaps(new Set(allMapNames))} 
              onCollapseAll={() => setExpandedMaps(new Set())} 
              allExpanded={allExpanded} 
              fontScale={fontScale}
              onAdjustFont={adjustFont}
            />

            <div className="space-y-16">
              {Object.entries(mapsData).map(([mapName, data]) => {
                const mapCombos = data.combo_names
                  .map((names: string[]) => names.join('&'))
                  .filter((id: string) => filteredComboIds.includes(id));

                if (filterRelatedOnly && mapCombos.length === 0) return null;
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

              {filterRelatedOnly && filteredComboIds.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-white/50 rounded-[3rem] border-4 border-dashed border-slate-200">
                  <div className="bg-slate-200 p-4 rounded-full text-slate-400 mb-4">
                    <SearchX size={32} />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase text-slate-400 tracking-tight">No related combos</h3>
                  <p className="text-base font-bold text-slate-400/80 uppercase tracking-widest mt-1">Select characters from the left to see their possible combos</p>
                </div>
              )}
            </div>
          </div>
        </main>
        
        {/* RIGHT SIDEBAR: Analysis & Sync */}
        <aside className={cn(
          "relative bg-white border-l border-slate-200 transition-all duration-300 flex flex-col z-20", 
          isAnalysisCollapsed ? "w-0 border-l-0" : "w-[26rem]"
        )}>
          <button 
            onClick={() => setIsAnalysisCollapsed(!isAnalysisCollapsed)} 
            className={cn(
              "absolute top-12 z-50 w-8 h-8 flex items-center justify-center transition-all duration-200",
              "bg-slate-800 text-white rounded-full shadow-md hover:bg-slate-900 hover:scale-110 active:scale-95",
              "border-2 border-white",
              isAnalysisCollapsed ? "right-2" : "-left-4"
            )}
          >
            {isAnalysisCollapsed ? <ChevronLeft size={18} strokeWidth={3} /> : <ChevronRight size={18} strokeWidth={3} />}
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
                      "w-full flex items-center justify-center gap-2 p-3 rounded-2xl font-black italic uppercase text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50", 
                      isLoggedIn ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100" : "bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200"
                    )}
                  >
                    {isSyncing ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {isSyncing ? 'Saving...' : isLoggedIn ? 'Cloud Sync' : 'Save Locally'}
                  </button>
                  {lastSaved && (
                    <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-slate-400 uppercase tracking-widest">
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

      <Footer />
    </div>
  );
};

export default App;