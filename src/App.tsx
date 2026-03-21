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
import { cn } from '@/utils/style';
import characters from '@/data/characters.json';

const BASE_ASSET_PATH = '/assets/icons_split/';

// --- SUB-COMPONENTS ---

const Logo = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <div className={cn(
    "flex items-center py-8 shrink-0 transition-all duration-300",
    isCollapsed ? "justify-center px-0" : "gap-3 px-6"
  )}>
    <div className="w-10 h-10 flex items-center justify-center shrink-0">
      <img 
        src="/assets/logo.png" 
        alt="Logo" 
        className="w-full h-full object-contain" 
      />
    </div>
    <div className={cn(
      "flex flex-col transition-all duration-300 origin-left",
      isCollapsed ? "w-0 opacity-0 scale-x-0 hidden" : "w-auto opacity-100 scale-x-100"
    )}>
      <span className="font-black italic text-xl tracking-tighter text-slate-900 uppercase leading-none whitespace-nowrap">
        Pawapuro 2024-2025
      </span>
      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest whitespace-nowrap">
        Combo Planner
      </span>
    </div>
  </div>
);

const App: React.FC = () => {
  const { 
    ownedChars, toggleCharacter, selectedComboIds, toggleCombo, toggleAllByType,
    clearAll, analysis, libraryGroups, mapsData, characterMapping,
    setOwnedChars, setSelectedComboIds,
    searchTerm, setSearchTerm, filteredComboIds // Now consuming from hook
  } = useComboManager();

  // --- UI STATE ---
  const [posFilter, setPosFilter] = useState<string | null>(null);
  const [mapFilter, setMapFilter] = useState<string | null>(null);
  const [showPositionIcon, setShowPositionIcon] = useState(true);
  const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState(false);

  // --- AUTH & SYNC STATE ---
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // 1. SINGLE AUTH LISTENER
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (event === 'SIGNED_OUT') {
        clearAll();
        setLastSaved(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [clearAll]);

  // 2. DATA HYDRATION
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_saves')
          .select('selected_characters, selected_combos, updated_at')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          if (data.selected_characters) setOwnedChars(new Set(data.selected_characters));
          if (data.selected_combos) setSelectedComboIds(new Set(data.selected_combos));
          
          if (data.updated_at) {
            setLastSaved(new Date(data.updated_at).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }));
          }
        }
      } catch (err) {
        console.error("❌ Hydration Error:", err);
      }
    };

    loadData();
  }, [isLoggedIn, setOwnedChars, setSelectedComboIds]);

  // 3. SAVE HANDLER
  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setIsSaving(true);
    const now = new Date().toISOString();

    const { error } = await supabase.from('user_saves').upsert({
      user_id: user.id,
      selected_characters: Array.from(ownedChars),
      selected_combos: Array.from(selectedComboIds),
      updated_at: now,
    });

    if (!error) {
      setLastSaved(new Date(now).toLocaleString());
    }
    setIsSaving(false);
  };

  // --- HELPERS ---
  const getImagePath = (name: string, usePosIcon: boolean) => {
    const charEntry = characterMapping.idToName?.by_name[name];
    let img = charEntry?.img_standard || 'placeholder.png';
    if (usePosIcon && img !== 'placeholder.png') img = img.replace('.png', '_pos.png');
    return `${BASE_ASSET_PATH}${img}`;
  };

  // Filter library list based on UI filters (Pos/Map)
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

  // Filter visible maps based on the combos that survived the hook's search filter
  const visibleMaps = useMemo(() => {
    return Object.entries(mapsData).filter(([mapName, data]) => {
      // 1. Check sidebar map filter first
      if (mapFilter && mapName !== mapFilter) return false;

      if (!filteredComboIds) return true;
      
      // 2. Check if any combo in this map exists in the filtered list
      return data.combo_names.some((comboNames: string[]) => {
        // Normalize the array ["CharA", "CharB"] into "CharA&CharB"
        const id = comboNames.join('&');
        return filteredComboIds.includes(id);
      });
    });
  }, [mapsData, filteredComboIds, mapFilter]);

  return (
    <div className="flex h-screen bg-slate-100 text-[1.15em] text-slate-900 overflow-hidden font-medium">
      
      {/* LEFT SIDEBAR */}
      <aside className={cn(
        "relative bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-20", 
        isSidebarCollapsed ? "w-20" : "w-[24rem]"
      )}>
        <Logo isCollapsed={isSidebarCollapsed} />
        
        <button
          data-testid="sidebar-collapse-btn"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-12 -right-4 z-50 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 shadow-md hover:text-blue-600 transition-colors"
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

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-10 bg-slate-50 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-12">
          <Header 
            showPositionIcon={showPositionIcon} 
            setShowPositionIcon={setShowPositionIcon} 
            toggleAllByType={toggleAllByType} 
            clearAll={clearAll} 
            onExpandAll={() => setExpandedMaps(new Set(Object.keys(mapsData)))} 
            onCollapseAll={() => setExpandedMaps(new Set())} 
            allExpanded={Object.keys(mapsData).length > 0 && Object.keys(mapsData).every(n => expandedMaps.has(n))} 
          />
          <div className="space-y-16">
            {visibleMaps.map(([mapName, data]) => {
              // Pass only the combos that match the current search
              const mapCombos = data.combo_names
                .map((names: string[]) => names.join('&')) // Convert to IDs
                .filter((id: string) => filteredComboIds?.includes(id)); // Check against search
              return (
                <MapSection 
                  key={mapName} 
                  mapName={mapName} 
                  combos={mapCombos}
                  searchTerm={searchTerm} // Helpful to pass this for auto-expansion
                  selectedComboIds={selectedComboIds} 
                  toggleCombo={toggleCombo} 
                  ownedChars={ownedChars} 
                  toggleCharacter={toggleCharacter} 
                  getImagePath={getImagePath} 
                  showPositionIcon={showPositionIcon} 
                  progress={analysis?.mapCompletion?.[mapName]} 
                  // Map expands if searched, filtered via sidebar, or manually toggled
                  isExpanded={
                    expandedMaps.has(mapName) || 
                    mapFilter === mapName || 
                    (searchTerm?.trim()?.length ?? 0) > 0
                  }
                  onToggle={() => setExpandedMaps(prev => { 
                    const n = new Set(prev); 
                    n.has(mapName) ? n.delete(mapName) : n.add(mapName); 
                    return n; 
                  })} 
                />
              );
            })}
            
            {visibleMaps.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                <p className="font-black italic text-xl uppercase tracking-tighter">No matching combos found</p>
                <button onClick={() => setSearchTerm('')} className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline">Clear Search</button>
              </div>
            )}
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
            "absolute top-12 z-50 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 shadow-md hover:text-blue-600 transition-colors", 
            isAnalysisCollapsed ? "right-2" : "-left-4"
          )}
        >
          {isAnalysisCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        {!isAnalysisCollapsed && (
          <div className="h-full w-[26rem] flex flex-col">
            <div className="p-6 border-b border-slate-100 space-y-4">
              <AuthButton />
              {isLoggedIn && (
                <div className="space-y-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-2xl font-black italic uppercase text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {isSaving ? 'Syncing...' : 'Save Configuration'}
                  </button>
                  {lastSaved && (
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <Clock size={10} />
                      Last synced: {lastSaved}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <RewardAnalysis analysis={analysis} />
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default App;