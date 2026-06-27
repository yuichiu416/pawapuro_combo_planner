// src/components/SlotSwitcher.tsx
import {
  Check,
  ChevronDown,
  ChevronUp,
  Database,
  Download,
  Edit2,
  Lock,
  Save,
  X,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/utils/style';

interface Slot {
  slot_number: number;
  slot_name: string;
  is_active: boolean;
}

interface SlotSwitcherProps {
  slots: Slot[];
  activeSlotNumber: number;
  onSwitch: (num: number) => void; // This will now act as "Load"
  onSaveToSlot: (num: number) => void; // This will act as "Copy/Save to"
  onRename: (num: number, name: string) => void;
  isSyncing: boolean;
}

export const SlotSwitcher: React.FC<SlotSwitcherProps> = ({
  slots = [],
  activeSlotNumber,
  onSwitch,
  onSaveToSlot,
  onRename,
  isSyncing,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    if (isSyncing) {
      setIsExpanded(false);
      setEditingId(null);
    }
  }, [isSyncing]);

  const activeSlot = slots.find((s) => s.slot_number === activeSlotNumber);
  const activeName = activeSlot?.slot_name || `スロット 0${activeSlotNumber}`;

  const handleRenameSubmit = (num: number) => {
    if (editValue.trim()) {
      onRename(num, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="w-full mb-4 select-none font-bold" data-testid="slot-switcher-container">
      {/* Main Selector Button */}
      <button
        data-testid="slot-switcher-button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between px-4 h-12 rounded-lg border-2 transition-all duration-150 shadow-sm',
          isExpanded
            ? 'bg-[#003D87] border-white text-white ring-4 ring-blue-500/20'
            : 'bg-white border-blue-100 text-[#0059C1] hover:border-blue-400 hover:bg-blue-50/50',
        )}
      >
        <div className="flex items-center gap-3">
          <Database size={18} className={isExpanded ? 'text-blue-300' : 'text-blue-600'} />
          <div className="flex flex-col items-start leading-none text-left">
            <span
              className={cn(
                'text-[10px] uppercase tracking-tighter mb-0.5 font-black',
                isExpanded ? 'text-blue-300/80' : 'text-slate-400',
              )}
            >
              現在のチーム
            </span>
            <span className="text-sm font-black truncate max-w-[140px]">{activeName}</span>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {/* Expandable Menu */}
      {isExpanded && (
        <div className="mt-1 bg-white border-2 border-blue-600 rounded-lg shadow-xl overflow-hidden z-50 relative">
          <div className="p-1 space-y-1">
            {[1, 2, 3].map((num) => {
              const slot = slots.find((s) => s.slot_number === num);
              const isActive = activeSlotNumber === num;
              const isEditing = editingId === num;
              const slotName = slot?.slot_name || `Slot 0${num}`;

              return (
                <div
                  key={num}
                  className={cn(
                    'flex flex-col p-2 rounded-md border transition-colors',
                    isActive
                      ? 'bg-blue-50 border-blue-200'
                      : 'border-transparent hover:bg-slate-50',
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          autoFocus
                          className="flex-1 bg-white text-xs font-bold text-blue-900 px-2 py-1 rounded border border-yellow-400 outline-none"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(num)}
                        />
                        <button
                          onClick={() => handleRenameSubmit(num)}
                          className="text-green-600 p-1"
                        >
                          <Check size={14} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-red-500 p-1">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span
                          className={cn(
                            'text-xs font-black truncate',
                            isActive ? 'text-blue-700' : 'text-slate-600',
                          )}
                        >
                          {slotName}
                        </span>
                        <Edit2
                          size={12}
                          className="text-slate-400 cursor-pointer hover:text-blue-600"
                          onClick={() => {
                            setEditingId(num);
                            setEditValue(slotName);
                          }}
                        />
                      </div>
                    )}
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_4px_#FFC800]" />
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        onSwitch(num);
                        setIsExpanded(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-[#0059C1] text-white text-[10px] font-black hover:bg-[#003D87] transition-colors"
                    >
                      <Download size={10} /> LOAD
                    </button>
                    <button
                      onClick={() => {
                        onSaveToSlot(num);
                        setIsExpanded(false);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded border border-blue-200 text-blue-700 text-[10px] font-black hover:bg-blue-50 transition-colors"
                    >
                      <Save size={10} /> {isActive ? 'SAVE' : 'OVERWRITE'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
