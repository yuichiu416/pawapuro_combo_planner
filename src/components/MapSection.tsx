// src/components/MapSection.tsx
import { ChevronDown, MapPin } from 'lucide-react';
import type React from 'react';
import { ComboCard } from '@/components/ComboCard';
import combosDataRaw from '@/data/combos.json';
import { cn } from '@/utils/style';

const combosData = combosDataRaw as Record<string, any>;

interface MapSectionProps {
  mapName: string;
  combos: string[];
  selectedComboIds: Set<string>;
  toggleCombo: (id: string) => void;
  ownedChars: Set<string>;
  toggleCharacter: (name: string) => void;
  getImagePath: (name: string, usePos: boolean) => string;
  showPositionIcon: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectPreview: (name: string | null) => void;
  progress?: { selected: number; total: number };
}

export const MapSection: React.FC<MapSectionProps> = ({
  mapName,
  combos = [],
  selectedComboIds,
  toggleCombo,
  isExpanded,
  onToggle,
  onSelectPreview,
  progress,
  ...gridProps
}) => {
  const isComplete = progress && progress.selected === progress.total && progress.total > 0;

  return (
    <section className="space-y-8" data-testid={`map-section-${mapName}`}>
      {/* Clickable Header for Toggling Expansion */}
      <div
        onClick={onToggle}
        data-testid={`map-trigger-${mapName}`}
        className="flex items-center justify-between group cursor-pointer select-none"
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'p-3 rounded-2xl transition-colors',
              isExpanded
                ? 'bg-blue-100 text-blue-600'
                : 'bg-slate-200 text-black group-hover:bg-slate-300',
              isComplete && !isExpanded && 'bg-emerald-100 text-emerald-600',
            )}
          >
            <MapPin size={28} />
          </div>
          <div>
            <h2 className="font-black text-3xl uppercase tracking-tight text-black">{mapName}</h2>
            <div className="flex items-center gap-3">
              <p className="text-sm font-black text-black uppercase tracking-widest">
                {combos.length} Combos Found
              </p>

              {progress && (
                <span
                  data-testid={`map-progress-${mapName}`}
                  className={cn(
                    'text-sm font-black uppercase tracking-widest px-2 py-0.5 rounded transition-all shadow-sm',
                    isComplete
                      ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
                      : 'bg-blue-50 text-blue-600 ring-1 ring-blue-100',
                  )}
                >
                  Combos: {progress.selected}/{progress.total}
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all',
            isExpanded
              ? 'border-blue-200 text-blue-600 rotate-180'
              : 'border-slate-200 text-black group-hover:border-slate-300 group-hover:text-black',
            isComplete && !isExpanded && 'border-emerald-200 text-emerald-500',
          )}
        >
          <ChevronDown size={24} />
        </div>
      </div>

      {/* Expandable Content Container */}
      {isExpanded && (
        <div className="grid gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {combos.map((comboId) => {
            const fullComboData = combosData[comboId];
            if (!fullComboData) return null;

            return (
              <ComboCard
                key={comboId}
                names={fullComboData.characters}
                rewards={fullComboData.rewards}
                isSelected={selectedComboIds.has(comboId)}
                onToggleCombo={() => toggleCombo(comboId)}
                setSelectedPreview={onSelectPreview}
                {...gridProps}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};
