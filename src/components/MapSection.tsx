// src/components/MapSection.tsx
import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { ComboCard } from '@/components/ComboCard';
import { cn } from '@/utils/style';

interface MapSectionProps {
  mapName: string;
  combos: string[][];
  selectedComboIds: Set<string>;
  toggleCombo: (id: string) => void;
  ownedChars: Set<string>;
  toggleCharacter: (name: string) => void;
  getImagePath: (name: string, usePos: boolean) => string;
  showPositionIcon: boolean;
  // New props from App.tsx
  isExpanded: boolean;
  onToggle: () => void;
}

export const MapSection: React.FC<MapSectionProps> = ({
  mapName, 
  combos, 
  selectedComboIds, 
  toggleCombo, 
  isExpanded,
  onToggle,
  ...gridProps
}) => (
  <section className="space-y-8">
    {/* Clickable Header */}
    <div 
      onClick={onToggle}
      className="flex items-center justify-between group cursor-pointer select-none"
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-3 rounded-2xl transition-colors",
          isExpanded ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-500 group-hover:bg-slate-300"
        )}>
          <MapPin size={28} />
        </div>
        <div>
          <h2 className="font-black text-3xl italic uppercase tracking-tight">
            {mapName}
          </h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {combos?.length || 0} Potential Combos
          </p>
        </div>
      </div>

      <div className={cn(
        "w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all",
        isExpanded 
          ? "border-blue-200 text-blue-600 rotate-180" 
          : "border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600"
      )}>
        <ChevronDown size={24} />
      </div>
    </div>

    {/* Expandable Content Container */}
    {isExpanded && (
      <div className="grid gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
        {combos?.map((names) => {
          const comboId = names.join('&');
          return (
            <ComboCard 
              key={comboId}
              names={names}
              isSelected={selectedComboIds.has(comboId)}
              onToggleCombo={() => toggleCombo(comboId)}
              {...gridProps}
            />
          );
        })}
        
        {(!combos || combos.length === 0) && (
          <div className="p-12 border-4 border-dashed border-slate-200 rounded-[3rem] text-center">
            <p className="font-black text-slate-300 uppercase italic">No Combos Available</p>
          </div>
        )}
      </div>
    )}
  </section>
);