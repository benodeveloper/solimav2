import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for combining Tailwind CSS classes.
 * @param inputs - The classes to combine.
 * @returns The combined classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns the extension for a given MIME type.
 * @param mimeType - The MIME type to check.
 * @returns The file extension with a leading dot.
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'video/mp4': '.mp4',
    'video/mpeg': '.mpeg',
    'video/ogg': '.ogv',
    'video/webm': '.webm',
  };
  return mimeMap[mimeType] || '.jpg';
}
