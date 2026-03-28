// src/components/CharacterSidebar.tsx
import { Plus, RotateCcw, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

import characterMappingRaw from '@/data/character_mapping.json';
import charactersDataRaw from '@/data/characters.json';
import { cn } from '@/utils/style';
import { CharacterItem } from './CharacterItem';
import { FilterBar } from './FilterBar';
import { RosterGrid } from './RosterGrid';

const CHAR_MAPPING = (characterMappingRaw as any).by_name as Record<string, { id: number }>;
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
  const [sortByNumber, setSortByNumber] = useState(false);
  const [activeTab, setActiveTab] = useState<'with' | 'without'>('with');

  useEffect(() => {
    if (selectedPreview) {
      setShowUndo(false);
    }
  }, [selectedPreview]);

  const isPreviewOwned = selectedPreview ? props.ownedChars.has(selectedPreview) : false;

  const sortChars = (names: string[]) => {
    return [...names].sort((a, b) => {
      if (sortByNumber) {
        return (CHAR_MAPPING[a]?.id || 999) - (CHAR_MAPPING[b]?.id || 999);
      }
      const pA = POSITION_ORDER[CHAR_DATA[a]?.position?.trim()] || 0;
      const pB = POSITION_ORDER[CHAR_DATA[b]?.position?.trim()] || 0;
      if (pA !== pB) return pA - pB;
      return (CHAR_MAPPING[a]?.id || 999) - (CHAR_MAPPING[b]?.id || 999);
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

  const handleSelectPreview = (name: string) => {
    if (props.ownedChars.has(name)) {
      setSelectedPreview(name);
    } else {
      handleAdd(name);
    }
  };

  const handleAdd = (name: string) => {
    props.onToggle(name);
    setLastAction({ name, type: 'add' });
    setShowUndo(true);
    setSelectedPreview(null);
  };

  const handleRemove = (name: string) => {
    props.onToggle(name);
    setLastAction({ name, type: 'remove' });
    setShowUndo(true);
    setSelectedPreview(null);
  };

  const rosterSlots = useMemo(() => {
    const sorted = sortChars(Array.from(props.ownedChars));
    return Array(28)
      .fill(null)
      .map((_, i) => sorted[i] || null);
  }, [props.ownedChars, sortByNumber]);

  const handleUndo = () => {
    if (lastAction) {
      props.onToggle(lastAction.name);
      setSelectedPreview(lastAction.name);
      setShowUndo(false);
      setLastAction(null);
    }
  };

  const { names, label } =
    activeTab === 'with'
      ? { names: sortChars(props.groups.withCombo), label: 'WITH combos' }
      : { names: sortChars(props.groups.noCombo), label: 'WITHOUT combos' };

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
          setSelectedPreview={setSelectedPreview}
          getImagePath={props.getImagePath}
          testId={testId}
        />

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
                  onClick={() => handleRemove(selectedPreview)}
                  className="px-4 py-2 bg-[#FF2D55] hover:bg-[#E60039] text-white rounded-lg text-xs font-black transition-all shadow-sm active:scale-95 border-2 border-white/20"
                >
                  REMOVE
                </button>
              ) : (
                <button
                  key="add-btn"
                  data-testid={`${testId}-add-btn-${selectedPreview}`}
                  onClick={() => handleAdd(selectedPreview)}
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
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <button
                  onClick={handleUndo}
                  data-testid={`${testId}-undo-button`}
                  className="px-4 py-2 bg-white text-[#1A1C1E] hover:bg-blue-50 rounded-lg text-xs font-black uppercase shadow-sm transition-transform active:scale-95"
                >
                  Undo
                </button>
                <button
                  data-testid={`${testId}-undo-close`}
                  onClick={() => setShowUndo(false)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/50 transition-colors"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>
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

      <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
        <div className="px-3 flex gap-2">
          <button
            data-testid={`${testId}-tab-with-combos`}
            onClick={() => setActiveTab('with')}
            className={cn(
              'flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg border transition-colors',
              activeTab === 'with'
                ? 'bg-[#0059C1] text-white border-[#00479B]'
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300',
            )}
          >
            With combos
          </button>
          <button
            data-testid={`${testId}-tab-without-combos`}
            onClick={() => setActiveTab('without')}
            className={cn(
              'flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg border transition-colors',
              activeTab === 'without'
                ? 'bg-[#0059C1] text-white border-[#00479B]'
                : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300',
            )}
          >
            Without combos
          </button>
        </div>

        <div className="space-y-3">
          <div className="px-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-4 w-1 bg-[#FF9E00] rounded-full" />
              <h3 className="text-xs font-black text-[#003D87] tracking-widest leading-none">
                {names.length} characters
              </h3>
            </div>
            <button
              data-testid={`${testId}-sort-toggle`}
              onClick={() => setSortByNumber((p) => !p)}
              className={cn(
                'text-xs font-black uppercase tracking-wider px-2 py-1 rounded-lg border transition-colors',
                sortByNumber
                  ? 'bg-[#0059C1] text-white border-[#00479B]'
                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300',
              )}
            >
              {sortByNumber ? 'No. ↑' : 'Pos. ↑'}
            </button>
          </div>
          <div className="grid gap-1.5 px-3">
            {names.map((name) => (
              <CharacterItem
                key={name}
                name={name}
                isOwned={props.ownedChars.has(name)}
                isSelected={selectedPreview === name}
                onToggle={() => handleSelectPreview(name)}
                onRemove={(targetName) => handleRemove(targetName)}
                getImagePath={props.getImagePath}
                data={{ ...CHAR_DATA[name], id: CHAR_MAPPING[name]?.id }}
                testId={`${testId}-char-${name}`}
                hasCombo={activeTab === 'with'}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};
