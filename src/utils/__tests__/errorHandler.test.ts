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
        },
      };

      // Act
      const result = handleError(error);

      // Assert
      expect(result).toContain('不存在');
    });

    it('should handle 500 server errors', () => {
      // Arrange
      const error = {
        response: {
          status: 500,
        },
      };

      // Act
      const result = handleError(error);

      // Assert
      expect(result).toContain('服务器');
    });

    it('should handle unknown errors', () => {
      // Arrange
      const error = 'Unknown string error';

      // Act
      const result = handleError(error);

      // Assert
      expect(result).toContain('未知错误');
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
    it('should parse standard API error response', () => {
      // Arrange
      const apiError = {
        status: 400,
        message: 'Invalid input',
        error: 'Bad Request',
      };

      // Act
      const result = parseApiError(apiError);

      // Assert
      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCodes.INVALID_INPUT);
      expect(result.message).toBe('Invalid input');
    });

    it('should parse validation errors', () => {
      // Arrange
      const apiError = {
        status: 422,
        message: 'Validation failed',
        errors: {
          email: ['Invalid email format'],
        },
      };

      // Act
      const result = parseApiError(apiError);

      // Assert
      expect(result.code).toBe(ErrorCodes.VALIDATION_ERROR);
      // The implementation of parseApiError passes the whole data object as details if it's not a ZodError
      // So we expect details to contain the errors property
      expect(result.details).toEqual(apiError);
    });

    it('should handle non-standard error objects', () => {
      // Arrange
      const error = { random: 'object' };

      // Act
      const result = parseApiError(error);

      // Assert
      expect(result.code).toBe(ErrorCodes.UNKNOWN_ERROR);
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
