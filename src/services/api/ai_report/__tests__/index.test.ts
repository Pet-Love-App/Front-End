/**
 * AI Report Service Tests
 * 测试 AI 报告相关服务
 */

import { aiReportService } from '../index';
import { apiClient } from '../../core/httpClient';

// Mock apiClient
jest.mock('../../core/httpClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('AI Report Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkReportExists', () => {
    it('should return true when report exists', async () => {
      // Arrange
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { exists: true },
      });

      // Act
      const result = await aiReportService.checkReportExists(123);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/api/ai/123/exists/');
      expect(result.exists).toBe(true);
      expect(result.catfood_id).toBe(123);
    });

    it('should return false when report does not exist', async () => {
      // Arrange
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: { exists: false },
      });

      // Act
      const result = await aiReportService.checkReportExists(123);

      // Assert
      expect(result.exists).toBe(false);
    });
  });

  describe('getReport', () => {
    it('should fetch report data successfully', async () => {
      // Arrange
      const mockReport = { id: 1, content: 'Analysis' };
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockReport,
      });

      // Act
      const result = await aiReportService.getReport(123);

      // Assert
      expect(apiClient.get).toHaveBeenCalledWith('/api/ai/123/');
      expect(result).toEqual(mockReport);
    });

    it('should propagate errors', async () => {
      // Arrange
      (apiClient.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

      // Act & Assert
      await expect(aiReportService.getReport(123)).rejects.toThrow('Network Error');
    });
  });

  describe('saveReport', () => {
    it('should save report successfully', async () => {
      // Arrange
      const request = { catfood_id: 123, report_data: {} };
      const response = { id: 1, success: true };
      (apiClient.post as jest.Mock).mockResolvedValue(response);

      // Act
      const result = await aiReportService.saveReport(request as any);

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/api/ai/save/', request);
      expect(result).toEqual(response);
    });
  });

  describe('deleteReport', () => {
    it('should delete report successfully', async () => {
      // Arrange
      const response = { message: 'Deleted' };
      (apiClient.delete as jest.Mock).mockResolvedValue(response);

      // Act
      const result = await aiReportService.deleteReport(123);

      // Assert
      expect(apiClient.delete).toHaveBeenCalledWith('/api/ai/123/delete/');
      expect(result).toEqual(response);
    });
  });
});
