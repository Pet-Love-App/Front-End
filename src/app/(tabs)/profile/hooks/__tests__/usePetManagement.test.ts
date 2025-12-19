/**
 * usePetManagement Hook 测试
 *
 * 测试宠物管理 Hook 的功能
 */

import { renderHook, act } from '@testing-library/react-native';
import { usePetManagement } from '../usePetManagement';
import { supabasePetService } from '@/src/lib/supabase';

import { toast } from '@/src/components/dialogs';

// Mock dependencies
jest.mock('@/src/lib/supabase', () => ({
  supabasePetService: {
    createPet: jest.fn(),
    deletePet: jest.fn(),
    uploadPetPhoto: jest.fn(),
  },
}));

jest.mock('@/src/store/userStore', () => ({
  useUserStore: jest.fn((selector) => {
    const state = {
      fetchCurrentUser: jest.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

jest.mock('@/src/components/dialogs', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

jest.mock('@/src/schemas/pet.schema', () => ({
  petInputSchema: {
    parse: jest.fn((data) => data),
  },
}));

describe('usePetManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have modal closed initially', () => {
      // Act
      const { result } = renderHook(() => usePetManagement());

      // Assert
      expect(result.current.petModalVisible).toBe(false);
      expect(result.current.selectedPet).toBeNull();
    });
  });

  describe('modal management', () => {
    it('should open pet modal', () => {
      // Arrange
      const { result } = renderHook(() => usePetManagement());

      // Act
      act(() => {
        result.current.openAddPetModal();
      });

      // Assert
      expect(result.current.petModalVisible).toBe(true);
    });

    it('should close pet modal', () => {
      // Arrange
      const { result } = renderHook(() => usePetManagement());
      act(() => {
        result.current.openAddPetModal();
      });

      // Act
      act(() => {
        result.current.closeAddPetModal();
      });

      // Assert
      expect(result.current.petModalVisible).toBe(false);
    });
  });

  describe('handleAddPet', () => {
    it('should create pet without photo successfully', async () => {
      // Arrange
      const mockPet = { id: 1, name: 'Mochi', species: 'cat' };
      (supabasePetService.createPet as jest.Mock).mockResolvedValue({
        data: mockPet,
        error: null,
      });

      const { result } = renderHook(() => usePetManagement());

      // Act
      await act(async () => {
        await result.current.handleAddPet({ name: 'Mochi', species: 'cat' }, null);
      });

      // Assert
      expect(supabasePetService.createPet).toHaveBeenCalledWith({
        name: 'Mochi',
        species: 'cat',
      });
      expect(toast.success).toHaveBeenCalledWith('已创建宠物');
      expect(result.current.selectedPet).toEqual(mockPet);
    });

    it('should create pet with photo successfully', async () => {
      // Arrange
      const mockPet = { id: 1, name: 'Mochi', species: 'cat' };
      const mockPetWithPhoto = { ...mockPet, photo_url: 'https://example.com/photo.jpg' };

      (supabasePetService.createPet as jest.Mock).mockResolvedValue({
        data: mockPet,
        error: null,
      });
      (supabasePetService.uploadPetPhoto as jest.Mock).mockResolvedValue({
        data: mockPetWithPhoto,
        error: null,
      });

      const { result } = renderHook(() => usePetManagement());

      // Act
      await act(async () => {
        await result.current.handleAddPet(
          { name: 'Mochi', species: 'cat' },
          'file:///path/to/photo.jpg'
        );
      });

      // Assert
      expect(supabasePetService.uploadPetPhoto).toHaveBeenCalledWith(
        1,
        'file:///path/to/photo.jpg'
      );
      expect(toast.success).toHaveBeenCalledWith('已创建宠物');
    });

    it('should handle photo upload failure gracefully', async () => {
      // Arrange
      const mockPet = { id: 1, name: 'Mochi', species: 'cat' };

      (supabasePetService.createPet as jest.Mock).mockResolvedValue({
        data: mockPet,
        error: null,
      });
      (supabasePetService.uploadPetPhoto as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      });

      const { result } = renderHook(() => usePetManagement());

      // Act
      await act(async () => {
        await result.current.handleAddPet({ name: 'Mochi', species: 'cat' }, 'file:///photo.jpg');
      });

      // Assert
      expect(toast.warning).toHaveBeenCalled();
      expect(result.current.selectedPet).toEqual(mockPet);
    });

    it('should throw error on creation failure', async () => {
      // Arrange
      (supabasePetService.createPet as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Creation failed' },
      });

      const { result } = renderHook(() => usePetManagement());

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.handleAddPet({ name: 'Test', species: 'cat' }, null);
        })
      ).rejects.toThrow();

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('handleDeletePet', () => {
    it('should delete pet successfully', async () => {
      // Arrange
      (supabasePetService.deletePet as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => usePetManagement());

      // Act
      await act(async () => {
        await result.current.handleDeletePet(1);
      });

      // Assert
      expect(supabasePetService.deletePet).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith('已删除宠物');
    });

    it('should clear selectedPet if deleting current selection', async () => {
      // Arrange
      const mockPet = { id: 1, name: 'Mochi' };
      (supabasePetService.deletePet as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => usePetManagement());

      act(() => {
        result.current.selectPet(mockPet as any);
      });

      // Act
      await act(async () => {
        await result.current.handleDeletePet(1);
      });

      // Assert
      expect(result.current.selectedPet).toBeNull();
    });

    it('should not clear selectedPet if deleting different pet', async () => {
      // Arrange
      const mockPet = { id: 1, name: 'Mochi' };
      (supabasePetService.deletePet as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => usePetManagement());

      act(() => {
        result.current.selectPet(mockPet as any);
      });

      // Act
      await act(async () => {
        await result.current.handleDeletePet(2); // Different pet
      });

      // Assert
      expect(result.current.selectedPet).toEqual(mockPet);
    });

    it('should throw error on deletion failure', async () => {
      // Arrange
      (supabasePetService.deletePet as jest.Mock).mockResolvedValue({
        error: { message: 'Deletion failed' },
      });

      const { result } = renderHook(() => usePetManagement());

      // Act & Assert
      await expect(
        act(async () => {
          await result.current.handleDeletePet(1);
        })
      ).rejects.toThrow();

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('selectPet', () => {
    it('should set selected pet', () => {
      // Arrange
      const mockPet = { id: 1, name: 'Mochi' };
      const { result } = renderHook(() => usePetManagement());

      // Act
      act(() => {
        result.current.selectPet(mockPet as any);
      });

      // Assert
      expect(result.current.selectedPet).toEqual(mockPet);
    });

    it('should clear selection when null is passed', () => {
      // Arrange
      const { result } = renderHook(() => usePetManagement());
      act(() => {
        result.current.selectPet({ id: 1, name: 'Test' } as any);
      });

      // Act
      act(() => {
        result.current.selectPet(null);
      });

      // Assert
      expect(result.current.selectedPet).toBeNull();
    });
  });
});
