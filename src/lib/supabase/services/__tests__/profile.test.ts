/**
 * Profile Service 集成测试
 *
 * 测试用户资料管理服务
 * 遵循 JavaScript Testing Best Practices
 */

import { supabaseProfileService } from '../profile';
import type { UpdateProfileParams } from '../profile';
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

describe('SupabaseProfileService', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('getCurrentProfile', () => {
    it('should return current user profile with pets', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      const mockProfile = {
        id: 'user-123',
        username: 'testuser',
        avatar_url: 'https://example.com/avatar.jpg',
        bio: 'Test bio',
        phone: null,
        is_admin: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const mockPets = [
        {
          id: 1,
          name: 'Mochi',
          species: 'cat',
          user_id: 'user-123',
        },
      ];

      // Mock profile query - return single result for .single() call
      (mockSupabaseClient.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          const builder = {
            select: jest.fn(),
            eq: jest.fn(),
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          };
          builder.select.mockReturnValue(builder);
          builder.eq.mockReturnValue(builder);
          return builder;
        }
        if (table === 'pets') {
          const builder = {
            select: jest.fn(),
            eq: jest.fn(),
            order: jest.fn().mockResolvedValue({ data: mockPets, error: null }),
          };
          builder.select.mockReturnValue(builder);
          builder.eq.mockReturnValue(builder);
          return builder;
        }
        return {};
      });

      // Act
      const result = await supabaseProfileService.getCurrentProfile();

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('testuser');
    });

    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      // Act
      const result = await supabaseProfileService.getCurrentProfile();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_AUTHENTICATED');
    });

    it('should handle missing profile gracefully', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      (mockSupabaseClient.from as jest.Mock).mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }));

      // Act
      const result = await supabaseProfileService.getCurrentProfile();

      // Assert
      expect(result.success).toBe(false);
      // Note: error code is UNKNOWN when profile is null
    });
  });

  describe('getProfileById', () => {
    it('should return profile by user id', async () => {
      // Arrange
      const mockProfile = {
        id: 'user-456',
        username: 'otheruser',
        avatar_url: null,
        bio: null,
      };

      setupFromMock('profiles', mockSuccessResponse(mockProfile));

      // Act
      const result = await supabaseProfileService.getProfileById('user-456');

      // Assert
      expect(result.success).toBe(true);
      expect(result.data?.username).toBe('otheruser');
    });

    it('should handle query for non-existent user', async () => {
      // Arrange
      setupFromMock('profiles', mockSuccessResponse(null));

      // Act
      const result = await supabaseProfileService.getProfileById('nonexistent');

      // Assert - single() returns data: null without error when not found
      expect(result.data).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile with valid data', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const updates: UpdateProfileParams = {
        username: 'newusername',
        bio: 'Updated bio',
      };

      setupFromMock('profiles', mockSuccessResponse([{ id: 'user-123', ...updates }]));

      // Act
      const result = await supabaseProfileService.updateProfile(updates);

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
      const result = await supabaseProfileService.updateProfile({ username: 'test' });

      // Assert
      expect(result.success).toBe(false);
    });

    it('should handle username conflict', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('profiles', mockErrorResponse('Username already taken', 'UNIQUE_VIOLATION'));

      // Act
      const result = await supabaseProfileService.updateProfile({
        username: 'taken_username',
      });

      // Assert
      expect(result.success).toBe(false);
    });

    it('should allow updating only bio', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('profiles', mockSuccessResponse([{ bio: 'New bio' }]));

      // Act
      const result = await supabaseProfileService.updateProfile({ bio: 'New bio' });

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock file system read
      const fs = require('expo-file-system/legacy');
      fs.readAsStringAsync.mockResolvedValue('base64string');

      // Mock storage upload
      mockSupabaseClient.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'avatars/user-123.jpg' },
          error: null,
        }),
        download: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/avatar.jpg' },
        }),
        createSignedUrl: jest.fn(),
      });

      // Mock profile update
      setupFromMock(
        'profiles',
        mockSuccessResponse([{ avatar_url: 'https://example.com/avatar.jpg' }])
      );

      // Act
      const result = await supabaseProfileService.uploadAvatar('file:///path/to/image.jpg');

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
      const result = await supabaseProfileService.uploadAvatar('file:///path/to/image.jpg');

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar successfully', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      setupFromMock('profiles', mockSuccessResponse([{ avatar_url: null }]));

      // Act
      const result = await supabaseProfileService.deleteAvatar();

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
      const result = await supabaseProfileService.deleteAvatar();

      // Assert
      expect(result.success).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should convert snake_case to camelCase in responses', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      const mockProfile = {
        id: 'user-123',
        username: 'testuser',
        avatar_url: 'url',
        is_admin: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      (mockSupabaseClient.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'profiles') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
          };
        }
        if (table === 'pets') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
        return {};
      });

      // Act
      const result = await supabaseProfileService.getCurrentProfile();

      // Assert
      expect(result.data?.avatarUrl).toBeDefined();
      expect(result.data?.isAdmin).toBeDefined();
    });

    it('should handle exceptions gracefully', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockRejectedValue(new Error('Unexpected error'));

      // Act
      const result = await supabaseProfileService.getCurrentProfile();

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
