// src/components/CharacterSidebar.tsx
import React from 'react';
import { Users, Search } from 'lucide-react';
import { cn } from '@/utils/style';
import { POSITIONS } from '@/constants';

interface Props {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  posFilter: string | null;
  setPosFilter: (pos: string | null) => void;
  groups: { withCombo: string[]; noCombo: string[] };
  ownedChars: Set<string>;
  onToggle: (name: string) => void;
  getImagePath: (name: string, usePos: boolean) => string;
}

export const CharacterSidebar: React.FC<Props> = ({
  searchTerm, setSearchTerm, posFilter, setPosFilter, groups, ownedChars, onToggle, getImagePath
}) => {
  const renderList = (names: string[], title: string, subColor: string) => (
    <div className="space-y-4">
      <h4 className={cn("text-xs font-black uppercase tracking-widest px-2", subColor)}>
        {title} ({names.length})
      </h4>
      {names.map(name => {
        const isOwned = ownedChars.has(name);
        return (
          <button 
            key={name} onClick={() => onToggle(name)}
            className={cn(
              "w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all cursor-pointer", 
              isOwned ? "bg-emerald-50 border-emerald-200" : "bg-white border-transparent hover:bg-slate-50"
            )}
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
              <img 
                src={getImagePath(name, false)} 
                className={cn("w-full h-full object-cover", !isOwned && "grayscale opacity-40")} 
                alt={name}
              />
            </div>
            <div className="text-left">
              <p data-testid={`character-selector-character-name-${name}`} className={cn("text-lg font-black", isOwned ? "text-emerald-700" : "text-slate-700")}>{name}</p>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <aside
      data-testid="character-sidebar"
      className="w-[420px] bg-white border-r border-slate-200 flex flex-col shadow-xl z-20"
    >
      <div className="p-8 border-b border-slate-100 space-y-6">
        <div className="flex items-center gap-3 text-blue-600 font-black text-2xl italic uppercase">
          <Users /> Characters
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Search..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl font-bold focus:outline-none"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map(pos => (
           <button 
            key={pos} 
            onClick={() => setPosFilter(posFilter === pos ? null : pos)}
            aria-label={pos}
            data-testid={`filter-button-${pos}`}
            className={cn(
              "px-3 py-2 rounded-xl text-[10px] font-black border-2 transition-colors cursor-pointer", 
              posFilter === pos 
                ? "bg-slate-900 border-slate-900 text-white" 
                : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
            )}
          >
            {pos}
          </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {groups.withCombo.length > 0 && renderList(groups.withCombo, "Combos Available Characters", "text-blue-500")}
        {groups.noCombo.length > 0 && renderList(groups.noCombo, "No Combos", "text-slate-400")}
      </div>
    </aside>
  );
};