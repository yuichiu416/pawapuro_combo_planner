// src/components/CharacterSidebar/CharacterItem.tsx
import { Compass } from 'lucide-react';
import type React from 'react';
import { cn } from '../../utils/style';

interface CharacterItemProps {
  name: string;
  data: any;
  isOwned: boolean;
  onToggle: (name: string) => void;
  getImagePath: (name: string, usePos: boolean) => string;
  testId: string;
}

export const CharacterItem: React.FC<CharacterItemProps> = ({
  name,
  data,
  isOwned,
  onToggle,
  getImagePath,
  testId,
}) => {
  return (
    <button
      data-testid={testId}
      onClick={() => onToggle(name)}
      className={cn(
        'flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group text-left w-full border',
        isOwned
          ? 'bg-blue-50 border-blue-200 shadow-sm ring-1 ring-blue-100/50'
          : 'bg-white border-transparent hover:border-slate-200 shadow-sm',
      )}
    >
      <div
        className={cn(
          'w-11 h-11 flex-shrink-0 relative rounded-lg overflow-hidden border',
          isOwned
            ? 'border-blue-500 bg-white shadow-sm'
            : 'border-slate-200 bg-slate-50 opacity-70 group-hover:opacity-100',
        )}
      >
        <img
          src={getImagePath(name, true)}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              'text-sm font-black tracking-tighter leading-tight flex-1 break-words text-left',
              isOwned ? 'text-blue-950' : 'text-black',
            )}
          >
            {name}
          </p>
          <span
            className={cn(
              'text-xs font-black px-1.5 py-0.5 rounded uppercase flex-shrink-0',
              isOwned ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600',
            )}
          >
            {data?.position || 'MGR'}
          </span>
        </div>

        <p className="text-xs font-bold text-slate-400 uppercase leading-none mt-1 flex items-center gap-1">
          <Compass size={10} className="flex-shrink-0" />
          <span className="truncate">{data?.encounter_map || 'Unknown Map'}</span>
        </p>
      </div>
    </button>
  );
};
