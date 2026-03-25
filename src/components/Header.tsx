// src/components/Header.tsx
import { ChevronDown, ChevronUp, Loader2, Minus, Plus, Save, Star, XCircle } from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
import skillsData from '@/data/skills.json';
import { cn } from '@/utils/style';
import { AuthButton } from './AuthButton';

interface HeaderProps {
  showPositionIcon: boolean;
  setShowPositionIcon: (val: boolean) => void;
  filterRelatedOnly: boolean;
  toggleRelatedFilter: () => void;
  toggleAllByType: (type: 'pitcher' | 'fielder') => void;
  typeFilter: 'pitcher' | 'fielder' | null;
  clearAll: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  allExpanded: boolean;
  fontScale: number;
  onAdjustFont: (delta: number) => void;
  isLoggedIn: boolean;
  isSyncing: boolean;
  handleSave: () => void;
  goldFilter: 'pitcher' | 'fielder' | null;
  toggleGoldFilter: (type: 'pitcher' | 'fielder') => void;
  activeSkillFilters: string[];
  onToggleSkillFilter: (skill: string | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  showPositionIcon,
  setShowPositionIcon,
  filterRelatedOnly,
  toggleRelatedFilter,
  clearAll,
  onExpandAll,
  onCollapseAll,
  allExpanded,
  fontScale,
  onAdjustFont,
  isLoggedIn,
  isSyncing,
  handleSave,
  goldFilter,
  toggleGoldFilter,
  activeSkillFilters,
  onToggleSkillFilter,
}) => {
  const baseLabelSize = 0.75;
  const baseButtonSize = 0.875;

  const availableGoldSkills = useMemo(() => {
    if (!goldFilter) return [];
    return Object.values(skillsData)
      .filter((s: any) => s.type === 'gold' && s.category === goldFilter)
      .map((s: any) => s.name)
      .sort((a, b) => a.localeCompare(b));
  }, [goldFilter]);

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 px-4 pt-4 pb-8 shadow-sm overflow-visible">
      {/* Top Row: Save/Auth on left, Skills & Clear on right */}
      <div className="flex items-center justify-between gap-1 mb-4">
        {/* Left Side: Save and Auth */}
        <div className="flex items-center gap-1">
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={handleSave}
              disabled={isSyncing}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-sm',
                isLoggedIn ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white',
              )}
            >
              {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            </button>
            <AuthButton />
          </div>
        </div>

        {/* Spacer to push everything else to the right */}
        <div className="flex-1" />

        {/* Right Side: Gold Skills and Clear grouped together */}
        <div className="flex items-center gap-1">
          <button
            data-testid="filter-pitcher-btn"
            onClick={() => toggleGoldFilter('pitcher')}
            style={{ fontSize: `${baseButtonSize * fontScale * 0.9}rem` }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl font-black transition-all uppercase whitespace-nowrap',
              goldFilter === 'pitcher'
                ? 'bg-amber-500 border-amber-500 text-white'
                : 'bg-white border-slate-200 text-black',
            )}
          >
            <Star size={14} fill={goldFilter === 'pitcher' ? 'white' : 'transparent'} /> 投手金特
          </button>
          <button
            data-testid="filter-fielder-btn"
            onClick={() => toggleGoldFilter('fielder')}
            style={{ fontSize: `${baseButtonSize * fontScale * 0.9}rem` }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl font-black transition-all uppercase whitespace-nowrap',
              goldFilter === 'fielder'
                ? 'bg-amber-500 border-amber-500 text-white'
                : 'bg-white border-slate-200 text-black',
            )}
          >
            <Star size={14} fill={goldFilter === 'fielder' ? 'white' : 'transparent'} /> 野手金特
          </button>
          <button
            data-testid="filter-clear-btn"
            onClick={clearAll}
            style={{ fontSize: `${baseButtonSize * fontScale * 0.9}rem` }}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-rose-500 text-white rounded-xl font-black uppercase hover:bg-rose-600 transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <XCircle size={14} /> CLEAR
          </button>
        </div>
      </div>

      {/* Middle Section: Gold Skill List (Enhanced Scrollbar) */}
      {goldFilter && (
        <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="relative bg-slate-50 rounded-xl border-2 border-amber-100 shadow-inner overflow-hidden">
            <div
              className="flex flex-wrap gap-2 p-3 overflow-y-auto max-h-32 
              [&::-webkit-scrollbar]:w-2 
              [&::-webkit-scrollbar-track]:bg-slate-200 
              [&::-webkit-scrollbar-thumb]:bg-slate-400 
              [&::-webkit-scrollbar-thumb]:rounded-full 
              hover:[&::-webkit-scrollbar-thumb]:bg-slate-500"
            >
              <button
                data-testid="all-combos-btn"
                onClick={() => onToggleSkillFilter(null)}
                style={{ fontSize: `${baseButtonSize * fontScale * 0.8}rem` }}
                className={cn(
                  'px-2 py-1.5 rounded-lg font-bold transition-all border-2 uppercase',
                  activeSkillFilters.length === 0
                    ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500',
                )}
              >
                ALL
              </button>
              {availableGoldSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => onToggleSkillFilter(skill)}
                  style={{ fontSize: `${baseButtonSize * fontScale * 0.8}rem` }}
                  className={cn(
                    'px-2 py-1.5 rounded-lg font-bold transition-all border-2',
                    activeSkillFilters.includes(skill)
                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                      : 'bg-white border-slate-100 text-slate-600',
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Row: Controls */}
      <div className="flex flex-nowrap items-center pt-3 border-t border-slate-200/60 gap-2 overflow-visible">
        <button
          data-testid="toggle-position-number-icon-btn"
          onClick={() => setShowPositionIcon(!showPositionIcon)}
          style={{ fontSize: `${baseButtonSize * fontScale * 0.8}rem` }}
          className={cn(
            'flex-shrink-0 px-2 py-2 border-2 rounded-xl font-black transition-all uppercase whitespace-nowrap',
            showPositionIcon
              ? 'bg-white border-slate-200 text-black'
              : 'bg-blue-600 border-blue-600 text-white',
          )}
        >
          {showPositionIcon ? 'POS ICON' : '# Icon'}
        </button>

        <button
          data-testid="owned-or-all-characters-combo-btn"
          onClick={toggleRelatedFilter}
          style={{ fontSize: `${baseButtonSize * fontScale * 0.8}rem` }}
          className={cn(
            'flex-shrink-0 px-2 py-2 border-2 rounded-xl font-black transition-all uppercase whitespace-nowrap',
            filterRelatedOnly
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'bg-white border-slate-200 text-black',
          )}
        >
          {filterRelatedOnly ? 'OWNED' : 'ALL'}
        </button>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 ml-auto flex-shrink-0">
          <button
            data-testid="font-decrease-btn"
            onClick={() => onAdjustFont(-0.1)}
            className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-all"
          >
            <Minus size={12} />
          </button>
          <div
            className="px-1 font-black text-black text-center min-w-[2.5rem]"
            style={{ fontSize: `${baseLabelSize * fontScale}rem` }}
          >
            {Math.round(fontScale * 100)}%
          </div>
          <button
            data-testid="font-increase-btn"
            onClick={() => onAdjustFont(0.1)}
            className="w-7 h-7 flex items-center justify-center hover:bg-white rounded-lg transition-all"
          >
            <Plus size={12} />
          </button>
        </div>

        <button
          data-testid="expand-collapse-toggle-btn"
          onClick={allExpanded ? onCollapseAll : onExpandAll}
          style={{ fontSize: `${baseButtonSize * fontScale * 0.8}rem` }}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-2 bg-slate-100 rounded-xl font-black uppercase text-black hover:bg-slate-200 transition-all whitespace-nowrap"
        >
          {allExpanded ? (
            <>
              <ChevronUp size={14} className="text-blue-600" /> COLLAPSE
            </>
          ) : (
            <>
              <ChevronDown size={14} /> EXPAND
            </>
          )}
        </button>
      </div>
    </header>
  );
};
