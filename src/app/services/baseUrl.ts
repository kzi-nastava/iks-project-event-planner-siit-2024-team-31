export const baseUrl = 'http://localhost:3308/api/';

/**
 * Utility function to properly join URL paths without double slashes
 * @param base - Base URL
 * @param path - Path to append
 * @returns Properly formatted URL
 */
export function joinUrl(base: string, path: string): string {
  // Remove trailing slash from base
  const cleanBase = base.replace(/\/$/, '');
  // Remove leading slash from path
  const cleanPath = path.replace(/^\//, '');
  // Join with single slash
  return `${cleanBase}/${cleanPath}`;
}
