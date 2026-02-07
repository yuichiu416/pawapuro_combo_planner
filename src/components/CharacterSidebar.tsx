// src/components/CharacterSidebar.tsx
import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '../utils/style';
import { POSITIONS } from '@/constants';

interface CharacterSidebarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  posFilter: string | null;
  setPosFilter: (val: string | null) => void;
  groups: {
    withCombo: string[];
    noCombo: string[];
  };
  ownedChars: Set<string>;
  onToggle: (name: string) => void;
  getImagePath: (name: string, usePos: boolean) => string;
}

export const CharacterSidebar: React.FC<CharacterSidebarProps> = ({
  searchTerm, setSearchTerm, posFilter, setPosFilter,
  groups, ownedChars, onToggle, getImagePath
}) => {

  const renderList = (names: string[], title: string) => (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{title}</h3>
      <div className="grid gap-2">
        {names.map(name => (
          <button
            key={name}
            data-testid={`character-selector-character-name-${name}`}
            onClick={() => onToggle(name)}
            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white transition-all group text-left w-full"
          >
            <div className="relative">
              <img 
                src={getImagePath(name, true)} 
                alt={name}
                className={cn(
                  "w-12 h-12 rounded-xl border-2 transition-all object-cover",
                  ownedChars.has(name) ? "border-emerald-500 scale-105" : "border-slate-200 opacity-40"
                )}
              />
            </div>
            <p className={cn(
              "text-lg font-black",
              ownedChars.has(name) ? "text-emerald-900" : "text-slate-700"
            )}>
              {name}
            </p>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <aside data-testid="character-sidebar" className="w-96 bg-slate-50 border-r border-slate-200 flex flex-col h-full">
      <div className="p-8 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="SEARCH CHARACTER..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-black text-sm transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setPosFilter(null)}
            className={cn(
              "px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2",
              !posFilter ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
            )}
          >
            ALL
          </button>
          {POSITIONS.map(pos => (
            <button
              key={pos}
              data-testid={`filter-button-${pos}`}
              onClick={() => setPosFilter(pos === posFilter ? null : pos)}
              className={cn(
                "w-10 h-10 rounded-xl text-[10px] font-black transition-all border-2 flex items-center justify-center",
                posFilter === pos ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
              )}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-10 custom-scrollbar">
        {renderList(groups.withCombo, "Combo Characters")}
        {renderList(groups.noCombo, "Other Characters")}
      </div>
    </aside>
  );
};