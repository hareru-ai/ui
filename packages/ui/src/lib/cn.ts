import { type ClassValue, clsx } from 'clsx';

/** Merge class names using clsx (no tailwind-merge — semantic CSS doesn't need it) */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
