// src/components/Header.tsx
import React from 'react';
import { 
  ChevronDown, ChevronUp, 
  CircleDot, UserPlus, 
  ShieldCheck, User, XCircle,
  UserCheck,
  Users // ✨ Added for "Show All" state
} from 'lucide-react';
import { cn } from '@/utils/style';

interface HeaderProps {
  showPositionIcon: boolean;
  setShowPositionIcon: (val: boolean) => void;
  filterRelatedOnly: boolean;
  toggleRelatedFilter: () => void;
  toggleAllByType: (type: 'pitcher' | 'fielder') => void;
  clearAll: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  allExpanded: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  showPositionIcon, 
  setShowPositionIcon,
  filterRelatedOnly,
  toggleRelatedFilter,
  toggleAllByType, 
  clearAll,
  onExpandAll, 
  onCollapseAll, 
  allExpanded
}) => {
  return (
    <header className="space-y-6">
      {/* Top Row: Brand & Main Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
            <CircleDot size={24} />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
            Planner
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black italic text-slate-400 uppercase tracking-widest">
            Select all combos for:
          </span>

          <button 
            onClick={() => toggleAllByType('pitcher')}
            className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm active:scale-95"
          >
            PITCHER
          </button>

          <button 
            onClick={() => toggleAllByType('fielder')}
            className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase hover:border-orange-400 hover:text-orange-600 transition-all shadow-sm active:scale-95"
          >
            FIELDER
          </button>

          <button 
            onClick={clearAll}
            className="flex items-center gap-2 px-5 py-3 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-rose-600 transition-all shadow-md active:scale-95 ml-2"
          >
            <XCircle size={14} /> CLEAR
          </button>
        </div>
      </div>

      {/* Bottom Row: Utility Controls */}
      <div className="flex items-center py-3 px-1 border-t border-slate-200/60 gap-3">
        {/* Toggle 1: Position Icons */}
        <button 
          onClick={() => setShowPositionIcon(!showPositionIcon)} 
          className={cn(
            "px-4 py-2 border-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all uppercase", 
            showPositionIcon 
              ? "bg-white border-slate-200 text-slate-600 hover:border-slate-300" 
              : "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
          )}
        >
          {showPositionIcon ? <ShieldCheck size={14} /> : <User size={14} />} 
          {showPositionIcon ? "POS ICON" : "NO. ICON"}
        </button>

        {/* ✨ Toggle 2: Owned Related Filter & Batch Select */}
        <button 
          onClick={toggleRelatedFilter} 
          className={cn(
            "px-4 py-2 border-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all uppercase", 
            !filterRelatedOnly 
              ? "bg-white border-slate-200 text-slate-600 hover:border-slate-300" 
              : "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200"
          )}
        >
          {filterRelatedOnly ? <Users size={14} /> : <UserCheck size={14} />}
          {filterRelatedOnly ? "SHOW ALL" : "OWNED RELATED"}
        </button>

        {/* Expand/Collapse All */}
        <button 
          onClick={allExpanded ? onCollapseAll : onExpandAll}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:bg-slate-200 transition-all min-w-[140px] justify-center active:scale-95"
        >
          {allExpanded ? (
            <><ChevronUp size={14} className="text-blue-600" /> COLLAPSE ALL</>
          ) : (
            <><ChevronDown size={14} className="text-slate-400" /> EXPAND ALL</>
          )}
        </button>
      </div>
    </header>
  );
};