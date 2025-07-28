import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to conditionally join CSS class names together
 * Combines clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Composes CSS module classes with Tailwind classes
 * @param moduleClasses - CSS module classes object
 * @param moduleKeys - Keys from the CSS module to apply
 * @param tailwindClasses - Additional Tailwind classes
 * @returns Combined class string
 */
export function composeClasses(
  moduleClasses: { [key: string]: string },
  moduleKeys: string[],
  tailwindClasses?: string
): string {
  const moduleClassString = moduleKeys
    .map(key => moduleClasses[key])
    .filter(Boolean)
    .join(' ');
  
  return cn(moduleClassString, tailwindClasses);
}

/**
 * Creates conditional CSS module classes
 * @param moduleClasses - CSS module classes object
 * @param conditions - Object with class keys and boolean conditions
 * @returns Array of class names that meet the conditions
 */
export function conditionalClasses(
  moduleClasses: { [key: string]: string },
  conditions: { [key: string]: boolean }
): string[] {
  return Object.entries(conditions)
    .filter(([_, condition]) => condition)
    .map(([key, _]) => moduleClasses[key])
    .filter(Boolean);
} 