/**
 * Features Config 测试
 */

import { FEATURES } from '../features';

describe('Features Config', () => {
  describe('FEATURES object', () => {
    it('should have USE_SUPABASE flag', () => {
      expect(FEATURES).toHaveProperty('USE_SUPABASE');
      expect(typeof FEATURES.USE_SUPABASE).toBe('boolean');
    });

    it('should have ENABLE_REALTIME flag', () => {
      expect(FEATURES).toHaveProperty('ENABLE_REALTIME');
      expect(typeof FEATURES.ENABLE_REALTIME).toBe('boolean');
    });

    it('should have ENABLE_PERFORMANCE_MONITORING flag', () => {
      expect(FEATURES).toHaveProperty('ENABLE_PERFORMANCE_MONITORING');
      expect(typeof FEATURES.ENABLE_PERFORMANCE_MONITORING).toBe('boolean');
    });
  });

  describe('feature flags', () => {
    it('should return boolean values', () => {
      expect([true, false]).toContain(FEATURES.USE_SUPABASE);
      expect([true, false]).toContain(FEATURES.ENABLE_REALTIME);
      expect([true, false]).toContain(FEATURES.ENABLE_PERFORMANCE_MONITORING);
    });
  });

  describe('default export', () => {
    it('should export FEATURES as default', () => {
      const defaultExport = require('../features').default;

      expect(defaultExport).toEqual(FEATURES);
    });
  });
});
