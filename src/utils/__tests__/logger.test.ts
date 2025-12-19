/**
 * Logger 单元测试
 *
 * 测试日志工具的各种功能
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { logger } from '../logger';

describe('Logger', () => {
  // 保存原始 console 方法
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    group: console.group,
    groupEnd: console.groupEnd,
  };

  beforeEach(() => {
    // Mock console 方法
    console.log = jest.fn();
    console.warn = jest.fn();
    console.error = jest.fn();
    console.group = jest.fn();
    console.groupEnd = jest.fn();
  });

  afterEach(() => {
    // 恢复原始 console 方法
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.group = originalConsole.group;
    console.groupEnd = originalConsole.groupEnd;
  });

  describe('debug', () => {
    it('should call console.log in development mode', () => {
      // Arrange
      const message = 'Debug message';

      // Act
      logger.debug(message);

      // Assert - 在开发环境应该调用 console.log
      // 注意：测试环境 __DEV__ 通常为 true
      if ((global as any).__DEV__) {
        expect(console.log).toHaveBeenCalled();
      }
    });

    it('should include context when provided', () => {
      // Arrange
      const message = 'Debug with context';
      const context = { userId: 123, action: 'test' };

      // Act
      logger.debug(message, context);

      // Assert
      if ((global as any).__DEV__) {
        expect(console.log).toHaveBeenCalled();
      }
    });
  });

  describe('info', () => {
    it('should call console.log for info level', () => {
      // Arrange
      const message = 'Info message';

      // Act
      logger.info(message);

      // Assert
      if ((global as any).__DEV__) {
        expect(console.log).toHaveBeenCalled();
      }
    });
  });

  describe('warn', () => {
    it('should call console.warn for warn level', () => {
      // Arrange
      const message = 'Warning message';

      // Act
      logger.warn(message);

      // Assert
      if ((global as any).__DEV__) {
        expect(console.warn).toHaveBeenCalled();
      }
    });

    it('should include context in warning', () => {
      // Arrange
      const message = 'Warning with context';
      const context = { deprecated: true, api: '/old-endpoint' };

      // Act
      logger.warn(message, context);

      // Assert
      if ((global as any).__DEV__) {
        expect(console.warn).toHaveBeenCalled();
      }
    });
  });

  describe('error', () => {
    it('should always call console.error for errors', () => {
      // Arrange
      const message = 'Error message';

      // Act
      logger.error(message);

      // Assert - 错误在所有环境都应该记录
      expect(console.error).toHaveBeenCalled();
    });

    it('should log error object when provided', () => {
      // Arrange
      const message = 'Error with exception';
      const error = new Error('Test error');

      // Act
      logger.error(message, error);

      // Assert
      expect(console.error).toHaveBeenCalled();
    });

    it('should include context with error', () => {
      // Arrange
      const message = 'Error with context';
      const error = new Error('Test error');
      const context = { component: 'TestComponent', userId: 123 };

      // Act
      logger.error(message, error, context);

      // Assert
      expect(console.error).toHaveBeenCalled();
    });

    it('should work without error object', () => {
      // Arrange
      const message = 'Error without exception';
      const context = { operation: 'failed' };

      // Act
      logger.error(message, undefined, context);

      // Assert
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('performance', () => {
    it('should return the result of the function', async () => {
      // Arrange
      const expectedResult = { data: 'test' };
      const fn = async () => expectedResult;

      // Act
      const result = await logger.performance('Test operation', fn);

      // Assert
      expect(result).toEqual(expectedResult);
    });

    it('should propagate errors from the function', async () => {
      // Arrange
      const error = new Error('Test error');
      const fn = async () => {
        throw error;
      };

      // Act & Assert
      await expect(logger.performance('Failing operation', fn)).rejects.toThrow('Test error');
    });

    it('should log start and end in development mode', async () => {
      // Arrange
      const fn = async () => 'result';

      // Act
      await logger.performance('Timed operation', fn);

      // Assert - 在开发环境应该有日志
      if ((global as any).__DEV__) {
        expect(console.log).toHaveBeenCalled();
      }
    });
  });

  describe('group', () => {
    it('should call console.group and groupEnd in development mode', () => {
      // Arrange
      const label = 'Test Group';
      const fn = jest.fn();

      // Act
      logger.group(label, fn);

      // Assert
      if ((global as any).__DEV__) {
        expect(console.group).toHaveBeenCalled();
        expect(fn).toHaveBeenCalled();
        expect(console.groupEnd).toHaveBeenCalled();
      }
    });

    it('should still call groupEnd even if function throws', () => {
      // Arrange
      const label = 'Error Group';
      const fn = () => {
        throw new Error('Group error');
      };

      // Act & Assert
      if ((global as any).__DEV__) {
        expect(() => logger.group(label, fn)).toThrow('Group error');
        expect(console.groupEnd).toHaveBeenCalled();
      }
    });
  });
});
