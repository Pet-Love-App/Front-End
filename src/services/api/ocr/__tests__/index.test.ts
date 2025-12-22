/**
 * OCR Service Tests
 * 测试 OCR 识别服务
 */

import { ocrService } from '../index';
import { apiClient } from '../../core/httpClient';

// Mock apiClient
jest.mock('../../core/httpClient', () => ({
  apiClient: {
    upload: jest.fn(),
  },
}));

describe('OCR Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('recognize', () => {
    it('should successfully recognize text from image', async () => {
      // Arrange
      const mockResponse = {
        data: {
          text: 'Detected Text',
          confidence: 0.98,
        },
      };
      (apiClient.upload as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await ocrService.recognize('file://image.jpg');

      // Assert
      expect(apiClient.upload).toHaveBeenCalledWith('/api/ocr/recognize/', expect.any(FormData));
      expect(result).toEqual({
        text: 'Detected Text',
        confidence: 0.98,
      });
    });

    it('should handle recognition failure', async () => {
      // Arrange
      (apiClient.upload as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      // Act & Assert
      await expect(ocrService.recognize('file://image.jpg')).rejects.toThrow('识别失败，请重试');
    });

    it('should use default confidence if not provided', async () => {
      // Arrange
      const mockResponse = {
        data: {
          text: 'Text',
          // no confidence
        },
      };
      (apiClient.upload as jest.Mock).mockResolvedValue(mockResponse);

      // Act
      const result = await ocrService.recognize('file://image.jpg');

      // Assert
      expect(result.confidence).toBe(0.95);
    });
  });
});
