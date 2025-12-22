import { duration, easing, springConfig } from '../animations';
import { Easing } from 'react-native';

describe('Animation Tokens', () => {
  describe('duration', () => {
    it('should have correct duration values', () => {
      expect(duration.instant).toBe(0);
      expect(duration.fastest).toBe(50);
      expect(duration.normal).toBe(200);
      expect(duration.slowest).toBe(500);
      expect(duration.skeleton).toBe(1500);
    });
  });

  describe('easing', () => {
    it('should have correct easing functions', () => {
      expect(easing.linear).toBeDefined();
      expect(easing.easeIn).toBeDefined();
      expect(easing.bounce).toBeDefined();
    });

    it('should map to React Native Easing functions', () => {
      expect(easing.linear).toBe(Easing.linear);
      expect(easing.easeIn).toBe(Easing.ease);
      expect(easing.bounce).toBe(Easing.bounce);
    });
  });

  describe('springConfig', () => {
    it('should have gentle spring configuration', () => {
      expect(springConfig.gentle).toEqual({
        damping: 20,
        mass: 1,
        stiffness: 100,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      });
    });
  });
});
