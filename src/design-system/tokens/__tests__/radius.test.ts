import { radius, semanticRadius, componentRadius } from '../radius';

describe('Radius Tokens', () => {
  describe('radius', () => {
    it('should have correct values', () => {
      expect(radius[0]).toBe(0);
      expect(radius[4]).toBe(8);
      expect(radius.full).toBe(9999);
    });
  });

  describe('semanticRadius', () => {
    it('should map to radius values', () => {
      expect(semanticRadius.none).toBe(radius[0]);
      expect(semanticRadius.md).toBe(radius[4]);
      expect(semanticRadius.full).toBe(radius.full);
    });
  });

  describe('componentRadius', () => {
    it('should have correct component mappings', () => {
      expect(componentRadius.button.md).toBe(radius[4]);
      expect(componentRadius.button.pill).toBe(radius.full);
      expect(componentRadius.card.md).toBe(radius[6]);
      expect(componentRadius.input).toBe(radius[4]);
    });
  });
});
