// src/components/RewardAnalysis/index.tsx
import type React from 'react';
import { RewardItem } from './RewardItem';

interface RewardAnalysisProps {
  analysis: any;
  getImagePath: (name: string, usePos: boolean) => string;
  activeSkillFilter: string | null;
  onToggleSkillFilter: (skill: string) => void;
  testId?: string;
}

export const RewardAnalysis: React.FC<RewardAnalysisProps> = ({
  analysis,
  getImagePath,
  activeSkillFilter,
  onToggleSkillFilter,
  testId = 'reward-analysis',
}) => {
  const sortedSkills = Object.entries(analysis?.totalRewards || {}).sort(
    ([, a], [, b]) => (b as number) - (a as number),
  );

  return (
    <div className="p-4 space-y-6" data-testid={testId}>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-black uppercase tracking-widest">
            Reward Summary
          </h3>
          <span className="text-xs font-black bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 uppercase">
            {sortedSkills.length} Skills
          </span>
        </div>

        <div className="grid gap-2">
          {sortedSkills.map(([skill, count]) => (
            <RewardItem
              key={skill}
              skill={skill}
              count={count as number}
              icon={getImagePath(skill, false)}
              isActive={activeSkillFilter === skill}
              onToggle={onToggleSkillFilter}
              testId={testId}
            />
          ))}

          {sortedSkills.length === 0 && (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                No rewards analyzed
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
