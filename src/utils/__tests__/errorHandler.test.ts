/**
 * 测试错误处理工具
 * 简化版本 - 测试核心功能
 */

import { handleError, isAuthError, isNetworkError } from '../errorHandler';

describe('Error Handler Utils', () => {
  describe('handleError', () => {
    it('should handle Error objects and return friendly message', () => {
      const error = new Error('Something went wrong');
      const result = handleError(error);

      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle network errors', () => {
      const error = new Error('Network request failed');
      const result = handleError(error);

      expect(result).toContain('网络');
    });

    it('should handle API errors with status', () => {
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };
      const result = handleError(error);

      expect(result).toContain('登录');
    });
  });

  describe('isNetworkError', () => {
    it('should identify network errors', () => {
      const error = new Error('Network request failed');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for non-network errors', () => {
      const error = new Error('Database error');
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('should identify auth errors by status', () => {
      const error = {
        response: {
          status: 401,
          data: {},
        },
      };
      expect(isAuthError(error)).toBe(true);
    });

    it('should return false for non-auth errors', () => {
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };
      expect(isAuthError(error)).toBe(false);
    });
  });
});
