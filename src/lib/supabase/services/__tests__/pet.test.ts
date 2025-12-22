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

    it('should handle database errors', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('pets', mockErrorResponse({ message: 'DB Error' }));

      // Act
      const result = await supabasePetService.getMyPets();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getPet', () => {
    it('should return pet details', async () => {
      const mockPet = { id: 1, name: 'Mochi' };
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockPet, error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await supabasePetService.getPet(1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPet);
    });

    it('should handle error when getting pet', async () => {
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'DB Error' } });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      });

      const result = await supabasePetService.getPet(1);

      expect(result.success).toBe(false);
    });
  });

  describe('createPet', () => {
    it('should create pet successfully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockPet = { id: 1, name: 'Mochi', user_id: 'user-123' };
      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockPet, error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await supabasePetService.createPet({ name: 'Mochi' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPet);
    });

    it('should fail when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await supabasePetService.createPet({ name: 'Mochi' });

      expect(result.success).toBe(false);
    });

    it('should handle error when creating pet', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockInsert = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Insert Error' } });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await supabasePetService.createPet({ name: 'Mochi' });

      expect(result.success).toBe(false);
    });
  });

  describe('updatePet', () => {
    it('should update pet successfully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockPet = { id: 1, name: 'Mochi Updated' };
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: mockPet, error: null });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await supabasePetService.updatePet(1, { name: 'Mochi Updated' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPet);
    });

    it('should fail when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await supabasePetService.updatePet(1, { name: 'Mochi' });

      expect(result.success).toBe(false);
    });

    it('should handle error when updating pet', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const mockUpdate = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnThis();
      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: null, error: { message: 'Update Error' } });

      (mockSupabaseClient.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      });

      const result = await supabasePetService.updatePet(1, { name: 'Mochi' });

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

      // Mock pet fetch (no photo)
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: { photo_url: null }, error: null });

      // Mock delete
      const mockDeleteBuilder = {
        delete: jest.fn(),
        eq: jest.fn(),
      };
      mockDeleteBuilder.delete.mockReturnValue(mockDeleteBuilder);
      mockDeleteBuilder.eq.mockReturnValue(mockDeleteBuilder);

      (mockSupabaseClient.from as jest.Mock)
        .mockReturnValueOnce({
          // fetch
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        })
        .mockReturnValueOnce(mockDeleteBuilder); // delete

      const result = await supabasePetService.deletePet(1);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should delete pet photo if exists', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock pet fetch (with photo)
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: { photo_url: 'http://supa.base/pets/photo.jpg' }, error: null });

      // Mock storage remove
      const mockRemove = jest.fn().mockResolvedValue({ data: [], error: null });
      (mockSupabaseClient.storage.from as jest.Mock).mockReturnValue({
        remove: mockRemove,
      });

      // Mock delete
      const mockDelete = jest.fn().mockReturnThis();
      const mockEqDelete = jest.fn().mockReturnThis();

      (mockSupabaseClient.from as jest.Mock)
        .mockReturnValueOnce({
          // fetch
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        })
        .mockReturnValueOnce({
          // delete
          delete: mockDelete,
          eq: mockEqDelete,
        });

      const result = await supabasePetService.deletePet(1);

      // Assert
      expect(result.success).toBe(true);
      expect(mockRemove).toHaveBeenCalledWith(['photo.jpg']);
    });

    it('should fail when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await supabasePetService.deletePet(1);

      expect(result.success).toBe(false);
    });

    it('should handle error when deleting pet', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock pet fetch
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest.fn().mockResolvedValue({ data: { photo_url: null }, error: null });

      // Mock delete error
      const mockDelete = jest.fn().mockReturnThis();
      const mockEqDelete = jest.fn().mockReturnThis();
      const mockDeleteError = { message: 'Delete Error' };

      // We need to mock the promise chain to return error
      // Since delete().eq().eq() returns a promise that resolves to { error }
      // We can mock the last eq to return a promise
      mockEqDelete.mockResolvedValue({ error: mockDeleteError });

      // Mock the chain: delete().eq().eq()
      mockDelete.mockReturnValue({ eq: mockEqDelete });
      mockEqDelete.mockReturnValue({
        eq: mockEqDelete,
        then: (resolve: any) => resolve({ error: mockDeleteError }),
      });

      (mockSupabaseClient.from as jest.Mock)
        .mockReturnValueOnce({
          // fetch
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        })
        .mockReturnValueOnce({
          // delete
          delete: mockDelete,
          eq: mockEqDelete,
        });

      const result = await supabasePetService.deletePet(1);

      expect(result.success).toBe(false);
    });
  });

  describe('uploadPetPhoto', () => {
    // ... existing tests or add new ones ...
    // Since uploadPetPhoto involves FileSystem which is mocked, we can add basic tests
    it('should fail when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await supabasePetService.uploadPetPhoto(1, 'file://image.jpg');

      expect(result.success).toBe(false);
    });
  });

  describe('deletePetPhoto', () => {
    it('should delete pet photo successfully', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock pet fetch
      const mockSelect = jest.fn().mockReturnThis();
      const mockEq = jest.fn().mockReturnThis();
      const mockSingle = jest
        .fn()
        .mockResolvedValue({ data: { photo_url: 'http://supa.base/pets/photo.jpg' }, error: null });

      // Mock storage remove
      const mockRemove = jest.fn().mockResolvedValue({ data: [], error: null });
      (mockSupabaseClient.storage.from as jest.Mock).mockReturnValue({
        remove: mockRemove,
      });

      // Mock update
      const mockUpdate = jest.fn().mockReturnThis();
      const mockEqUpdate = jest.fn().mockReturnThis();
      const mockSelectUpdate = jest.fn().mockReturnThis();
      const mockSingleUpdate = jest
        .fn()
        .mockResolvedValue({ data: { photo_url: null }, error: null });

      (mockSupabaseClient.from as jest.Mock)
        .mockReturnValueOnce({
          // fetch
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        })
        .mockReturnValueOnce({
          // update
          update: mockUpdate,
          eq: mockEqUpdate,
          select: mockSelectUpdate,
          single: mockSingleUpdate,
        });

      const result = await supabasePetService.deletePetPhoto(1);

      expect(result.success).toBe(true);
      expect(mockRemove).toHaveBeenCalledWith(['photo.jpg']);
    });

    it('should fail when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await supabasePetService.deletePetPhoto(1);

      expect(result.success).toBe(false);
    });
  });
});
