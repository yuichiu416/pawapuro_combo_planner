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
  activeSkillFilters: string[]; // Changed to array
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

  // Extract available gold skills based on the current goldFilter category
  const availableGoldSkills = useMemo(() => {
    if (!goldFilter) return [];
    return Object.values(skillsData)
      .filter((s: any) => s.type === 'gold' && s.category === goldFilter)
      .map((s: any) => s.name)
      .sort((a, b) => a.localeCompare(b));
  }, [goldFilter]);

  return (
    <header className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <div className="flex lg:hidden items-center gap-2">
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

        <div className="flex items-center gap-2 md:gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <button
              data-testid="filter-button-pitcher"
              onClick={() => toggleGoldFilter('pitcher')}
              style={{ fontSize: `${baseButtonSize * fontScale}rem` }}
              className={cn(
                'flex items-center gap-1.5 px-3 md:px-4 py-2 border-2 rounded-xl font-black transition-all uppercase',
                goldFilter === 'pitcher'
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-white border-slate-200 text-black',
              )}
            >
              <Star size={14} fill={goldFilter === 'pitcher' ? 'white' : 'transparent'} /> 投手金特
            </button>
            <button
              data-testid="filter-button-fielder"
              onClick={() => toggleGoldFilter('fielder')}
              style={{ fontSize: `${baseButtonSize * fontScale}rem` }}
              className={cn(
                'flex items-center gap-1.5 px-3 md:px-4 py-2 border-2 rounded-xl font-black transition-all uppercase',
                goldFilter === 'fielder'
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : 'bg-white border-slate-200 text-black',
              )}
            >
              <Star size={14} fill={goldFilter === 'fielder' ? 'white' : 'transparent'} /> 野手金特
            </button>
          </div>
          <button
            data-testid="filter-button-clear"
            onClick={clearAll}
            style={{ fontSize: `${baseButtonSize * fontScale}rem` }}
            className="flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-rose-500 text-white rounded-2xl font-black uppercase hover:bg-rose-600 transition-all shadow-md active:scale-95"
          >
            <XCircle size={14} /> CLEAR
          </button>
        </div>
      </div>

      {/* Gold Skill Selection List */}
      {goldFilter && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-wrap gap-2 p-3 bg-white rounded-2xl border-2 border-amber-100 shadow-sm">
            <button
              onClick={() => onToggleSkillFilter(null)}
              style={{ fontSize: `${baseButtonSize * fontScale * 0.9}rem` }}
              className={cn(
                'px-3 py-1.5 rounded-lg font-bold transition-all border-2 uppercase',
                activeSkillFilters.length === 0
                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200',
              )}
            >
              ALL
            </button>
            {availableGoldSkills.map((skill) => (
              <button
                key={skill}
                onClick={() => onToggleSkillFilter(skill)}
                style={{ fontSize: `${baseButtonSize * fontScale * 0.9}rem` }}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-bold transition-all border-2',
                  activeSkillFilters.includes(skill)
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300',
                )}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center py-3 px-1 border-t border-slate-200/60 gap-3">
        <button
          data-testid="filter-label-position-icon"
          onClick={() => setShowPositionIcon(!showPositionIcon)}
          style={{ fontSize: `${baseButtonSize * fontScale}rem` }}
          className={cn(
            'px-3 md:px-4 py-2 border-2 rounded-xl font-black transition-all uppercase',
            showPositionIcon
              ? 'bg-white border-slate-200 text-black'
              : 'bg-blue-600 border-blue-600 text-white',
          )}
        >
          {showPositionIcon ? 'POSITION ICON' : '# Icon'}
        </button>

        <button
          data-testid="filter-button-all"
          onClick={toggleRelatedFilter}
          style={{ fontSize: `${baseButtonSize * fontScale}rem` }}
          className={cn(
            'px-3 md:px-4 py-2 border-2 rounded-xl font-black transition-all uppercase',
            filterRelatedOnly
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'bg-white border-slate-200 text-black',
          )}
        >
          {filterRelatedOnly ? 'OWNED RELATED' : 'ALL COMBOS'}
        </button>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 ml-auto">
          <button
            onClick={() => onAdjustFont(-0.1)}
            aria-label="Decrease font size"
            className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all"
          >
            <Minus size={14} />
          </button>
          <div
            className="px-2 font-black text-black text-center"
            style={{ fontSize: `${baseLabelSize * fontScale}rem` }}
          >
            {Math.round(fontScale * 100)}%
          </div>
          <button
            onClick={() => onAdjustFont(0.1)}
            aria-label="Increase font size"
            className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all"
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          data-testid="expand-all-button"
          onClick={allExpanded ? onCollapseAll : onExpandAll}
          style={{ fontSize: `${baseButtonSize * fontScale}rem` }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl font-black uppercase text-black hover:bg-slate-200 transition-all active:scale-95"
        >
          {allExpanded ? (
            <>
              <ChevronUp size={14} className="text-blue-600" /> COLLAPSE ALL
            </>
          ) : (
            <>
              <ChevronDown size={14} /> EXPAND ALL
            </>
          )}
        </button>
      </div>
    </header>
  );
};
