/**
 * 测试 Supabase 辅助函数
 */

import type { PostgrestError } from '@supabase/supabase-js';
import {
  calculatePagination,
  convertKeysToCamel,
  handleSupabaseError,
  wrapResponse,
} from '../helpers';

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
  });
});
