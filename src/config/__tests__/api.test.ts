import { API_ENDPOINTS } from '../api';

describe('API_ENDPOINTS', () => {
  it('should have correct AI_REPORT endpoints', () => {
    expect(API_ENDPOINTS.AI_REPORT.LLM_CHAT).toBe('/api/ai/llm/chat/');
    expect(API_ENDPOINTS.AI_REPORT.SAVE).toBe('/api/ai/save/');
    expect(API_ENDPOINTS.AI_REPORT.GET(123)).toBe('/api/ai/123/');
    expect(API_ENDPOINTS.AI_REPORT.DELETE(123)).toBe('/api/ai/123/delete/');
    expect(API_ENDPOINTS.AI_REPORT.EXISTS(123)).toBe('/api/ai/123/exists/');
    expect(API_ENDPOINTS.AI_REPORT.FAVORITES).toBe('/api/ai/favorites/');
    expect(API_ENDPOINTS.AI_REPORT.TOGGLE_FAVORITE).toBe('/api/ai/favorites/toggle/');
    expect(API_ENDPOINTS.AI_REPORT.DELETE_FAVORITE(123)).toBe('/api/ai/favorites/123/delete/');
  });

  it('should have correct OCR endpoints', () => {
    expect(API_ENDPOINTS.OCR.RECOGNIZE).toBe('/api/ocr/recognize/');
  });

  it('should have correct ADDITIVE endpoints', () => {
    expect(API_ENDPOINTS.ADDITIVE.INGREDIENT_INFO).toBe('/api/search/ingredient/info');
  });
});