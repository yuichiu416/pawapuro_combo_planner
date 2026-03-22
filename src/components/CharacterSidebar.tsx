// src/components/CharacterSidebar.tsx
import React, { useMemo, useState } from 'react';
import { Search, ChevronDown, ChevronRight, MapPin, X } from 'lucide-react';
import { cn } from '../utils/style';
import { POSITIONS } from '@/constants';
import charactersDataRaw from '@/data/characters.json';

const POSITION_ORDER: Record<string, number> = {
  '投': 1, '捕': 2, '一': 3, '二': 4, '三': 5, '遊': 6, 
  '外': 7, '左': 8, '中': 9, '右': 10, 'マ': 11,
};

const CHAR_DATA = charactersDataRaw as Record<string, any>;

const AVAILABLE_MAPS = Array.from(
  new Set(
    Object.values(charactersDataRaw)
      .map((char: any) => char.encounter_map)
      .filter((map): map is string => Boolean(map))
  )
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
  const rosterSlots = Array(28).fill(null).map((_, i) => sortedRoster[i] || null);

  const renderList = (names: string[], title: string) => {
    if (names.length === 0) return null;
    return (
      <div className="space-y-1.5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 italic leading-none">{title}</h3>
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
                  "flex items-center gap-2 p-1.5 rounded-lg transition-all duration-200 group text-left w-full border",
                  isOwned 
                    ? "bg-emerald-50 border-emerald-300 shadow-sm" 
                    : "bg-white border-transparent hover:border-slate-200 shadow-sm"
                )}
              >
                <div className={cn(
                  "w-10 h-10 flex-shrink-0 relative rounded overflow-hidden border",
                  isOwned ? "border-emerald-600 bg-white" : "border-slate-200 bg-slate-50 opacity-70 group-hover:opacity-100"
                )}>
                  <img src={getImagePath(name, true)} alt={name} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className={cn("text-sm font-black tracking-tighter leading-tight", isOwned ? "text-emerald-950" : "text-slate-700")}>
                    {name}
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase leading-none">{data?.position || 'Manager'}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-full bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden" role="complementary" aria-label={ariaLabel}>
      <div className="shrink-0 bg-white border-b border-slate-200 shadow-sm">
        <div className="p-3 space-y-2.5">
          
          {/* ENLARGED OWNED CHARACTERS (ACTIVE ROSTER) */}
          <div className="space-y-1.5 bg-slate-900 p-3 rounded-xl shadow-inner border border-slate-800">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Roster</span>
              <span className={cn("text-sm font-black italic", ownedChars.size > 25 ? "text-rose-400" : "text-emerald-400")}>
                {ownedChars.size} / 28
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {rosterSlots.map((charName, i) => (
                <button 
                  key={charName ? `slot-${charName}` : `empty-${i}`} 
                  disabled={!charName}
                  onClick={() => charName && onToggle(charName)}
                  className={cn(
                    "aspect-square rounded-md border flex items-center justify-center overflow-hidden transition-all relative group/slot",
                    charName 
                      ? "border-slate-600 bg-slate-800 hover:border-rose-500 hover:scale-105" 
                      : "border-slate-800/50 bg-slate-900/40"
                  )}
                >
                  {charName ? (
                    <>
                      <img src={getImagePath(charName, true)} alt={charName} className="w-full h-full object-cover z-10 group-hover/slot:opacity-30" />
                      <div className="absolute inset-0 z-20 opacity-0 group-hover/slot:opacity-100 flex items-center justify-center">
                         <X size={14} className="text-rose-500 stroke-[3px]" />
                      </div>
                    </>
                  ) : <div className="w-1 h-1 bg-slate-800 rounded-full" />}
                </button>
              ))}
            </div>
          </div>

          {/* Position Filters Area */}
          <div className="flex flex-wrap items-center gap-1">
            <button 
              onClick={toggleKanjiFilter}
              className={cn(
                "w-7 h-7 rounded-lg text-sm font-black border flex items-center justify-center transition-all",
                filterNoKanji 
                  ? "bg-purple-600 border-purple-600 text-white shadow-sm" 
                  : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
              )}
            >ア</button>
            <div className="w-[1px] h-5 bg-slate-200 mx-0.5" />
            <button 
              onClick={() => setPosFilter(null)} 
              className={cn(
                "px-2 h-7 rounded-lg text-sm font-black border uppercase transition-all", 
                !posFilter ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white text-slate-400 border-slate-200"
              )}
            >ALL</button>
            {POSITIONS.map((pos) => (
              <button 
                key={pos} 
                onClick={() => setPosFilter(pos === posFilter ? null : pos)} 
                className={cn(
                  "w-7 h-7 rounded-lg text-sm font-black border flex items-center justify-center transition-all", 
                  posFilter === pos ? "bg-blue-600 border-blue-600 text-white shadow-sm scale-105" : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                )}
              >{pos}</button>
            ))}
          </div>

          {/* Map & Search Row */}
          <div className="flex gap-1.5 pt-0.5">
            <button
              data-testid="map-filter-button"
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className={cn(
                "flex items-center gap-1 px-2 h-8 rounded-lg text-xs font-black border uppercase transition-all shrink-0",
                !mapFilter ? "bg-slate-800 border-slate-800 text-white" : "bg-white text-slate-500 border-slate-200"
              )}
            >
              <MapPin size={10} className={mapFilter ? "text-blue-400" : ""} />
              {mapFilter || "ANY MAP"}
            </button>

            <div className="relative flex-1 group">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" size={12} />
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
                data-testid="map-filter-button-any" 
                onClick={() => {setMapFilter(null); setIsMapExpanded(false);}} 
                className={cn(
                    "px-2 py-1 rounded-md text-xs font-black border uppercase transition-all",
                    !mapFilter ? "bg-slate-800 border-slate-800 text-white" : "bg-white text-slate-400"
                )}
              >
                ANY MAP
              </button>
              {AVAILABLE_MAPS.map((map) => (
                <button 
                    data-testid={`map-filter-button-${map}`} 
                    key={map} 
                    onClick={() => {setMapFilter(map); setIsMapExpanded(false);}} 
                    className={cn(
                        "px-2 py-1 rounded-md text-xs font-black border uppercase transition-all",
                        mapFilter === map ? "bg-blue-600 border-blue-600 text-white" : "bg-white text-slate-400"
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
        {renderList(sortedWithCombo, "Available Combo Partners")}
        {renderList(sortedNoCombo, "Other Characters")}
      </div>
    </aside>
  );
};