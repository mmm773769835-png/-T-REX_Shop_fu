import { COLORS, THEME } from '../../shared/constants/colors';

describe('COLORS', () => {
  it('should contain all expected color keys', () => {
    const expectedKeys = [
      'primary', 'secondary', 'success', 'danger', 'warning',
      'info', 'light', 'dark', 'white', 'black',
      'gray', 'grayLight', 'grayDark',
    ];
    expectedKeys.forEach(key => {
      expect(COLORS).toHaveProperty(key);
    });
  });

  it('should have valid hex color values', () => {
    const hexRegex = /^#[0-9a-fA-F]{6}$/;
    Object.values(COLORS).forEach(value => {
      expect(value).toMatch(hexRegex);
    });
  });

  it('should have white as #ffffff', () => {
    expect(COLORS.white).toBe('#ffffff');
  });

  it('should have black as #000000', () => {
    expect(COLORS.black).toBe('#000000');
  });
});

describe('THEME', () => {
  it('should have light and dark variants', () => {
    expect(THEME).toHaveProperty('light');
    expect(THEME).toHaveProperty('dark');
  });

  it('should have background, text, cardBackground, border in light theme', () => {
    expect(THEME.light).toHaveProperty('background');
    expect(THEME.light).toHaveProperty('text');
    expect(THEME.light).toHaveProperty('cardBackground');
    expect(THEME.light).toHaveProperty('border');
  });

  it('should have background, text, cardBackground, border in dark theme', () => {
    expect(THEME.dark).toHaveProperty('background');
    expect(THEME.dark).toHaveProperty('text');
    expect(THEME.dark).toHaveProperty('cardBackground');
    expect(THEME.dark).toHaveProperty('border');
  });

  it('should use white background for light theme', () => {
    expect(THEME.light.background).toBe(COLORS.white);
  });

  it('should use dark background for dark theme', () => {
    expect(THEME.dark.background).toBe(COLORS.dark);
  });

  it('should use contrasting text colors', () => {
    expect(THEME.light.text).toBe(COLORS.black);
    expect(THEME.dark.text).toBe(COLORS.white);
  });
});
