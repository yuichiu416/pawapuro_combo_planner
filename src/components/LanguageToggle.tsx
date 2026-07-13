// src/components/LanguageToggle.tsx
import { Languages } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import i18n, { STORAGE_KEY } from '@/i18n/config';
import { cn } from '@/utils/style';

const LANGUAGES = [
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'English' },
  { code: 'zh', label: '繁體中文' },
] as const;

type LangCode = (typeof LANGUAGES)[number]['code'];

export const LanguageToggle: React.FC = () => {
  const { i18n: i18nInstance } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const currentLang = LANGUAGES.find(l => l.code === i18nInstance.language) ?? LANGUAGES[0];

  const computePos = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setMenuPos({ top: rect.bottom + 4, left: rect.left });
  }, []);

  const openMenu = () => {
    computePos();
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('resize', computePos);
    window.addEventListener('scroll', computePos, true);
    return () => {
      window.removeEventListener('resize', computePos);
      window.removeEventListener('scroll', computePos, true);
    };
  }, [isOpen, computePos]);

  const switchLanguage = (code: LangCode) => {
    i18n.changeLanguage(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" data-testid="language-toggle">
      <button
        ref={buttonRef}
        type="button"
        data-testid="language-toggle-btn"
        onClick={openMenu}
        className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 hover:bg-blue-50 active:scale-95 transition-all text-sm font-black text-slate-700"
      >
        <Languages size={13} className="text-blue-600" />
        <span>{currentLang.label}</span>
      </button>

      {isOpen && menuPos && createPortal(
        <>
          <button
            type="button"
            aria-label="言語メニューを閉じる"
            className="fixed inset-0 z-[9998] cursor-default bg-transparent"
            data-testid="language-toggle-overlay"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="fixed z-[9999] min-w-[9rem] bg-white border-2 border-blue-100 rounded-lg shadow-xl overflow-hidden"
            style={{ top: menuPos.top, left: menuPos.left }}
            data-testid="language-toggle-menu"
          >
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                type="button"
                data-testid={`language-option-${lang.code}`}
                onClick={() => switchLanguage(lang.code)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm font-bold transition-colors',
                  lang.code === i18nInstance.language
                    ? 'bg-blue-50 text-[#0059C1]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700',
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </>,
        document.body,
      )}
    </div>
  );
};
