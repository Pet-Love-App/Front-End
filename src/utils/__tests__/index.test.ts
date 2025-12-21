import * as utils from '../index';
import { AppError, handleError } from '../errorHandler';
import { appEvents, APP_EVENTS } from '../eventEmitter';
import { logger } from '../logger';

describe('utils index', () => {
  it('should export errorHandler', () => {
    expect(utils.AppError).toBe(AppError);
    expect(utils.handleError).toBe(handleError);
  });

  it('should export eventEmitter', () => {
    expect(utils.appEvents).toBe(appEvents);
    expect(utils.APP_EVENTS).toBe(APP_EVENTS);
  });

  it('should export logger', () => {
    expect(utils.logger).toBe(logger);
  });
});
