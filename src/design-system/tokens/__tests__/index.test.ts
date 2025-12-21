import * as tokens from '../index';

describe('Tokens Index', () => {
  it('should export all token modules', () => {
    expect(tokens.primaryScale).toBeDefined(); // from colors
    expect(tokens.sageScale).toBeDefined(); // from brand-colors
    expect(tokens.spacing).toBeDefined(); // from spacing
    expect(tokens.fontSize).toBeDefined(); // from typography
    expect(tokens.radius).toBeDefined(); // from radius
    expect(tokens.shadows).toBeDefined(); // from shadows
    expect(tokens.duration).toBeDefined(); // from animations
  });
});
