// src/components/RewardAnalysis/RewardItem.tsx
import type React from 'react';
import { cn } from '../../utils/style';

interface RewardItemProps {
  skill: string;
  count: number;
  icon: string;
  isActive: boolean;
  onToggle: (skill: string) => void;
  testId?: string;
}

export const RewardItem: React.FC<RewardItemProps> = ({
  skill,
  count,
  icon,
  isActive,
  onToggle,
  testId,
}) => (
  <button
    data-testid={`${testId}-skill-${skill}`}
    onClick={() => onToggle(skill)}
    className={cn(
      'w-full flex items-center justify-between p-2 rounded-xl border transition-all duration-200 group',
      isActive
        ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-[1.02]'
        : 'bg-white border-slate-200 hover:border-slate-300 text-black shadow-sm',
    )}
  >
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'w-10 h-10 rounded-lg border overflow-hidden transition-colors',
          isActive ? 'border-blue-400 bg-white' : 'border-slate-100 bg-slate-50',
        )}
      >
        <img src={icon} alt={skill} className="w-full h-full object-contain p-1" />
      </div>
      <div className="text-left">
        <p className="text-xs font-black uppercase tracking-tight leading-none mb-1">{skill}</p>
        <p
          className={cn(
            'text-[10px] font-bold uppercase',
            isActive ? 'text-blue-100' : 'text-slate-400',
          )}
        >
          Selected
        </p>
      </div>
    </div>
    <div
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-black',
        isActive ? 'bg-white text-blue-600' : 'bg-slate-100 text-black',
      )}
    >
      {count}
    </div>
  </button>
);
