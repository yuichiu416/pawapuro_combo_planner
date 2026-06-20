// src/components/VersionToggle.tsx
import { ChevronDown } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGameVersion } from '@/contexts/GameVersionContext';
import { cn } from '@/utils/style';

export const VersionToggle: React.FC = () => {
  const { version, set, versions } = useGameVersion();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const computePos = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setMenuPos({ top: rect.bottom + 4, left: rect.left });
  }, []);

  const openMenu = () => {
    computePos();
    setIsOpen((prev) => !prev);
  };

  // Reposition on scroll/resize while open so the menu tracks the button.
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('resize', computePos);
    window.addEventListener('scroll', computePos, true);
    return () => {
      window.removeEventListener('resize', computePos);
      window.removeEventListener('scroll', computePos, true);
    };
  }, [isOpen, computePos]);

  return (
    <div className="relative inline-block" data-testid="version-toggle">
      <button
        ref={buttonRef}
        type="button"
        data-testid="version-toggle-button"
        onClick={openMenu}
        className="inline-flex items-center gap-1 rounded-md px-1.5 -mx-1.5 hover:bg-blue-50 active:scale-95 transition-all"
      >
        <span>{version}</span>
        <ChevronDown
          size={16}
          strokeWidth={3}
          className={cn('text-blue-600 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen &&
        menuPos &&
        createPortal(
          <>
            {/* Click-away overlay rendered in body, so fixed positioning is always relative to viewport */}
            <button
              type="button"
              aria-label="Close version menu"
              className="fixed inset-0 z-[9998] cursor-default bg-transparent"
              data-testid="version-toggle-overlay"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="fixed z-[9999] min-w-[8.5rem] bg-white border-2 border-blue-100 rounded-lg shadow-xl overflow-hidden"
              style={{ top: menuPos.top, left: menuPos.left }}
              data-testid="version-toggle-menu"
            >
              {[...versions].reverse().map((v) => (
                <button
                  key={v}
                  type="button"
                  data-testid={`version-toggle-option-${v}`}
                  onClick={() => {
                    setVersion(v);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm font-black tracking-tight transition-colors',
                    v === version
                      ? 'bg-blue-50 text-[#0059C1]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};
