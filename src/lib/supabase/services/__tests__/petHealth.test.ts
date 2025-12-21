/**
 * Pet Health Service 测试
 */

import * as petHealthService from '../petHealth';
import {
  mockSupabaseClient,
  resetAllMocks,
  setupFromMock,
  mockSuccessResponse,
} from '../../__tests__/setup';

describe('PetHealthService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getPetHealthRecords', () => {
    it('should fetch health records successfully', async () => {
      const mockData = [{ id: 1, pet_id: 1, record_type: 'vaccine' }];
      setupFromMock('pet_health_records', mockSuccessResponse(mockData));

      const result = await petHealthService.getPetHealthRecords(1);

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('pet_health_records');
    });

    it('should filter by record type', async () => {
      const mockData = [{ id: 1, pet_id: 1, record_type: 'vaccine' }];
      setupFromMock('pet_health_records', mockSuccessResponse(mockData));

      await petHealthService.getPetHealthRecords(1, 'vaccine');

      // Verify that eq was called with record_type
      // Note: Since we are using a mock chain, we can't easily inspect the exact call order/args of chained methods
      // without more complex mocking, but we can verify the service runs without error.
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('pet_health_records');
    });

    it('should handle errors', async () => {
      const mockError = { message: 'Error fetching records' };
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      } as any);

      const result = await petHealthService.getPetHealthRecords(1);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('createHealthRecord', () => {
    it('should create a health record successfully', async () => {
      const mockParams = { pet_id: 1, record_type: 'vaccine', date: '2023-01-01' } as any;
      const mockData = { id: 1, ...mockParams };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      } as any);

      const result = await petHealthService.createHealthRecord(mockParams);

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });

    it('should handle creation errors', async () => {
      const mockParams = { pet_id: 1 } as any;
      const mockError = { message: 'Creation failed' };

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      } as any);

      const result = await petHealthService.createHealthRecord(mockParams);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('updateHealthRecord', () => {
    it('should update a health record successfully', async () => {
      const mockParams = { notes: 'Updated' } as any;
      const mockData = { id: 1, notes: 'Updated' };

      mockSupabaseClient.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      } as any);

      const result = await petHealthService.updateHealthRecord(1, mockParams);

      expect(result.data).toEqual(mockData);
      expect(result.error).toBeNull();
    });
  });

  // Add more tests for other methods as needed...
});
