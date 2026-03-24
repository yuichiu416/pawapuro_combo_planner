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
        layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6' : 'flex gap-8',
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
            className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer"
          >
            <div
              // This ID is the key for your failing test
              data-testid={`icon-highlight-wrapper-${name}`}
              className={cn(
                'w-20 h-20 relative rounded-3xl overflow-hidden transition-all duration-200 border-4',
                isOwned
                  ? 'border-emerald-500 bg-emerald-50 shadow-md group-hover:border-emerald-300'
                  : 'border-transparent bg-slate-100 opacity-50 group-hover:opacity-100 group-hover:border-blue-400',
              )}
            >
              <img
                src={getImagePath(name, showPositionIcon)}
                className="absolute inset-0 w-full h-full object-cover"
                alt={name}
              />
            </div>
            <span
              className={cn(
                'text-lg font-black uppercase transition-colors duration-200',
                isOwned
                  ? 'text-emerald-700 group-hover:text-emerald-500'
                  : 'text-black group-hover:text-blue-600',
              )}
            >
              {name}
            </span>
          </button>
        );
      })}
    </div>
  );
};
