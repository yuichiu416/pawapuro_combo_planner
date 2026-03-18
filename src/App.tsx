import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useComboManager } from '@/hooks/useComboManager';
import { CharacterSidebar } from '@/components/CharacterSidebar';
import { RewardAnalysis } from '@/components/RewardAnalysis';
import { MapSection } from '@/components/MapSection';
import { Header } from '@/components/Header';
import { cn } from '@/utils/style';
import characters from '@/data/characters.json';

const BASE_ASSET_PATH = '/assets/icons_split/';

const App: React.FC = () => {
  const { 
    ownedChars, toggleCharacter, selectedComboIds, toggleCombo, toggleAllByType,
    clearAll, analysis, libraryGroups, mapsData, characterMapping
  } = useComboManager();

  // Filter & UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState<string | null>(null);
  const [mapFilter, setMapFilter] = useState<string | null>(null);
  const [showPositionIcon, setShowPositionIcon] = useState(true);
  const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set());

  // COLLAPSIBLE STATE
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState(false);

  const allExpanded = useMemo(() => {
    const mapNames = Object.keys(mapsData);
    if (mapNames.length === 0) return false;
    return mapNames.every(name => expandedMaps.has(name));
  }, [expandedMaps, mapsData]);

  const toggleMapExpand = (mapName: string) => {
    setExpandedMaps(prev => {
      const next = new Set(prev);
      if (next.has(mapName)) next.delete(mapName);
      else next.add(mapName);
      return next;
    });
  };

  const expandAllMaps = () => {
    setExpandedMaps(new Set(Object.keys(mapsData)));
  };

  const collapseAllMaps = () => {
    setExpandedMaps(new Set());
    setMapFilter(null);
  };

  const getImagePath = (name: string, usePosIcon: boolean) => {
    const charEntry = characterMapping.idToName?.by_name[name];
    let img = charEntry?.img_standard || 'placeholder.png';
    if (usePosIcon && img !== 'placeholder.png') img = img.replace('.png', '_pos.png');
    return `${BASE_ASSET_PATH}${img}`;
  };

  const filteredLibrary = useMemo(() => {
    const filterFn = (name: string) => {
      const charData = (characters as any)[name];
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPos = !posFilter || charData?.position === posFilter;
      const matchesMap = !mapFilter || charData?.encounter_map === mapFilter;
      return matchesSearch && matchesPos && matchesMap;
    };
    return {
      withCombo: libraryGroups.withCombo.filter(filterFn),
      noCombo: libraryGroups.noCombo.filter(filterFn)
    };
  }, [libraryGroups, searchTerm, posFilter, mapFilter]);

  return (
    <div className="flex h-screen bg-slate-100 text-[1.15em] text-slate-900 overflow-hidden font-medium">
      
      {/* LEFT SIDEBAR AREA */}
      <aside 
        className={cn(
          "relative bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col z-20",
          isSidebarCollapsed ? "w-0 border-r-0" : "w-[24rem]"
        )}
      >
        {/* Toggle Button - Placed outside the hidden-overflow wrapper */}
        <button 
          data-testid="sidebar-collapse-btn"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={cn(
            "absolute top-12 z-50 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-md transition-all",
            isSidebarCollapsed ? "left-2" : "-right-4"
          )}
        >
          {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        {/* Internal Content Wrapper - Handles clipping during transition */}
        <div className={cn(
          "h-full w-[24rem] overflow-hidden transition-opacity duration-200",
          isSidebarCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <CharacterSidebar 
            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            posFilter={posFilter} setPosFilter={setPosFilter}
            mapFilter={mapFilter} setMapFilter={setMapFilter}
            groups={filteredLibrary} ownedChars={ownedChars}
            onToggle={toggleCharacter} getImagePath={getImagePath}
          />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-12">
          <Header 
            showPositionIcon={showPositionIcon}
            setShowPositionIcon={setShowPositionIcon}
            toggleAllByType={toggleAllByType}
            clearAll={clearAll}
            onExpandAll={expandAllMaps}
            onCollapseAll={collapseAllMaps}
            allExpanded={allExpanded}
          />

          <div className="space-y-16">
            {Object.entries(mapsData).map(([mapName, data]) => (
              <MapSection 
                key={mapName}
                mapName={mapName}
                combos={data.combo_names}
                selectedComboIds={selectedComboIds}
                toggleCombo={toggleCombo}
                ownedChars={ownedChars}
                toggleCharacter={toggleCharacter}
                getImagePath={getImagePath}
                showPositionIcon={showPositionIcon}
                isExpanded={expandedMaps.has(mapName) || mapFilter === mapName}
                onToggle={() => toggleMapExpand(mapName)}
              />
            ))}
          </div>
        </div>
      </main>
      
      {/* RIGHT ANALYSIS AREA */}
      <aside 
        className={cn(
          "relative bg-white border-l border-slate-200 transition-all duration-300 ease-in-out flex flex-col z-20",
          isAnalysisCollapsed ? "w-0 border-l-0" : "w-[26rem]"
        )}
      >
        {/* Toggle Button - Straddles the left edge */}
        <button 
          onClick={() => setIsAnalysisCollapsed(!isAnalysisCollapsed)}
          className={cn(
            "absolute top-12 z-50 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 shadow-md transition-all",
            isAnalysisCollapsed ? "right-2" : "-left-4"
          )}
        >
          {isAnalysisCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        <div className={cn(
          "h-full w-[26rem] overflow-hidden transition-opacity duration-200",
          isAnalysisCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <RewardAnalysis analysis={analysis} />
        </div>
      </aside>
    </div>
  );
};

export default App;