import * as Core from '../index';

describe('API Core Module Exports', () => {
  it('should export helpers', () => {
    expect(Core.buildQueryString).toBeDefined();
    expect(Core.camelToSnake).toBeDefined();
    expect(Core.createErrorDetail).toBeDefined();
    expect(Core.devError).toBeDefined();
    expect(Core.devLog).toBeDefined();
    expect(Core.extractData).toBeDefined();
    expect(Core.extractList).toBeDefined();
    expect(Core.normalizePaginatedResponse).toBeDefined();
    expect(Core.safeParseSchema).toBeDefined();
    expect(Core.snakeToCamel).toBeDefined();
    expect(Core.toCamelCase).toBeDefined();
    expect(Core.toSnakeCase).toBeDefined();
    expect(Core.wrapError).toBeDefined();
    expect(Core.wrapResponse).toBeDefined();
    expect(Core.wrapSuccess).toBeDefined();
  });

  it('should export http client', () => {
    expect(Core.apiClient).toBeDefined();
    expect(Core.httpClient).toBeDefined();
  });
});
