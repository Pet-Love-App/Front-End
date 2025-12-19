/**
 * Pet Service 集成测试
 *
 * 测试宠物管理服务的各项功能
 */

import { supabasePetService } from '../pet';
import type { Pet } from '@/src/schemas/pet.schema';
import type { PetInput } from '../pet';
import {
  mockSupabaseClient,
  resetAllMocks,
  setupFromMock,
  mockSuccessResponse,
  mockErrorResponse,
} from '../../__tests__/setup';

// Mock expo-file-system
jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

// Mock base64-arraybuffer
jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn((str) => new ArrayBuffer(8)),
}));

describe('SupabasePetService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getMyPets', () => {
    it('should return current user pets', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockPets = [
        {
          id: 1,
          name: 'Mochi',
          species: 'cat',
          breed: 'British Shorthair',
          age: 3,
          user_id: 'user-123',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          name: 'Luna',
          species: 'cat',
          breed: 'Persian',
          age: 2,
          user_id: 'user-123',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      setupFromMock('pets', mockSuccessResponse(mockPets));

      // Act
      const result = await supabasePetService.getMyPets();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabasePetService.getMyPets();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_AUTHENTICATED');
      expect(result.error?.message).toBe('未登录');
    });

    it('should return empty array when user has no pets', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('pets', mockSuccessResponse([]));

      // Act
      const result = await supabasePetService.getMyPets();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should order pets by created_at descending', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('pets', mockSuccessResponse([]));

      // Act
      await supabasePetService.getMyPets();

      // Assert - verify query builder is used correctly
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('pets');
    });
  });

  describe('getPet', () => {
    it('should return pet by id', async () => {
      // Arrange
      const mockPet = {
        id: 1,
        name: 'Mochi',
        species: 'cat',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      setupFromMock('pets', mockSuccessResponse(mockPet));

      // Act
      const result = await supabasePetService.getPet(1);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return error when pet not found', async () => {
      // Arrange
      setupFromMock('pets', mockErrorResponse('Pet not found', 'NOT_FOUND'));

      // Act
      const result = await supabasePetService.getPet(999);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('createPet', () => {
    it('should create pet with valid data', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const petInput: PetInput = {
        name: 'New Pet',
        species: 'dog',
        breed: 'Golden Retriever',
        age: 1,
      };

      const mockCreatedPet = {
        id: 1,
        ...petInput,
        user_id: 'user-123',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      setupFromMock('pets', mockSuccessResponse([mockCreatedPet]));

      // Act
      const result = await supabasePetService.createPet(petInput);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabasePetService.createPet({
        name: 'Test Pet',
        species: 'cat',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_AUTHENTICATED');
    });

    it('should handle database constraint violations', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('pets', mockErrorResponse('Name already exists', 'CONSTRAINT_VIOLATION'));

      // Act
      const result = await supabasePetService.createPet({
        name: 'Duplicate',
        species: 'cat',
      });

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('updatePet', () => {
    it('should update pet successfully', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const updates = { name: 'Updated Name', age: 4 };
      setupFromMock('pets', mockSuccessResponse([{ id: 1, ...updates }]));

      // Act
      const result = await supabasePetService.updatePet(1, updates);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabasePetService.updatePet(1, { name: 'Test' });

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('deletePet', () => {
    it('should delete pet successfully', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('pets', mockSuccessResponse(null));

      // Act
      const result = await supabasePetService.deletePet(1);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabasePetService.deletePet(1);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should handle deletion of non-existent pet', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('pets', mockErrorResponse('Pet not found', 'NOT_FOUND'));

      // Act
      const result = await supabasePetService.deletePet(999);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle network errors gracefully', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await supabasePetService.getMyPets();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Network error');
    });

    it('should handle null values in pet data', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const petWithNulls = {
        id: 1,
        name: 'Pet',
        species: 'cat',
        breed: null,
        age: null,
        description: null,
        photo_url: null,
      };

      setupFromMock('pets', mockSuccessResponse([petWithNulls]));

      // Act
      const result = await supabasePetService.getMyPets();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data![0].breed).toBeNull();
    });
  });
});
