/**
 * R2 Storage Utility Functions
 * Helper functions to generate R2 storage URLs
 */

/**
 * Get the R2 public URL from environment variables
 * @returns {string} R2 public URL or empty string if not configured
 */
export function getR2PublicUrl(): string {
  return import.meta.env.VITE_R2_PUBLIC_URL || '';
}

/**
 * Generate a full R2 URL for a file path
 * @param {string} filePath - File path in R2 (e.g., 'images/banner.jpg' or 'uploads/file.png')
 * @returns {string} Full R2 URL
 */
export function getR2Url(filePath: string): string {
  const baseUrl = getR2PublicUrl();
  if (!baseUrl) {
    // Fallback to local path if R2 is not configured
    return filePath.startsWith('/') ? filePath : `/${filePath}`;
  }
  
  // Remove leading slash from filePath if present
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  
  // Ensure baseUrl doesn't have trailing slash
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  return `${cleanBaseUrl}/${cleanPath}`;
}

/**
 * Get R2 URL for common static assets
 * @param {string} assetName - Asset name (e.g., 'banner.jpg', 'logoo.png')
 * @param {string} folder - Folder in R2 (default: 'images')
 * @returns {string} Full R2 URL
 */
export function getR2AssetUrl(assetName: string, folder: string = 'images'): string {
  return getR2Url(`${folder}/${assetName}`);
}
