// src/components/CharacterSidebar/CharacterItem.tsx
import { Compass } from 'lucide-react';
import type React from 'react';
import { cn } from '../../utils/style';

interface RewardStats {
  skills: string[];
  stats: Record<string, number>;
}

interface CharacterData {
  position?: string;
  encounter_map?: string;
  id?: number;
  rewards?: RewardStats;
}

interface CharacterItemProps {
  name: string;
  data: CharacterData;
  isOwned: boolean;
  isSelected: boolean;
  onToggle: (name: string) => void;
  onRemove: (name: string) => void;
  getImagePath: (name: string, usePos: boolean) => string;
  testId: string;
  hasCombo?: boolean;
}

type CardState = 'selected' | 'owned' | 'unowned';

const cardStyles = {
  selected: {
    root: 'border-[#0059C1] bg-blue-50 shadow-[0_4px_12px_rgba(0,89,193,0.15)] z-10',
    portrait: 'border-[#0059C1] scale-105 shadow-sm',
    name: 'text-[#003D87]',
    position: 'bg-[#0059C1] text-white border-[#00479B]',
    compass: 'text-[#0059C1]',
    map: 'text-[#0059C1]/80',
    id: 'text-[#0059C1]',
    stat: 'bg-blue-100 text-[#003D87] border-blue-200',
  },
  owned: {
    root: 'border-slate-100 bg-white shadow-sm hover:border-slate-300',
    portrait: 'border-slate-200 bg-white',
    name: 'text-slate-900',
    position: 'bg-[#0059C1] text-white border-[#00479B]',
    compass: 'text-slate-300',
    map: 'text-slate-400',
    id: 'text-black',
    stat: 'bg-slate-50 text-slate-500 border-slate-200',
  },
  unowned: {
    root: 'border-slate-100 bg-white shadow-sm hover:border-slate-300',
    portrait: 'border-slate-100 bg-slate-50 opacity-60 group-hover:opacity-100',
    name: 'text-slate-500',
    position: 'bg-slate-100 text-slate-400 border-slate-200',
    compass: 'text-slate-300',
    map: 'text-slate-400',
    id: 'text-black',
    stat: 'bg-slate-50 text-slate-500 border-slate-200',
  },
} as const;

export const CharacterItem: React.FC<CharacterItemProps> = ({
  name,
  data,
  isOwned,
  isSelected,
  onToggle,
  onRemove,
  getImagePath,
  testId,
  hasCombo,
}) => {
  const cardState: CardState = isSelected ? 'selected' : isOwned ? 'owned' : 'unowned';
  const styles = cardStyles[cardState];
  const showRemove = isSelected && isOwned;

  const rewardStats = data?.rewards?.stats ? Object.entries(data.rewards.stats) : [];

  return (
    <button
      data-testid={testId}
      onClick={() => onToggle(name)}
      className={cn(
        'flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group text-left w-full border-2 relative outline-none mb-1',
        styles.root,
      )}
    >
      {/* Dot — only for unowned-selected; owned-selected gets the remove button instead */}
      {isSelected && !isOwned && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#0059C1] rounded-full shrink-0" />
      )}

      {/* Character portrait */}
      <div
        className={cn(
          'w-12 h-12 flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-transform',
          styles.portrait,
        )}
      >
        <img
          src={getImagePath(name, true)}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Text content — pr-6 only needed when dot is showing */}
      <div className={cn('min-w-0 flex-1', !showRemove && 'pr-6')}>
        {/* Name + position row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <p
              className={cn(
                'text-sm font-black tracking-tighter leading-tight break-words',
                styles.name,
              )}
            >
              {name}
            </p>
            {!hasCombo && (
              <span className="text-xs font-medium text-slate-400 italic flex-shrink-0">
                (No Combo)
              </span>
            )}
          </div>
          <span
            className={cn(
              'text-xs font-black px-1.5 py-0.5 rounded uppercase flex-shrink-0 border',
              styles.position,
            )}
          >
            {data?.position || ''}
          </span>
        </div>

        {/* Map + ID row — REMOVE replaces No.xxx when selected+owned */}
        <div className="flex items-center gap-1 mt-1.5">
          <Compass size={11} className={cn('flex-shrink-0', styles.compass)} />
          <p className={cn('text-xs font-bold uppercase tracking-wider truncate', styles.map)}>
            {data?.encounter_map || 'Unknown Map'}
          </p>
          {showRemove ? (
            <button
              data-testid={`${testId}-inline-remove`}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(name);
              }}
              className="ml-auto flex-shrink-0 px-2.5 py-1 bg-[#FF2D55] hover:bg-[#E60039] text-white rounded-md text-xs font-black uppercase tracking-wider transition-all active:scale-95"
            >
              Remove
            </button>
          ) : (
            data?.id && (
              <span
                data-testid={`${testId}-no`}
                className={cn('ml-auto text-xs font-bold tracking-wider flex-shrink-0', styles.id)}
              >
                No.{String(data.id).padStart(3, '0')}
              </span>
            )
          )}
        </div>

        {/* Reward stats row */}
        {rewardStats.length > 0 && (
          <div data-testid={`${testId}-reward-stats`} className="flex flex-wrap gap-1 mt-1.5">
            {rewardStats.map(([key, value]) => (
              <span
                key={key}
                data-testid={`${testId}-reward-stat-${key}`}
                className={cn('text-xs font-bold px-1.5 py-0.5 rounded border', styles.stat)}
              >
                {key}: {value}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  );
};
