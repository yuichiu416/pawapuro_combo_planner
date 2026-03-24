// src/components/CharacterSidebar.tsx

import {
  ChevronDown,
  ChevronRight,
  Compass,
  Info,
  MapPin,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { POSITIONS } from '@/constants';
import charactersDataRaw from '@/data/characters.json';
import { cn } from '../utils/style';

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
  testId = 'character-sidebar',
}) => {
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [lastRemoved, setLastRemoved] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  const AVAILABLE_MAPS = useMemo(() => {
    return Array.from(
      new Set(
        Object.values(CHAR_DATA)
          .map((char: any) => char.encounter_map)
          .filter((map): map is string => Boolean(map)),
      ),
    );
  }, []);

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
      <div
        className="space-y-1.5"
        data-testid={`${testId}-list-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <h3 className="text-xs font-black text-black uppercase tracking-widest px-4 leading-none">
          {title}
        </h3>
        <div className="grid gap-1 px-3">
          {names.map((name) => {
            const isOwned = ownedChars.has(name);
            const data = CHAR_DATA[name];
            return (
              <button
                data-testid={`${testId}-char-${name}`}
                key={name}
                onClick={() => onToggle(name)}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group text-left w-full border',
                  isOwned
                    ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100/50'
                    : 'bg-white border-transparent hover:border-slate-200 shadow-sm',
                )}
              >
                <div
                  className={cn(
                    'w-11 h-11 flex-shrink-0 relative rounded-lg overflow-hidden border',
                    isOwned
                      ? 'border-blue-500 bg-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 opacity-70 group-hover:opacity-100',
                  )}
                >
                  <img
                    src={getImagePath(name, true)}
                    alt={name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        'text-sm font-black tracking-tighter leading-tight',
                        isOwned ? 'text-blue-950' : 'text-black',
                      )}
                    >
                      {name}
                    </p>
                    <span
                      className={cn(
                        'text-xs font-black px-1 rounded uppercase',
                        isOwned ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600',
                      )}
                    >
                      {data?.position || 'MGR'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-black uppercase leading-none mt-1 flex items-center gap-1">
                    <Compass size={10} /> {data?.encounter_map || 'Unknown Map'}
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
      aria-label={testId}
      data-testid={testId}
    >
      <div className="shrink-0 bg-white border-b border-slate-200 shadow-sm">
        <div className="p-3 space-y-2.5">
          <div
            className="space-y-1.5 bg-slate-900 p-3 rounded-xl shadow-inner border border-slate-800"
            data-testid="active-roster"
          >
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-black text-white uppercase tracking-widest">
                Active Roster
              </span>
              <span
                data-testid={`${testId}-roster-count`}
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
                  data-testid={`${testId}-roster-${charName || `slot-empty-${i}`}`}
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

          {selectedPreview && !showUndo && (
            <div
              data-testid={`${testId}-roster-preview-box`}
              className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center justify-between animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded border border-blue-300 bg-white overflow-hidden">
                  <img
                    src={getImagePath(selectedPreview, true)}
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
                <X size={12} strokeWidth={3} />
                REMOVE
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
                    <span className="text-blue-400">
                      <Info size={16} />
                    </span>
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
                  onClick={handleUndo}
                  aria-label="Undo"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-blue-50 rounded-md text-xs font-black uppercase transition-all active:scale-95 shadow-sm shrink-0 ml-2"
                >
                  <RotateCcw size={12} strokeWidth={3} />
                  Undo
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              data-testid={`${testId}-kanji-filter-toggle`}
              onClick={toggleKanjiFilter}
              className={cn(
                'w-7 h-7 rounded-lg text-sm font-black border flex items-center justify-center transition-all',
                filterNoKanji
                  ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                  : 'bg-white text-black border-slate-200 hover:border-slate-300',
              )}
            >
              ア
            </button>
            <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />
            <button
              data-testid={`${testId}-pos-filter-all`}
              onClick={() => setPosFilter(null)}
              className={cn(
                'px-2 h-7 rounded-lg text-xs font-black border uppercase transition-all',
                !posFilter
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white text-black border-slate-200',
              )}
            >
              ALL
            </button>
            {POSITIONS.map((pos) => (
              <button
                data-testid={`${testId}-pos-filter-${pos}`}
                key={pos}
                onClick={() => setPosFilter(pos === posFilter ? null : pos)}
                className={cn(
                  'w-7 h-7 rounded-lg text-xs font-black border flex items-center justify-center transition-all',
                  posFilter === pos
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-105'
                    : 'bg-white text-black border-slate-200 hover:border-slate-300',
                )}
              >
                {pos}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 pt-0.5">
            <button
              data-testid={`${testId}-map-filter-trigger`}
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className={cn(
                'flex items-center gap-1 px-2 h-8 rounded-lg text-xs font-black border uppercase transition-all shrink-0',
                !mapFilter
                  ? 'bg-slate-800 border-slate-800 text-white'
                  : 'bg-white text-black border-slate-200',
              )}
            >
              <MapPin size={10} className={mapFilter ? 'text-blue-400' : ''} />
              {mapFilter || 'ANY MAP'}
            </button>

            <div className="relative flex-1 group">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-black group-focus-within:text-blue-500"
                size={12}
              />
              <input
                data-testid={`${testId}-character-search-input`}
                type="text"
                placeholder="SEARCH A NAME OR SKILL"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 h-8 bg-slate-50 border border-slate-200 rounded-lg font-black text-xs uppercase outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {isMapExpanded && (
            <div
              data-testid={`${testId}-map-filter-popover`}
              className="flex flex-wrap gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-top-1"
            >
              <button
                data-testid={`${testId}-map-filter-option-any`}
                onClick={() => {
                  setMapFilter(null);
                  setIsMapExpanded(false);
                }}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-black border uppercase transition-all',
                  !mapFilter ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white text-black',
                )}
              >
                ANY MAP
              </button>
              {AVAILABLE_MAPS.map((map) => (
                <button
                  data-testid={`${testId}-map-filter-option-${map}`}
                  key={map}
                  onClick={() => {
                    setMapFilter(map);
                    setIsMapExpanded(false);
                  }}
                  className={cn(
                    'px-2 py-1 rounded-md text-xs font-black border uppercase transition-all',
                    mapFilter === map
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white text-black',
                  )}
                >
                  {map}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-6 custom-scrollbar">
        {renderList(sortedWithCombo, 'Available Combo Partners')}
        {renderList(sortedNoCombo, 'Other Characters')}
      </div>
    </aside>
  );
};
