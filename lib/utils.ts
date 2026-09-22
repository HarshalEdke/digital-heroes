import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins class names and resolves Tailwind conflicts so that later
 * overrides always win (e.g. `bg-white` replacing a variant's
 * `bg-brand-600`). Without twMerge the cascade order decides, which
 * produced invisible button text.
 */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes));
}
