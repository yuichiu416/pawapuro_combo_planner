// src/App.tsx
import { ChevronLeft, ChevronRight, Clock, Loader2, Save, SearchX } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthButton } from '@/components/AuthButton';
import { CharacterSidebar } from '@/components/CharacterSidebar';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { MapSection } from '@/components/MapSection';
import { MobileDrawer } from '@/components/MobileDrawer';
import { MobileNavigation } from '@/components/MobileNavigation';
import { RewardAnalysis } from '@/components/RewardAnalysis';
import characters from '@/data/characters.json';
import { useComboManager } from '@/hooks/useComboManager';
import { supabase } from '@/lib/supabase';
import { cn } from '@/utils/style';

const BASE_ASSET_PATH = '/assets/icons_split/';

interface LogoProps {
  isCollapsed: boolean;
}

const Logo: React.FC<LogoProps> = ({ isCollapsed }) => (
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
        <span
          data-testid="pawapuro_title_text"
          className="font-black text-xl md:text-2xl tracking-tighter text-black uppercase leading-none whitespace-nowrap"
        >
          パワプロ 2024-2025
        </span>
        <span className="text-xs md:text-sm font-bold text-blue-600 uppercase tracking-widest whitespace-nowrap">
          Combo Planner
        </span>
      </div>
    )}
  </div>
);

const App: React.FC = () => {
  const manager = useComboManager();
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
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);

  const handleSetSelectedPreview = useCallback((name: string | null) => {
    setSelectedPreview(name);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setIsLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  const getImagePath = (name: string, usePosIcon: boolean) => {
    const mapping = manager.characterMapping?.idToName?.by_name;
    const charEntry = mapping ? (mapping as any)[name] : null;
    let img = charEntry?.img_standard || 'placeholder.png';
    if (usePosIcon && img !== 'placeholder.png') img = img.replace('.png', '_pos.png');
    return `${BASE_ASSET_PATH}${img}`;
  };

  const filteredLibrary = useMemo(() => {
    if (!manager.libraryGroups) return { withCombo: [], noCombo: [] };
    const filterFn = (name: string) => {
      const charData = (characters as any)[name];
      const matchesSearch =
        !manager.searchTerm ||
        name.toLowerCase().includes(manager.searchTerm.toLowerCase()) ||
        charData?.position?.toLowerCase().includes(manager.searchTerm.toLowerCase());
      const matchesPos = !posFilter || charData?.position === posFilter;
      const matchesMap = !mapFilter || charData?.encounter_map === mapFilter;
      return matchesSearch && matchesPos && matchesMap;
    };
    return {
      withCombo: (manager.libraryGroups.withCombo || []).filter(filterFn),
      noCombo: (manager.libraryGroups.noCombo || []).filter(filterFn),
    };
  }, [manager.libraryGroups, manager.searchTerm, posFilter, mapFilter]);

  const allMapNames = useMemo(() => Object.keys(manager.mapsData), [manager.mapsData]);
  const allExpanded = expandedMaps.size === allMapNames.length && allMapNames.length > 0;

  return (
    <div
      className="flex flex-col h-screen bg-slate-100 text-black overflow-hidden font-medium"
      style={{ fontSize: `${manager.fontScale}rem` }}
      data-testid="app-container"
    >
      <div className="flex flex-1 overflow-hidden relative">
        <aside
          data-testid="desktop-sidebar-container"
          className={cn(
            'hidden lg:flex relative bg-white border-r border-slate-200 transition-all duration-300 flex-col z-40',
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
              'flex-1 overflow-hidden transition-opacity duration-200',
              isSidebarCollapsed ? 'opacity-0 invisible h-0' : 'opacity-100 visible h-full',
            )}
          >
            <CharacterSidebar
              {...manager}
              selectedPreview={selectedPreview}
              setSelectedPreview={handleSetSelectedPreview}
              posFilter={posFilter}
              setPosFilter={setPosFilter}
              mapFilter={mapFilter}
              setMapFilter={setMapFilter}
              groups={filteredLibrary}
              onToggle={manager.toggleCharacter}
              getImagePath={getImagePath}
              testId="desktop-character-sidebar"
            />
          </div>
        </aside>

        <MobileDrawer
          isOpen={activeMobileTab === 'roster'}
          onClose={() => setActiveMobileTab('planner')}
          title="Character Library"
          side="left"
          testId="mobile-character-sidebar"
          titleTestId="mobile-drawer-title-library"
        >
          <CharacterSidebar
            {...manager}
            selectedPreview={selectedPreview}
            setSelectedPreview={handleSetSelectedPreview}
            posFilter={posFilter}
            setPosFilter={setPosFilter}
            mapFilter={mapFilter}
            setMapFilter={setMapFilter}
            groups={filteredLibrary}
            onToggle={manager.toggleCharacter}
            getImagePath={getImagePath}
            testId="mobile-character-sidebar"
          />
        </MobileDrawer>

        <main
          data-testid="main-content-area"
          className={cn(
            'flex-1 overflow-y-auto bg-slate-50 custom-scrollbar transition-all pb-24 lg:pb-10',
            activeMobileTab === 'planner' ? 'block' : 'hidden lg:block',
          )}
        >
          <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 p-4 md:p-8">
            <Header
              {...manager}
              showPositionIcon={showPositionIcon}
              setShowPositionIcon={setShowPositionIcon}
              toggleRelatedFilter={() => {
                manager.toggleRelatedFilter();
                if (!manager.filterRelatedOnly) setExpandedMaps(new Set(allMapNames));
              }}
              onExpandAll={() => setExpandedMaps(new Set(allMapNames))}
              onCollapseAll={() => setExpandedMaps(new Set())}
              allExpanded={allExpanded}
              isLoggedIn={isLoggedIn}
              onAdjustFont={manager.adjustFont}
            />

            <div className="space-y-12 md:space-y-16">
              {Object.entries(manager.mapsData).map(([mapName, data]) => {
                const mapCombos = ((data as any).combo_names || [])
                  .map((names: string[]) => names.join('&'))
                  .filter((id: string) => manager.filteredComboIds.includes(id));

                if (manager.filterRelatedOnly && mapCombos.length === 0) return null;
                if (mapFilter && mapName !== mapFilter) return null;

                return (
                  <MapSection
                    key={mapName}
                    mapName={mapName}
                    combos={mapCombos}
                    searchTerm={manager.searchTerm}
                    selectedComboIds={manager.selectedComboIds}
                    toggleCombo={manager.toggleCombo}
                    ownedChars={manager.ownedChars}
                    toggleCharacter={manager.toggleCharacter}
                    onSelectPreview={handleSetSelectedPreview}
                    onAddCharacters={(input) => {
                      const names = typeof input === 'string' ? input.split('&') : input;
                      names.forEach(
                        (n) => !manager.ownedChars.has(n) && manager.toggleCharacter(n),
                      );
                    }}
                    getImagePath={getImagePath}
                    showPositionIcon={showPositionIcon}
                    progress={manager.analysis?.mapCompletion?.[mapName]}
                    isExpanded={
                      expandedMaps.has(mapName) ||
                      mapFilter === mapName ||
                      !!manager.searchTerm ||
                      (manager.activeSkillFilters && manager.activeSkillFilters.length > 0) ||
                      manager.filterRelatedOnly
                    }
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
              {manager.filterRelatedOnly && manager.filteredComboIds.length === 0 && (
                <div
                  data-testid="no-results-placeholder"
                  className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-slate-200 px-6 text-center"
                >
                  <SearchX size={32} className="text-black mb-4" />
                  <h3 className="text-xl font-black uppercase text-black">No related combos</h3>
                </div>
              )}
            </div>
          </div>
        </main>

        <aside
          data-testid="desktop-analysis-sidebar"
          className={cn(
            'hidden lg:flex relative bg-white border-l border-slate-200 transition-all duration-300 flex-col z-40',
            isAnalysisCollapsed ? 'w-0 border-l-0' : 'w-[26rem]',
          )}
        >
          <button
            data-testid="analysis-collapse-btn"
            onClick={() => setIsAnalysisCollapsed(!isAnalysisCollapsed)}
            className="absolute top-12 -left-4 z-50 w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform"
          >
            {isAnalysisCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
          <div className={cn('h-full w-[26rem] flex flex-col', isAnalysisCollapsed && 'hidden')}>
            <div className="px-6 py-3 space-y-2 bg-slate-50/50 border-b border-slate-200/50">
              <div className="flex flex-row items-center gap-3">
                <button
                  data-testid="sync-status-btn"
                  onClick={manager.handleSave}
                  disabled={manager.isSyncing}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-black uppercase text-xs transition-all active:scale-95 disabled:opacity-50 shadow-sm',
                    isLoggedIn ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white',
                  )}
                >
                  {manager.isSyncing ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  <span>
                    {manager.isSyncing ? 'Syncing...' : isLoggedIn ? 'Cloud Sync' : 'Save Locally'}
                  </span>
                </button>
                <AuthButton />
              </div>
              <div
                data-testid="last-saved-timestamp"
                className={cn(
                  'text-xs font-bold text-black text-right uppercase tracking-widest leading-none',
                  !manager.lastSaved && 'invisible',
                )}
              >
                <Clock size={8} className="inline mr-1 -mt-0.5" />
                Last saved: {manager.lastSaved || 'Just now'}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <RewardAnalysis
                {...manager}
                getImagePath={getImagePath}
                testId="desktop-reward-analysis"
              />
            </div>
          </div>
        </aside>

        <MobileDrawer
          isOpen={activeMobileTab === 'analysis'}
          onClose={() => setActiveMobileTab('planner')}
          title="Reward Analysis"
          side="right"
          testId="mobile-analysis"
        >
          <RewardAnalysis
            {...manager}
            getImagePath={getImagePath}
            testId="mobile-reward-analysis"
          />
        </MobileDrawer>

        <MobileNavigation activeTab={activeMobileTab} onTabChange={setActiveMobileTab} />
      </div>
      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
};

export default App;
