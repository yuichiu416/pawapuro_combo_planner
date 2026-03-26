// src/components/CharacterSidebar.tsx
import { Info, Plus, RotateCcw, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import charactersDataRaw from '@/data/characters.json';
import { cn } from '@/utils/style';
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
  selectedPreview: string | null;
  setSelectedPreview: (val: string | null) => void;
  testId?: string;
}

export const CharacterSidebar: React.FC<CharacterSidebarProps> = (props) => {
  const { testId = 'character-sidebar', selectedPreview, setSelectedPreview } = props;
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [lastAction, setLastAction] = useState<{ name: string; type: 'add' | 'remove' } | null>(
    null,
  );
  const [showUndo, setShowUndo] = useState(false);

  useEffect(() => {
    if (selectedPreview) {
      setShowUndo(false);
    }
  }, [selectedPreview]);

  const isPreviewOwned = selectedPreview ? props.ownedChars.has(selectedPreview) : false;

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

  const handleSelectPreview = (name: string | null) => {
    setSelectedPreview(name);
  };

  const handleConfirmAction = (name: string, type: 'add' | 'remove') => {
    props.onToggle(name);
    setLastAction({ name, type });
    setShowUndo(true);
    setSelectedPreview(null);
  };

  const handleUndo = () => {
    if (lastAction) {
      props.onToggle(lastAction.name);
      setShowUndo(false);
      setLastAction(null);
    }
  };

  return (
    <aside
      className="w-full bg-[#E6F0FF] border-r-4 border-blue-900/10 flex flex-col h-full overflow-hidden relative"
      data-testid={testId}
    >
      <div className="shrink-0 bg-white border-b-2 border-blue-100 shadow-sm p-4 space-y-3">
        <RosterGrid
          ownedChars={props.ownedChars}
          rosterSlots={rosterSlots}
          selectedPreview={selectedPreview}
          setSelectedPreview={handleSelectPreview}
          getImagePath={props.getImagePath}
          testId={testId}
        />

        {/* Player Preview Card */}
        {selectedPreview && (
          <div
            data-testid={`${testId}-roster-preview-box`}
            className={cn(
              'border-2 rounded-xl p-3 flex items-center justify-between animate-in zoom-in-95 duration-150 shadow-md',
              isPreviewOwned
                ? 'bg-[#003D87] border-white text-white'
                : 'bg-white border-[#0059C1] text-[#003D87]',
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-12 h-12 rounded-lg border-2 overflow-hidden bg-white shadow-inner',
                  isPreviewOwned ? 'border-blue-400' : 'border-blue-100',
                )}
              >
                <img
                  src={props.getImagePath(selectedPreview, true)}
                  className="w-full h-full object-cover"
                  alt={selectedPreview}
                />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-black uppercase tracking-tight">{selectedPreview}</p>
                <p
                  className={cn(
                    'text-xs font-bold uppercase mt-0.5',
                    isPreviewOwned ? 'text-blue-300' : 'text-blue-500',
                  )}
                >
                  {CHAR_DATA[selectedPreview]?.position || 'Manager'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isPreviewOwned ? (
                <button
                  key="remove-btn"
                  data-testid={`${testId}-remove-btn-${selectedPreview}`}
                  onClick={() => handleConfirmAction(selectedPreview, 'remove')}
                  className="px-4 py-2 bg-[#FF2D55] hover:bg-[#E60039] text-white rounded-lg text-xs font-black transition-all shadow-sm active:scale-95 border-2 border-white/20"
                >
                  REMOVE
                </button>
              ) : (
                <button
                  key="add-btn"
                  data-testid={`${testId}-add-btn-${selectedPreview}`}
                  onClick={() => handleConfirmAction(selectedPreview, 'add')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0059C1] hover:bg-[#006AEE] text-white rounded-lg text-xs font-black transition-all shadow-sm active:scale-95 border-2 border-white/20"
                >
                  <Plus size={12} strokeWidth={3} />
                  ADD
                </button>
              )}
              <button
                onClick={() => setSelectedPreview(null)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isPreviewOwned
                    ? 'hover:bg-white/10 text-white/50'
                    : 'hover:bg-blue-50 text-slate-400',
                )}
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}

        {/* Undo Toast */}
        {showUndo && !selectedPreview && (
          <div
            data-testid={`${testId}-undo-toast`}
            className="animate-in fade-in slide-in-from-top-4 duration-300"
          >
            <div className="bg-[#1A1C1E] text-white rounded-xl shadow-xl px-4 py-3 flex items-center justify-between border-2 border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#0059C1] flex items-center justify-center shrink-0 border border-white/20">
                  <RotateCcw size={14} strokeWidth={3} className="text-white" />
                </div>
                <div className="flex flex-col min-w-0 leading-none">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">
                    Roster Updated
                  </span>
                  <span className="text-xs font-bold truncate">
                    {lastAction?.type === 'add' ? 'Added' : 'Removed'} {lastAction?.name}
                  </span>
                </div>
              </div>
              <button
                onClick={handleUndo}
                data-testid={`${testId}-undo-button`}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#1A1C1E] hover:bg-blue-50 rounded-lg text-xs font-black uppercase shadow-sm ml-4 transition-transform active:scale-95"
              >
                Undo
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

      <div className="flex-1 overflow-y-auto py-4 space-y-8 custom-scrollbar">
        {[
          { names: sortChars(props.groups.withCombo), label: 'Available Combo Partners' },
          { names: sortChars(props.groups.noCombo), label: 'Other Characters' },
        ].map(
          ({ names, label }) =>
            names.length > 0 && (
              <div
                key={label}
                className="space-y-3"
                data-testid={`${testId}-list-${label.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div className="px-4 flex items-center gap-3">
                  <div className="h-4 w-1 bg-[#FF9E00] rounded-full" />
                  <h3 className="text-xs font-black text-[#003D87] uppercase tracking-widest leading-none">
                    {label}
                  </h3>
                </div>
                <div className="grid gap-1.5 px-3">
                  {names.map((name) => (
                    <CharacterItem
                      key={name}
                      name={name}
                      isOwned={props.ownedChars.has(name)}
                      isSelected={props.ownedChars.has(name)}
                      onToggle={() => handleSelectPreview(name)}
                      getImagePath={props.getImagePath}
                      data={CHAR_DATA[name]}
                      testId={`${testId}-char-${name}`}
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
