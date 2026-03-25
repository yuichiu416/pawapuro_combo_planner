// src/components/ComboCard.tsx

import { BadgeCheck, Star, UserPlus } from 'lucide-react';
import type React from 'react';
import skillsDataRaw from '@/data/skills.json';
import { cn } from '../utils/style';

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
  rewards,
}) => {
  const missingChars = names.filter((name) => !ownedChars.has(name));
  const hasMissing = missingChars.length > 0;
  const comboId = names.join('&');

  const isMatch = (text: string) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return false;
    return text.toLowerCase().includes(term);
  };

  return (
    <div
      data-testid={`combo-card-${comboId}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onToggleCombo();
      }}
      className={cn(
        'flex flex-col lg:flex-row gap-4 p-3 rounded-2xl border-2 transition-all hover:shadow-sm overflow-hidden relative cursor-pointer',
        isSelected
          ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-600/10'
          : 'border-slate-200 bg-white hover:border-slate-300',
      )}
    >
      {/* 1. CHARACTERS SECTION */}
      <div
        data-testid="character-section"
        className="flex-none lg:w-[220px] flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-100 pb-2 lg:pb-0 lg:pr-5"
      >
        <div className="flex flex-row items-start justify-center gap-x-5 gap-y-2 flex-wrap w-full">
          {names.map((name) => {
            const isOwned = ownedChars.has(name);
            return (
              <div key={name} className="flex flex-col items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCharacter(name);
                  }}
                  className={cn(
                    'w-11 h-11 md:w-13 md:h-13 relative rounded-xl overflow-hidden border-2 transition-all shrink-0',
                    isOwned
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 bg-slate-100 opacity-60 hover:opacity-100',
                  )}
                >
                  <img
                    src={getImagePath(name, showPositionIcon)}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt={name}
                  />
                </button>

                <p
                  className={cn(
                    'font-black leading-[1.2] text-center transition-colors',
                    'max-w-[100px] [overflow-wrap:anywhere] [line-break:strict]',
                    // FIX: Changed to >= 8 to include "ダイジョーブ博士"
                    name.length >= 8 ? 'text-sm' : 'text-base',
                    isOwned ? 'text-emerald-700' : 'text-slate-900',
                  )}
                >
                  {name}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. REWARDS SECTION */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-black text-slate-900 uppercase tracking-tight">
              Combo Rewards
            </span>
          </div>

          {isSelected && hasMissing && (
            <button
              data-testid="combo-add-btn"
              onClick={(e) => {
                e.stopPropagation();
                onAddCharacters(missingChars);
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black uppercase rounded-lg transition-all shadow-sm active:scale-95"
            >
              <UserPlus size={12} />
              Add {missingChars.length}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {rewards?.skills?.map((sk, idx) => {
            const detail = skillsData[sk.name];
            const isGold = detail?.type === 'gold';
            const hasHit = isMatch(sk.name);

            return (
              <div
                key={`${sk.name}-${idx}`}
                data-testid={`skill-row-${sk.name}`}
                className={cn(
                  'flex flex-col lg:flex-row lg:items-center gap-1 lg:gap-3 px-1.5 py-1 transition-all rounded-xl',
                  hasHit ? 'bg-red-50/50' : 'bg-transparent',
                )}
              >
                <div
                  data-testid={`skill-badge-${sk.name}`}
                  className={cn(
                    'px-2 py-0.5 rounded text-sm font-black shrink-0 border uppercase flex items-center gap-1 w-fit',
                    hasHit
                      ? 'bg-red-600 border-red-600 text-white'
                      : isGold
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : 'bg-blue-100 border-blue-200 text-blue-800',
                  )}
                >
                  {sk.verified && (
                    <BadgeCheck size={11} className={hasHit ? 'text-white' : 'text-emerald-600'} />
                  )}
                  {sk.name}{' '}
                  <span className={hasHit ? 'text-white/70' : 'opacity-60'}>Lv{sk.level}</span>
                </div>

                <p
                  className={cn(
                    'text-sm font-bold break-words leading-tight flex-1',
                    hasHit ? 'text-red-900' : 'text-slate-600',
                  )}
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
