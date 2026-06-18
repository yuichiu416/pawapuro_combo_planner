// src/components/RewardAnalysis.tsx
import { AlertCircle, Award, MapPin, Zap } from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
import skillsDataRaw from '@/data/skills.json';
import type { Character } from '@/types';
import { cn } from '@/utils/style';

const skillsData = skillsDataRaw as Record<string, any>;

interface AnalysisProps {
  analysis: {
    stats: Record<string, number>;
    skills: { name: string; level: number }[];
    missingCharacters: string[];
    roster: {
      pitcher: number;
      fielder: number;
      manager: number;
      total: number;
      errors: Record<string, boolean>;
    };
  };
  charactersData: Record<string, Character>;
  getImagePath: (name: string, usePosIcon: boolean) => string;
  testId: string; // This should be "desktop-reward-analysis" or "mobile-reward-analysis"
  activeSkillFilter: string | null;
  onToggleSkillFilter: (skillName: string) => void;
}

export const RewardAnalysis: React.FC<AnalysisProps> = ({
  analysis,
  charactersData,
  getImagePath,
  testId,
  activeSkillFilter,
  onToggleSkillFilter,
}) => {
  const { stats, skills, missingCharacters, roster } = analysis;

  const sortedSkills = useMemo(() => {
    return [...skills].sort((a, b) => {
      const typeA = skillsData[a.name]?.type || 'normal';
      const typeB = skillsData[b.name]?.type || 'normal';
      const isAGold = typeA === 'gold';
      const isBGold = typeB === 'gold';

      if (isAGold !== isBGold) return isAGold ? -1 : 1;
      if (a.level !== b.level) return b.level - a.level;
      return a.name.localeCompare(b.name);
    });
  }, [skills]);

  const goldSkillsCount = skills.filter((s) => skillsData[s.name]?.type === 'gold').length;

  return (
    <div
      className="h-full flex flex-col p-4 pt-2 bg-slate-50 gap-4 overflow-hidden border-l border-slate-200"
      data-testid={testId}
    >
      {/* 1. ROSTER STATUS */}
      <section
        className="shrink-0 grid grid-cols-4 gap-1.5"
        data-testid={`${testId}-roster-section`}
      >
        {[
          {
            label: 'Total',
            val: roster.total + roster.manager,
            max: '/28',
            err: roster.errors?.total,
          },
          { label: 'Pitch', val: roster.pitcher, max: '/6-8', err: roster.errors?.pitcher },
          { label: 'Field', val: roster.fielder, max: '/15-17', err: roster.errors?.fielder },
          { label: 'Mgr', val: roster.manager, max: '/3', err: roster.errors?.manager },
        ].map((item) => (
          <div
            key={item.label}
            data-testid={`${testId}-roster-card-${item.label.toLowerCase()}`}
            className={cn(
              'py-2 rounded-2xl border bg-white flex flex-col items-center justify-center shadow-sm transition-all',
              item.err ? 'border-rose-300 bg-rose-50 ring-2 ring-rose-100' : 'border-slate-100',
            )}
          >
            <span
              className={cn(
                'text-xs font-black uppercase mb-0.5',
                item.err ? 'text-rose-500' : 'text-black',
              )}
            >
              {item.label}
            </span>
            <div className="flex items-baseline gap-0.5">
              <span
                className={cn(
                  'text-lg font-black tracking-tighter',
                  item.err ? 'text-rose-600' : 'text-slate-900',
                )}
              >
                {item.val}
              </span>
              <span className="text-xs font-bold text-black">{item.max}</span>
            </div>
          </div>
        ))}
      </section>

      {/* 2. TOTAL STATS */}
      <section
        className="shrink-0 p-3 bg-slate-900 rounded-2xl shadow-xl text-white"
        data-testid={`${testId}-stats-section`}
      >
        <div className="flex items-center gap-2 mb-2.5" data-testid={`${testId}-stats-bonus-title`}>
          <Zap size={12} className="text-blue-400 fill-blue-400" />
          <span className="text-xs font-black uppercase tracking-[0.15em] text-blue-100/80">
            Total Attribute Exp
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {Object.entries(stats).length > 0 ? (
            Object.entries(stats).map(([stat, val]) => (
              <div key={stat} className="flex items-center gap-1.5 group">
                <span className="text-sm font-bold text-white/50 uppercase group-hover:text-white/80">
                  {stat}
                </span>
                <span className="text-sm font-black text-blue-400">+{val}</span>
              </div>
            ))
          ) : (
            <p className="text-xs font-black text-white/30 uppercase tracking-widest py-1">
              No active bonuses
            </p>
          )}
        </div>
      </section>

      {/* 3. EARNED SKILLS / COMBO REWARDS */}
      <section
        className="flex-[2] flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        data-testid={`${testId}-combo-reward-section`}
      >
        <div
          className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between shrink-0"
          data-testid={`${testId}-combo-reward`}
        >
          <div className="flex items-center">
            <Award size={14} className="text-blue-600 mr-2" />
            <span className="text-xs font-black text-slate-900 uppercase">Combo rewards</span>
          </div>
          <div className="px-2 py-0.5 bg-amber-400 rounded-full shadow-sm shadow-amber-200">
            <span className="text-xs font-black text-amber-950 uppercase leading-none">
              {goldSkillsCount} 金特
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar">
          {sortedSkills.map((skill) => {
            const isGold = skillsData[skill.name]?.type === 'gold';
            const isActive = activeSkillFilter === skill.name;
            const isOverLimit = skill.level > 5;

            return (
              <button
                key={skill.name}
                data-testid={`${testId}-skill-button-${skill.name}`}
                type="button"
                onClick={() => onToggleSkillFilter(skill.name)}
                className={cn(
                  'w-full flex justify-between items-center py-2 px-3 rounded-xl border transition-all duration-200 group relative shadow-sm',
                  isGold ? 'bg-amber-50/50 border-amber-100' : 'bg-white border-slate-50',
                  'hover:border-blue-200 hover:bg-blue-50/30 hover:translate-x-1',
                  isActive &&
                    'ring-2 ring-blue-500 border-blue-500 bg-blue-50/80 translate-x-1 z-10 shadow-md',
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isGold && (
                    <div
                      className={cn(
                        'w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0',
                        !isActive && 'animate-pulse',
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'text-sm font-black truncate uppercase',
                      isGold ? 'text-amber-900' : 'text-slate-700',
                      isActive ? 'text-blue-700' : 'group-hover:text-blue-600',
                    )}
                  >
                    {skill.name}
                  </span>
                </div>
                <div
                  className={cn(
                    'px-2 py-0.5 text-xs font-black rounded border transition-all',
                    isOverLimit
                      ? 'animate-[bounce_0.5s_ease-in-out_2] border-rose-400 text-rose-600 bg-rose-50'
                      : isGold
                        ? 'bg-amber-500 text-white border-amber-400'
                        : 'bg-slate-100 text-slate-500 border-slate-200/50',
                    isActive &&
                      !isOverLimit &&
                      'bg-blue-600 text-white border-blue-400 scale-110 shadow-blue-200',
                    isActive &&
                      isOverLimit &&
                      'bg-rose-600 text-white border-rose-400 scale-110 shadow-rose-200',
                  )}
                >
                  LV{skill.level}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. MISSING CHARACTERS */}
      {missingCharacters.length > 0 && (
        <section
          className="flex-1 flex flex-col min-h-0 bg-rose-50/20 border border-rose-100 rounded-3xl overflow-hidden"
          data-testid={`${testId}-missing-characters-section`}
        >
          <div className="px-4 py-2 bg-rose-50/50 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-500" />
              <span className="text-xs font-black text-rose-600 uppercase">
                Missing Characters ({missingCharacters.length})
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar-rose">
            {missingCharacters.map((char) => (
              <div
                data-testid={`${testId}-missing-char-row-${char}`}
                key={char}
                className="flex items-center justify-between p-2 bg-white rounded-xl border border-rose-100 shadow-sm hover:scale-[1.02] transition-transform"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                    <img
                      src={getImagePath(char, false)}
                      alt={char}
                      className="w-full h-full object-contain"
                      onError={(e) => (e.currentTarget.src = '/assets/placeholder.png')}
                    />
                  </div>
                  <span className="text-sm font-black text-slate-800 uppercase truncate">
                    {char}
                  </span>
                </div>
                <div
                  data-testid={`${testId}-missing-char-map-${char}`}
                  className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 rounded-lg border border-rose-100"
                >
                  <MapPin size={10} className="text-rose-400" />
                  <span className="text-xs font-black text-rose-500 uppercase">
                    {charactersData[char]?.encounter_map || '???'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
