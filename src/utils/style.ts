import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns Tailwind classes for a skill "type pill" styled after the actual
 * in-game skill list colors (金特=gold, 青特=blue, 赤特=red, 緑特=green,
 * 青赤特/hybrid=blue-red split — stored as type "normal" in our data).
 */
export function getSkillTypeStyle(type: string | undefined) {
  switch (type) {
    case 'gold':
      return 'bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 border-amber-600 text-amber-950 shadow-sm';
    case 'blue':
      return 'bg-gradient-to-b from-sky-100 via-sky-200 to-sky-400 border-sky-500 text-sky-950';
    case 'red':
      return 'bg-gradient-to-b from-rose-200 via-rose-300 to-rose-500 border-rose-600 text-rose-950';
    case 'green':
      return 'bg-gradient-to-b from-emerald-200 via-emerald-300 to-emerald-500 border-emerald-600 text-emerald-950';
    case 'normal':
      // 青赤特 (blue-red hybrid)
      return 'bg-gradient-to-r from-sky-300 via-violet-200 to-rose-300 border-violet-400 text-slate-900';
    default:
      return 'bg-slate-100 text-black border-slate-200';
  }
}

/** Small legacy badge style (type label only) still used elsewhere. */
export function getSkillTypeBadgeStyle(type: string | undefined) {
  switch (type) {
    case 'gold':
      return 'bg-amber-100 text-amber-700 border-amber-300 shadow-sm';
    case 'blue':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'red':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'green':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-slate-100 text-black border-slate-200';
  }
}
