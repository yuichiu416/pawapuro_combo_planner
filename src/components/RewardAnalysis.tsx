// src/components/RewardAnalysis.tsx
import { AlertCircle, Award, MapPin, Zap } from 'lucide-react';
import type React from 'react';
import { useMemo } from 'react';
import charactersDataRaw from '@/data/characters.json';
import skillsDataRaw from '@/data/skills.json';
import { cn } from '@/utils/style';

const skillsData = skillsDataRaw as Record<string, any>;
const charactersData = charactersDataRaw as Record<string, any>;

interface AnalysisProps {
  analysis: {
    stats: Record<string, number>;
    skills: { name: string; level: number }[];
    missingCharacters: string[];
    totalSelectedCombos: number;
    roster: {
      pitcher: number;
      fielder: number;
      manager: number;
      total: number;
      isValid: boolean;
      errors: {
        total: boolean;
        pitcher: boolean;
        fielder: boolean;
        manager: boolean;
      };
    };
  };
  getImagePath: (name: string, usePosIcon: boolean) => string;
  testId: string;
}

export const RewardAnalysis: React.FC<AnalysisProps> = ({ analysis, getImagePath, testId }) => {
  const { stats, skills, missingCharacters, roster } = analysis;

  const sortedSkills = useMemo(() => {
    return [...skills].sort((a, b) => {
      const isAGold = skillsData[a.name]?.type === 'gold';
      const isBGold = skillsData[b.name]?.type === 'gold';
      if (isAGold && !isBGold) return -1;
      if (!isAGold && isBGold) return 1;
      if (a.level !== b.level) return b.level - a.level;
      return a.name.localeCompare(b.name);
    });
  }, [skills]);

  const goldSkillsCount = skills.filter((s) => skillsData[s.name]?.type === 'gold').length;

  return (
    <div className="h-full flex flex-col p-4 pt-2 bg-slate-50 gap-4 overflow-hidden border-l border-slate-200">
      {/* 1. ROSTER STATUS */}
      <section className="shrink-0 grid grid-cols-4 gap-1.5">
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
            className={cn(
              'py-2 rounded-2xl border bg-white flex flex-col items-center justify-center shadow-sm transition-all',
              item.err ? 'border-rose-300 bg-rose-50 ring-2 ring-rose-100' : 'border-slate-100',
            )}
          >
            <span
              className={cn(
                'text-xs font-black uppercase mb-0.5',
                item.err ? 'text-rose-500' : 'text-slate-400',
              )}
            >
              {item.label}
            </span>
            <div className="flex items-baseline gap-0.5">
              <span
                className={cn(
                  'text-lg font-black italic tracking-tighter',
                  item.err ? 'text-rose-600' : 'text-slate-900',
                )}
              >
                {item.val}
              </span>
              <span className="text-xs font-bold text-slate-300">{item.max}</span>
            </div>
          </div>
        ))}
      </section>

      {/* 2. TOTAL STATS */}
      <section className="shrink-0 p-3 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 text-white">
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
                <span className="text-xs font-bold text-white/50 uppercase tracking-tight group-hover:text-white/80 transition-colors">
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

      {/* 3. EARNED SKILLS */}
      <section
        className="flex-[2] flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden foo"
        data-testid={`${testId}-combo-rewards`}
      >
        <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-blue-600" />
            <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
              Combo rewards
            </span>
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
            return (
              <div
                key={skill.name}
                className={cn(
                  'flex justify-between items-center py-2 px-3 rounded-xl border transition-all duration-200',
                  isGold
                    ? 'bg-amber-50/50 border-amber-100 shadow-sm translate-x-1'
                    : 'bg-white border-slate-50 hover:border-slate-200',
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isGold && <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />}
                  <span
                    className={cn(
                      'text-sm font-black truncate uppercase',
                      isGold ? 'text-amber-900' : 'text-slate-700',
                    )}
                  >
                    {skill.name}
                  </span>
                </div>
                <div
                  className={cn(
                    'px-2 py-0.5 text-xs font-black rounded italic shrink-0 shadow-sm',
                    isGold
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-200/50',
                  )}
                >
                  LV{skill.level}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. MISSING CHARACTERS */}
      {missingCharacters.length > 0 && (
        <section className="flex-1 flex flex-col min-h-0 bg-rose-50/20 border border-rose-100 rounded-3xl overflow-hidden">
          <div className="px-4 py-2 bg-rose-50/50 flex items-center justify-between shrink-0 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-rose-500" />
              <span className="text-sm font-black text-rose-600 uppercase tracking-tight">
                Missing Targets ({missingCharacters.length})
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 custom-scrollbar-rose">
            {missingCharacters.map((char) => {
              const charInfo = charactersData[char];
              const mapName = charInfo?.encounter_map || '???';
              return (
                <div
                  key={char}
                  data-testid={`missing-char-row-${char}`}
                  className="flex items-center justify-between p-2 bg-white rounded-xl border border-rose-100 shadow-sm hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                      <img
                        src={getImagePath(char, false)}
                        alt={char}
                        className="w-full h-full object-contain"
                        onError={(e) =>
                          (e.currentTarget.src = '/assets/icons_split/placeholder.png')
                        }
                      />
                    </div>
                    <span className="text-sm font-black text-slate-800 uppercase truncate">
                      {char}
                    </span>
                  </div>
                  <div
                    data-testid={`missing-char-map-${char}`}
                    className="flex items-center gap-1.5 px-2 py-1 bg-rose-50 rounded-lg border border-rose-100"
                  >
                    <MapPin size={10} className="text-rose-400" />
                    <span className="text-xs font-black text-rose-500 uppercase italic">
                      {mapName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
