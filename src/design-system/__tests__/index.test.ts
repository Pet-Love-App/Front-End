import * as DesignSystem from '../index';

describe('Design System Index', () => {
  it('should export tokens', () => {
    // Colors are exported as scales, not a single 'colors' object
    expect(DesignSystem).toHaveProperty('primaryScale');
    expect(DesignSystem).toHaveProperty('neutralScale');

    expect(DesignSystem).toHaveProperty('spacing');
    // Typography exports might be split
    expect(DesignSystem).toHaveProperty('fontFamily');
    expect(DesignSystem).toHaveProperty('fontSize');

    expect(DesignSystem).toHaveProperty('radius');
    expect(DesignSystem).toHaveProperty('shadows');
    expect(DesignSystem).toHaveProperty('animationPresets');
  });

  it('should export components', () => {
    expect(DesignSystem).toHaveProperty('Button');
    expect(DesignSystem).toHaveProperty('Avatar');
    expect(DesignSystem).toHaveProperty('Input');
    expect(DesignSystem).toHaveProperty('Card');
    expect(DesignSystem).toHaveProperty('Badge');
    expect(DesignSystem).toHaveProperty('Divider');

    // Ingredient components
    expect(DesignSystem).toHaveProperty('CircularScore');
    expect(DesignSystem).toHaveProperty('IngredientTag');
    expect(DesignSystem).toHaveProperty('IngredientAnalysisCard');
  });
});
