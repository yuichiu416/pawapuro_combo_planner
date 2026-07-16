// src/components/CharacterSidebar/RosterGrid.tsx
import type React from 'react';
import { CharacterLinkIcon } from '@/components/CharacterLink/CharacterLinkIcon';
import type { LinkData } from '@/types';
import { cn } from '../../utils/style';

interface RosterGridProps {
  ownedChars: Set<string>;
  rosterSlots: (string | null)[];
  selectedPreview: string | null;
  setSelectedPreview: (name: string | null) => void;
  getImagePath: (name: string, usePos: boolean) => string;
  links: Record<string, LinkData>;
  testId: string;
}

export const RosterGrid: React.FC<RosterGridProps> = ({
  ownedChars,
  rosterSlots,
  selectedPreview,
  setSelectedPreview,
  getImagePath,
  links,
  testId,
}) => (
  <div
    className="space-y-2 bg-[#004A99] p-3 rounded-xl shadow-md border border-blue-400/20"
    data-testid={`${testId}-active-roster`}
  >
    <div className="flex justify-between items-center px-1">
      <span className="text-xs font-black text-blue-100/80 uppercase tracking-widest leading-none">
        登録メンバー
      </span>
      <div className="flex items-center gap-1 bg-[#003D87] px-2 py-0.5 rounded-full border border-white/10">
        <span
          data-testid={`${testId}-roster-count`}
          className={cn(
            'text-xs font-black',
            ownedChars.size > 25 ? 'text-[#FF4D70]' : 'text-[#FFF200]',
          )}
        >
          {ownedChars.size}
        </span>
        <span className="text-xs font-bold text-blue-200/40">/ 28</span>
      </div>
    </div>

    <div className="grid grid-cols-7 gap-1.5" data-testid={`${testId}-roster-grid`}>
      {rosterSlots.map((charName, i) => (
        <CharacterLinkIcon
          key={charName ? `slot-${charName}` : `empty-${i}`}
          name={charName ?? ''}
          link={charName ? links[charName] : undefined}
          className="aspect-square block w-full"
        >
          <button
            data-testid={
              charName ? `${testId}-roster-item-${charName}` : `${testId}-roster-slot-empty-${i}`
            }
            disabled={!charName}
            onClick={() =>
              charName && setSelectedPreview(charName === selectedPreview ? null : charName)
            }
            className={cn(
              'w-full h-full rounded-lg border flex items-center justify-center overflow-hidden transition-all relative transform active:scale-95',
              charName
                ? cn(
                    'bg-white shadow-sm',
                    selectedPreview === charName
                      ? 'border-[#FFF200] ring-2 ring-[#FFF200]/40 z-20 scale-105'
                      : 'border-transparent hover:border-white/30',
                  )
                : 'border-white/5 bg-black/10',
            )}
          >
            {charName ? (
              <img
                src={getImagePath(charName, true)}
                alt={charName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-1 h-1 bg-white/10 rounded-full" />
            )}

            {/* Soft inner glow for selection instead of a hard outer box */}
            {charName && selectedPreview === charName && (
              <div className="absolute inset-0 border-2 border-[#FFF200] rounded-lg z-30 pointer-events-none" />
            )}
          </button>
        </CharacterLinkIcon>
      ))}
    </div>
  </div>
);
