/**
 * HTTP Client Tests
 * 测试统一的 HTTP 客户端
 */

import { apiClient } from '../httpClient';
import { AppError, ErrorCodes } from '@/src/utils/errorHandler';

// Mock dependencies
jest.mock('@/src/config/env', () => ({
  API_BASE_URL: 'http://test-api.com',
  ENV: {
    API_BASE_URL: 'http://test-api.com',
    API_TIMEOUT: 10000,
  },
}));

jest.mock('@/src/store/userStore', () => ({
  useUserStore: {
    getState: jest.fn(() => ({
      accessToken: 'mock-token',
      refreshAccessToken: jest.fn(),
      logout: jest.fn(),
    })),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe('HTTP Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('request', () => {
    it('should make a successful GET request', async () => {
      // Arrange
      const mockResponse = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      // Act
      const result = await apiClient.get('/test');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle 404 Not Found error', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify({ message: 'Not Found' })),
        url: 'http://test-api.com/test',
      });

      // Act & Assert
      await expect(apiClient.get('/test')).rejects.toThrow(AppError);
      await expect(apiClient.get('/test')).rejects.toHaveProperty('code', 'UNKNOWN_ERROR');
    });

    it('should handle 500 Server Error', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify({ message: 'Server Error' })),
        url: 'http://test-api.com/test',
      });

      // Act & Assert
      await expect(apiClient.get('/test')).rejects.toThrow('Server Error');
    });

    it('should handle network errors', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network request failed'));

      // Act & Assert
      await expect(apiClient.get('/test')).rejects.toHaveProperty('code', ErrorCodes.NETWORK_ERROR);
    });
  });

  describe('Convenience Methods', () => {
    it('should support post method', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve('{}'),
      });

      // Act
      await apiClient.post('/test', { data: 1 });

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ data: 1 }),
        })
      );
    });

    it('should support delete method', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve('{}'),
      });

      // Act
      await apiClient.delete('/test');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });
});
