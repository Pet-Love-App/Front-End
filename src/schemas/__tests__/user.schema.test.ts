/**
 * User Schema 单元测试
 *
 * 测试用户相关的 Zod schema 验证规则
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { userSchema, updateUsernameSchema, changePasswordSchema } from '../user.schema';

describe('User Schemas', () => {
  // ==================== User Schema ====================
  describe('userSchema', () => {
    it('should pass validation with complete user data', () => {
      // Arrange
      const validUser = {
        id: 'uuid-123-456',
        email: 'user@example.com',
        username: 'testuser',
        bio: 'I love cats!',
        avatar_url: 'https://example.com/avatar.jpg',
        is_admin: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        pets: [
          {
            id: 1,
            name: 'Mochi',
            species: 'cat',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      // Act
      const result = userSchema.safeParse(validUser);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.username).toBe('testuser');
        expect(result.data.pets).toHaveLength(1);
      }
    });

    it('should pass validation with minimal required fields', () => {
      // Arrange
      const minimalUser = {
        id: 'uuid-123',
        username: 'user',
      };

      // Act
      const result = userSchema.safeParse(minimalUser);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should pass validation when optional fields are null', () => {
      // Arrange
      const userWithNulls = {
        id: 'uuid-123',
        username: 'user',
        bio: null,
        avatar_url: null,
      };

      // Act
      const result = userSchema.safeParse(userWithNulls);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should default is_admin to false', () => {
      // Arrange
      const userWithoutAdmin = {
        id: 'uuid-123',
        username: 'user',
      };

      // Act
      const result = userSchema.safeParse(userWithoutAdmin);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_admin).toBe(false);
      }
    });

    it('should fail validation when id is missing', () => {
      // Arrange
      const invalidUser = {
        username: 'user',
      };

      // Act
      const result = userSchema.safeParse(invalidUser);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should fail validation when username is missing', () => {
      // Arrange
      const invalidUser = {
        id: 'uuid-123',
      };

      // Act
      const result = userSchema.safeParse(invalidUser);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should fail validation when email format is invalid', () => {
      // Arrange
      const invalidUser = {
        id: 'uuid-123',
        username: 'user',
        email: 'invalid-email',
      };

      // Act
      const result = userSchema.safeParse(invalidUser);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should validate nested pets array', () => {
      // Arrange
      const userWithMultiplePets = {
        id: 'uuid-123',
        username: 'user',
        pets: [
          {
            id: 1,
            name: 'Cat1',
            species: 'cat',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 2,
            name: 'Dog1',
            species: 'dog',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      };

      // Act
      const result = userSchema.safeParse(userWithMultiplePets);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.pets).toHaveLength(2);
      }
    });
  });

  // ==================== Update Username Schema ====================
  describe('updateUsernameSchema', () => {
    it('should pass validation with valid username', () => {
      // Arrange
      const validInput = {
        username: 'newusername',
      };

      // Act
      const result = updateUsernameSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail validation when username is too short', () => {
      // Arrange
      const invalidInput = {
        username: 'ab',
      };

      // Act
      const result = updateUsernameSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('用户名至少需要3个字符');
      }
    });

    it('should fail validation when username is too long', () => {
      // Arrange
      const invalidInput = {
        username: 'a'.repeat(21),
      };

      // Act
      const result = updateUsernameSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('用户名最多20个字符');
      }
    });

    it('should accept username with exactly 3 characters', () => {
      // Arrange
      const validInput = {
        username: 'abc',
      };

      // Act
      const result = updateUsernameSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should accept username with exactly 20 characters', () => {
      // Arrange
      const validInput = {
        username: 'a'.repeat(20),
      };

      // Act
      const result = updateUsernameSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  // ==================== Change Password Schema ====================
  describe('changePasswordSchema', () => {
    it('should pass validation with valid password data', () => {
      // Arrange
      const validInput = {
        current_password: 'currentpass',
        new_password: 'newpassword123',
        re_new_password: 'newpassword123',
      };

      // Act
      const result = changePasswordSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail validation when current_password is empty', () => {
      // Arrange
      const invalidInput = {
        current_password: '',
        new_password: 'newpassword123',
        re_new_password: 'newpassword123',
      };

      // Act
      const result = changePasswordSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('请输入当前密码');
      }
    });

    it('should fail validation when new_password is too short', () => {
      // Arrange
      const invalidInput = {
        current_password: 'currentpass',
        new_password: '12345',
        re_new_password: '12345',
      };

      // Act
      const result = changePasswordSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('新密码至少需要6个字符');
      }
    });

    it('should fail validation when re_new_password is too short', () => {
      // Arrange
      const invalidInput = {
        current_password: 'currentpass',
        new_password: 'newpassword123',
        re_new_password: '12345',
      };

      // Act
      const result = changePasswordSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('确认密码至少需要6个字符');
      }
    });
  });
});
