// src/App.tsx
import React, { useState, useMemo } from 'react';
import { useComboManager } from '@/hooks/useComboManager';
import { CharacterSidebar } from '@/components/CharacterSidebar';
import { RewardAnalysis } from '@/components/RewardAnalysis';
import { MapSection } from '@/components/MapSection';
import { Header } from '@/components/Header';
import characters from '@/data/characters.json';

const BASE_ASSET_PATH = '/assets/icons_split/';

const App: React.FC = () => {
  const { 
    ownedChars, toggleCharacter, selectedComboIds, toggleCombo, toggleAllByType,
    clearAll, analysis, libraryGroups, mapsData, characterMapping
  } = useComboManager();

  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState<string | null>(null);
  // NEW: Add the map filter state here
  const [mapFilter, setMapFilter] = useState<string | null>(null);
  const [showPositionIcon, setShowPositionIcon] = useState(true);

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
      // NEW: Add the map matching logic
      const matchesMap = !mapFilter || charData?.encounter_map === mapFilter;
      
      return matchesSearch && matchesPos && matchesMap;
    };

    return {
      withCombo: libraryGroups.withCombo.filter(filterFn),
      noCombo: libraryGroups.noCombo.filter(filterFn)
    };
  }, [libraryGroups, searchTerm, posFilter, mapFilter]); // Added mapFilter to dependencies

  return (
    <div className="flex h-screen bg-slate-100 text-[1.15em] text-slate-900 overflow-hidden font-medium">
      <CharacterSidebar 
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        posFilter={posFilter} setPosFilter={setPosFilter}
        // NEW: Pass these props to the Sidebar
        mapFilter={mapFilter} setMapFilter={setMapFilter}
        groups={filteredLibrary} ownedChars={ownedChars}
        onToggle={toggleCharacter} getImagePath={getImagePath}
      />

      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-12">
          <Header 
            showPositionIcon={showPositionIcon}
            setShowPositionIcon={setShowPositionIcon}
            toggleAllByType={toggleAllByType}
            clearAll={clearAll}
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
              />
            ))}
          </div>
        </div>
      </main>
      
      <RewardAnalysis analysis={analysis} />
    </div>
  );
};

export default App;