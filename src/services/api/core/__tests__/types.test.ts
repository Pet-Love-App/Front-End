/**
 * API Core Types Tests
 * 测试 API 核心类型定义
 */

import {
  ApiErrorDetail,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  ListResponse,
  DeleteResponse,
  ToggleResponse,
  BaseEntity,
  SearchParams,
} from '../types';

describe('API Core Types', () => {
  describe('ApiErrorDetail Interface', () => {
    it('should allow creating valid error detail', () => {
      // Arrange
      const error: ApiErrorDetail = {
        message: 'Something went wrong',
        code: 'ERR_001',
        details: { field: 'username' },
      };

      // Act & Assert
      expect(error.message).toBe('Something went wrong');
      expect(error.code).toBe('ERR_001');
    });
  });

  describe('ApiResponse Interface', () => {
    it('should allow creating valid success response', () => {
      // Arrange
      const response: ApiResponse<string> = {
        data: 'Success',
        error: null,
        success: true,
      };

      // Act & Assert
      expect(response.data).toBe('Success');
      expect(response.success).toBe(true);
    });

    it('should allow creating valid error response', () => {
      // Arrange
      const response: ApiResponse<null> = {
        data: null,
        error: { message: 'Error' },
        success: false,
      };

      // Act & Assert
      expect(response.error?.message).toBe('Error');
      expect(response.success).toBe(false);
    });
  });

  describe('PaginatedResponse Interface', () => {
    it('should allow creating valid paginated response', () => {
      // Arrange
      const response: PaginatedResponse<string> = {
        results: ['item1', 'item2'],
        count: 100,
        page: 1,
        pageSize: 10,
        totalPages: 10,
        next: 'http://api.com?page=2',
        previous: null,
      };

      // Act & Assert
      expect(response.results.length).toBe(2);
      expect(response.count).toBe(100);
      expect(response.next).toBe('http://api.com?page=2');
    });
  });

  describe('ListResponse Interface', () => {
    it('should allow creating valid list response', () => {
      // Arrange
      const response: ListResponse<string> = {
        items: ['item1', 'item2'],
        total: 2,
      };

      // Act & Assert
      expect(response.items.length).toBe(2);
      expect(response.total).toBe(2);
    });
  });

  describe('DeleteResponse Interface', () => {
    it('should allow creating valid delete response', () => {
      // Arrange
      const response: DeleteResponse = {
        message: 'Deleted successfully',
        success: true,
      };

      // Act & Assert
      expect(response.success).toBe(true);
      expect(response.message).toBe('Deleted successfully');
    });
  });

  describe('ToggleResponse Interface', () => {
    it('should allow creating valid toggle response', () => {
      // Arrange
      const response: ToggleResponse = {
        toggled: true,
        message: 'Toggled successfully',
        count: 10,
      };

      // Act & Assert
      expect(response.toggled).toBe(true);
      expect(response.message).toBe('Toggled successfully');
      expect(response.count).toBe(10);
    });
  });

  describe('PaginationParams Interface', () => {
    it('should allow creating valid pagination params', () => {
      // Arrange
      const params: PaginationParams = {
        page: 1,
        pageSize: 20,
      };

      // Act & Assert
      expect(params.page).toBe(1);
      expect(params.pageSize).toBe(20);
    });
  });

  describe('BaseEntity Interface', () => {
    it('should allow creating valid base entity', () => {
      // Arrange
      const entity: BaseEntity = {
        id: 1,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-02',
      };

      // Act & Assert
      expect(entity.id).toBe(1);
      expect(entity.createdAt).toBe('2023-01-01');
    });
  });
});
