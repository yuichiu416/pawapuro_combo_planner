import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSkillTypeStyle(type: string | undefined) {
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
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}