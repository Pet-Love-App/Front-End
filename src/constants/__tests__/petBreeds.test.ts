/**
 * Pet Breeds Constants 测试
 *
 * 测试宠物品种配置和工具函数
 */

import {
  CAT_BREEDS,
  DOG_BREEDS,
  BIRD_BREEDS,
  OTHER_BREEDS,
  getBreedsBySpecies,
  getPopularBreeds,
} from '../petBreeds';

import type { PetSpecies } from '../petBreeds';

describe('Pet Breeds Constants', () => {
  describe('breed arrays', () => {
    it('should have cat breeds', () => {
      expect(CAT_BREEDS).toBeDefined();
      expect(Array.isArray(CAT_BREEDS)).toBe(true);
      expect(CAT_BREEDS.length).toBeGreaterThan(0);
    });

    it('should have dog breeds', () => {
      expect(DOG_BREEDS).toBeDefined();
      expect(Array.isArray(DOG_BREEDS)).toBe(true);
      expect(DOG_BREEDS.length).toBeGreaterThan(0);
    });

    it('should have bird breeds', () => {
      expect(BIRD_BREEDS).toBeDefined();
      expect(Array.isArray(BIRD_BREEDS)).toBe(true);
      expect(BIRD_BREEDS.length).toBeGreaterThan(0);
    });

    it('should have other breeds', () => {
      expect(OTHER_BREEDS).toBeDefined();
      expect(Array.isArray(OTHER_BREEDS)).toBe(true);
      expect(OTHER_BREEDS.length).toBeGreaterThan(0);
    });
  });

  describe('breed structure', () => {
    it('should have correct structure for cat breeds', () => {
      CAT_BREEDS.forEach((breed) => {
        expect(breed).toHaveProperty('label');
        expect(typeof breed.label).toBe('string');
        expect(breed.label.length).toBeGreaterThan(0);
      });
    });

    it('should have popular flag for some breeds', () => {
      const popularCats = CAT_BREEDS.filter((b) => b.popular);
      expect(popularCats.length).toBeGreaterThan(0);
    });

    it('should include "其他" as last option', () => {
      expect(CAT_BREEDS[CAT_BREEDS.length - 1].label).toBe('其他');
      expect(DOG_BREEDS[DOG_BREEDS.length - 1].label).toBe('其他');
      expect(BIRD_BREEDS[BIRD_BREEDS.length - 1].label).toBe('其他');
      expect(OTHER_BREEDS[OTHER_BREEDS.length - 1].label).toBe('其他');
    });
  });

  describe('getBreedsBySpecies', () => {
    it('should return cat breeds for cat species', () => {
      // Act
      const result = getBreedsBySpecies('cat');

      // Assert
      expect(result).toEqual(CAT_BREEDS);
    });

    it('should return dog breeds for dog species', () => {
      // Act
      const result = getBreedsBySpecies('dog');

      // Assert
      expect(result).toEqual(DOG_BREEDS);
    });

    it('should return bird breeds for bird species', () => {
      // Act
      const result = getBreedsBySpecies('bird');

      // Assert
      expect(result).toEqual(BIRD_BREEDS);
    });

    it('should return other breeds for other species', () => {
      // Act
      const result = getBreedsBySpecies('other');

      // Assert
      expect(result).toEqual(OTHER_BREEDS);
    });

    it('should return empty array for invalid species', () => {
      // Act
      const result = getBreedsBySpecies('invalid' as PetSpecies);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getPopularBreeds', () => {
    it('should return only popular cat breeds', () => {
      // Act
      const result = getPopularBreeds('cat');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThan(CAT_BREEDS.length);
      expect(result).toContain('英国短毛猫');
      expect(result).toContain('布偶猫');
    });

    it('should return only popular dog breeds', () => {
      // Act
      const result = getPopularBreeds('dog');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('金毛寻回犬');
      expect(result).toContain('哈士奇');
    });

    it('should return only popular bird breeds', () => {
      // Act
      const result = getPopularBreeds('bird');

      // Assert
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain('虎皮鹦鹉');
    });

    it('should return empty array when no popular breeds', () => {
      // Act
      const result = getPopularBreeds('invalid' as PetSpecies);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('data quality', () => {
    it('should have at least 10 cat breeds', () => {
      expect(CAT_BREEDS.length).toBeGreaterThanOrEqual(10);
    });

    it('should have at least 10 dog breeds', () => {
      expect(DOG_BREEDS.length).toBeGreaterThanOrEqual(10);
    });

    it('should have no duplicate breed labels', () => {
      const checkUnique = (breeds: typeof CAT_BREEDS) => {
        const labels = breeds.map((b) => b.label);
        const uniqueLabels = new Set(labels);
        expect(uniqueLabels.size).toBe(labels.length);
      };

      checkUnique(CAT_BREEDS);
      checkUnique(DOG_BREEDS);
      checkUnique(BIRD_BREEDS);
      checkUnique(OTHER_BREEDS);
    });

    it('should have at least one popular breed per species', () => {
      expect(CAT_BREEDS.filter((b) => b.popular).length).toBeGreaterThan(0);
      expect(DOG_BREEDS.filter((b) => b.popular).length).toBeGreaterThan(0);
      expect(BIRD_BREEDS.filter((b) => b.popular).length).toBeGreaterThan(0);
    });
  });
});
