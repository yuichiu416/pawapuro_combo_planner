import React from 'react';
import { Target, TrendingUp, Award, Zap } from 'lucide-react';

interface AnalysisProps {
  analysis: {
    stats: Record<string, number>;
    skills: { name: string; level: number }[];
    missingCharacters: string[];
    achievableCombos?: number; 
    totalSelectedCombos: number;
  };
}

export const RewardAnalysis: React.FC<AnalysisProps> = ({ analysis }) => {
  const stats = analysis?.stats ?? {};
  const skills = analysis?.skills ?? [];
  const missingChars = analysis?.missingCharacters ?? [];
  const activeCount = analysis?.achievableCombos ?? 0;
  const totalTargets = analysis?.totalSelectedCombos ?? 0;

  return (
    <aside data-testid="analysis-panel" className="w-80 bg-white border-l border-slate-200 p-8 flex flex-col gap-8 shadow-2xl">
      <div className="space-y-1">
        <h2 className="text-2xl font-black italic uppercase flex items-center gap-2">
          <TrendingUp className="text-blue-600" /> Analysis
        </h2>
      </div>

      <div className="grid gap-4">
        <div className="p-5 bg-slate-50 rounded-3xl border-2 border-slate-100">
          <div className="flex items-center gap-3 mb-2">
            <Target size={18} className="text-blue-500" />
            <span className="text-xs font-black text-slate-500 uppercase">Combo Status</span>
          </div>
          <div className="text-3xl font-black italic">
            {activeCount > 0 ? 'Active' : 'Inactive'}
          </div>
          <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
            From {totalTargets} Targets
          </p>
        </div>

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

        <div className="p-5 bg-blue-50 rounded-3xl border-2 border-blue-100">
          <div className="flex items-center gap-3 mb-2">
            <Award size={18} className="text-blue-500" />
            <span className="text-xs font-black text-blue-500 uppercase">Active Skills</span>
          </div>
          <div className="space-y-2 mt-2">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <div key={skill.name} className="flex justify-between items-center bg-white p-2 rounded-xl border border-blue-100 shadow-sm">
                  <span className="text-xs font-black text-slate-700">{skill.name}</span>
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-black rounded-lg">
                    LV {skill.level}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-slate-400 font-bold italic text-center">No active skills</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">
          Missing Characters ({missingChars.length})
        </h3>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex flex-wrap gap-2">
            {missingChars.map(char => (
              <span key={char} className="px-3 py-1.5 bg-rose-50 border-2 border-rose-100 rounded-xl text-[10px] font-black text-rose-600 uppercase">
                {char}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};