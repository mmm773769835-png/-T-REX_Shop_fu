import {
  CATEGORIES_WITH_ICONS,
  PRODUCT_CATEGORIES,
  PRODUCT_ATTRIBUTES,
} from '../../shared/constants/productConstants';

describe('CATEGORIES_WITH_ICONS', () => {
  it('should contain 10 categories', () => {
    expect(CATEGORIES_WITH_ICONS).toHaveLength(10);
  });

  it('should have unique ids', () => {
    const ids = CATEGORIES_WITH_ICONS.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have English name, Arabic name, and icon for each entry', () => {
    CATEGORIES_WITH_ICONS.forEach(cat => {
      expect(cat.name.length).toBeGreaterThan(0);
      expect(cat.nameAr.length).toBeGreaterThan(0);
      expect(cat.icon.length).toBeGreaterThan(0);
    });
  });
});

describe('PRODUCT_CATEGORIES', () => {
  it('should have both ar and en arrays', () => {
    expect(Array.isArray(PRODUCT_CATEGORIES.ar)).toBe(true);
    expect(Array.isArray(PRODUCT_CATEGORIES.en)).toBe(true);
  });

  it('should have equal length ar and en arrays', () => {
    expect(PRODUCT_CATEGORIES.ar.length).toBe(PRODUCT_CATEGORIES.en.length);
  });

  it('should have 10 categories in each language', () => {
    expect(PRODUCT_CATEGORIES.en).toHaveLength(10);
    expect(PRODUCT_CATEGORIES.ar).toHaveLength(10);
  });

  it('should include Electronics in English', () => {
    expect(PRODUCT_CATEGORIES.en).toContain('Electronics');
  });
});

describe('PRODUCT_ATTRIBUTES', () => {
  it('should have both ar and en arrays', () => {
    expect(Array.isArray(PRODUCT_ATTRIBUTES.ar)).toBe(true);
    expect(Array.isArray(PRODUCT_ATTRIBUTES.en)).toBe(true);
  });

  it('should have equal length ar and en arrays', () => {
    expect(PRODUCT_ATTRIBUTES.ar.length).toBe(PRODUCT_ATTRIBUTES.en.length);
  });

  it('should include New in English attributes', () => {
    expect(PRODUCT_ATTRIBUTES.en).toContain('New');
  });

  it('should include Used in English attributes', () => {
    expect(PRODUCT_ATTRIBUTES.en).toContain('Used');
  });
});
