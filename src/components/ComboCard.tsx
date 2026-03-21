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
  onAddCharacters: (names: string[]) => void; // ✨ New Prop
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
  onAddCharacters, // ✨ Destructure new prop
  getImagePath, 
  showPositionIcon, 
  searchTerm = '', 
  rewards
}) => {
  // Check which characters from this combo are missing from the roster
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
        // Prevent toggle if clicking a button inside the card
        if ((e.target as HTMLElement).closest('button')) return;
        onToggleCombo();
      }} 
      className={cn(
        "flex items-center gap-6 p-6 rounded-[2.5rem] border-4 bg-white cursor-pointer transition-all hover:shadow-lg overflow-hidden relative", 
        isSelected ? "border-blue-500 shadow-xl" : "border-transparent hover:border-slate-200"
      )}
    >
      {/* 1. SELECTION INDICATOR */}
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all", 
        isSelected ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-slate-100 text-slate-300"
      )}>
        <CheckCircle2 size={24} />
      </div>

      {/* 2. CHARACTERS */}
      <div className="shrink-0 flex items-center border-r border-slate-100 pr-6">
        <CharacterGrid 
          characters={names}
          ownedChars={ownedChars}
          onToggle={toggleCharacter}
          getImagePath={getImagePath}
          showPositionIcon={showPositionIcon}
          layout="row"
        />
      </div>

      {/* 3. REWARDS */}
      <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Combo Rewards</span>
          </div>
          {isSelected && hasMissing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddCharacters(missingChars);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase rounded-xl transition-all shadow-md active:scale-95 animate-in fade-in zoom-in duration-200"
            >
              <UserPlus size={12} />
              Add {missingChars.length} to Roster
            </button>
          )}
        </div>
        
        <div className="space-y-1 overflow-hidden">
          {rewards?.skills?.map((sk, idx) => {
            const detail = skillsData[sk.name];
            const isGold = detail?.type === 'gold';
            const hasHit = isMatch(sk.name);

            return (
              <div 
                key={`${sk.name}-${idx}`} 
                className={cn(
                  "flex items-center gap-3 px-2 py-1 rounded-xl transition-all duration-200 border-2",
                  hasHit 
                    ? "bg-red-50 border-red-200 ring-1 ring-red-100" 
                    : "bg-transparent border-transparent"
                )}
              >
                <div className={cn(
                  "px-2 py-0.5 rounded-lg text-[9px] font-black shrink-0 border uppercase flex items-center gap-1",
                  hasHit 
                    ? "bg-red-600 border-red-600 text-white" 
                    : isGold 
                      ? "bg-amber-50 border-amber-200 text-amber-700" 
                      : "bg-blue-50 border-blue-100 text-blue-700"
                )}>
                  {sk.verified && <BadgeCheck size={10} className={hasHit ? "text-white" : "text-emerald-500"} />}
                  {sk.name} <span className={hasHit ? "text-white/70" : "opacity-60"}>LV.{sk.level}</span>
                </div>
                
                <p 
                  className={cn(
                    "text-[11px] font-bold truncate flex-1 italic transition-colors",
                    hasHit ? "text-red-900" : "text-slate-500"
                  )} 
                  title={detail?.description}
                >
                  {detail?.description || '---'}
                </p>
              </div>
            );
          })}
          {(!rewards?.skills || rewards.skills.length === 0) && (
             <span className="text-[10px] font-bold text-slate-300 italic uppercase">No skills recorded</span>
          )}
        </div>
      </div>
    </div>
  );
};