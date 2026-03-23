// src/components/RewardAnalysis.tsx
import React, { useMemo } from 'react';
import { Award, Zap, AlertCircle, MapPin } from 'lucide-react';
import { cn } from '@/utils/style';
import skillsDataRaw from '@/data/skills.json';
import charactersDataRaw from '@/data/characters.json';

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
}

export const RewardAnalysis: React.FC<AnalysisProps> = ({ 
  analysis, 
  getImagePath
}) => {
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

  const goldSkillsCount = skills.filter(s => skillsData[s.name]?.type === 'gold').length;

  return (
    <div className="h-full flex flex-col p-4 pt-2 bg-slate-50 gap-4 overflow-hidden">
      
      {/* ROSTER STATUS */}
      <section className="shrink-0 grid grid-cols-4 gap-1.5">
        {[
          { label: 'Total', val: roster.total + roster.manager, max: '/28', err: roster.errors?.total },
          { label: 'Pitch', val: roster.pitcher, max: '/6-8', err: roster.errors?.pitcher },
          { label: 'Field', val: roster.fielder, max: '/15+', err: roster.errors?.fielder },
          { label: 'Mgr', val: roster.manager, max: '/3', err: roster.errors?.manager },
        ].map((item) => (
          <div 
            key={item.label}
            className={cn(
              "py-1.5 rounded-xl border bg-white flex flex-col items-center justify-center shadow-sm",
              item.err ? "border-rose-400 bg-rose-50 ring-1 ring-rose-100" : "border-slate-200"
            )}
          >
            <span className={cn("text-[9px] font-black uppercase leading-none mb-0.5", item.err ? "text-rose-500" : "text-slate-400")}>
              {item.label}
            </span>
            <span className={cn("text-base font-black italic leading-none", item.err ? "text-rose-600" : "text-slate-800")}>
              {item.val}<span className="text-[9px] font-normal text-slate-300 ml-0.5">{item.max}</span>
            </span>
          </div>
        ))}
      </section>

      {/* STATS SECTION */}
      <section className="shrink-0 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl shadow-sm">
        <div className="flex items-center gap-1.5 mb-2">
          <Zap size={12} className="text-emerald-500 fill-emerald-500" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Total Stats</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {Object.entries(stats).length > 0 ? (
            Object.entries(stats).map(([stat, val]) => (
              <div key={stat} className="flex justify-between items-baseline border-b border-emerald-100/30">
                <span className="text-[10px] font-bold text-slate-500 uppercase truncate">{stat}</span>
                <span className="text-xs font-black text-emerald-700">+{val}</span>
              </div>
            ))
          ) : (
            <p className="col-span-2 text-[10px] text-slate-400 font-bold italic text-center uppercase leading-none">No bonuses</p>
          )}
        </div>
      </section>

      {/* EARNED SKILLS LIST - Taking majority height */}
      <section className="flex-[2] flex flex-col min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-1.5">
            <Award size={14} className="text-blue-500" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">Earned Skills</span>
          </div>
          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full border border-amber-200">
            {goldSkillsCount} 金特
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {sortedSkills.map((skill) => {
            const isGold = skillsData[skill.name]?.type === 'gold';
            return (
              <div 
                key={skill.name} 
                className={cn(
                  "flex justify-between items-center py-1.5 px-2 rounded-lg border transition-all",
                  isGold ? "bg-amber-50 border-amber-100 shadow-sm" : "bg-white border-slate-50"
                )}
              >
                <span className={cn("text-xs font-black pr-2 truncate", isGold ? "text-amber-900" : "text-slate-600")}>
                  {skill.name}
                </span>
                <div className={cn(
                  "px-1.5 py-0.5 text-[9px] font-black rounded-md italic shrink-0",
                  isGold ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400 border border-slate-200/50"
                )}>
                  LV{skill.level}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* VERTICAL MISSING CHARACTERS - Re-adjusted for visibility */}
      {missingCharacters.length > 0 && (
        <section className="flex-1 flex flex-col min-h-0 bg-rose-50/30 border border-rose-100 rounded-2xl overflow-hidden">
          <div className="px-3 py-1.5 bg-rose-50/80 flex items-center justify-between shrink-0 border-b border-rose-100">
            <div className="flex items-center gap-1.5">
              <AlertCircle size={12} className="text-rose-500" />
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-tighter">Missing Characters</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar-rose">
            {missingCharacters.map(char => {
              const charInfo = charactersData[char];
              const mapName = charInfo?.encounter_map || '???';
              return (
                <div key={char} className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-rose-100 shadow-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                      <img 
                        src={getImagePath(char, false)} 
                        alt={char} 
                        className="w-full h-full object-contain scale-110"
                        onError={(e) => (e.currentTarget.src = "/assets/icons_split/placeholder.png")}
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 truncate uppercase tracking-tight">
                      {char}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-100/50 rounded-lg shrink-0 border border-rose-200/40">
                    <MapPin size={8} className="text-rose-500" />
                    <span className="text-[9px] font-black italic text-rose-600 uppercase tracking-tighter">
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