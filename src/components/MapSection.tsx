// src/components/MapSection.tsx
import React from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { ComboCard } from '@/components/ComboCard';
import { cn } from '@/utils/style';

// Import the full combo data to get reward details
import combosDataRaw from '@/data/combos.json';

const combosData = combosDataRaw as Record<string, any>;

interface MapSectionProps {
  mapName: string;
  combos: string[]; // CHANGED: Now expecting an array of IDs from the parent
  selectedComboIds: Set<string>;
  toggleCombo: (id: string) => void;
  ownedChars: Set<string>;
  toggleCharacter: (name: string) => void;
  getImagePath: (name: string, usePos: boolean) => string;
  showPositionIcon: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  progress?: { selected: number; total: number };
}

export const MapSection: React.FC<MapSectionProps> = ({
  mapName, 
  combos, 
  selectedComboIds, 
  toggleCombo, 
  isExpanded,
  onToggle,
  progress,
  ...gridProps
}) => {
  const isComplete = progress && progress.selected === progress.total && progress.total > 0;

  return (
    <section className="space-y-8">
      {/* Clickable Header */}
      <div 
        onClick={onToggle}
        className="flex items-center justify-between group cursor-pointer select-none"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-2xl transition-colors",
            isExpanded ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-500 group-hover:bg-slate-300",
            isComplete && !isExpanded && "bg-emerald-100 text-emerald-600"
          )}>
            <MapPin size={28} />
          </div>
          <div>
            <h2 className="font-black text-3xl italic uppercase tracking-tight text-slate-900">
              {mapName}
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {combos?.length || 0} Matches Found
              </p>

              {progress && (
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-all shadow-sm",
                  isComplete 
                    ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" 
                    : "bg-blue-50 text-blue-600 ring-1 ring-blue-100"
                )}>
                  Combos: {progress.selected}/{progress.total}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={cn(
          "w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all",
          isExpanded 
            ? "border-blue-200 text-blue-600 rotate-180" 
            : "border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600",
          isComplete && !isExpanded && "border-emerald-200 text-emerald-500"
        )}>
          <ChevronDown size={24} />
        </div>
      </div>

      {/* Expandable Content Container */}
      {isExpanded && (
        <div className="grid gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {combos?.map((comboId) => {
            const fullComboData = combosData[comboId];
            if (!fullComboData) return null;

            return (
              <ComboCard 
                key={comboId}
                // We pull the names and rewards directly from the JSON using the ID
                names={fullComboData.characters}
                rewards={fullComboData.rewards} 
                isSelected={selectedComboIds.has(comboId)}
                onToggleCombo={() => toggleCombo(comboId)}
                {...gridProps}
              />
            );
          })}
          
          {(!combos || combos.length === 0) && (
            <div className="p-12 border-4 border-dashed border-slate-200 rounded-[3rem] text-center">
              <p className="font-black text-slate-300 uppercase italic">No Matches in this area</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};