import * as Api from '../index';

describe('API Module Exports', () => {
  it('should export core modules', () => {
    expect(Api.apiClient).toBeDefined();
    expect(Api.buildQueryString).toBeDefined();
    expect(Api.devError).toBeDefined();
    expect(Api.devLog).toBeDefined();
    expect(Api.extractData).toBeDefined();
    expect(Api.extractList).toBeDefined();
    expect(Api.httpClient).toBeDefined();
    expect(Api.normalizePaginatedResponse).toBeDefined();
    expect(Api.safeParseSchema).toBeDefined();
    expect(Api.toCamelCase).toBeDefined();
    expect(Api.toSnakeCase).toBeDefined();
    expect(Api.wrapError).toBeDefined();
    expect(Api.wrapResponse).toBeDefined();
    expect(Api.wrapSuccess).toBeDefined();
  });

  it('should export OCR service', () => {
    expect(Api.ocrService).toBeDefined();
    expect(Api.recognizeImage).toBeDefined();
  });

  it('should export AI Report service', () => {
    expect(Api.aiReportService).toBeDefined();
  });

  it('should export Search service', () => {
    expect(Api.searchService).toBeDefined();
  });
});
