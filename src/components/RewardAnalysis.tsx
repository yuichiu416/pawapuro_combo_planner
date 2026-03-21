// src/components/RewardAnalysis.tsx
import React from 'react';
import { TrendingUp, Award, Zap, AlertCircle } from 'lucide-react';
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
    <div className="h-full flex flex-col p-6 bg-slate-50 gap-4 overflow-hidden">
      {/* 1. HEADER (Title Only) */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-xl font-black italic uppercase flex items-center gap-2 text-slate-800 tracking-tight">
          <TrendingUp className="text-blue-600 w-5 h-5" /> Analysis
        </h2>
      </div>

      {/* 2. ROSTER STATUS */}
      <section className="shrink-0 grid grid-cols-4 gap-2">
        {[
          { label: 'Total', val: roster.total, max: '/25', err: roster.errors?.total },
          { label: 'Pitch', val: roster.pitcher, max: '/6-8', err: roster.errors?.pitcher },
          { label: 'Field', val: roster.fielder, max: '/15+', err: roster.errors?.fielder },
          { label: 'Mgr', val: roster.manager, max: '/3', err: roster.errors?.manager },
        ].map((item) => (
          <div 
            key={item.label}
            className={cn(
              "p-2 rounded-2xl border bg-white flex flex-col items-center justify-center transition-colors",
              item.err ? "border-rose-400 bg-rose-50" : "border-slate-200"
            )}
          >
            <span className={cn("text-[9px] font-black uppercase leading-none mb-1", item.err ? "text-rose-500" : "text-slate-400")}>
              {item.label}
            </span>
            <span className={cn("text-lg font-black italic leading-none", item.err ? "text-rose-600" : "text-slate-800")}>
              {item.val}<span className="text-[10px] font-normal text-slate-300 ml-0.5">{item.max}</span>
            </span>
          </div>
        ))}
      </section>

      {/* 3. TOTAL STATS */}
      <section className="shrink-0 p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Stats</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(stats).length > 0 ? (
            Object.entries(stats).map(([stat, val]) => (
              <div key={stat} className="flex justify-between items-baseline border-b border-emerald-100/30 pb-0.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{stat}</span>
                <span className="text-xs font-black text-emerald-700">+{val}</span>
              </div>
            ))
          ) : (
            <p className="col-span-2 text-[9px] text-slate-400 font-bold italic text-center py-1">No active stat bonuses</p>
          )}
        </div>
      </section>

      {/* 4. ACTIVE SKILLS */}
      <section className="flex-grow flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-blue-500" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Active Skills</span>
          </div>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-black rounded-lg">
            {skills.length}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {skills.length > 0 ? (
            skills.map((skill) => {
              const isGold = skillsData[skill.name]?.type === 'gold';
              return (
                <div 
                  key={skill.name} 
                  className={cn(
                    "flex justify-between items-center p-3 rounded-xl border transition-all",
                    isGold ? "bg-amber-50 border-amber-200" : "bg-white border-slate-100"
                  )}
                >
                  <span className={cn("text-xs font-black truncate pr-2", isGold ? "text-amber-900" : "text-slate-700")}>
                    {skill.name}
                  </span>
                  <div className={cn(
                    "px-2 py-1 text-[10px] font-black rounded-lg border shrink-0 italic tracking-tighter",
                    isGold ? "bg-amber-500 border-amber-600 text-white" : "bg-blue-600 border-blue-700 text-white"
                  )}>
                    LV{skill.level}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30 py-10">
              <Award size={40} className="mb-2 text-slate-400" />
              <p className="text-[10px] font-black uppercase italic text-slate-500">No Skills Active</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. MISSING CHARACTERS */}
      {missingCharacters.length > 0 && (
        <section className="shrink-0 p-3 bg-rose-50 border border-rose-100 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className="text-rose-500" />
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">Missing for Combos</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {missingCharacters.map(char => (
              <span key={char} className="px-2 py-0.5 bg-white border border-rose-200 rounded-lg text-[9px] font-black text-rose-500 uppercase">
                {char}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};