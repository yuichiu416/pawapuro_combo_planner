import React from 'react';
import { Bug } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white border-t border-slate-200 px-6 py-2 shrink-0">
      <div className="flex flex-row justify-between items-center max-w-full mx-auto">
        
        {/* Left: Branding & Copy */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-black tracking-tighter text-slate-900 uppercase">
            Pawapuro Planner <span className="text-slate-400 ml-1 not-italic font-bold">v1.2.0</span>
          </span>
          <span className="text-slate-200">|</span>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            © {currentYear}
          </p>
        </div>

        {/* Center: Legal Disclaimer (Condensed) */}
        <p className="hidden lg:block text-sm text-slate-400 uppercase font-medium tracking-tight">
          Unofficial fan project. Assets property of Konami Digital Entertainment.
        </p>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <a 
            href="https://tally.so/r/44jMPB"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-black text-slate-600 hover:text-rose-500 transition-colors uppercase italic group"
          >
            <Bug size={12} className="group-hover:animate-bounce" />
            Report a Bug or Request a Feature
          </a>
          <a 
            href="https://github.com/your-username/repo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-900 transition-colors"
          >
          </a>
        </div>

      </div>
    </footer>
  );
};