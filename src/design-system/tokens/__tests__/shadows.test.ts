import { shadowPresets, createShadow, shadows } from '../shadows';
import { Platform } from 'react-native';

describe('Shadow Tokens', () => {
  describe('shadowPresets', () => {
    it('should have correct presets', () => {
      expect(shadowPresets.none).toBeDefined();
      expect(shadowPresets.md).toBeDefined();
      expect(shadowPresets.xxl).toBeDefined();
    });

    it('should have correct values for md preset', () => {
      expect(shadowPresets.md).toEqual({
        offsetX: 0,
        offsetY: 4,
        blur: 6,
        opacity: 0.1,
        elevation: 4,
        color: '#000',
      });
    });
  });

  describe('createShadow', () => {
    it('should create shadow style for iOS (default)', () => {
      // Mock Platform.OS to 'ios'
      Platform.OS = 'ios';
      const style = createShadow('md');
      expect(style).toEqual({
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      });
    });

    it('should create shadow style for Android', () => {
      // Mock Platform.OS to 'android'
      Platform.OS = 'android';
      const style = createShadow('md');
      expect(style).toEqual({
        elevation: 4,
        shadowColor: '#000',
      });
      // Reset Platform.OS
      Platform.OS = 'ios';
    });

    it('should support custom color', () => {
      Platform.OS = 'ios';
      const style = createShadow('md', '#FF0000');
      expect(style).toEqual({
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      });
    });
  });

  describe('shadows', () => {
    it('should have pre-generated shadow styles', () => {
      expect(shadows.none).toBeDefined();
      expect(shadows.md).toBeDefined();
      expect(shadows.xxl).toBeDefined();
    });
  });
});
