// src/components/MapSection.tsx
import { ChevronDown, MapPin } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { ComboCard } from '@/components/ComboCard';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { cn } from '@/utils/style';

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
  const { gameData } = useGameVersion();
  const { t } = useTranslation();
  const combosData = gameData.combos as Record<string, any>;
  const isComplete = progress && progress.selected === progress.total && progress.total > 0;

  return (
    <section className="space-y-6" data-testid={`map-section-${mapName}`}>
      {/* Clickable Header for Toggling Expansion */}
      <div
        onClick={onToggle}
        data-testid={`map-trigger-${mapName}`}
        className={cn(
          'flex items-center justify-between group cursor-pointer select-none p-4 rounded-2xl transition-all border-2',
          isExpanded
            ? 'bg-white border-[#0059C1] shadow-lg'
            : 'bg-[#F0F7FF] border-transparent hover:bg-white hover:border-blue-200 shadow-sm',
        )}
      >
        <div className="flex items-center gap-5">
          <div
            className={cn(
              'p-3 rounded-xl transition-all shadow-inner border-2',
              isExpanded
                ? 'bg-[#0059C1] text-white border-blue-400'
                : 'bg-white text-blue-600 border-blue-50 group-hover:border-blue-100',
              isComplete && !isExpanded && 'bg-[#FFF200] text-[#003D87] border-[#E6D900]',
            )}
          >
            <MapPin size={24} strokeWidth={3} />
          </div>
          <div>
            <h2
              className={cn(
                'font-black text-2xl uppercase tracking-tighter leading-none mb-1',
                isExpanded ? 'text-[#003D87]' : 'text-slate-900',
              )}
            >
              {mapName}
            </h2>
            <div className="flex items-center gap-3">
              {progress && (
                <div
                  data-testid={`map-progress-${mapName}`}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm border',
                    isComplete
                      ? 'bg-[#FFF200] text-[#003D87] border-[#E6D900]'
                      : 'bg-blue-50 text-blue-600 border-blue-100',
                  )}
                >
                  <span className="opacity-60">{t('ui.combos_found')}:</span>
                  <span>
                    {progress.total > 0
                      ? `${progress.selected}/${progress.total}`
                      : progress.selected > 0
                        ? progress.selected
                        : '-'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className={cn(
            'w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all',
            isExpanded
              ? 'bg-[#0059C1] border-blue-400 text-white rotate-180'
              : 'bg-white border-slate-100 text-slate-400 group-hover:border-blue-200 group-hover:text-blue-500',
            isComplete && !isExpanded && 'bg-[#FFF200] border-[#E6D900] text-[#003D87]',
          )}
        >
          <ChevronDown size={20} strokeWidth={3} />
        </div>
      </div>

      {/* Expandable Content Container */}
      {isExpanded && (
        <div className="grid gap-4 px-1 animate-in fade-in slide-in-from-top-2 duration-200">
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
