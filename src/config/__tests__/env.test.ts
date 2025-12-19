/**
 * Env Config 测试
 */

import { ENV } from '../env';

describe('Env Config', () => {
  describe('ENV object', () => {
    it('should have API_BASE_URL', () => {
      expect(ENV).toHaveProperty('API_BASE_URL');
      expect(typeof ENV.API_BASE_URL).toBe('string');
    });

    it('should have API_TIMEOUT', () => {
      expect(ENV).toHaveProperty('API_TIMEOUT');
    });

    it('should have DEBUG flag', () => {
      expect(ENV).toHaveProperty('DEBUG');
      expect(typeof ENV.DEBUG).toBe('boolean');
    });
  });

  describe('environment variables', () => {
    it('should have valid URL format for API_BASE_URL', () => {
      if (ENV.API_BASE_URL) {
        expect(ENV.API_BASE_URL).toMatch(/^https?:\/\//);
      }
    });

    it('should handle missing environment variables', () => {
      expect(ENV).toBeDefined();
    });
  });
});
