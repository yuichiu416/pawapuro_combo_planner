// src/components/SkillListModal.tsx
import { BookOpen, X } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import SkillList from './SkillList';

export const SkillListButton: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <button
        type="button"
        data-testid="skill-list-btn"
        onClick={() => setOpen(true)}
        style={style}
        className="w-full md:w-auto flex items-center justify-center gap-1.5 px-3 py-2 bg-white border-2 border-blue-200 rounded-xl font-black uppercase text-[#0059C1] hover:bg-blue-50 transition-all shadow-sm whitespace-nowrap"
      >
        <BookOpen size={14} strokeWidth={3} />
        {t('ui.skill_list')}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              data-testid="skill-list-modal-overlay"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-[#1e293b]/80 backdrop-blur-md cursor-pointer"
            />
            <div
              data-testid="skill-list-modal"
              className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl border-4 border-[#003D87] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="bg-[#003D87] py-4 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-white font-black tracking-tighter text-xl uppercase italic">
                  <BookOpen size={20} />
                  {t('ui.skill_list')}
                </div>
                <button
                  type="button"
                  data-testid="skill-list-modal-close-btn"
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-[#3b82f6]/40 rounded-full hover:bg-[#3b82f6]/60 transition-colors"
                  aria-label={t('ui.close_modal')}
                >
                  <X size={22} className="text-white" strokeWidth={4} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <SkillList />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
