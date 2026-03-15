// src/components/Header.tsx
import React from 'react';
import { LayoutDashboard, ShieldCheck, User, Trophy, UserPlus, XCircle } from 'lucide-react';
import { cn } from '../utils/style';

interface HeaderProps {
  showPositionIcon: boolean;
  setShowPositionIcon: (val: boolean) => void;
  toggleAllByType: (type: 'pitcher' | 'fielder') => void;
  clearAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  showPositionIcon, setShowPositionIcon, toggleAllByType, clearAll 
}) => (
  <header className="flex justify-between items-end">
    <h1 className="text-4xl font-black italic uppercase flex items-center gap-4">
      <LayoutDashboard size={40} className="text-blue-600" /> Planner
    </h1>
    <div className="flex gap-3">
      <button 
        onClick={() => setShowPositionIcon(!showPositionIcon)} 
        className={cn(
          "px-5 py-2.5 border-2 rounded-2xl text-[11px] font-black flex items-center gap-2 transition-all", 
          showPositionIcon ? "bg-white border-slate-200 text-slate-600" : "bg-blue-600 border-blue-600 text-white"
        )}
      >
        {showPositionIcon ? <ShieldCheck size={14} /> : <User size={14} />} 
        {showPositionIcon ? "POS ICON" : "NO. ICON"}
      </button>
      <button onClick={() => toggleAllByType('pitcher')} className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black hover:border-blue-400 flex items-center gap-2 transition-all">
        <Trophy size={14} className="text-blue-500" /> PITCHER
      </button>
      <button onClick={() => toggleAllByType('fielder')} className="px-5 py-2.5 bg-white border-2 border-slate-200 rounded-2xl text-[11px] font-black hover:border-orange-400 flex items-center gap-2 transition-all">
        <UserPlus size={14} className="text-orange-500" /> FIELDER
      </button>
      <button onClick={clearAll} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[11px] font-black flex items-center gap-2 transition-all">
        <XCircle size={14} /> CLEAR
      </button>
    </div>
  </header>
);