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
{names.map(name => {
  const isOwned = ownedChars.has(name);
  
  return (
    <button
      key={name}
      data-testid={`character-selector-character-name-${name}`}
      onClick={() => onToggle(name)}
      className={cn(
        "flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 group text-left w-full cursor-pointer",
        isOwned 
          ? [
              "bg-emerald-100/70 shadow-sm border border-emerald-200/50", 
              "hover:bg-emerald-200 hover:border-emerald-400 hover:shadow-md"
            ]
          : [
              // INCREASED UNSELECTED HOVER CONTRAST
              "bg-transparent border border-transparent", 
              "hover:bg-slate-100 hover:border-slate-300 hover:shadow-sm" // Changed from bg-white to bg-slate-100
            ]
      )}
    >
      <div 
        data-testid={`sidebar-icon-wrapper-${name}`}
        className={cn(
          "w-12 h-12 flex-shrink-0 relative rounded-xl overflow-hidden transition-all duration-200 border-2",
          isOwned 
            ? "border-emerald-600 bg-white group-hover:border-emerald-500" 
            : [
                "border-transparent bg-slate-200 opacity-30",
                "group-hover:opacity-100 group-hover:border-blue-500 group-hover:scale-105" // Added a tiny scale for extra pop
              ]
        )}
      >
        <img 
          src={getImagePath(name, true)} 
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <p className={cn(
        "text-lg font-black transition-colors duration-200",
        isOwned 
          ? "text-emerald-950 group-hover:text-emerald-800" 
          : "text-slate-600 group-hover:text-blue-600" // Name turns blue on hover to match the icon border
      )}>
        {name}
      </p>
    </button>
  );
})}
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