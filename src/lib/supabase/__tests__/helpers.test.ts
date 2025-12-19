/**
 * 测试 Supabase 辅助函数
 *
 * - 测试边界条件
 * - 测试错误处理
 * - 测试数据转换的正确性
 */

import {
  calculatePagination,
  convertKeysToCamel,
  snakeToCamel,
  handleSupabaseError,
  wrapResponse,
  buildPercentData,
  getCurrentUserId,
  isAuthenticated,
  logger,
} from '../helpers';

import { mockSupabaseClient, resetAllMocks } from './setup';

import type { PostgrestError } from '@supabase/supabase-js';

describe('Supabase Helpers', () => {
  describe('calculatePagination', () => {
    it('should calculate correct pagination for first page', () => {
      const result = calculatePagination({ page: 1, pageSize: 20 });
      expect(result).toEqual({ from: 0, to: 19 });
    });

    it('should calculate correct pagination for second page', () => {
      const result = calculatePagination({ page: 2, pageSize: 20 });
      expect(result).toEqual({ from: 20, to: 39 });
    });

    it('should use default values when not provided', () => {
      const result = calculatePagination({});
      expect(result).toEqual({ from: 0, to: 19 });
    });

    it('should handle custom page size', () => {
      const result = calculatePagination({ page: 1, pageSize: 50 });
      expect(result).toEqual({ from: 0, to: 49 });
    });
  });

  describe('convertKeysToCamel', () => {
    it('should convert snake_case keys to camelCase', () => {
      const input = {
        user_id: '123',
        first_name: 'John',
        last_name: 'Doe',
      };
      const expected = {
        userId: '123',
        firstName: 'John',
        lastName: 'Doe',
      };
      expect(convertKeysToCamel(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        user_profile: {
          user_id: '123',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      };
      const expected = {
        userProfile: {
          userId: '123',
          avatarUrl: 'https://example.com/avatar.jpg',
        },
      };
      expect(convertKeysToCamel(input)).toEqual(expected);
    });

    it('should handle arrays', () => {
      const input = [
        { user_id: '1', user_name: 'Alice' },
        { user_id: '2', user_name: 'Bob' },
      ];
      const expected = [
        { userId: '1', userName: 'Alice' },
        { userId: '2', userName: 'Bob' },
      ];
      expect(convertKeysToCamel(input)).toEqual(expected);
    });

    it('should return null for null input', () => {
      expect(convertKeysToCamel(null)).toBeNull();
    });

    it('should return undefined for undefined input', () => {
      expect(convertKeysToCamel(undefined)).toBeUndefined();
    });
  });

  describe('handleSupabaseError', () => {
    it('should return formatted error for PostgrestError', () => {
      const error: PostgrestError = {
        message: 'Database error',
        details: 'Column not found',
        hint: 'Check your query',
        code: '42703',
        name: 'PostgrestError',
      };
      const result = handleSupabaseError(error, 'test_operation');
      expect(result).toEqual({
        message: 'Database error',
        code: '42703',
        details: 'Column not found',
        hint: 'Check your query',
      });
    });

    it('should handle error without details', () => {
      const error: PostgrestError = {
        message: 'Simple error',
        details: '',
        hint: '',
        code: '0',
        name: 'PostgrestError',
      };
      const result = handleSupabaseError(error, 'test_operation');
      expect(result?.message).toBe('Simple error');
    });

    it('should return null for null error', () => {
      const result = handleSupabaseError(null, 'test_operation');
      expect(result).toBeNull();
    });
  });

  describe('wrapResponse', () => {
    it('should wrap successful response', () => {
      const data = { id: '1', name: 'Test' };
      const result = wrapResponse(data, null);
      expect(result).toEqual({
        data,
        error: null,
        success: true,
      });
    });

    it('should wrap error response', () => {
      const error: PostgrestError = {
        message: 'Error occurred',
        details: '',
        hint: '',
        code: '500',
        name: 'PostgrestError',
      };
      const result = wrapResponse(null, error);
      expect(result).toEqual({
        data: null,
        error,
        success: false,
      });
    });

    it('should handle both data and error (error takes precedence)', () => {
      const data = { id: '1' };
      const error: PostgrestError = {
        message: 'Error',
        details: '',
        hint: '',
        code: '500',
        name: 'PostgrestError',
      };
      const result = wrapResponse(data, error);
      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
    });

    it('should mark as failed when data is null even without error', () => {
      // Arrange & Act
      const result = wrapResponse(null, null);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('user_id')).toBe('userId');
      expect(snakeToCamel('created_at')).toBe('createdAt');
      expect(snakeToCamel('avatar_url')).toBe('avatarUrl');
    });

    it('should handle strings without underscores', () => {
      expect(snakeToCamel('username')).toBe('username');
      expect(snakeToCamel('id')).toBe('id');
    });

    it('should handle multiple underscores', () => {
      expect(snakeToCamel('some_long_var_name')).toBe('someLongVarName');
    });

    it('should handle leading underscore', () => {
      // Note: leading underscore gets converted too
      expect(snakeToCamel('_private')).toBe('Private');
    });

    it('should handle empty string', () => {
      expect(snakeToCamel('')).toBe('');
    });
  });

  describe('buildPercentData', () => {
    it('should build percentData from nutrition fields', () => {
      // Arrange
      const data = {
        crude_protein: 30,
        crude_fat: 15,
        carbohydrates: 40,
        crude_fiber: 5,
        crude_ash: 8,
        others: 2,
      };

      // Act
      const result = buildPercentData(data);

      // Assert
      expect(result).toEqual({
        protein: 30,
        fat: 15,
        carbohydrates: 40,
        fiber: 5,
        ash: 8,
        others: 2,
      });
    });

    it('should skip null values', () => {
      // Arrange
      const data = {
        crude_protein: 30,
        crude_fat: null,
        carbohydrates: undefined,
      };

      // Act
      const result = buildPercentData(data as any);

      // Assert
      expect(result).toEqual({ protein: 30 });
    });

    it('should return null when all values are null/undefined', () => {
      // Arrange
      const data = {
        crude_protein: null,
        crude_fat: undefined,
      };

      // Act
      const result = buildPercentData(data as any);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle empty object', () => {
      // Arrange
      const data = {};

      // Act
      const result = buildPercentData(data);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle zero values', () => {
      // Arrange
      const data = {
        crude_protein: 0,
        crude_fat: 0,
      };

      // Act
      const result = buildPercentData(data);

      // Assert
      expect(result).toEqual({
        protein: 0,
        fat: 0,
      });
    });
  });

  describe('getCurrentUserId', () => {
    beforeEach(() => {
      resetAllMocks();
    });

    it('should return user id when authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Act
      const result = await getCurrentUserId();

      // Assert
      expect(result).toBe('user-123');
    });

    it('should return null when not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await getCurrentUserId();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    beforeEach(() => {
      resetAllMocks();
    });

    it('should return true when session exists', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'token' } },
        error: null,
      });

      // Act
      const result = await isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no session exists', async () => {
      // Arrange
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Act
      const result = await isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('logger helpers', () => {
    beforeEach(() => {
      // Mock console methods
      console.log = jest.fn();
      console.error = jest.fn();
    });

    it('should log query operations', () => {
      // Act
      logger.query('users', 'select', { id: '123' });

      // Assert - should call console in dev mode
      if ((global as any).__DEV__) {
        expect(console.log).toHaveBeenCalled();
      }
    });

    it('should log success operations', () => {
      // Act
      logger.success('users', 'insert', 1);

      // Assert
      if ((global as any).__DEV__) {
        expect(console.log).toHaveBeenCalled();
      }
    });

    it('should log errors', () => {
      // Act
      logger.error('users', 'delete', new Error('Test error'));

      // Assert
      expect(console.error).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      // Act
      logger.info('Test message', { data: 'test' });

      // Assert
      if ((global as any).__DEV__) {
        expect(console.log).toHaveBeenCalled();
      }
    });
  });

  describe('edge cases', () => {
    it('should handle Date objects in convertKeysToCamel', () => {
      // Arrange
      const date = new Date('2024-01-01');
      const input = {
        created_at: date,
      };

      // Act
      const result = convertKeysToCamel(input);

      // Assert
      expect((result as any).createdAt).toEqual(date);
    });

    it('should handle primitive values in convertKeysToCamel', () => {
      expect(convertKeysToCamel('string')).toBe('string');
      expect(convertKeysToCamel(123)).toBe(123);
      expect(convertKeysToCamel(true)).toBe(true);
    });

    it('should handle nested arrays in convertKeysToCamel', () => {
      // Arrange
      const input = {
        user_list: [{ user_id: '1' }, { user_id: '2' }],
      };

      // Act
      const result = convertKeysToCamel(input);

      // Assert
      expect((result as any).userList[0].userId).toBe('1');
    });

    it('should handle large page numbers in calculatePagination', () => {
      // Act
      const result = calculatePagination({ page: 100, pageSize: 50 });

      // Assert
      expect(result).toEqual({ from: 4950, to: 4999 });
    });
  });
});
