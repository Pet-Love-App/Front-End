import { Platform } from 'react-native';
import { Fonts, Colors } from '../theme';
import { Colors as UnifiedColors } from '../colors';

describe('theme', () => {
  it('should export Colors matching UnifiedColors', () => {
    expect(Colors).toBe(UnifiedColors);
  });

  describe('Fonts', () => {
    it('should have correct structure', () => {
      expect(Fonts).toBeDefined();
      expect(Fonts.sans).toBeDefined();
      expect(Fonts.serif).toBeDefined();
      expect(Fonts.rounded).toBeDefined();
      expect(Fonts.mono).toBeDefined();
    });

    it('should return iOS fonts when Platform.OS is ios', () => {
      jest.resetModules();
      jest.doMock('react-native', () => ({
        Platform: {
          select: jest.fn((objs) => objs.ios),
          OS: 'ios',
        },
      }));

      const { Fonts: IOSFonts } = require('../theme');

      expect(IOSFonts.sans).toBe('system-ui');
      expect(IOSFonts.serif).toBe('ui-serif');
      expect(IOSFonts.rounded).toBe('ui-rounded');
      expect(IOSFonts.mono).toBe('ui-monospace');
    });

    it('should return web fonts when Platform.OS is web', () => {
      jest.resetModules();
      jest.doMock('react-native', () => ({
        Platform: {
          select: jest.fn((objs) => objs.web),
          OS: 'web',
        },
      }));

      const { Fonts: WebFonts } = require('../theme');

      expect(WebFonts.sans).toContain('system-ui');
      expect(WebFonts.serif).toContain('Georgia');
      expect(WebFonts.rounded).toContain('SF Pro Rounded');
      expect(WebFonts.mono).toContain('SFMono-Regular');
    });

    it('should return default fonts for other platforms', () => {
      jest.resetModules();
      jest.doMock('react-native', () => ({
        Platform: {
          select: jest.fn((objs) => objs.default),
          OS: 'android',
        },
      }));

      const { Fonts: DefaultFonts } = require('../theme');

      expect(DefaultFonts.sans).toBe('normal');
      expect(DefaultFonts.serif).toBe('serif');
      expect(DefaultFonts.rounded).toBe('normal');
      expect(DefaultFonts.mono).toBe('monospace');
    });
  });
});
