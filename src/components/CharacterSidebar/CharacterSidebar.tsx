// src/components/CharacterSidebar.tsx

import { Info, RotateCcw, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import charactersDataRaw from '@/data/characters.json';

import { CharacterItem } from './CharacterItem';
import { FilterBar } from './FilterBar';
import { RosterGrid } from './RosterGrid';

const POSITION_ORDER: Record<string, number> = {
  投: 1,
  捕: 2,
  一: 3,
  二: 4,
  三: 5,
  遊: 6,
  外: 7,
  左: 8,
  中: 9,
  右: 10,
  マ: 11,
};
const CHAR_DATA = charactersDataRaw as Record<string, any>;

interface CharacterSidebarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  posFilter: string | null;
  setPosFilter: (val: string | null) => void;
  mapFilter: string | null;
  setMapFilter: (val: string | null) => void;
  filterNoKanji: boolean;
  toggleKanjiFilter: () => void;
  groups: { withCombo: string[]; noCombo: string[] };
  ownedChars: Set<string>;
  onToggle: (name: string) => void;
  getImagePath: (name: string, usePos: boolean) => string;
  testId?: string;
}

export const CharacterSidebar: React.FC<CharacterSidebarProps> = (props) => {
  const { testId = 'character-sidebar' } = props;
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [lastRemoved, setLastRemoved] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  const sortChars = (names: string[]) => {
    return [...names].sort((a, b) => {
      const pA = POSITION_ORDER[CHAR_DATA[a]?.position?.trim()] || 0;
      const pB = POSITION_ORDER[CHAR_DATA[b]?.position?.trim()] || 0;
      if (pA !== pB) return pA - pB;
      return (CHAR_DATA[a]?.id || 99) - (CHAR_DATA[b]?.id || 99);
    });
  };

  const AVAILABLE_MAPS = useMemo(
    () =>
      Array.from(
        new Set(
          Object.values(CHAR_DATA)
            .map((c: any) => c.encounter_map)
            .filter(Boolean),
        ),
      ),
    [],
  );
  const rosterSlots = useMemo(() => {
    const sorted = sortChars(Array.from(props.ownedChars));
    return Array(28)
      .fill(null)
      .map((_, i) => sorted[i] || null);
  }, [props.ownedChars]);

  useEffect(() => {
    if (showUndo) {
      const timer = setTimeout(() => setShowUndo(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showUndo]);

  const handleConfirmRemove = (name: string) => {
    props.onToggle(name);
    setLastRemoved(name);
    setShowUndo(true);
    setSelectedPreview(null);
  };

  return (
    <aside
      className="w-full bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden relative"
      role="complementary"
      aria-label={testId}
      data-testid={testId}
    >
      <div className="shrink-0 bg-white border-b border-slate-200 shadow-sm p-3 space-y-2.5">
        <RosterGrid
          ownedChars={props.ownedChars}
          rosterSlots={rosterSlots}
          selectedPreview={selectedPreview}
          setSelectedPreview={setSelectedPreview}
          getImagePath={props.getImagePath}
          testId={testId}
        />

        {selectedPreview && !showUndo && (
          <div
            data-testid={`${testId}-roster-preview-box`}
            className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center justify-between animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded border border-blue-300 bg-white overflow-hidden">
                <img
                  src={props.getImagePath(selectedPreview, true)}
                  className="w-full h-full object-cover"
                  alt={selectedPreview}
                />
              </div>
              <div>
                <p className="text-xs font-black text-blue-900 leading-none">{selectedPreview}</p>
                <p className="text-xs font-bold text-blue-600 uppercase mt-0.5">
                  {CHAR_DATA[selectedPreview]?.position || 'Manager'}
                </p>
              </div>
            </div>
            <button
              data-testid={`${testId}-remove-btn-${selectedPreview}`}
              onClick={() => handleConfirmRemove(selectedPreview)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-black transition-colors"
            >
              <X size={12} strokeWidth={3} /> REMOVE
            </button>
          </div>
        )}

        {showUndo && (
          <div
            data-testid={`${testId}-undo-toast`}
            className="z-[50] animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-lg shadow-2xl px-3 py-2.5 flex items-center justify-between border border-slate-700/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Info size={16} className="text-blue-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-white uppercase tracking-tighter leading-none">
                    Roster Updated
                  </span>
                  <span className="text-xs font-bold tracking-tight truncate">
                    Removed {lastRemoved}
                  </span>
                </div>
              </div>
              <button
                data-testid={`${testId}-undo-button`}
                aria-label="Undo"
                onClick={() => {
                  props.onToggle(lastRemoved!);
                  setShowUndo(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-blue-50 rounded-md text-xs font-black uppercase shadow-sm ml-2"
              >
                <RotateCcw size={12} strokeWidth={3} /> Undo
              </button>
            </div>
          </div>
        )}

        <FilterBar
          {...props}
          isMapExpanded={isMapExpanded}
          setIsMapExpanded={setIsMapExpanded}
          availableMaps={AVAILABLE_MAPS}
          testId={testId}
        />
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-6 custom-scrollbar">
        {[
          { names: sortChars(props.groups.withCombo), label: 'Available Combo Partners' },
          { names: sortChars(props.groups.noCombo), label: 'Other Characters' },
        ].map(
          ({ names, label }) =>
            names.length > 0 && (
              <div
                key={label}
                className="space-y-1.5"
                data-testid={`${testId}-list-${label.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <h3 className="text-xs font-black text-black uppercase tracking-widest px-4 leading-none">
                  {label}
                </h3>
                <div className="grid gap-1 px-3">
                  {names.map((name) => (
                    <CharacterItem
                      key={name}
                      name={name}
                      isOwned={props.ownedChars.has(name)}
                      onToggle={props.onToggle}
                      getImagePath={props.getImagePath}
                      data={CHAR_DATA[name]}
                      testId={testId}
                    />
                  ))}
                </div>
              </div>
            ),
        )}
      </div>
    </aside>
  );
};
