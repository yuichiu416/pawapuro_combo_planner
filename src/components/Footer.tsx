import { Bug } from 'lucide-react';
import type React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-slate-200 px-6 py-2 shrink-0">
      <div className="flex flex-row justify-between items-center max-w-full mx-auto">
        {/* Left: Branding & Copy */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-black tracking-tighter text-black uppercase">
            パワプロ 2024-2025 Combo Planner{' '}
            <span className="text-black ml-1 not-font-bold">v1.2.0</span>
          </span>
          <span className="text-black">|</span>
          <p className="text-sm font-bold text-black uppercase tracking-widest">© {currentYear}</p>
        </div>

        {/* Center: Legal Disclaimer (Condensed) */}
        <p className="hidden lg:block text-sm text-black uppercase font-medium tracking-tight">
          Unofficial fan project. Assets property of Konami Digital Entertainment.
        </p>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <a
            href="https://tally.so/r/44jMPB"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-black text-black hover:text-rose-500 transition-colors uppercase group"
          >
            <Bug size={12} className="group-hover:animate-bounce" />
            Report a Bug or Request a Feature
          </a>
          <a
            href="https://github.com/your-username/repo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-black hover:text-black transition-colors"
          ></a>
        </div>
      </div>
    </footer>
  );
};
