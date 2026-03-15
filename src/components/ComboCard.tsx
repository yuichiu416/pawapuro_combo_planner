// src/components/ComboCard.tsx
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/style';
import { CharacterGrid } from './CharacterGrid';

interface ComboCardProps {
  names: string[];
  isSelected: boolean;
  onToggleCombo: () => void;
  ownedChars: Set<string>;
  toggleCharacter: (name: string) => void;
  getImagePath: (name: string, usePos: boolean) => string;
  showPositionIcon: boolean;
}

export const ComboCard: React.FC<ComboCardProps> = ({
  names, isSelected, onToggleCombo, ownedChars, toggleCharacter, getImagePath, showPositionIcon
}) => (
  <div 
    data-testid={`combo-card-${names.join('&')}`}
    onClick={onToggleCombo} 
    className={cn(
      "flex items-center gap-6 p-6 rounded-[3rem] border-4 bg-white cursor-pointer transition-all", 
      isSelected ? "border-blue-500 shadow-xl" : "border-transparent hover:border-slate-200"
    )}
  >
    <div className={cn(
      "w-16 h-16 rounded-4xl flex items-center justify-center shrink-0 transition-all", 
      isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-300"
    )}>
      <CheckCircle2 size={32} />
    </div>
    <div className="flex-1 overflow-x-auto pb-2 custom-scrollbar">
      <CharacterGrid 
        characters={names}
        ownedChars={ownedChars}
        onToggle={toggleCharacter}
        getImagePath={getImagePath}
        showPositionIcon={showPositionIcon}
        layout="row"
      />
    </div>
  </div>
);