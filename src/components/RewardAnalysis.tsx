import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';
import { cn } from '@/utils/style';

interface Props {
  analysis: {
    pitchers: number;
    fielders: number;
    managers: number;
    skills: Array<{ name: string; level: number; isGold: boolean; category: string }>;
  };
}

export const RewardAnalysis: React.FC<Props> = ({ analysis }) => {
  return (
    <aside 
      data-testid="analysis-panel" 
      className="w-[420px] bg-slate-900 p-10 flex flex-col text-white shadow-2xl"
    >
      <h3 className="text-amber-500 text-xs font-black tracking-widest uppercase mb-10 italic flex items-center gap-2">
        <Sparkles size={16} /> Master Rewards
      </h3>
      
      <div className="grid grid-cols-3 gap-4 mb-12">
        <StatBox label="Pitch" val={analysis.pitchers} testId="stat-pitchers" />
        <StatBox label="Field" val={analysis.fielders} testId="stat-fielders" />
        <StatBox label="マ" val={analysis.managers} testId="stat-managers" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
        {analysis.skills.map((skill) => (
          <div 
            key={skill.name} 
            data-testid={`skill-item-${skill.name}`}
            className={cn(
              "flex items-center justify-between p-5 rounded-3xl border-l-8 transition-all duration-300",
              skill.isGold 
                ? "bg-gradient-to-br from-amber-600/40 via-amber-900/20 to-slate-900 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                : "bg-slate-800/50 border-slate-700"
            )}
          >
            <div className="flex items-center gap-4">
              {skill.isGold && <Trophy size={20} className="text-amber-400" />}
              <div>
                <p 
                  data-testid="skill-name"
                  className={cn("font-black tracking-tight", skill.isGold ? "text-amber-100 text-xl" : "text-white text-base")}
                >
                  {skill.name}
                </p>
                <p className="text-[10px] text-slate-500 font-black uppercase">{skill.category}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-black mr-1 uppercase text-blue-400">Lv</span>
              <span 
                data-testid="skill-level"
                className={cn("text-3xl font-black italic", skill.isGold ? "text-amber-400" : "text-white")}
              >
                {skill.level}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

const StatBox = ({ label, val, testId }: { label: string, val: number, testId?: string }) => (
  <div 
    data-testid={testId}
    className="bg-slate-800/50 p-4 rounded-2xl border-2 border-slate-800 text-center"
  >
    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">{label}</p>
    <p className="text-2xl font-black">{val}</p>
  </div>
);