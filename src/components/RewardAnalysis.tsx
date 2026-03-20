// src/components/RewardAnalysis.tsx
import React from 'react';
import { TrendingUp, Award, Zap, AlertCircle, CheckCircle2, UserCheck } from 'lucide-react';
import { cn } from '@/utils/style';
import skillsDataRaw from '@/data/skills.json';

const skillsData = skillsDataRaw as Record<string, any>;

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
}

export const RewardAnalysis: React.FC<AnalysisProps> = ({ analysis }) => {
  const { stats, skills, missingCharacters, roster } = analysis;

  return (
    <div className="p-8 flex flex-col gap-8 animate-in fade-in duration-300">
      {/* 1. HEADER */}
      <div className="shrink-0">
        <h2 className="text-2xl font-black italic uppercase flex items-center gap-2 whitespace-nowrap">
          <TrendingUp className="text-blue-600" /> Analysis
        </h2>
      </div>

      <div className="flex-1 flex flex-col gap-8 min-h-0">
        
        {/* 2. ROSTER STATUS */}
        <div className={cn(
          "p-5 rounded-3xl border-2 transition-all duration-500 relative overflow-hidden",
          roster.isValid 
            ? "bg-slate-50 border-slate-100" 
            : "bg-rose-50 border-rose-200 shadow-[0_0_15px_rgba(225,29,72,0.1)]"
        )}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                {roster.isValid ? (
                  <CheckCircle2 size={14} className="text-emerald-500" />
                ) : (
                  <AlertCircle size={14} className="text-rose-500" />
                )}
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Roster</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  "text-3xl font-black italic tabular-nums leading-none",
                  roster.errors?.total ? "text-rose-600 animate-pulse" : "text-slate-900"
                )}>
                  {roster.total}
                </span>
                <span className="text-slate-300 font-bold text-sm">/ 25</span>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Managers</span>
              <div className={cn(
                "px-3 py-1 rounded-2xl flex items-center gap-2 border transition-all",
                roster.errors?.manager 
                  ? "bg-rose-600 border-rose-700 text-white" 
                  : "bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-200"
              )}>
                <UserCheck size={12} />
                <span className="text-sm font-black italic">{roster.manager} / 3</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={cn(
              "p-3 rounded-2xl border transition-all",
              roster.errors?.pitcher ? "bg-rose-100 border-rose-200" : "bg-white border-slate-200/60"
            )}>
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Pitchers</span>
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  "font-black italic text-xl",
                  roster.errors?.pitcher ? "text-rose-600" : "text-slate-800"
                )}>
                  {roster.pitcher}
                </span>
                <span className="text-[9px] font-bold text-slate-300 uppercase">6-8</span>
              </div>
            </div>

            <div className={cn(
              "p-3 rounded-2xl border transition-all",
              roster.errors?.fielder ? "bg-rose-100 border-rose-200" : "bg-white border-slate-200/60"
            )}>
              <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Fielders</span>
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  "font-black italic text-xl",
                  roster.errors?.fielder ? "text-rose-600" : "text-slate-800"
                )}>
                  {roster.fielder}
                </span>
                <span className="text-[9px] font-bold text-slate-300 uppercase">15-17</span>
              </div>
            </div>
          </div>

          {!roster.isValid && (
            <div className="mt-4 pt-3 border-t border-rose-100">
              <p className="text-[9px] font-black text-rose-500 uppercase italic leading-tight">
                {roster.errors?.total ? "⚠️ Exceeded roster limit" : "⚠️ Check requirements"}
              </p>
            </div>
          )}
        </div>

        {/* 3. TOTAL STATS */}
        <div className="p-5 bg-emerald-50 rounded-3xl border-2 border-emerald-100">
          <div className="flex items-center gap-3 mb-2">
            <Zap size={18} className="text-emerald-500" />
            <span className="text-xs font-black text-emerald-500 uppercase">Total Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {Object.entries(stats).length > 0 ? (
              Object.entries(stats).map(([stat, val]) => (
                <div key={stat} className="text-xs font-black">
                  <span className="text-slate-400 mr-1">{stat.toUpperCase()}</span>
                  <span className="text-emerald-700">+{val}</span>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-[10px] text-slate-400 font-bold italic text-center">No stats</p>
            )}
          </div>
        </div>

        {/* 4. ACTIVE SKILLS */}
        <div className="p-5 bg-blue-50 rounded-3xl border-2 border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <Award size={18} className="text-blue-500" />
            <span className="text-xs font-black text-blue-500 uppercase">Active Skills</span>
          </div>
          <div className="space-y-2 mt-2 overflow-y-auto max-h-48 pr-1 custom-scrollbar">
            {skills.length > 0 ? (
              skills.map((skill) => {
                const isGold = skillsData[skill.name]?.type === 'gold';
                return (
                  <div 
                    key={skill.name} 
                    className={cn(
                      "flex justify-between items-center p-2 rounded-xl border transition-all shadow-sm",
                      isGold ? "bg-amber-50 border-amber-200 shadow-amber-100/50" : "bg-white border-blue-100"
                    )}
                  >
                    <span className={cn("text-xs font-black truncate mr-2", isGold ? "text-amber-900" : "text-slate-700")}>
                      {skill.name}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 text-[10px] font-black rounded-lg border shrink-0 transition-colors",
                      isGold ? "bg-amber-500 border-amber-600 text-white" : "bg-blue-600 border-blue-700 text-white"
                    )}>
                      LV {skill.level}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-[10px] text-slate-400 font-bold italic text-center">No active skills</p>
            )}
          </div>
        </div>

        {/* 5. MISSING CHARACTERS */}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">
            Missing Characters ({missingCharacters.length})
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-wrap gap-2 pb-4">
              {missingCharacters.map(char => (
                <span key={char} className="px-3 py-1.5 bg-rose-50 border-2 border-rose-100 rounded-xl text-[10px] font-black text-rose-600 uppercase">
                  {char}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};