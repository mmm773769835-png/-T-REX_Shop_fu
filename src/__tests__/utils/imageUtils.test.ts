import {
  getDefaultProductImage,
  getDefaultUserImage,
  getDefaultLogoImage,
  sanitizeImageUrl,
} from '../../utils/imageUtils';

describe('imageUtils', () => {
  describe('getDefaultProductImage', () => {
    it('should return a placehold.co URL', () => {
      const url = getDefaultProductImage();
      expect(url).toBe('https://placehold.co/300x300/e5e5e5/999999?text=Product');
    });
  });

  describe('getDefaultUserImage', () => {
    it('should return a base64 SVG data URI', () => {
      const url = getDefaultUserImage();
      expect(url).toMatch(/^data:image\/svg\+xml;base64,/);
    });
  });

  describe('getDefaultLogoImage', () => {
    it('should return a base64 SVG data URI', () => {
      const url = getDefaultLogoImage();
      expect(url).toMatch(/^data:image\/svg\+xml;base64,/);
    });
  });

  describe('sanitizeImageUrl', () => {
    it('should return the URL as-is for a valid HTTPS URL', () => {
      const url = 'https://example.com/image.png';
      expect(sanitizeImageUrl(url)).toBe(url);
    });

    it('should return default image for null', () => {
      expect(sanitizeImageUrl(null)).toBe(getDefaultProductImage());
    });

    it('should return default image for undefined', () => {
      expect(sanitizeImageUrl(undefined)).toBe(getDefaultProductImage());
    });

    it('should return default image for empty string', () => {
      expect(sanitizeImageUrl('')).toBe(getDefaultProductImage());
    });

    it('should return default image for whitespace-only string', () => {
      expect(sanitizeImageUrl('   ')).toBe(getDefaultProductImage());
    });

    it('should replace placeholder.com URLs with default', () => {
      expect(sanitizeImageUrl('https://placeholder.com/150')).toBe(getDefaultProductImage());
    });

    it('should replace via.placeholder URLs with default', () => {
      expect(sanitizeImageUrl('https://via.placeholder.com/200')).toBe(getDefaultProductImage());
    });

    it('should trim whitespace from valid URLs', () => {
      expect(sanitizeImageUrl('  https://example.com/img.jpg  ')).toBe('https://example.com/img.jpg');
    });
  });
});
