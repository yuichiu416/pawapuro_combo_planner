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
).sort();

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
}

export const CharacterSidebar: React.FC<CharacterSidebarProps> = ({
  searchTerm,
  setSearchTerm,
  posFilter,
  setPosFilter,
  mapFilter,
  setMapFilter,
  groups,
  ownedChars,
  onToggle,
  getImagePath,
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
  const rosterSlots = Array(30).fill(null).map((_, i) => sortedRoster[i] || null);

  const renderList = (names: string[], title: string) => {
    if (names.length === 0) return null;
    return (
      <div className="space-y-3">
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-4 italic">{title}</h3>
        <div className="grid gap-1.5 px-3">
          {names.map((name) => {
            const isOwned = ownedChars.has(name);
            const data = CHAR_DATA[name];
            return (
              <button
                key={name}
                onClick={() => onToggle(name)}
                className={cn(
                  "flex items-center gap-4 p-2.5 rounded-2xl transition-all duration-200 group text-left w-full border-2",
                  isOwned 
                    ? "bg-emerald-50 border-emerald-400 shadow-[0_4px_0_0_rgba(52,211,153,0.2)]" 
                    : "bg-white border-transparent hover:border-slate-200 shadow-sm"
                )}
              >
                {/* LARGER AVATAR FOR LIST */}
                <div className={cn(
                  "w-12 h-12 flex-shrink-0 relative rounded-xl overflow-hidden border-2",
                  isOwned ? "border-emerald-600 bg-white" : "border-slate-200 bg-slate-50 opacity-60 group-hover:opacity-100"
                )}>
                  <img src={getImagePath(name, true)} alt={name} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className={cn("text-sm font-black italic tracking-tighter truncate", isOwned ? "text-emerald-950" : "text-slate-700")}>
                    {name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{data?.position || 'Manager'}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <aside className="w-100 bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="shrink-0 bg-white border-b border-slate-200 shadow-sm">
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="SEARCH A CHARACTER OR SKILL"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none font-black text-[11px] italic"
            />
          </div>

          {/* COMPACTED ROSTER GRID (6 Cols) */}
          <div className="space-y-1.5 bg-slate-900 p-2.5 rounded-2xl shadow-xl">
            <div className="flex justify-between items-center px-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Roster</span>
              <span className={cn("text-[10px] font-black italic", ownedChars.size > 28 ? "text-rose-400" : "text-emerald-400")}>
                {ownedChars.size} / 28
              </span>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {rosterSlots.map((charName, i) => (
                <button 
                  key={charName ? `slot-${charName}` : `empty-${i}`} 
                  disabled={!charName}
                  onClick={() => charName && onToggle(charName)}
                  className={cn(
                    "aspect-square rounded-md border flex items-center justify-center overflow-hidden transition-all relative group/slot",
                    charName ? "border-slate-700 bg-slate-800 hover:border-rose-500" : "border-slate-800 bg-slate-900/50"
                  )}
                >
                  {charName ? (
                    <>
                      <img src={getImagePath(charName, true)} alt={charName} className="w-full h-full object-cover z-10 group-hover/slot:opacity-20" />
                      <div className="absolute inset-0 z-20 opacity-0 group-hover/slot:opacity-100 flex items-center justify-center">
                         <X size={12} className="text-rose-500 stroke-[4px]" />
                      </div>
                    </>
                  ) : <div className="w-1 h-1 bg-slate-800 rounded-full" />}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1">
            <button onClick={() => setPosFilter(null)} className={cn("px-2 py-1 rounded-lg text-[9px] font-black border uppercase transition-all", !posFilter ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105" : "bg-white text-slate-400")}>ALL</button>
            {POSITIONS.map((pos) => (
              <button key={pos} onClick={() => setPosFilter(pos === posFilter ? null : pos)} className={cn("w-7 h-7 rounded-lg text-[10px] font-black border flex items-center justify-center transition-all", posFilter === pos ? "bg-blue-600 border-blue-600 text-white shadow-md scale-105" : "bg-white text-slate-400 hover:border-slate-300")}>{pos}</button>
            ))}
          </div>

          {/* Map Filter */}
          <div className="border-t border-slate-100 pt-2">
            <button 
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="flex items-center justify-between w-full text-[10px] font-black text-slate-600 hover:text-slate-800 transition-colors uppercase"
            >
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className={mapFilter ? "text-blue-600" : ""} />
                Location: {mapFilter || "ANY MAP"}
              </div>
              {isMapExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            
            {isMapExpanded && (
              <div className="flex flex-wrap gap-1 mt-2 max-h-32 overflow-y-auto pr-1 py-1 custom-scrollbar">
                <button onClick={() => setMapFilter(null)} className={cn("px-2 py-1 rounded-lg text-[9px] font-black border uppercase", !mapFilter ? "bg-slate-800 border-slate-800 text-white shadow-sm" : "bg-white text-slate-400")}>ANY MAP</button>
                {AVAILABLE_MAPS.map((map) => (
                  <button key={map} onClick={() => setMapFilter(map === mapFilter ? null : map)} className={cn("px-2 py-1 rounded-lg text-[9px] font-black border transition-all truncate max-w-[100px]", mapFilter === map ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white text-slate-400 hover:border-slate-300")}>{map}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-10 custom-scrollbar">
        {renderList(sortedWithCombo, "Available Combo Partners")}
        {renderList(sortedNoCombo, "Other Characters")}
      </div>
    </aside>
  );
};