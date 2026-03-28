// src/components/CharacterSidebar/CharacterItem.tsx
import { Compass } from 'lucide-react';
import type React from 'react';
import { cn } from '../../utils/style';

interface CharacterItemProps {
  name: string;
  data: any;
  isOwned: boolean;
  isSelected: boolean;
  onToggle: (name: string) => void;
  getImagePath: (name: string, usePos: boolean) => string;
  testId: string;
  hasCombo?: boolean;
}

export const CharacterItem: React.FC<CharacterItemProps> = ({
  name,
  data,
  isOwned,
  isSelected,
  onToggle,
  getImagePath,
  testId,
  hasCombo,
}) => {
  return (
    <button
      data-testid={testId}
      onClick={() => onToggle(name)}
      // Using !important modifiers and inline styles as a absolute backup
      className={cn(
        'flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 group text-left w-full border-2 relative outline-none mb-1',
        isSelected
          ? '!border-[#0059C1] !bg-blue-50 shadow-[0_4px_12px_rgba(0,89,193,0.15)] z-10'
          : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm',
      )}
      style={isSelected ? { borderColor: '#0059C1', backgroundColor: '#eff6ff' } : {}}
    >
      {/* Indicator Dot - Matches the Preview Box UI */}
      {isSelected && (
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#0059C1] rounded-full z-20 shadow-sm"
          style={{ backgroundColor: '#0059C1' }}
        />
      )}

      {/* Character Portrait */}
      <div
        className={cn(
          'w-12 h-12 flex-shrink-0 relative rounded-lg overflow-hidden border-2 transition-transform',
          isSelected
            ? '!border-[#0059C1] scale-105 shadow-sm'
            : isOwned
              ? 'border-slate-200 bg-white'
              : 'border-slate-100 bg-slate-50 opacity-60 group-hover:opacity-100',
        )}
        style={isSelected ? { borderColor: '#0059C1' } : {}}
      >
        <img
          src={getImagePath(name, true)}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1 pr-6">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              'text-sm font-black tracking-tighter leading-tight flex-1 break-words text-left',
              isSelected ? 'text-[#003D87]' : 'text-slate-900',
              !isOwned && !isSelected && 'text-slate-500',
            )}
          >
            {`${name}${hasCombo ? '' : '(No Combo)'}`}
          </p>
          <span
            className={cn(
              'text-xs font-black px-1.5 py-0.5 rounded uppercase flex-shrink-0 border',
              isSelected || isOwned
                ? 'bg-[#0059C1] text-white border-[#00479B]'
                : 'bg-slate-100 text-slate-400 border-slate-200',
            )}
          >
            {data?.position || 'MGR'}
          </span>
        </div>

        {/* Map Info */}
        <div className="flex items-center gap-1 mt-1.5">
          <Compass
            size={11}
            className={cn('flex-shrink-0', isSelected ? 'text-[#0059C1]' : 'text-slate-300')}
          />
          <p
            className={cn(
              'text-xs font-bold uppercase tracking-wider truncate',
              isSelected ? 'text-[#0059C1]/80' : 'text-slate-400',
            )}
          >
            {data?.encounter_map || 'Unknown Map'}
          </p>

          {/* Character ID */}
          {data?.id && (
            <span
              data-testid={`${testId}-no`}
              className={cn(
                'ml-auto text-xs font-bold tracking-wider flex-shrink-0',
                isSelected ? 'text-[#0059C1]' : 'text-black', // was /60 and slate-300
              )}
            >
              No.{String(data.id).padStart(3, '0')}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
