import { CATEGORIES, SUB_CATEGORIES } from '../../shared/constants/categories';

describe('CATEGORIES', () => {
  it('should contain 10 top-level categories', () => {
    expect(CATEGORIES).toHaveLength(10);
  });

  it('should have unique ids', () => {
    const ids = CATEGORIES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have non-empty name and icon for every entry', () => {
    CATEGORIES.forEach(cat => {
      expect(cat.name.length).toBeGreaterThan(0);
      expect(cat.icon.length).toBeGreaterThan(0);
    });
  });

  it('should include key categories', () => {
    const names = CATEGORIES.map(c => c.name);
    expect(names).toContain('Electronics');
    expect(names).toContain('Clothing');
    expect(names).toContain('Books');
  });
});

describe('SUB_CATEGORIES', () => {
  it('should contain at least 12 sub-categories', () => {
    expect(SUB_CATEGORIES.length).toBeGreaterThanOrEqual(12);
  });

  it('should have unique ids', () => {
    const ids = SUB_CATEGORIES.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should reference valid category ids', () => {
    const categoryIds = new Set(CATEGORIES.map(c => c.id));
    SUB_CATEGORIES.forEach(sub => {
      expect(categoryIds.has(sub.categoryId)).toBe(true);
    });
  });

  it('should have non-empty names', () => {
    SUB_CATEGORIES.forEach(sub => {
      expect(sub.name.length).toBeGreaterThan(0);
    });
  });
});
