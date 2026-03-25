// src/components/MobileDrawer.tsx

import { X } from 'lucide-react';
import type React from 'react';
import { cn } from '@/utils/style';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
  testId?: string;
  titleTestId?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  side = 'left',
  testId,
  titleTestId,
}) => {
  const isLeft = side === 'left';

  return (
    <div
      data-testid={`${testId}-overlay`}
      className={cn(
        'lg:hidden fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300',
        isOpen ? 'opacity-100 visible' : 'opacity-0 invisible',
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          'absolute top-0 h-full w-[90%] max-w-sm bg-white shadow-2xl transition-transform duration-300 flex flex-col',
          isLeft ? 'left-0' : 'right-0',
          isOpen ? 'translate-x-0' : isLeft ? '-translate-x-full' : 'translate-x-full',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center shrink-0">
          <span
            data-testid={titleTestId || `${testId}-title`}
            className="font-black uppercase tracking-tighter text-lg"
          >
            {title}
          </span>
          <button
            data-testid={`${testId}-close-btn`}
            onClick={onClose}
            className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
