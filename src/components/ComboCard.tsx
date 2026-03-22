// src/components/ComboCard.tsx
import React from 'react';
import { CheckCircle2, Star, BadgeCheck, UserPlus } from 'lucide-react';
import { cn } from '../utils/style';
import { CharacterGrid } from './CharacterGrid';
import skillsDataRaw from '@/data/skills.json';

const skillsData = skillsDataRaw as Record<string, any>;

interface ComboCardProps {
  names: string[];
  isSelected: boolean;
  onToggleCombo: () => void;
  ownedChars: Set<string>;
  toggleCharacter: (name: string) => void;
  onAddCharacters: (names: string[]) => void;
  getImagePath: (name: string, usePos: boolean) => string;
  showPositionIcon: boolean;
  searchTerm?: string;
  rewards?: {
    skills: Array<{ name: string; level: number; verified?: boolean }>;
  };
}

export const ComboCard: React.FC<ComboCardProps> = ({
  names, 
  isSelected, 
  onToggleCombo, 
  ownedChars, 
  toggleCharacter, 
  onAddCharacters,
  getImagePath, 
  showPositionIcon, 
  searchTerm = '', 
  rewards
}) => {
  const missingChars = names.filter(name => !ownedChars.has(name));
  const hasMissing = missingChars.length > 0;

  const isMatch = (text: string) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return false;
    return text.toLowerCase().includes(term);
  };

  return (
    <div 
      data-testid={`combo-card-${names.join('&')}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onToggleCombo();
      }} 
      className={cn(
        "flex items-center gap-4 p-4 rounded-[1.5rem] border-2 bg-white cursor-pointer transition-all hover:shadow-md overflow-hidden relative", 
        isSelected ? "border-blue-500 bg-blue-50/30" : "border-transparent hover:border-slate-200"
      )}
    >
      {/* 1. SELECTION INDICATOR */}
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all", 
        isSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-slate-100 text-slate-300"
      )}>
        <CheckCircle2 size={24} />
      </div>

      {/* 2. CHARACTERS SECTION - Added data-testid for layout tests */}
      <div 
        data-testid="character-section"
        className="shrink-0 flex items-center border-r border-slate-100 pr-4"
      >
        <CharacterGrid 
          characters={names}
          ownedChars={ownedChars}
          onToggle={toggleCharacter}
          getImagePath={getImagePath}
          showPositionIcon={showPositionIcon}
          layout="row"
        />
      </div>

      {/* 3. REWARDS SECTION */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star size={8} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Combo Rewards</span>
          </div>
          
          {isSelected && hasMissing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddCharacters(missingChars);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black uppercase rounded-lg transition-all shadow-sm active:scale-95"
            >
              <UserPlus size={10} />
              Add {missingChars.length}
            </button>
          )}
        </div>
        
        <div className="space-y-0.5 overflow-hidden">
          {rewards?.skills?.map((sk, idx) => {
            const detail = skillsData[sk.name];
            const isGold = detail?.type === 'gold';
            const hasHit = isMatch(sk.name);

            return (
              <div 
                key={`${sk.name}-${idx}`} 
                data-testid={`skill-row-${sk.name}`}
                className={cn(
                  "flex items-center gap-2 px-1.5 py-0.5 rounded-lg transition-all border",
                  hasHit 
                    ? "bg-red-50 border-red-200" 
                    : "bg-transparent border-transparent"
                )}
              >
                <div 
                  data-testid={`skill-badge-${sk.name}`}
                  className={cn(
                    "px-1.5 py-0.5 rounded-md text-sm font-black shrink-0 border uppercase flex items-center gap-1",
                    hasHit 
                      ? "bg-red-600 border-red-600 text-white" 
                      : isGold 
                        ? "bg-amber-50 border-amber-200 text-amber-700" 
                        : "bg-blue-50 border-blue-100 text-blue-700"
                  )}
                >
                  {sk.verified && <BadgeCheck size={10} className={hasHit ? "text-white" : "text-emerald-500"} />}
                  {sk.name} <span className={hasHit ? "text-white/70" : "opacity-60"}>Lv{sk.level}</span>
                </div>
                
                <p 
                  className={cn(
                    "text-sm font-bold truncate flex-1 transition-colors",
                    hasHit ? "text-red-900" : "text-slate-500"
                  )} 
                  title={detail?.description}
                >
                  {detail?.description || '---'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};