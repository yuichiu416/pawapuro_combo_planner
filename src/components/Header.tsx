// src/components/Header.tsx
import { ChevronDown, ChevronUp, Loader2, Minus, Plus, Save, Star, XCircle } from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import skillsData from '@/data/skills.json';
import { cn } from '@/utils/style';
import { AuthButton } from './AuthButton';
import { SkillListButton } from './SkillListModal';

interface HeaderProps {
  showPositionIcon: boolean;
  setShowPositionIcon: (val: boolean) => void;
  filterRelatedOnly: boolean;
  toggleRelatedFilter: () => void;
  toggleAllByType: (type: 'pitcher' | 'fielder') => void;
  typeFilter: 'pitcher' | 'fielder' | null;
  onOpenClearModal: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  allExpanded: boolean;
  fontScale: number;
  onAdjustFont: (delta: number) => void;
  isLoggedIn: boolean;
  isSyncing: boolean;
  handleSave: () => void;
  goldFilter: 'pitcher' | 'fielder' | null;
  toggleGoldFilter: (type: 'pitcher' | 'fielder' | null) => void;
  closeGoldMenu: () => void;
  isGoldMenuOpen: boolean;
  activeSkillFilters: string[];
  onToggleSkillFilter: (skill: string | null) => void;
}

export const Header: React.FC<HeaderProps> = ({
  showPositionIcon,
  setShowPositionIcon,
  filterRelatedOnly,
  toggleRelatedFilter,
  onOpenClearModal,
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
  closeGoldMenu,
  isGoldMenuOpen,
  activeSkillFilters,
  onToggleSkillFilter,
}) => {
  const { t } = useTranslation();
  const baseLabelSize = 0.75;
  const baseButtonSize = 0.875;

  const availableGoldSkills = useMemo(() => {
    if (!goldFilter) return [];
    return Object.entries(skillsData)
      .filter(([, s]: [string, any]) => s.type === 'gold' && s.category === goldFilter)
      .map(([name]) => name)
      .sort((a, b) => a.localeCompare(b));
  }, [goldFilter]);

  const handleCategoryClick = (type: 'pitcher' | 'fielder') => {
    if (goldFilter === type) {
      toggleGoldFilter(null);
    } else {
      toggleGoldFilter(type);
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#E6F0FF] border-b-4 border-blue-900/10 p-3 md:px-4 md:pt-4 md:pb-6 shadow-sm overflow-visible">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        {/* Mobile Top Row */}
        <div className="flex lg:hidden items-center justify-between w-full border-b border-blue-900/5 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSyncing}
              className={cn(
                'flex items-center justify-center w-10 h-10 rounded-xl border-2 border-white transition-all active:scale-95 disabled:opacity-50 shadow-sm shrink-0',
                isLoggedIn ? 'bg-[#0059C1] text-white' : 'bg-slate-800 text-white',
              )}
            >
              {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            </button>
            <AuthButton />
          </div>
          <span className="text-[10px] font-black text-blue-900/30 uppercase tracking-tighter">
            Planner v2.0
          </span>
        </div>

        {/* Gold Skill Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          <button
            data-testid="filter-pitcher-btn"
            onClick={() => handleCategoryClick('pitcher')}
            style={{ fontSize: `${baseButtonSize * fontScale * 0.8}rem` }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl font-black transition-all uppercase whitespace-nowrap shadow-sm shrink-0',
              goldFilter === 'pitcher'
                ? 'bg-[#FF9E00] border-white text-black ring-2 ring-[#FF9E00]'
                : 'bg-white border-blue-200 text-[#0059C1] hover:border-blue-400',
            )}
          >
            <Star
              size={12}
              fill={goldFilter === 'pitcher' ? 'black' : 'transparent'}
              strokeWidth={3}
            />
            {t('filter.gold_pitcher')}
          </button>

          <button
            data-testid="filter-fielder-btn"
            onClick={() => handleCategoryClick('fielder')}
            style={{ fontSize: `${baseButtonSize * fontScale * 0.8}rem` }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 border-2 rounded-xl font-black transition-all uppercase whitespace-nowrap shadow-sm shrink-0',
              goldFilter === 'fielder'
                ? 'bg-[#FF9E00] border-white text-black ring-2 ring-[#FF9E00]'
                : 'bg-white border-blue-200 text-[#0059C1] hover:border-blue-400',
            )}
          >
            <Star
              size={12}
              fill={goldFilter === 'fielder' ? 'black' : 'transparent'}
              strokeWidth={3}
            />
            {t('filter.gold_fielder')}
          </button>

          <button
            data-testid="filter-clear-btn"
            onClick={onOpenClearModal}
            style={{ fontSize: `${baseButtonSize * fontScale * 0.8}rem` }}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#FF2D55] border-2 border-white text-white rounded-xl font-black uppercase hover:bg-[#E60039] transition-all shadow-md active:scale-95 whitespace-nowrap shrink-0"
          >
            <XCircle size={14} strokeWidth={3} /> {t('ui.clear')}
          </button>
        </div>
      </div>

      {/* Gold Skill Selection Menu */}
      {isGoldMenuOpen && goldFilter && (
        <div className="mb-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative bg-[#003D87] rounded-2xl border-4 border-white shadow-xl overflow-hidden">
            <div className="flex flex-wrap gap-2 p-3 overflow-y-auto max-h-40 custom-scrollbar-pawa">
              <button
                data-testid="all-combos-btn"
                onClick={closeGoldMenu}
                style={{ fontSize: `${baseButtonSize * fontScale * 0.8}rem` }}
                className={cn(
                  'px-3 py-1.5 rounded-lg font-black transition-all border-2 uppercase',
                  activeSkillFilters.length === 0
                    ? 'bg-[#FFF200] border-white text-black'
                    : 'bg-white/10 border-white/20 text-blue-200 hover:bg-white/20',
                )}
              >
                {t('ui.all')}
              </button>
              {availableGoldSkills.map((skill) => (
                <button
                  key={skill}
                  data-testid={`gold-combo-btn-${skill}`}
                  onClick={() => onToggleSkillFilter(skill)}
                  style={{ fontSize: `${baseButtonSize * fontScale * 0.8}rem` }}
                  className={cn(
                    'px-3 py-1.5 rounded-lg font-black transition-all border-2',
                    activeSkillFilters.includes(skill)
                      ? 'bg-[#FFF200] border-white text-black shadow-[0_0_10px_rgba(255,242,0,0.5)]'
                      : 'bg-white border-blue-100 text-[#003D87] hover:bg-blue-50',
                  )}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Secondary Controls Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-blue-900/5">
        <button
          data-testid="toggle-position-number-icon-btn"
          onClick={() => setShowPositionIcon(!showPositionIcon)}
          style={{ fontSize: `${baseButtonSize * fontScale * 0.75}rem` }}
          className={cn(
            'px-3 py-2 border-2 rounded-xl font-black transition-all uppercase whitespace-nowrap shadow-sm flex-1 md:flex-none text-center',
            showPositionIcon
              ? 'bg-white border-blue-100 text-[#0059C1]'
              : 'bg-[#0059C1] border-white text-white',
          )}
        >
          {showPositionIcon ? t('ui.pos_icon') : t('ui.number_icon')}
        </button>

        <button
          data-testid="owned-or-all-characters-combo-btn"
          onClick={toggleRelatedFilter}
          style={{ fontSize: `${baseButtonSize * fontScale * 0.75}rem` }}
          className={cn(
            'px-3 py-2 border-2 rounded-xl font-black transition-all uppercase whitespace-nowrap shadow-sm flex-1 md:flex-none text-center',
            filterRelatedOnly
              ? 'bg-emerald-500 border-white text-white'
              : 'bg-white border-blue-100 text-[#0059C1]',
          )}
        >
          {filterRelatedOnly ? t('ui.owned') : t('ui.all')}
        </button>

        {/* Font Control */}
        <div className="flex items-center bg-white p-1 rounded-xl border-2 border-blue-100 shadow-sm shrink-0 ml-auto md:ml-0">
          <button
            data-testid="font-decrease-btn"
            onClick={() => onAdjustFont(-0.1)}
            className="w-7 h-7 flex items-center justify-center hover:bg-blue-50 text-[#0059C1] rounded-lg transition-all"
          >
            <Minus size={12} strokeWidth={3} />
          </button>
          <div
            className="px-1 font-black text-[#003D87] text-center min-w-[2rem]"
            style={{ fontSize: `${baseLabelSize * fontScale}rem` }}
          >
            {Math.round(fontScale * 100)}%
          </div>
          <button
            data-testid="font-increase-btn"
            onClick={() => onAdjustFont(0.1)}
            className="w-7 h-7 flex items-center justify-center hover:bg-blue-50 text-[#0059C1] rounded-lg transition-all"
          >
            <Plus size={12} strokeWidth={3} />
          </button>
        </div>

        {/* Expand/Collapse */}
        <button
          data-testid="expand-collapse-toggle-btn"
          onClick={allExpanded ? onCollapseAll : onExpandAll}
          style={{ fontSize: `${baseButtonSize * fontScale * 0.75}rem` }}
          className="w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-white border-2 border-blue-200 rounded-xl font-black uppercase text-[#0059C1] hover:bg-blue-50 transition-all shadow-sm whitespace-nowrap"
        >
          {allExpanded ? (
            <>
              <ChevronUp size={14} strokeWidth={3} className="text-[#FF9E00]" /> {t('ui.collapse')}
            </>
          ) : (
            <>
              <ChevronDown size={14} strokeWidth={3} /> {t('ui.expand')}
            </>
          )}
        </button>

        <SkillListButton />
      </div>
    </header>
  );
};
