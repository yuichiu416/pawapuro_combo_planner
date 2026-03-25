// src/components/MobileNavigation.tsx

import { BarChart3, List, Users } from 'lucide-react';
import type React from 'react';
import { cn } from '@/utils/style';

type TabType = 'roster' | 'planner' | 'analysis';

interface MobileNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav
      data-testid="mobile-navbar"
      className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-md border-t border-slate-200 z-[90] flex items-center justify-around px-6 pb-2"
    >
      <MobileNavBtn
        active={activeTab === 'roster'}
        onClick={() => onTabChange('roster')}
        icon={<Users size={22} />}
        label="Library"
      />
      <MobileNavBtn
        active={activeTab === 'planner'}
        onClick={() => onTabChange('planner')}
        icon={<List size={22} />}
        label="Planner"
      />
      <MobileNavBtn
        active={activeTab === 'analysis'}
        onClick={() => onTabChange('analysis')}
        icon={<BarChart3 size={22} />}
        label="Analysis"
      />
    </nav>
  );
};

const MobileNavBtn = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    data-testid={`mobile-nav-${label.toLowerCase().replace(/\s+/g, '-')}-btn`}
    onClick={onClick}
    className={cn(
      'flex flex-col items-center gap-1 transition-all duration-300',
      active ? 'text-blue-600 scale-110' : 'text-black',
    )}
  >
    <div
      className={cn('p-2 rounded-xl transition-colors', active ? 'bg-blue-50' : 'bg-transparent')}
    >
      {icon}
    </div>
    <span className="text-xs font-black uppercase tracking-wider">{label}</span>
  </button>
);
