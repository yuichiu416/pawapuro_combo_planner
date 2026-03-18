import React from 'react';
import { CheckCircle2, Star, BadgeCheck } from 'lucide-react';
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
  getImagePath: (name: string, usePos: boolean) => string;
  showPositionIcon: boolean;
  rewards?: {
    skills: Array<{ name: string; level: number; verified?: boolean }>;
  };
}

export const ComboCard: React.FC<ComboCardProps> = ({
  names, isSelected, onToggleCombo, ownedChars, toggleCharacter, 
  getImagePath, showPositionIcon, rewards
}) => {
  return (
    <div 
      data-testid={`combo-card-${names.join('&')}`}
      onClick={(e) => {
        // Prevent toggle if clicking a specific character icon
        if ((e.target as HTMLElement).closest('button')) return;
        onToggleCombo();
      }} 
      className={cn(
        "flex items-center gap-6 p-6 rounded-[2.5rem] border-4 bg-white cursor-pointer transition-all hover:shadow-lg overflow-hidden", 
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

      {/* 2. CHARACTERS (Left Side) */}
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

      {/* 3. REWARDS (Middle Section - Scroll Protected) */}
      <div className="flex-1 flex flex-col gap-2 min-w-0 overflow-hidden">
        <div className="flex items-center gap-2">
          <Star size={10} className="text-amber-400 fill-amber-400" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Combo Rewards</span>
        </div>
        
        <div className="space-y-1.5 overflow-hidden">
          {rewards?.skills?.map((sk, idx) => {
            const detail = skillsData[sk.name];
            const isGold = detail?.type === 'gold';

            return (
              <div key={`${sk.name}-${idx}`} className="flex items-center gap-3 min-w-0">
                {/* Skill Badge */}
                <div className={cn(
                  "px-2 py-0.5 rounded-lg text-[9px] font-black shrink-0 border uppercase flex items-center gap-1",
                  isGold 
                    ? "bg-amber-50 border-amber-200 text-amber-700 shadow-sm" 
                    : "bg-blue-50 border-blue-100 text-blue-700"
                )}>
                  {sk.verified && <BadgeCheck size={10} className="text-emerald-500" />}
                  {sk.name} <span className="opacity-60">LV.{sk.level}</span>
                </div>
                
                {/* Description - Folded/Truncated */}
                <p 
                  className="text-[11px] font-bold text-slate-500 truncate flex-1 italic" 
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