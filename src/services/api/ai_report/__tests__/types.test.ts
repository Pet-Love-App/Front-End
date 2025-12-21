/**
 * AI Report Types Tests
 * 测试 AI 报告相关类型定义
 */

import {
  GenerateReportRequest,
  GenerateReportResponse,
  IngredientInfoRequest,
  IngredientInfoResponse,
  SaveReportRequest,
  SaveReportResponse,
  CheckReportExistsResponse,
  Favorite,
  FavoriteReport,
  AIReportData,
} from '../types';

describe('AI Report Types', () => {
  describe('GenerateReportRequest Interface', () => {
    it('should allow creating valid generate request', () => {
      // Arrange
      const request: GenerateReportRequest = {
        ingredients: 'Chicken, Rice',
        max_tokens: 1000,
      };

      // Act & Assert
      expect(request.ingredients).toBe('Chicken, Rice');
      expect(request.max_tokens).toBe(1000);
    });
  });

  describe('GenerateReportResponse Interface', () => {
    it('should allow creating valid generate response', () => {
      // Arrange
      const response: GenerateReportResponse = {
        additives: ['Vitamin A'],
        identified_nutrients: ['Protein'],
        safety: 'Safe',
        nutrient: 'Balanced',
        percentage: true,
        percent_data: { protein: 30 },
        tags: ['Healthy'],
      };

      // Act & Assert
      expect(response.additives).toContain('Vitamin A');
      expect(response.percent_data.protein).toBe(30);
    });
  });

  describe('IngredientInfoRequest Interface', () => {
    it('should allow creating valid ingredient info request', () => {
      // Arrange
      const request: IngredientInfoRequest = {
        ingredient: 'Taurine',
        lang: 'en',
      };

      // Act & Assert
      expect(request.ingredient).toBe('Taurine');
      expect(request.lang).toBe('en');
    });
  });

  describe('IngredientInfoResponse Interface', () => {
    it('should allow creating valid ingredient info response', () => {
      // Arrange
      const response: IngredientInfoResponse = {
        ok: true,
        data: {
          title: 'Taurine',
          extract: 'An amino acid',
        },
      };

      // Act & Assert
      expect(response.ok).toBe(true);
      expect(response.data?.title).toBe('Taurine');
    });
  });

  describe('SaveReportRequest Interface', () => {
    it('should allow creating valid save report request', () => {
      // Arrange
      const request: SaveReportRequest = {
        catfood_id: 123,
        ingredients_text: 'Chicken, Rice',
        tags: ['High Protein'],
        additives: ['Vitamin A'],
        ingredients: ['Chicken'],
        safety: 'Safe',
        nutrient: 'Good',
        percentage: false,
        percent_data: {},
      };

      // Act & Assert
      expect(request.catfood_id).toBe(123);
      expect(request.safety).toBe('Safe');
    });
  });

  describe('SaveReportResponse Interface', () => {
    it('should allow creating valid save report response', () => {
      // Arrange
      const response: SaveReportResponse = {
        ok: true,
        message: 'Saved successfully',
        data: {
          id: 1,
          catfood_id: 123,
          ingredients_text: 'Chicken, Rice',
          tags: ['High Protein'],
          additives: ['Vitamin A'],
          ingredients: ['Chicken'],
          safety: 'Safe',
          nutrient: 'Good',
          percentage: false,
          percent_data: {},
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
      };

      // Act & Assert
      expect(response.ok).toBe(true);
      expect(response.data.id).toBe(1);
    });
  });

  describe('CheckReportExistsResponse Interface', () => {
    it('should allow creating valid check report exists response', () => {
      // Arrange
      const response: CheckReportExistsResponse = {
        exists: true,
        catfood_id: 123,
        report_id: 1,
      };

      // Act & Assert
      expect(response.exists).toBe(true);
      expect(response.report_id).toBe(1);
    });
  });

  describe('Favorite Interface', () => {
    it('should allow creating valid favorite', () => {
      // Arrange
      const favorite: Favorite = {
        id: 1,
        catfoodId: '456',
        catfood: {
          id: '456',
          name: 'Food',
          brand: 'Brand',
        },
        createdAt: '2023-01-01',
      };

      // Act & Assert
      expect(favorite.catfoodId).toBe('456');
      expect(favorite.catfood.name).toBe('Food');
    });
  });

  describe('FavoriteReport Interface', () => {
    it('should allow creating valid favorite report', () => {
      // Arrange
      const report: FavoriteReport = {
        id: 1,
        reportId: 100,
        catfoodId: 123,
        report: {
          id: 100,
          catfood_id: 123,
          catfoodName: 'Food',
        },
        createdAt: '2023-01-01',
      };

      // Act & Assert
      expect(report.reportId).toBe(100);
      expect(report.report.catfoodName).toBe('Food');
    });
  });
});
