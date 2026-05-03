// Utility functions for image handling

/**
 * Default product image URL - HTTPS so it loads on Android/iOS
 * (data:image/svg not always supported in React Native Image)
 */
const DEFAULT_PRODUCT_IMAGE_URL = 'https://placehold.co/300x300/e5e5e5/999999?text=Product';

/**
 * Get default product image URL
 */
export const getDefaultProductImage = (): string => {
  return DEFAULT_PRODUCT_IMAGE_URL;
};

/**
 * Get default user image URL
 */
export const getDefaultUserImage = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzAwN2JmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Vc2VyPC90ZXh0Pjwvc3ZnPg==';
};

/**
 * Get default logo image URL
 */
export const getDefaultLogoImage = (): string => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwN2JmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmZmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5UUkVYPC90ZXh0Pjwvc3ZnPg==';
};

/**
 * Check if image URL is valid and replace placeholder.com URLs
 */
export const sanitizeImageUrl = (url: string | undefined | null): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return getDefaultProductImage();
  }
  const trimmed = url.trim();
  if (trimmed.includes('placeholder.com') || trimmed.includes('via.placeholder')) {
    return getDefaultProductImage();
  }
  return trimmed;
};


