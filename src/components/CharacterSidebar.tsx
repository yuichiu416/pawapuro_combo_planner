// src/components/CharacterSidebar.tsx

import { ChevronDown, ChevronRight, Info, MapPin, RotateCcw, Search, X } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { POSITIONS } from '@/constants';
import charactersDataRaw from '@/data/characters.json';
import { cn } from '../utils/style';

// Order mapping for sorting characters by position
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

// Extract unique map names from character data
const AVAILABLE_MAPS = Array.from(
  new Set(
    Object.values(charactersDataRaw)
      .map((char: any) => char.encounter_map)
      .filter((map): map is string => Boolean(map)),
  ),
);

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
  ariaLabel?: string;
}

export const CharacterSidebar: React.FC<CharacterSidebarProps> = ({
  searchTerm,
  setSearchTerm,
  posFilter,
  setPosFilter,
  mapFilter,
  setMapFilter,
  filterNoKanji,
  toggleKanjiFilter,
  groups,
  ownedChars,
  onToggle,
  getImagePath,
  ariaLabel,
}) => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [lastRemoved, setLastRemoved] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  // Helper to sort character names based on position and ID
  const sortChars = (names: string[]) => {
    return [...names].sort((a, b) => {
      const dataA = CHAR_DATA[a];
      const dataB = CHAR_DATA[b];
      const pA = POSITION_ORDER[dataA?.position?.trim()] || 0;
      const pB = POSITION_ORDER[dataB?.position?.trim()] || 0;
      if (pA !== pB) return pA - pB;
      return (dataA?.id || 99) - (dataB?.id || 99);
    });
  };

  const sortedRoster = useMemo(() => sortChars(Array.from(ownedChars)), [ownedChars]);
  const sortedWithCombo = useMemo(() => sortChars(groups.withCombo), [groups.withCombo]);
  const sortedNoCombo = useMemo(() => sortChars(groups.noCombo), [groups.noCombo]);

  const rosterSlots = Array(28)
    .fill(null)
    .map((_, i) => sortedRoster[i] || null);

  const handleConfirmRemove = (name: string) => {
    onToggle(name);
    setLastRemoved(name);
    setShowUndo(true);
    setSelectedPreview(null);
  };

  const handleUndo = () => {
    if (lastRemoved) {
      onToggle(lastRemoved);
      setLastRemoved(null);
      setShowUndo(false);
    }
  };

  useEffect(() => {
    if (showUndo) {
      const timer = setTimeout(() => setShowUndo(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showUndo]);

  const renderList = (names: string[], title: string) => {
    if (names.length === 0) return null;
    return (
      <div className="space-y-1.5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 italic leading-none">
          {title}
        </h3>
        <div className="grid gap-1 px-3">
          {names.map((name) => {
            const isOwned = ownedChars.has(name);
            const data = CHAR_DATA[name];
            return (
              <button
                data-testid={`sidebar-char-${name}`}
                key={name}
                onClick={() => onToggle(name)}
                className={cn(
                  'flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200 group text-left w-full border',
                  isOwned
                    ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                    : 'bg-white border-transparent hover:border-slate-200 shadow-sm',
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 flex-shrink-0 relative rounded overflow-hidden border',
                    isOwned
                      ? 'border-emerald-600 bg-white'
                      : 'border-slate-200 bg-slate-50 opacity-70 group-hover:opacity-100',
                  )}
                >
                  <img
                    src={getImagePath(name, true)}
                    alt={name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'text-sm font-black tracking-tighter leading-tight',
                      isOwned ? 'text-emerald-950' : 'text-slate-700',
                    )}
                  >
                    {name}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase leading-none">
                    {data?.position || 'Manager'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside
      className="w-full bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden relative"
      role="complementary"
      aria-label={ariaLabel}
    >
      <div className="shrink-0 bg-white border-b border-slate-200 shadow-sm">
        <div className="p-3 space-y-2.5">
          {/* ACTIVE ROSTER SECTION */}
          <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl shadow-inner border border-slate-800">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Active Roster
              </span>
              <span
                className={cn(
                  'text-sm font-black italic',
                  ownedChars.size > 25 ? 'text-rose-400' : 'text-emerald-400',
                )}
              >
                {ownedChars.size} / 28
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {rosterSlots.map((charName, i) => (
                <button
                  key={charName ? `slot-${charName}` : `empty-${i}`}
                  disabled={!charName}
                  onClick={() =>
                    charName && setSelectedPreview(charName === selectedPreview ? null : charName)
                  }
                  className={cn(
                    'aspect-square rounded-md border flex items-center justify-center overflow-hidden transition-all relative group/slot',
                    charName
                      ? cn(
                          'bg-slate-800',
                          selectedPreview === charName
                            ? 'border-blue-400 ring-2 ring-blue-400/50 scale-105 z-20'
                            : 'border-slate-600 hover:border-slate-400',
                        )
                      : 'border-slate-800/50 bg-slate-900/40',
                  )}
                >
                  {charName ? (
                    <img
                      src={getImagePath(charName, true)}
                      alt={charName}
                      className="w-full h-full object-cover z-10"
                    />
                  ) : (
                    <div className="w-1 h-1 bg-slate-800 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* PREVIEW PANEL */}
          {selectedPreview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center justify-between animate-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded border border-blue-300 bg-white overflow-hidden">
                  <img
                    src={getImagePath(selectedPreview, true)}
                    className="w-full h-full object-cover"
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
                onClick={() => handleConfirmRemove(selectedPreview)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-black transition-colors"
              >
                <X size={12} strokeWidth={3} />
                REMOVE
              </button>
            </div>
          )}

          {/* Filters Area */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              aria-label="No Kanji"
              onClick={toggleKanjiFilter}
              className={cn(
                'w-7 h-7 rounded-lg text-sm font-black border flex items-center justify-center transition-all',
                filterNoKanji
                  ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300',
              )}
            >
              ア
            </button>
            <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />
            <button
              onClick={() => setPosFilter(null)}
              className={cn(
                'px-2 h-7 rounded-lg text-sm font-black border uppercase transition-all',
                !posFilter
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-400 border-slate-200',
              )}
            >
              ALL
            </button>
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => setPosFilter(pos === posFilter ? null : pos)}
                className={cn(
                  'w-7 h-7 rounded-lg text-sm font-black border flex items-center justify-center transition-all',
                  posFilter === pos
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-105'
                    : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300',
                )}
              >
                {pos}
              </button>
            ))}
          </div>

          {/* Map & Search Row */}
          <div className="flex gap-1.5 pt-0.5">
            <button
              data-testid="map-filter-button"
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className={cn(
                'flex items-center gap-1 px-2 h-8 rounded-lg text-xs font-black border uppercase transition-all shrink-0',
                !mapFilter
                  ? 'bg-slate-800 border-slate-800 text-white'
                  : 'bg-white text-slate-500 border-slate-200',
              )}
            >
              <MapPin size={10} className={mapFilter ? 'text-blue-400' : ''} />
              {mapFilter || 'ANY MAP'}
            </button>

            <div className="relative flex-1 group">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"
                size={12}
              />
              <input
                data-testid="character-search-input"
                type="text"
                placeholder="SEARCH A NAME OR SKILL"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 h-8 bg-slate-50 border border-slate-200 rounded-lg font-black text-xs uppercase outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Map Popover */}
          {isMapExpanded && (
            <div className="flex flex-wrap gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-1">
              <button
                data-testid={`map-filter-button-any`}
                onClick={() => {
                  setMapFilter(null);
                  setIsMapExpanded(false);
                }}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-black border uppercase transition-all',
                  !mapFilter
                    ? 'bg-slate-800 border-slate-800 text-white'
                    : 'bg-white text-slate-400',
                )}
              >
                ANY MAP
              </button>
              {AVAILABLE_MAPS.map((map) => (
                <button
                  data-testid={`map-filter-button-${map}`}
                  key={map}
                  onClick={() => {
                    setMapFilter(map);
                    setIsMapExpanded(false);
                  }}
                  className={cn(
                    'px-2 py-1 rounded-md text-xs font-black border uppercase transition-all',
                    mapFilter === map
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white text-slate-400',
                  )}
                >
                  {map}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto py-3 space-y-6 custom-scrollbar">
        {renderList(sortedWithCombo, 'Available Combo Partners')}
        {renderList(sortedNoCombo, 'Other Characters')}
      </div>

      {/* Undo Notification Toast - Improved Visuals */}
      {showUndo && (
        <div
          data-testid="undo-toast"
          className="absolute bottom-6 left-4 right-4 z-[50] animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl px-4 py-3.5 flex items-center justify-between border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Info size={18} className="text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-400 uppercase tracking-tighter leading-none">
                  Roster Updated
                </span>
                <span className="text-sm font-bold tracking-tight">Removed {lastRemoved}</span>
              </div>
            </div>

            <button
              onClick={handleUndo}
              aria-label="Undo"
              className="flex items-center gap-2 px-4 py-2 bg-white text-slate-950 hover:bg-blue-50 rounded-xl text-xs font-black uppercase transition-all active:scale-95 shadow-sm"
            >
              <RotateCcw size={14} strokeWidth={3} />
              Undo
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
