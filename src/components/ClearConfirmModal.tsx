// src/components/ClearConfirmModal.tsx

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Trash2, X } from 'lucide-react';
import type React from 'react';
import { useTranslation } from 'react-i18next';

interface ClearConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ClearConfirmModal: React.FC<ClearConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
          {/* Darker backdrop with blur */}
          <motion.div
            data-testid="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1e293b]/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            data-testid="modal-container"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-[380px] bg-white rounded-[2rem] border-[10px] border-[#003D87] overflow-hidden shadow-2xl"
          >
            {/* Dark Navy Header */}
            <div className="bg-[#003D87] pt-4 pb-3 px-6 flex items-center justify-between">
              <div
                data-testid="modal-title"
                className="flex items-center gap-2 text-white font-black tracking-tighter text-xl uppercase italic"
              >
                <div className="bg-[#FFF200] rounded-full p-0.5">
                  <AlertCircle size={18} className="text-[#003D87]" fill="currentColor" />
                </div>
                {t('ui.attention')}
              </div>
              <button
                data-testid="modal-close-btn"
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-[#3b82f6]/40 rounded-full hover:bg-[#3b82f6]/60 transition-colors"
                aria-label={t('ui.close_modal')}
              >
                <X size={24} className="text-white" strokeWidth={4} />
              </button>
            </div>

            {/* Content Section */}
            <div className="px-10 py-10 flex flex-col items-center">
              {/* Red Outlined Trash Icon */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-50 rounded-2xl rotate-6" />
                <div className="relative w-20 h-20 bg-white border-[3px] border-[#FF2D55] rounded-2xl flex items-center justify-center">
                  <Trash2 size={40} className="text-[#FF2D55]" strokeWidth={2.5} />
                </div>
              </div>

              <h3 className="text-[28px] font-black text-[#003D87] uppercase leading-none mb-4 tracking-tighter italic">
                {t('ui.reset_roster_title')}
              </h3>
              <p className="text-[#475569] font-bold text-center text-lg leading-tight mb-8">
                {t('ui.reset_roster_body')}
              </p>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-4">
                {/* 3D Red Wipe Button */}
                <button
                  data-testid="modal-confirm-btn"
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="group relative w-full h-16 active:translate-y-1 transition-all"
                >
                  <span className="absolute inset-0 bg-[#B3002D] rounded-2xl translate-y-2" />
                  <span className="absolute inset-0 bg-[#FF2D55] rounded-2xl flex items-center justify-center text-white font-black text-xl tracking-wider border-2 border-white/20 uppercase italic">
                    {t('ui.confirm_wipe')}
                  </span>
                </button>

                {/* Light Blue/Grey Cancel Button */}
                <button
                  data-testid="modal-cancel-btn"
                  onClick={onClose}
                  className="w-full h-14 bg-[#e2e8f0] text-[#64748b] rounded-2xl font-black text-lg tracking-wider border-b-4 border-[#cbd5e1] active:border-b-0 active:translate-y-1 transition-all uppercase italic"
                >
                  {t('ui.cancel_wipe')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
