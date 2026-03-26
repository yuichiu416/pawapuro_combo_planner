// src/components/ComboCard.tsx
import { BadgeCheck, Star, UserPlus } from 'lucide-react';
import React from 'react';
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
  setSelectedPreview: (name: string | null) => void;
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
  setSelectedPreview,
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
      data-testid={`combo-card-container-${comboId}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onToggleCombo();
      }}
      className={cn(
        'flex flex-col lg:flex-row gap-5 p-4 rounded-2xl border-2 transition-all overflow-hidden relative cursor-pointer',
        isSelected
          ? 'border-[#0059C1] bg-white shadow-[0_8px_24px_rgba(0,89,193,0.12)] scale-[1.01] z-10'
          : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-md',
      )}
    >
      {/* 1. CHARACTERS SECTION - "VS/Duo" Style */}
      <div
        data-testid="character-section"
        className="flex-none lg:w-[240px] flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-50 pb-4 lg:pb-0 lg:pr-6"
      >
        <div className="flex flex-row items-center justify-center gap-x-3 w-full">
          {names.map((name, idx) => {
            const isOwned = ownedChars.has(name);
            return (
              <React.Fragment key={name}>
                <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
                  <button
                    data-testid={`combo-card-character-icon-btn-${name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPreview(name);
                    }}
                    className={cn(
                      'w-18 h-18 relative rounded-2xl overflow-hidden border-2 transition-all shrink-0 shadow-sm transform hover:scale-110 active:scale-95',
                      isOwned
                        ? 'border-[#0059C1] bg-white'
                        : 'border-slate-200 bg-slate-50 opacity-50 hover:opacity-100',
                    )}
                  >
                    <img
                      src={getImagePath(name, showPositionIcon)}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt={name}
                    />
                  </button>
                  <p
                    data-testid={`combo-card-p-${name}`}
                    className={cn(
                      'text-xs font-black leading-tight text-center tracking-tighter uppercase',
                      'w-full [overflow-wrap:anywhere] break-words',
                      isOwned ? 'text-[#003D87]' : 'text-slate-400',
                    )}
                  >
                    {name}
                  </p>
                </div>
                {idx === 0 && names.length > 1 && (
                  <div className="text-xs font-black text-slate-300 px-1">x</div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 2. REWARDS SECTION */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2">
            <div className="bg-[#FFF200] p-1 rounded-md shadow-sm border border-[#E6D900]">
              <Star size={14} className="text-[#003D87] fill-[#003D87]" />
            </div>
            <span className="text-sm font-black text-[#003D87] uppercase tracking-[0.2em]">
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
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0059C1] hover:bg-[#006AEE] text-white text-xs font-black uppercase rounded-lg transition-all shadow-md active:scale-90 border-b-4 border-blue-800"
            >
              <UserPlus size={12} strokeWidth={3} />
              Add Missing ({missingChars.length})
            </button>
          )}
        </div>

        <div className="space-y-1">
          {rewards?.skills?.map((sk, idx) => {
            const detail = skillsData[sk.name];
            const isGold = detail?.type === 'gold';
            const hasHit = isMatch(sk.name);

            return (
              <div
                key={`${sk.name}-${idx}`}
                data-testid={`skill-row-${sk.name}`}
                className={cn(
                  'flex flex-col lg:flex-row lg:items-center gap-2 px-2.5 py-1 transition-all rounded-xl border-l-4',
                  hasHit
                    ? 'bg-rose-50 border-rose-500'
                    : isGold
                      ? 'bg-amber-50 border-[#FFF200]'
                      : 'bg-slate-50 border-blue-200',
                )}
              >
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    data-testid={`skill-badge-${sk.name}`}
                    className={cn(
                      'px-2 py-0.5 rounded text-sm font-black shrink-0 border-2 uppercase flex items-center gap-1',
                      hasHit
                        ? 'bg-rose-600 border-rose-700 text-white'
                        : isGold
                          ? 'bg-[#FFF200] border-[#E6D900] text-[#003D87]'
                          : 'bg-white border-blue-100 text-blue-800',
                    )}
                  >
                    {sk.verified && (
                      <BadgeCheck
                        size={12}
                        strokeWidth={3}
                        className={
                          hasHit ? 'text-white' : isGold ? 'text-[#003D87]' : 'text-emerald-500'
                        }
                      />
                    )}
                    {sk.name}
                    <span className={cn('ml-1', hasHit ? 'text-white/70' : 'opacity-40')}>
                      Lv{sk.level}
                    </span>
                  </div>
                </div>

                <p
                  className={cn(
                    'text-sm font-bold leading-snug flex-1',
                    hasHit ? 'text-rose-900' : 'text-slate-500',
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
