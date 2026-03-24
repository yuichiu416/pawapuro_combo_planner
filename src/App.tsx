// src/App.tsx
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock,
  List,
  Loader2,
  Save,
  SearchX,
  Users,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { AuthButton } from '@/components/AuthButton';
import { CharacterSidebar } from '@/components/CharacterSidebar';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { MapSection } from '@/components/MapSection';
import { RewardAnalysis } from '@/components/RewardAnalysis';
import characters from '@/data/characters.json';
import { useComboManager } from '@/hooks/useComboManager';
import { supabase } from '@/lib/supabase';
import { cn } from '@/utils/style';

const BASE_ASSET_PATH = '/assets/icons_split/';

const Logo = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <div
    className={cn(
      'flex items-center pt-4 pb-2 shrink-0 transition-all duration-300',
      isCollapsed ? 'justify-center px-0' : 'gap-3 px-6',
    )}
  >
    <div className="w-10 h-10 flex items-center justify-center shrink-0">
      <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
    </div>
    {!isCollapsed && (
      <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
        <span className="font-black text-xl md:text-2xl tracking-tighter text-black uppercase leading-none whitespace-nowrap">
          PowerPro 2024-2025
        </span>
        <span className="text-xs md:text-sm font-bold text-blue-600 uppercase tracking-widest whitespace-nowrap">
          Combo Planner
        </span>
      </div>
    )}
  </div>
);

const App: React.FC = () => {
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
    filterNoKanji,
    toggleKanjiFilter,
    handleSave,
    isSyncing,
    lastSaved,
    libraryGroups = { withCombo: [], noCombo: [] },
    fontScale = 1.0,
    adjustFont,
  } = useComboManager();

  const [posFilter, setPosFilter] = useState<string | null>(null);
  const [mapFilter, setMapFilter] = useState<string | null>(null);
  const [showPositionIcon, setShowPositionIcon] = useState(true);
  const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAnalysisCollapsed, setIsAnalysisCollapsed] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'roster' | 'planner' | 'analysis'>(
    'planner',
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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

  const handleAddCharacters = (input: string | string[]) => {
    const names = typeof input === 'string' ? input.split('&') : input;
    if (!Array.isArray(names)) return;
    names.forEach((name) => {
      if (!ownedChars.has(name)) toggleCharacter(name);
    });
  };

  const filteredLibrary = useMemo(() => {
    if (!libraryGroups?.withCombo) return { withCombo: [], noCombo: [] };
    const filterFn = (name: string) => {
      const charData = (characters as any)[name];
      return (
        (!posFilter || charData?.position === posFilter) &&
        (!mapFilter || charData?.encounter_map === mapFilter)
      );
    };
    return {
      withCombo: libraryGroups.withCombo.filter(filterFn),
      noCombo: libraryGroups.noCombo.filter(filterFn),
    };
  }, [libraryGroups, posFilter, mapFilter]);

  const allMapNames = useMemo(() => Object.keys(mapsData), [mapsData]);
  const allExpanded = expandedMaps.size === allMapNames.length && allMapNames.length > 0;

  const handleToggleRelated = () => {
    const nextValue = !filterRelatedOnly;
    toggleRelatedFilter();
    if (nextValue) setExpandedMaps(new Set(allMapNames));
  };

  return (
    <div
      className="flex flex-col h-screen bg-slate-100 text-black overflow-hidden font-medium"
      style={{ fontSize: `${fontScale}rem` }}
    >
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT SIDEBAR (Desktop) */}
        <aside
          className={cn(
            'hidden lg:flex relative bg-white border-r border-slate-200 transition-all duration-300 flex-col z-20',
            isSidebarCollapsed ? 'w-20' : 'w-[24rem]',
          )}
        >
          <Logo isCollapsed={isSidebarCollapsed} />
          <button
            data-testid="sidebar-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute top-12 -right-4 z-50 w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <div
            className={cn(
              'h-full w-[24rem] overflow-hidden',
              isSidebarCollapsed && 'opacity-0 pointer-events-none',
            )}
          >
            <CharacterSidebar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              posFilter={posFilter}
              setPosFilter={setPosFilter}
              mapFilter={mapFilter}
              setMapFilter={setMapFilter}
              filterNoKanji={filterNoKanji}
              toggleKanjiFilter={toggleKanjiFilter}
              groups={filteredLibrary}
              ownedChars={ownedChars}
              onToggle={toggleCharacter}
              getImagePath={getImagePath}
              testId="desktop-character-sidebar" // Fixed: Changed from ariaLabel to testId
            />
          </div>
        </aside>

        {/* MOBILE DRAWER: Roster */}
        <div
          className={cn(
            'lg:hidden fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300',
            activeMobileTab === 'roster' ? 'opacity-100 visible' : 'opacity-0 invisible',
          )}
          onClick={() => setActiveMobileTab('planner')}
        >
          <div
            className={cn(
              'absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300',
              activeMobileTab === 'roster' ? 'translate-x-0' : '-translate-x-full',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <span
                data-testid="mobile-drawer-title-library"
                className="font-black uppercase tracking-tighter"
              >
                Character Library
              </span>
              <button
                data-testid="mobile-character-sidebar-close-btn"
                onClick={() => setActiveMobileTab('planner')}
                className="p-2 bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <CharacterSidebar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              posFilter={posFilter}
              setPosFilter={setPosFilter}
              mapFilter={mapFilter}
              setMapFilter={setMapFilter}
              filterNoKanji={filterNoKanji}
              toggleKanjiFilter={toggleKanjiFilter}
              groups={filteredLibrary}
              ownedChars={ownedChars}
              onToggle={toggleCharacter}
              getImagePath={getImagePath}
              testId="mobile-character-sidebar" // Fixed: Changed from ariaLabel to testId
            />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main
          className={cn(
            'flex-1 overflow-y-auto bg-slate-50 custom-scrollbar transition-all pb-24 lg:pb-10',
            activeMobileTab === 'planner' ? 'block' : 'hidden lg:block',
            'p-4 md:p-8 lg:p-10',
          )}
        >
          <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
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
              isLoggedIn={isLoggedIn}
              isSyncing={isSyncing}
              handleSave={handleSave}
            />

            <div className="space-y-12 md:space-y-16">
              {Object.entries(mapsData).map(([mapName, data]) => {
                const mapCombos = data.combo_names
                  .map((names: string[]) => names.join('&'))
                  .filter((id: string) => filteredComboIds.includes(id));
                if (filterRelatedOnly && mapCombos.length === 0) return null;
                if (mapFilter && mapName !== mapFilter) return null;

                return (
                  <MapSection
                    key={mapName}
                    data-testid={`map-progress-${mapName}`}
                    mapName={mapName}
                    combos={mapCombos}
                    searchTerm={searchTerm}
                    selectedComboIds={selectedComboIds}
                    toggleCombo={toggleCombo}
                    ownedChars={ownedChars}
                    toggleCharacter={toggleCharacter}
                    onAddCharacters={handleAddCharacters}
                    getImagePath={getImagePath}
                    showPositionIcon={showPositionIcon}
                    progress={analysis?.mapCompletion?.[mapName]}
                    isExpanded={expandedMaps.has(mapName) || mapFilter === mapName || !!searchTerm}
                    onToggle={() =>
                      setExpandedMaps((prev) => {
                        const n = new Set(prev);
                        n.has(mapName) ? n.delete(mapName) : n.add(mapName);
                        return n;
                      })
                    }
                  />
                );
              })}
              {filterRelatedOnly && filteredComboIds.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200 px-6 text-center">
                  <SearchX size={32} className="text-black mb-4" />
                  <h3 className="text-xl font-black uppercase text-black">No related combos</h3>
                  <p className="text-sm font-bold text-black/80 uppercase mt-1">
                    Try selecting more characters
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR (Analysis) */}
        <aside
          className={cn(
            'hidden lg:flex relative bg-white border-l border-slate-200 transition-all duration-300 flex-col z-20',
            isAnalysisCollapsed ? 'w-0 border-l-0' : 'w-[26rem]',
          )}
        >
          <button
            onClick={() => setIsAnalysisCollapsed(!isAnalysisCollapsed)}
            className="absolute top-12 -left-4 z-50 w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
          >
            {isAnalysisCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
          {!isAnalysisCollapsed && (
            <div className="h-full w-[26rem] flex flex-col">
              <div className="px-6 py-3 space-y-2 bg-slate-50/50 border-b border-slate-200/50">
                <div className="flex flex-row items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSyncing}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-black uppercase text-xs tracking-wider transition-all active:scale-95 disabled:opacity-50 shadow-sm',
                      isLoggedIn
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                        : 'bg-slate-800 text-white hover:bg-slate-900',
                    )}
                  >
                    {isSyncing ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    <span className="truncate">
                      {isSyncing ? 'Syncing...' : isLoggedIn ? 'Cloud Sync' : 'Save Locally'}
                    </span>
                  </button>
                  <AuthButton />
                </div>

                <div
                  className={cn(
                    'text-xs font-bold text-black text-right uppercase tracking-widest leading-none',
                    !lastSaved && 'invisible',
                  )}
                >
                  <Clock size={8} className="inline mr-1 -mt-0.5" />
                  Last saved: {lastSaved || 'Just now'}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <RewardAnalysis analysis={analysis} getImagePath={getImagePath} />
              </div>
            </div>
          )}
        </aside>

        {/* MOBILE DRAWER: Analysis */}
        <div
          className={cn(
            'lg:hidden fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300',
            activeMobileTab === 'analysis' ? 'opacity-100 visible' : 'opacity-0 invisible',
          )}
          onClick={() => setActiveMobileTab('planner')}
        >
          <div
            className={cn(
              'absolute right-0 top-0 h-full w-[90%] max-w-sm bg-white shadow-2xl transition-transform duration-300 flex flex-col',
              activeMobileTab === 'analysis' ? 'translate-x-0' : 'translate-x-full',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center shrink-0">
              <span className="font-black uppercase tracking-tighter text-lg">Reward Analysis</span>
              <button
                onClick={() => setActiveMobileTab('planner')}
                className="p-2 bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pb-32">
              <RewardAnalysis analysis={analysis} getImagePath={getImagePath} />
            </div>
          </div>
        </div>

        {/* MOBILE NAVIGATION */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-t border-slate-200 z-[90] flex items-center justify-around px-6 pb-2">
          <MobileNavBtn
            active={activeMobileTab === 'roster'}
            onClick={() => setActiveMobileTab('roster')}
            icon={<Users size={22} />}
            label="Library"
          />
          <MobileNavBtn
            active={activeMobileTab === 'planner'}
            onClick={() => setActiveMobileTab('planner')}
            icon={<List size={22} />}
            label="Planner"
          />
          <MobileNavBtn
            active={activeMobileTab === 'analysis'}
            onClick={() => setActiveMobileTab('analysis')}
            icon={<BarChart3 size={22} />}
            label="Analysis"
          />
        </nav>
      </div>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

const MobileNavBtn = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    data-testid={`mobile-${label.toLowerCase().replace(/\s+/g, '-')}-btn`}
    onClick={onClick}
    className={cn(
      'flex flex-col items-center gap-1 transition-all duration-300',
      active ? 'text-blue-600 scale-110' : 'text-black',
    )}
  >
    <div
      className={cn('p-2 rounded-xl transition-colors', active ? 'bg-blue-50' : 'bg-transparent')}
    >
      {icon}
    </div>
    <span className="text-xs font-black uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
