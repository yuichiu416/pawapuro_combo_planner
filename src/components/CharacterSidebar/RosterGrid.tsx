// src/components/CharacterSidebar/RosterGrid.tsx
import type React from 'react';
import { cn } from '../../utils/style';

interface RosterGridProps {
  ownedChars: Set<string>;
  rosterSlots: (string | null)[];
  selectedPreview: string | null;
  setSelectedPreview: (name: string | null) => void;
  getImagePath: (name: string, usePos: boolean) => string;
  testId: string;
}

export const RosterGrid: React.FC<RosterGridProps> = ({
  ownedChars,
  rosterSlots,
  selectedPreview,
  setSelectedPreview,
  getImagePath,
  testId,
}) => (
  <div
    className="space-y-1.5 bg-slate-900 p-3 rounded-xl shadow-inner border border-slate-800"
    data-testid={`${testId}-active-roster`} // Updated to use parent testId for consistency
  >
    <div className="flex justify-between items-center px-1">
      <span className="text-xs font-black text-white uppercase tracking-widest">Active Roster</span>
      <span
        data-testid={`${testId}-roster-count`}
        className={cn(
          'text-sm font-black',
          ownedChars.size > 25 ? 'text-rose-400' : 'text-emerald-400',
        )}
      >
        {ownedChars.size} / 28
      </span>
    </div>

    <div className="grid grid-cols-7 gap-1" data-testid={`${testId}-roster-grid`}>
      {rosterSlots.map((charName, i) => (
        <button
          // Ensure empty slots have a predictable ID for testing empty states
          data-testid={
            charName ? `${testId}-roster-item-${charName}` : `${testId}-roster-slot-empty-${i}`
          }
          key={charName ? `slot-${charName}` : `empty-${i}`}
          // Keep disabled to prevent interaction with empty slots
          disabled={!charName}
          onClick={() =>
            charName && setSelectedPreview(charName === selectedPreview ? null : charName)
          }
          className={cn(
            'aspect-square rounded-md border flex items-center justify-center overflow-hidden transition-all relative group/slot',
            charName
              ? cn(
                  'bg-slate-800',
                  selectedPreview === charName
                    ? 'border-blue-400 ring-2 ring-blue-400/50 scale-105 z-20'
                    : 'border-slate-600 hover:border-slate-400',
                )
              : 'border-slate-800/50 bg-slate-900/40',
          )}
        >
          {charName ? (
            <img
              src={getImagePath(charName, true)}
              alt={charName}
              className="w-full h-full object-cover z-10"
            />
          ) : (
            <div className="w-1 h-1 bg-slate-800 rounded-full" />
          )}
        </button>
      ))}
    </div>
  </div>
);
