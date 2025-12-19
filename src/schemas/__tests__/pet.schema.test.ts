/**
 * Pet Schema 单元测试
 *
 * 测试宠物相关的 Zod schema 验证规则
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { petSchema, petInputSchema } from '../pet.schema';

describe('Pet Schemas', () => {
  // ==================== Pet Schema ====================
  describe('petSchema', () => {
    it('should pass validation with complete pet data', () => {
      // Arrange
      const validPet = {
        id: 1,
        name: 'Mochi',
        species: 'cat',
        species_display: '猫',
        breed: 'British Shorthair',
        age: 3,
        photo_url: 'https://example.com/mochi.jpg',
        description: 'A lovely cat',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Act
      const result = petSchema.safeParse(validPet);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Mochi');
        expect(result.data.species).toBe('cat');
      }
    });

    it('should pass validation with minimal required fields', () => {
      // Arrange
      const minimalPet = {
        id: 1,
        name: 'Pet',
        species: 'dog',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Act
      const result = petSchema.safeParse(minimalPet);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should pass validation when optional fields are null', () => {
      // Arrange
      const petWithNulls = {
        id: 1,
        name: 'Pet',
        species: 'bird',
        breed: null,
        age: null,
        photo_url: null,
        description: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Act
      const result = petSchema.safeParse(petWithNulls);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail validation when id is missing', () => {
      // Arrange
      const invalidPet = {
        name: 'Pet',
        species: 'cat',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Act
      const result = petSchema.safeParse(invalidPet);

      // Assert
      expect(result.success).toBe(false);
    });

    it('should fail validation when name is missing', () => {
      // Arrange
      const invalidPet = {
        id: 1,
        species: 'cat',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Act
      const result = petSchema.safeParse(invalidPet);

      // Assert
      expect(result.success).toBe(false);
    });
  });

  // ==================== Pet Input Schema ====================
  describe('petInputSchema', () => {
    it('should pass validation with valid input data', () => {
      // Arrange
      const validInput = {
        name: 'Fluffy',
        species: 'cat',
        breed: 'Persian',
        age: 2,
        description: 'A fluffy persian cat',
      };

      // Act
      const result = petInputSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should pass validation with minimal required fields', () => {
      // Arrange
      const minimalInput = {
        name: 'Pet',
        species: 'dog',
      };

      // Act
      const result = petInputSchema.safeParse(minimalInput);

      // Assert
      expect(result.success).toBe(true);
    });

    it('should fail validation when name is empty', () => {
      // Arrange
      const invalidInput = {
        name: '',
        species: 'cat',
      };

      // Act
      const result = petInputSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('请输入宠物名称');
      }
    });

    it('should fail validation when name exceeds 100 characters', () => {
      // Arrange
      const invalidInput = {
        name: 'A'.repeat(101),
        species: 'cat',
      };

      // Act
      const result = petInputSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('宠物名称最多100个字符');
      }
    });

    it('should fail validation when species is invalid', () => {
      // Arrange
      const invalidInput = {
        name: 'Pet',
        species: 'dinosaur',
      };

      // Act
      const result = petInputSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('请选择宠物种类');
      }
    });

    it('should accept all valid species types', () => {
      // Arrange
      const speciesTypes = ['dog', 'cat', 'bird', 'other'];

      // Act & Assert
      speciesTypes.forEach((species) => {
        const input = { name: 'Pet', species };
        const result = petInputSchema.safeParse(input);
        expect(result.success).toBe(true);
      });
    });

    it('should fail validation when age is negative', () => {
      // Arrange
      const invalidInput = {
        name: 'Pet',
        species: 'cat',
        age: -1,
      };

      // Act
      const result = petInputSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('年龄不能为负数');
      }
    });

    it('should fail validation when age exceeds 100', () => {
      // Arrange
      const invalidInput = {
        name: 'Pet',
        species: 'cat',
        age: 101,
      };

      // Act
      const result = petInputSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('年龄过大');
      }
    });

    it('should fail validation when description exceeds 500 characters', () => {
      // Arrange
      const invalidInput = {
        name: 'Pet',
        species: 'cat',
        description: 'D'.repeat(501),
      };

      // Act
      const result = petInputSchema.safeParse(invalidInput);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('描述最多500个字符');
      }
    });

    it('should accept null age', () => {
      // Arrange
      const validInput = {
        name: 'Pet',
        species: 'cat',
        age: null,
      };

      // Act
      const result = petInputSchema.safeParse(validInput);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
