/**
 * API Helpers Tests
 * 测试 API 核心工具函数
 */

import {
  snakeToCamel,
  camelToSnake,
  toCamelCase,
  toSnakeCase,
  wrapSuccess,
  wrapError,
  createErrorDetail,
} from '../helpers';

describe('API Helpers', () => {
  describe('String Conversion', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('user_name')).toBe('userName');
      expect(snakeToCamel('first_name_last_name')).toBe('firstNameLastName');
      expect(snakeToCamel('simple')).toBe('simple');
    });

    it('should convert camelCase to snake_case', () => {
      expect(camelToSnake('userName')).toBe('user_name');
      expect(camelToSnake('firstNameLastName')).toBe('first_name_last_name');
      expect(camelToSnake('simple')).toBe('simple');
    });
  });

  describe('Object Conversion', () => {
    it('should recursively convert object keys to camelCase', () => {
      // Arrange
      const input = {
        user_id: 1,
        user_info: {
          first_name: 'John',
          address_details: {
            zip_code: '12345',
          },
        },
        items_list: [{ item_id: 1 }, { item_id: 2 }],
      };

      // Act
      const result = toCamelCase(input);

      // Assert
      expect(result).toEqual({
        userId: 1,
        userInfo: {
          firstName: 'John',
          addressDetails: {
            zipCode: '12345',
          },
        },
        itemsList: [{ itemId: 1 }, { itemId: 2 }],
      });
    });

    it('should recursively convert object keys to snake_case', () => {
      // Arrange
      const input = {
        userId: 1,
        userInfo: {
          firstName: 'John',
          addressDetails: {
            zipCode: '12345',
          },
        },
        itemsList: [{ itemId: 1 }, { itemId: 2 }],
      };

      // Act
      const result = toSnakeCase(input);

      // Assert
      expect(result).toEqual({
        user_id: 1,
        user_info: {
          first_name: 'John',
          address_details: {
            zip_code: '12345',
          },
        },
        items_list: [{ item_id: 1 }, { item_id: 2 }],
      });
    });

    it('should handle null and non-object values', () => {
      expect(toCamelCase(null)).toBeNull();
      expect(toCamelCase('string')).toBe('string');
      expect(toCamelCase(123)).toBe(123);
    });
  });

  describe('Response Wrapping', () => {
    it('should wrap success response', () => {
      // Arrange
      const data = { id: 1 };

      // Act
      const result = wrapSuccess(data);

      // Assert
      expect(result).toEqual({
        success: true,
        data: data,
        error: null,
      });
    });

    it('should wrap error response', () => {
      // Arrange
      const error = { message: 'Failed' };

      // Act
      const result = wrapError(error);

      // Assert
      expect(result).toEqual({
        success: false,
        data: null,
        error: error,
      });
    });
  });

  describe('createErrorDetail', () => {
    it('should create error detail from Error object', () => {
      // Arrange
      const error = new Error('Something wrong');

      // Act
      const result = createErrorDetail(error);

      // Assert
      expect(result.message).toBe('Something wrong');
      expect(result.details).toBe(error);
    });

    it('should create error detail from string', () => {
      // Arrange
      const error = 'Something wrong';

      // Act
      const result = createErrorDetail(error);

      // Assert
      expect(result.message).toBe('Something wrong');
    });

    it('should create error detail from object', () => {
      // Arrange
      const error = { message: 'Custom error', code: 'ERR_001' };

      // Act
      const result = createErrorDetail(error);

      // Assert
      expect(result.message).toBe('Custom error');
      expect(result.code).toBe('ERR_001');
    });
  });
});
