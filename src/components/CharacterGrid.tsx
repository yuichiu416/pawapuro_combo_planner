// src/components/CharacterGrid.tsx
import type React from 'react';
import { cn } from '../utils/style';

interface CharacterGridProps {
  characters: string[];
  ownedChars: Set<string>;
  onToggle: (name: string) => void;
  getImagePath: (name: string, usePos: boolean) => string;
  showPositionIcon: boolean;
  layout?: 'grid' | 'row';
}

export const CharacterGrid: React.FC<CharacterGridProps> = ({
  characters,
  ownedChars,
  onToggle,
  getImagePath,
  showPositionIcon,
  layout = 'grid',
}) => {
  return (
    <div
      data-testid="character-grid"
      className={cn(
        // Mobile: Single column list | Desktop: Grid
        layout === 'grid'
          ? 'grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-6'
          : 'flex flex-col sm:flex-row gap-4',
      )}
    >
      {characters.map((name) => {
        const isOwned = ownedChars.has(name);

        return (
          <button
            key={name}
            data-testid={`combo-char-button-${name}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(name);
            }}
            className={cn(
              'flex items-center sm:flex-col sm:items-center gap-3 sm:gap-1.5 group cursor-pointer w-full p-2 sm:p-0 rounded-xl transition-colors',
              isOwned
                ? 'bg-emerald-50 sm:bg-transparent'
                : 'hover:bg-slate-50 sm:hover:bg-transparent',
            )}
          >
            {/* Avatar Container */}
            <div
              data-testid={`icon-highlight-wrapper-${name}`}
              className={cn(
                'w-12 h-12 sm:w-20 sm:h-20 flex-shrink-0 relative rounded-xl sm:rounded-3xl overflow-hidden transition-all duration-200 border-2 sm:border-4',
                isOwned
                  ? 'border-emerald-500 bg-white shadow-sm'
                  : 'border-slate-200 bg-slate-100 opacity-60 group-hover:opacity-100',
              )}
            >
              <img
                src={getImagePath(name, showPositionIcon)}
                className="absolute inset-0 w-full h-full object-cover"
                alt={name}
              />
            </div>

            {/* Name Container: Left-aligned on mobile, Center-aligned on desktop */}
            <div className="flex-1 sm:w-full">
              <span
                className={cn(
                  'font-black uppercase transition-colors duration-200 block break-all leading-tight',
                  'text-sm sm:text-xs md:text-sm', // Sizing
                  'text-left sm:text-center', // Alignment switch
                  isOwned ? 'text-emerald-700' : 'text-slate-900 group-hover:text-blue-600',
                )}
              >
                {name}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
