import * as utils from '../index';

describe('utils index', () => {
  it('should export errorHandler', () => {
    expect(utils.AppError).toBeDefined();
    expect(utils.handleError).toBeDefined();
  });

  it('should export eventEmitter', () => {
    expect(utils.appEvents).toBeDefined();
  });

  it('should export logger', () => {
    expect(utils.logger).toBeDefined();
  });
});
