import * as Components from '../index';

describe('Design System Components Index', () => {
  it('should export all components', () => {
    const expectedExports = [
      'Button',
      'Input',
      'Card',
      'Badge',
      'Avatar',
      'Divider',
      'CircularScore',
      'IngredientTag',
      'IngredientAnalysisCard',
    ];

    expectedExports.forEach((componentName) => {
      expect(Components).toHaveProperty(componentName);
    });
  });
});
