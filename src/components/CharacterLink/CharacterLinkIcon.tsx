// src/components/CharacterLink/CharacterLinkIcon.tsx
import { ArrowRight, ChevronsRight, Link2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { LinkData } from '@/types';
import { cn } from '../../utils/style';

interface CharacterLinkIconProps {
  name: string;
  link: LinkData | undefined;
  children: React.ReactNode;
  className?: string;
}

const SkillChip: React.FC<{ name: string; level?: number; gold?: boolean }> = ({
  name,
  level,
  gold,
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-black border-2 uppercase tracking-tight',
      gold
        ? 'bg-[#FFF200] border-[#E6D900] text-[#003D87]'
        : 'bg-white border-blue-100 text-blue-800',
    )}
  >
    {name}
    {level != null && <span className="opacity-40">Lv{level}</span>}
  </span>
);

/**
 * Wraps an existing character-icon element (unchanged) with hover-triggered
 * コツコツリンク tooltip behavior. Renders children as-is with no visual
 * change when the character has no link data -- per design decision, there
 * is no persistent "has a link" indicator, only the on-hover reveal.
 */
export const CharacterLinkIcon: React.FC<CharacterLinkIconProps> = ({
  name,
  link,
  children,
  className,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn('relative inline-block', className)}
      data-testid={`character-link-icon-${name}`}
      onMouseEnter={() => link && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}

      {link && hovered && (
        <div
          data-testid={`link-tooltip-${name}`}
          className="absolute left-1/2 top-full z-50 mt-2 w-72 -translate-x-1/2 rounded-2xl border-2 border-[#0059C1] bg-white p-3 text-left shadow-xl"
        >
          <div className="mb-2 flex items-center gap-1.5">
            <Link2 size={12} strokeWidth={3} className="text-[#0059C1]" />
            <span className="text-xs font-black uppercase tracking-widest text-[#003D87]">
              コツコツリンク
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
                .map(([stat, val]) => `${stat}+${val}`)
                .join(' ')}
            </p>
          )}
        </div>
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
const AmbiguousContent: React.FC<{ name: string; link: LinkData }> = ({ name, link }) => (
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
          必要（いずれか）
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
          獲得（役割で決定）
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

const DescriptiveContent: React.FC<{ name: string; link: LinkData }> = ({ name, link }) => (
  <div className="flex flex-wrap gap-1" data-testid={`link-tooltip-groups-${name}`}>
    {(link.skill_groups ?? []).map((group, gi) =>
      group.map((skill) => <SkillChip key={skill} name={skill} gold={gi === 0} />),
    )}
  </div>
);
