import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names and merges Tailwind CSS classes safely.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns Tailwind CSS classes based on the skill type.
 * Standard Pawapuro types: blue, gold, red, green.
 */
export const getSkillTypeStyle = (type: string | undefined): string => {
  switch (type) {
    case 'gold':
      // Gold skills (Super Special Abilities)
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/30';
    case 'blue':
      // Regular positive skills
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/30';
    case 'red':
      // Negative skills
      return 'bg-red-50 text-red-700 border-red-200 ring-red-500/30';
    case 'green':
      // Mental/Other skills
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/30';
    default:
      // Unknown or default
      return 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/20';
  }
};