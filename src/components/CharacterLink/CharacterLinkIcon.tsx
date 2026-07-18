// src/components/CharacterLink/CharacterLinkIcon.tsx
import { ArrowRight, ChevronsRight, Link2 } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { LinkData } from '@/types';
import { getLocalizedSkillName } from '@/utils/skills';
import { STAT_I18N_KEY, type StatKey } from '@/utils/stats';
import { cn } from '../../utils/style';

interface CharacterLinkIconProps {
  name: string;
  link: LinkData | undefined;
  children: React.ReactNode;
  className?: string;
}

const TOOLTIP_WIDTH = 288; // w-72

const SkillChip: React.FC<{ name: string; level?: number; gold?: boolean }> = ({
  name,
  level,
  gold,
}) => {
  const { i18n } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-black border-2 uppercase tracking-tight',
        gold
          ? 'bg-[#FFF200] border-[#E6D900] text-[#003D87]'
          : 'bg-white border-blue-100 text-blue-800',
      )}
    >
      {getLocalizedSkillName(name, i18n.language)}
      {level != null && <span className="opacity-40">Lv{level}</span>}
    </span>
  );
};

/**
 * Wraps an existing character-icon element (unchanged) with hover-triggered
 * コツコツリンク tooltip behavior. Renders children as-is with no visual
 * change when the character has no link data -- per design decision, there
 * is no persistent "has a link" indicator, only the on-hover reveal.
 *
 * The tooltip is portaled to document.body and positioned via
 * getBoundingClientRect (same pattern as VersionToggle/LanguageToggle),
 * because it's used inside containers that have overflow-hidden for
 * unrelated reasons (e.g. ComboCard's outer card) -- an in-flow
 * absolutely-positioned tooltip gets silently clipped by those ancestors
 * no matter what z-index it has, since overflow:hidden clips regardless
 * of stacking order.
 *
 * NOTE: condition text (link.condition) is free-form Japanese sourced
 * directly from the master sheet, with no per-language counterpart the way
 * skill names have skills_en.json/skills_zh.json -- it always renders in
 * Japanese regardless of the active language. Flagged as a known gap, not
 * silently "fixed" here since translating ~400 condition sentences is its
 * own scoped task.
 */
export const CharacterLinkIcon: React.FC<CharacterLinkIconProps> = ({
  name,
  link,
  children,
  className,
}) => {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const computePos = useCallback(() => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centered = rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2;
    const clamped = Math.min(Math.max(centered, 8), window.innerWidth - TOOLTIP_WIDTH - 8);
    setPos({ top: rect.bottom + 8, left: clamped });
  }, []);

  useEffect(() => {
    if (!hovered) return;
    computePos();
    window.addEventListener('resize', computePos);
    window.addEventListener('scroll', computePos, true);
    return () => {
      window.removeEventListener('resize', computePos);
      window.removeEventListener('scroll', computePos, true);
    };
  }, [hovered, computePos]);

  const { t } = useTranslation();

  return (
    <div
      ref={wrapperRef}
      className={cn('relative inline-block', className)}
      data-testid={`character-link-icon-${name}`}
      onMouseEnter={() => link && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}

      {link &&
        hovered &&
        pos &&
        createPortal(
          <div
            data-testid={`link-tooltip-${name}`}
            className="fixed z-[9999] w-72 rounded-2xl border-2 border-[#0059C1] bg-white p-3 text-left shadow-xl"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="mb-2 flex items-center gap-1.5">
              <Link2 size={12} strokeWidth={3} className="text-[#0059C1]" />
              <span className="text-xs font-black uppercase tracking-widest text-[#003D87]">
                {t('link.title')}
              </span>
            </div>

            {link.format === 'descriptive' ? (
              <DescriptiveContent name={name} link={link} />
            ) : link.upgrades.length > 0 ? (
              <UpgradeContent name={name} link={link} />
            ) : (
              <AmbiguousContent name={name} link={link} />
            )}

            {Object.keys(link.stats).length > 0 && (
              <p
                data-testid={`link-tooltip-stats-${name}`}
                className="mt-2 text-xs font-bold text-slate-500"
              >
                {Object.entries(link.stats)
                  .map(
                    ([stat, val]) =>
                      `${t(`stats.${STAT_I18N_KEY[stat as StatKey] ?? stat}`)}+${val}`,
                  )
                  .join(' ')}
              </p>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

const UpgradeContent: React.FC<{ name: string; link: LinkData }> = ({ name, link }) => (
  <>
    {link.condition && (
      <p
        data-testid={`link-tooltip-condition-${name}`}
        className="mb-2 text-xs font-bold text-slate-700"
      >
        {link.condition}
      </p>
    )}
    <div className="space-y-1.5">
      {link.upgrades.map((up, idx) => (
        <div key={`${up.from.name}-${up.to.name}`} className="flex items-center gap-1.5">
          <span data-testid={`link-upgrade-${idx}-from`}>
            <SkillChip name={up.from.name} level={up.from.level} />
          </span>
          <ChevronsRight size={14} strokeWidth={3} className="shrink-0 text-[#FF9E00]" />
          <span data-testid={`link-upgrade-${idx}-to`}>
            <SkillChip name={up.to.name} gold />
          </span>
        </div>
      ))}
    </div>
  </>
);

/** Granted side has an `or`-alternative group -- can't confidently pair
 * granted[i] with prerequisite[i], so show "need one of / get one of"
 * instead of a false 1:1 arrow. */
const AmbiguousContent: React.FC<{ name: string; link: LinkData }> = ({ name, link }) => {
  const { t } = useTranslation();
  return (
    <>
      {link.condition && (
        <p
          data-testid={`link-tooltip-condition-${name}`}
          className="mb-2 text-xs font-bold text-slate-700"
        >
          {link.condition}
        </p>
      )}
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-1" data-testid={`link-tooltip-needed-${name}`}>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {t('link.needed')}
          </p>
          {link.prerequisite_skills.map((p) => (
            <div key={p.name}>
              <SkillChip name={p.name} level={p.level} />
            </div>
          ))}
        </div>
        <ArrowRight size={14} strokeWidth={3} className="mt-4 shrink-0 text-slate-300" />
        <div className="flex-1 space-y-1" data-testid={`link-tooltip-granted-${name}`}>
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            {t('link.granted')}
          </p>
          {link.granted_skills.map((g) =>
            Array.isArray(g) ? (
              <div key={g.join('/')} className="flex flex-wrap gap-1">
                {g.map((alt) => (
                  <SkillChip key={alt} name={alt} gold />
                ))}
              </div>
            ) : (
              <div key={g}>
                <SkillChip name={g} gold />
              </div>
            ),
          )}
        </div>
      </div>
    </>
  );
};

const DescriptiveContent: React.FC<{ name: string; link: LinkData }> = ({ name, link }) => (
  <div className="flex flex-wrap gap-1" data-testid={`link-tooltip-groups-${name}`}>
    {(link.skill_groups ?? []).map((group, gi) =>
      group.map((skill) => <SkillChip key={skill} name={skill} gold={gi === 0} />),
    )}
  </div>
);
