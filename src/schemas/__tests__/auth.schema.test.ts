/**
 * Auth Schema 单元测试
 *
 * 测试认证相关的 Zod schema 验证规则
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { ZodError } from 'zod';

import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  supabaseSessionSchema,
} from '../auth.schema';

describe('Auth Schemas', () => {
  // ==================== Login Schema ====================
  describe('loginSchema', () => {
    it('should pass validation with valid email and password', () => {
      // Arrange
      const validInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Act
      const result = loginSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
        expect(result.data.password).toBe('password123');
      }
    });

    it('should fail validation when email is empty', () => {
      // Arrange
      const invalidInput = {
        email: '',
        password: 'password123',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('请输入邮箱');
      }
    });

    it('should fail validation when email format is invalid', () => {
      // Arrange
      const invalidInput = {
        email: 'invalid-email',
        password: 'password123',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('请输入有效的邮箱地址');
      }
    });

    it('should fail validation when password is less than 6 characters', () => {
      // Arrange
      const invalidInput = {
        email: 'test@example.com',
        password: '12345',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('密码至少6个字符');
      }
    });

    it('should fail validation when password is empty', () => {
      // Arrange
      const invalidInput = {
        email: 'test@example.com',
        password: '',
      };

      // Act
      const result = loginSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('请输入密码');
      }
    });
  });

  // ==================== Register Schema ====================
  describe('registerSchema', () => {
    it('should pass validation with valid registration data', () => {
      // Arrange
      const validInput = {
        email: 'newuser@example.com',
        password: 'Password123',
        username: 'newuser',
      };

      // Act
      const result = registerSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail validation when password has no letters', () => {
      // Arrange
      const invalidInput = {
        email: 'test@example.com',
        password: '123456789',
        username: 'testuser',
      };

      // Act
      const result = registerSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain('密码必须包含字母');
      }
    });

    it('should fail validation when password has no numbers', () => {
      // Arrange
      const invalidInput = {
        email: 'test@example.com',
        password: 'abcdefgh',
        username: 'testuser',
      };

      // Act
      const result = registerSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const messages = result.error.issues.map((i) => i.message);
        expect(messages).toContain('密码必须包含数字');
      }
    });

    it('should fail validation when username is less than 3 characters', () => {
      // Arrange
      const invalidInput = {
        email: 'test@example.com',
        password: 'Password123',
        username: 'ab',
      };

      // Act
      const result = registerSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('用户名至少3个字符');
      }
    });

    it('should fail validation when username contains special characters', () => {
      // Arrange
      const invalidInput = {
        email: 'test@example.com',
        password: 'Password123',
        username: 'user@name!',
      };

      // Act
      const result = registerSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('用户名只能包含字母、数字和下划线');
      }
    });

    it('should accept username with underscores', () => {
      // Arrange
      const validInput = {
        email: 'test@example.com',
        password: 'Password123',
        username: 'user_name_123',
      };

      // Act
      const result = registerSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  // ==================== Change Password Schema ====================
  describe('changePasswordSchema', () => {
    it('should pass validation when passwords match', () => {
      // Arrange
      const validInput = {
        current_password: 'OldPassword123',
        new_password: 'NewPassword123',
        re_new_password: 'NewPassword123',
      };

      // Act
      const result = changePasswordSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail validation when new passwords do not match', () => {
      // Arrange
      const invalidInput = {
        current_password: 'OldPassword123',
        new_password: 'NewPassword123',
        re_new_password: 'DifferentPassword123',
      };

      // Act
      const result = changePasswordSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('两次输入的新密码不一致');
      }
    });

    it('should fail validation when new password is too weak', () => {
      // Arrange
      const invalidInput = {
        current_password: 'OldPassword123',
        new_password: '12345',
        re_new_password: '12345',
      };

      // Act
      const result = changePasswordSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  // ==================== Supabase Session Schema ====================
  describe('supabaseSessionSchema', () => {
    it('should pass validation with valid session data', () => {
      // Arrange
      const validSession = {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refresh_token: 'refresh_token_value',
        expires_in: 3600,
        expires_at: 1704067200,
        token_type: 'bearer',
        user: {
          id: 'uuid-123',
          email: 'test@example.com',
        },
      };

      // Act
      const result = supabaseSessionSchema.safeParse(validSession);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should pass validation with minimal required fields', () => {
      // Arrange
      const minimalSession = {
        access_token: 'token',
        refresh_token: 'refresh',
      };

      // Act
      const result = supabaseSessionSchema.safeParse(minimalSession);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail validation when access_token is missing', () => {
      // Arrange
      const invalidSession = {
        refresh_token: 'refresh',
      };

      // Act
      const result = supabaseSessionSchema.safeParse(invalidSession);

      // Assert
      expect(result.success).toBe(false);
    });
  });
});
