import React from 'react';
import { Target, TrendingUp, Award, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  collapsed?: boolean;
}

export const RewardAnalysis: React.FC<AnalysisProps> = ({ analysis, collapsed }) => {
  const { stats, skills, missingCharacters, roster } = analysis;

  return (
    <aside 
      data-testid="analysis-panel" 
      className={cn(
        "h-full bg-white border-l border-slate-200 flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-0 overflow-hidden border-l-0" : "w-80 p-8 gap-8 shadow-2xl"
      )}
    >
      {/* 1. HEADER */}
      <div className="w-64 shrink-0">
        <h2 className="text-2xl font-black italic uppercase flex items-center gap-2 whitespace-nowrap">
          <TrendingUp className="text-blue-600" /> Analysis
        </h2>
      </div>

      {!collapsed && (
        <div className="flex-1 flex flex-col gap-8 min-h-0 animate-in fade-in duration-300">
          
          {/* 2. ROSTER STATUS (The Updated Section) */}
          <div className={cn(
            "p-5 rounded-3xl border-2 transition-all duration-500",
            roster.isValid 
              ? "bg-slate-50 border-slate-100" 
              : "bg-rose-50 border-rose-200 shadow-[0_0_15px_rgba(225,29,72,0.1)]"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {roster.isValid ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <AlertCircle size={18} className="text-rose-500" />
                )}
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Scouting Roster</span>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-full text-[12px] font-black italic transition-colors",
                roster.errors.total ? "bg-rose-600 text-white animate-bounce" : "bg-slate-900 text-white"
              )}>
                {roster.total} / 25
              </div>
            </div>

            <div className="space-y-3">
              {/* Pitchers Count */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pitchers (投)</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-black italic text-lg transition-colors",
                    roster.errors.pitcher ? "text-rose-600" : "text-slate-800"
                  )}>
                    {roster.pitcher}
                  </span>
                  <span className="text-[9px] font-bold text-slate-300 uppercase">Req: 6-8</span>
                </div>
              </div>

              {/* Fielders Count */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Fielders (野)</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-black italic text-lg transition-colors",
                    roster.errors.fielder ? "text-rose-600" : "text-slate-800"
                  )}>
                    {roster.fielder}
                  </span>
                  <span className="text-[9px] font-bold text-slate-300 uppercase">Req: 15-17</span>
                </div>
              </div>

              {/* Managers Count */}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Managers (マ)</span>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-black italic text-lg transition-colors",
                    roster.errors.manager ? "text-rose-600" : "text-slate-800"
                  )}>
                    {roster.manager}
                  </span>
                  <span className="text-[9px] font-bold text-slate-300 uppercase">Max: 3</span>
                </div>
              </div>
            </div>

            {!roster.isValid && (
              <div className="mt-4 pt-3 border-t border-rose-100">
                <p className="text-[10px] font-black text-rose-500 uppercase italic leading-tight">
                  ⚠️ Invalid Roster configuration
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

          {/* 4. ACTIVE SKILLS (GOLD ROW HIGHLIGHT) */}
          <div className="p-5 bg-blue-50 rounded-3xl border-2 border-blue-100">
            <div className="flex items-center gap-3 mb-2">
              <Award size={18} className="text-blue-500" />
              <span className="text-xs font-black text-blue-500 uppercase">Active Skills</span>
            </div>
            <div className="space-y-2 mt-2">
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
      )}
    </aside>
  );
};