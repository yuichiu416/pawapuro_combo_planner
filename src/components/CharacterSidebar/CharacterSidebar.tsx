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

  // Sync internal UI state with external prop changes
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
      className="w-full bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden relative"
      data-testid={testId}
    >
      <div className="shrink-0 bg-white border-b border-slate-200 shadow-sm p-3 space-y-2.5">
        <RosterGrid
          ownedChars={props.ownedChars}
          rosterSlots={rosterSlots}
          selectedPreview={selectedPreview}
          setSelectedPreview={handleSelectPreview}
          getImagePath={props.getImagePath}
          testId={testId}
        />

        {selectedPreview && (
          <div
            data-testid={`${testId}-roster-preview-box`}
            className={cn(
              'border rounded-lg p-2.5 flex items-center justify-between animate-in zoom-in-95 duration-150',
              isPreviewOwned ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200',
            )}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-10 h-10 rounded border overflow-hidden bg-white',
                  isPreviewOwned ? 'border-blue-300' : 'border-emerald-300',
                )}
              >
                <img
                  src={props.getImagePath(selectedPreview, true)}
                  className="w-full h-full object-cover"
                  alt={selectedPreview}
                />
              </div>
              <div>
                <p
                  className={cn(
                    'text-xs font-black leading-none',
                    isPreviewOwned ? 'text-blue-900' : 'text-emerald-900',
                  )}
                >
                  {selectedPreview}
                </p>
                <p
                  className={cn(
                    'text-xs font-bold uppercase mt-0.5',
                    isPreviewOwned ? 'text-blue-600' : 'text-emerald-600',
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
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-black transition-colors"
                >
                  <X size={12} strokeWidth={3} />
                  REMOVE
                </button>
              ) : (
                <button
                  key="add-btn"
                  data-testid={`${testId}-add-btn-${selectedPreview}`}
                  onClick={() => handleConfirmAction(selectedPreview, 'add')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-black transition-colors"
                >
                  <Plus size={12} strokeWidth={3} />
                  ADD
                </button>
              )}
              <button
                onClick={() => setSelectedPreview(null)}
                className="p-1.5 hover:bg-slate-200 rounded-md transition-colors text-slate-400"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {showUndo && !selectedPreview && (
          <div
            data-testid={`${testId}-undo-toast`}
            className="animate-in fade-in zoom-in-95 duration-300"
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-lg shadow-2xl px-3 py-2.5 flex items-center justify-between border border-slate-700/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <span className="text-blue-400 font-bold">!</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-white uppercase tracking-tighter leading-none">
                    Roster Updated
                  </span>
                  <span className="text-xs font-bold tracking-tight truncate">
                    {lastAction?.type === 'add' ? 'Added' : 'Removed'} {lastAction?.name}
                  </span>
                </div>
              </div>
              <button
                onClick={handleUndo}
                data-testid={`${testId}-undo-button`}
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
