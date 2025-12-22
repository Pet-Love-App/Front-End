/**
 * Theme Tests
 */

import { petLoveLightTheme } from '../pet-love-theme';

describe('Pet Love Theme', () => {
  it('should have correct structure', () => {
    expect(petLoveLightTheme).toBeDefined();
    expect(petLoveLightTheme.background).toBeDefined();
    expect(petLoveLightTheme.color).toBeDefined();
    expect(petLoveLightTheme.borderColor).toBeDefined();
  });

  it('should have valid color values', () => {
    expect(petLoveLightTheme.background).toMatch(/^#|rgba/);
    expect(petLoveLightTheme.color).toMatch(/^#|rgba/);
  });

  it('should have consistent naming convention', () => {
    const keys = Object.keys(petLoveLightTheme);
    const backgroundKeys = keys.filter((k) => k.startsWith('background'));
    const colorKeys = keys.filter((k) => k.startsWith('color'));

    expect(backgroundKeys.length).toBeGreaterThan(0);
    expect(colorKeys.length).toBeGreaterThan(0);
  });
});
