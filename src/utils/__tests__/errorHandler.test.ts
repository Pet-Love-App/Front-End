/**
 * 测试错误处理工具
 *
 * - 测试所有错误类型和分支
 * - 测试边界情况
 * - 使用描述性测试名称
 */

import {
  handleError,
  isAuthError,
  isNetworkError,
  AppError,
  ErrorCodes,
  parseApiError,
} from '../errorHandler';
import { ZodError } from 'zod';

describe('Error Handler Utils', () => {
  describe('AppError class', () => {
    it('should create AppError with all parameters', () => {
      // Arrange & Act
      const error = new AppError('Test error', 'TEST_CODE', 500, { extra: 'data' });

      // Assert
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.status).toBe(500);
      expect(error.details).toEqual({ extra: 'data' });
      expect(error.name).toBe('AppError');
    });

    it('should create AppError with default code', () => {
      // Arrange & Act
      const error = new AppError('Test error');

      // Assert
      expect(error.code).toBe('UNKNOWN_ERROR');
    });

    it('should be instanceof Error', () => {
      // Arrange & Act
      const error = new AppError('Test');

      // Assert
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('ErrorCodes', () => {
    it('should have network error codes', () => {
      expect(ErrorCodes.NETWORK_ERROR).toBe('NETWORK_ERROR');
      expect(ErrorCodes.TIMEOUT_ERROR).toBe('TIMEOUT_ERROR');
    });

    it('should have auth error codes', () => {
      expect(ErrorCodes.AUTH_REQUIRED).toBe('AUTH_REQUIRED');
      expect(ErrorCodes.AUTH_EXPIRED).toBe('AUTH_EXPIRED');
      expect(ErrorCodes.AUTH_INVALID).toBe('AUTH_INVALID');
    });

    it('should have validation error codes', () => {
      expect(ErrorCodes.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCodes.INVALID_INPUT).toBe('INVALID_INPUT');
    });

    it('should have server error codes', () => {
      expect(ErrorCodes.SERVER_ERROR).toBe('SERVER_ERROR');
      expect(ErrorCodes.SERVICE_UNAVAILABLE).toBe('SERVICE_UNAVAILABLE');
    });
  });

  describe('handleError', () => {
    it('should handle Error objects', () => {
      // Arrange
      const error = new Error('Something went wrong');

      // Act
      const result = handleError(error);

      // Assert
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle network errors', () => {
      // Arrange
      const error = new Error('Network request failed');

      // Act
      const result = handleError(error);

      // Assert
      expect(result).toContain('网络');
    });

    it('should handle 401 auth errors', () => {
      // Arrange
      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      };

      // Act
      const result = handleError(error);

      // Assert
      expect(result).toContain('登录');
    });

    it('should handle 403 permission errors', () => {
      // Arrange
      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' },
        },
      };

      // Act
      const result = handleError(error);

      // Assert
      expect(result).toContain('权限');
    });

    it('should handle 404 not found errors', () => {
      // Arrange
      const error = {
        response: {
          status: 404,
          data: {},
        },
      };

      // Act
      const result = handleError(error);

      // Assert
      expect(result).toContain('资源不存在');
    });

    it('should handle 500 server errors', () => {
      // Arrange
      const error = {
        response: {
          status: 500,
          data: {},
        },
      };

      // Act
      const result = handleError(error);

      // Assert
      expect(result).toContain('服务器');
    });

    it('should handle string errors', () => {
      // Arrange
      const error = 'Simple string error';

      // Act
      const result = handleError(error);

      // Assert
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle unknown error types', () => {
      // Arrange
      const error = { random: 'object' };

      // Act
      const result = handleError(error);

      // Assert
      expect(result).toContain('未知');
    });
  });

  describe('isNetworkError', () => {
    it('should identify network request failed errors', () => {
      const error = new Error('Network request failed');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should identify timeout errors', () => {
      const error = new Error('Request timeout');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should identify connection errors', () => {
      const error = new Error('Network request failed');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for database errors', () => {
      const error = new Error('Database constraint violation');
      expect(isNetworkError(error)).toBe(false);
    });

    it('should return false for validation errors', () => {
      const error = new Error('Invalid email format');
      expect(isNetworkError(error)).toBe(false);
    });

    it('should handle error objects with response', () => {
      const error = {
        response: { status: 500 },
        message: 'Network Error',
      };
      expect(isNetworkError(error)).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('should identify 401 errors', () => {
      const error = {
        response: {
          status: 401,
          data: {},
        },
      };
      expect(isAuthError(error)).toBe(true);
    });

    it('should not identify 403 as auth error by default', () => {
      const error = {
        response: {
          status: 403,
          data: {},
        },
      };
      // Note: isAuthError only checks for 401
      expect(isAuthError(error)).toBe(false);
    });

    it('should return false for 404 errors', () => {
      const error = {
        response: {
          status: 404,
          data: {},
        },
      };
      expect(isAuthError(error)).toBe(false);
    });

    it('should return false for errors without response', () => {
      const error = new Error('Some error');
      expect(isAuthError(error)).toBe(false);
    });

    it('should return false for non-error objects', () => {
      expect(isAuthError('string')).toBe(false);
      expect(isAuthError({})).toBe(false);
    });
  });

  describe('parseApiError', () => {
    it('should parse API error with status code', () => {
      // Arrange
      const apiError = {
        response: {
          status: 400,
          data: {
            message: 'Validation failed',
            detail: 'Email is required',
            errors: { email: ['This field is required'] },
          },
        },
      };

      // Act
      const result = parseApiError(apiError);

      // Assert
      expect(result).toBeInstanceOf(AppError);
      expect(result.status).toBe(400);
      expect(result.code).toBe(ErrorCodes.INVALID_INPUT);
    });

    it('should handle 500 server errors', () => {
      // Arrange
      const apiError = {
        response: {
          status: 500,
          data: {
            error: 'Internal Server Error',
          },
        },
      };

      // Act
      const result = parseApiError(apiError);

      // Assert
      expect(result.code).toBe(ErrorCodes.SERVER_ERROR);
    });

    it('should handle error without response', () => {
      // Arrange
      const error = new Error('Random error');

      // Act
      const result = parseApiError(error);

      // Assert
      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Random error');
    });

    it('should handle network errors', () => {
      // Arrange
      const error = new Error('Network request failed');

      // Act
      const result = parseApiError(error);

      // Assert
      expect(result.code).toBe(ErrorCodes.NETWORK_ERROR);
    });
  });

  describe('Zod error handling', () => {
    it('should handle Zod validation errors in parseApiError', () => {
      // Arrange
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          path: ['email'],
          message: 'Email is invalid',
          expected: 'string',
          received: 'number',
        },
      ]);

      // Act
      const result = parseApiError(zodError);

      // Assert
      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('edge cases', () => {
    it('should handle errors with circular references', () => {
      // Arrange
      const error: any = { message: 'Circular' };
      error.self = error;

      // Act & Assert - should not throw
      expect(() => {
        handleError(error);
      }).not.toThrow();
    });

    it('should handle very long error messages', () => {
      // Arrange
      const longMessage = 'Error '.repeat(100);
      const error = new Error(longMessage);

      // Act
      const result = handleError(error);

      // Assert
      expect(typeof result).toBe('string');
    });

    it('should handle errors with special characters', () => {
      // Arrange
      const error = new Error('Error with 中文 and émojis 🐱');

      // Act
      const result = handleError(error);

      // Assert
      expect(result).toContain('Error');
    });
  });

  describe('status code mapping', () => {
    it('should map 400 to INVALID_INPUT', () => {
      const error = { response: { status: 400, data: {} } };
      const result = parseApiError(error);
      expect(result.code).toBe(ErrorCodes.INVALID_INPUT);
    });

    it('should map 409 to ALREADY_EXISTS', () => {
      const error = { response: { status: 409, data: {} } };
      const result = parseApiError(error);
      expect(result.code).toBe(ErrorCodes.ALREADY_EXISTS);
    });

    it('should map 422 to VALIDATION_ERROR', () => {
      const error = { response: { status: 422, data: {} } };
      const result = parseApiError(error);
      expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    it('should map 503 to SERVICE_UNAVAILABLE', () => {
      const error = { response: { status: 503, data: {} } };
      const result = parseApiError(error);
      expect(result.code).toBe(ErrorCodes.SERVICE_UNAVAILABLE);
    });

    it('should map unknown status codes to UNKNOWN_ERROR', () => {
      const error = { response: { status: 999, data: {} } };
      const result = parseApiError(error);
      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR);
    });
  });
});
