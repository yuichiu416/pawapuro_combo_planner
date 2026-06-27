import { Bug, Heart } from 'lucide-react';
import type React from 'react';
import { useGameVersion } from '@/contexts/GameVersionContext';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { version } = useGameVersion();

  return (
    <footer className="w-full bg-white border-t border-slate-200 px-6 py-2 shrink-0">
      <div className="flex flex-row justify-between items-center max-w-full mx-auto">
        {/* Left: Branding & Copy */}
        <div className="flex items-center gap-3" data-testid="combo_planner_subtitle">
          <span className="text-sm font-black tracking-tighter text-black uppercase">
            {`パワプロ ${version} コンボプランナー`}
            <span className="text-black ml-1 not-font-bold">v1.2.2</span>
          </span>
          <span className="text-black">|</span>
          <p className="text-sm font-bold text-black uppercase tracking-widest">© {currentYear}</p>
        </div>

        <p
          className="hidden lg:flex items-center gap-2 text-sm text-black uppercase font-medium tracking-tight"
          data-testid="footer-disclaimer"
        >
          <span>Unofficial fan project. Assets property of Konami Digital Entertainment.</span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5 normal-case">
            <Heart size={10} className="text-rose-400 fill-rose-400 shrink-0" />
            <span className="text-slate-400 font-medium text-xs">Special Thanks:</span>
            <a
              href="https://www.youtube.com/@dorami24"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-500 transition-colors font-medium text-xs"
              title="Excel spreadsheet"
            >
              ドラミ
            </a>
            <span className="text-slate-300 text-xs">·</span>
            <a
              href="https://home.gamer.com.tw/black80731"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-500 transition-colors font-medium text-xs"
              title="Character images"
            >
              尼才肆肥熊
            </a>
          </span>
        </p>

        {/* Right: Actions */}
        <div className="flex items-center gap-4" data-testid="footer-report-link">
          <a
            href="https://tally.so/r/44jMPB"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-black text-black hover:text-rose-500 transition-colors uppercase group"
          >
            <Bug size={12} className="group-hover:animate-bounce" />
            不具合報告・機能要望はこちら
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
