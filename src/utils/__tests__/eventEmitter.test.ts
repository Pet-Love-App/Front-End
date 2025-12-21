/**
 * EventEmitter 单元测试
 *
 * 测试事件发射器的订阅、发射和取消订阅功能
 * 遵循 AAA (Arrange-Act-Assert) 模式
 */

import { appEvents, APP_EVENTS } from '../eventEmitter';

describe('EventEmitter', () => {
  beforeEach(() => {
    // 每个测试前清除所有事件监听器
    appEvents.clear();
  });

  describe('on (subscribe)', () => {
    it('should register event listener', () => {
      // Arrange
      const callback = jest.fn();

      // Act
      appEvents.on('test_event', callback);
      appEvents.emit('test_event');

      // Assert
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return unsubscribe function', () => {
      // Arrange
      const callback = jest.fn();

      // Act
      const unsubscribe = appEvents.on('test_event', callback);
      unsubscribe();
      appEvents.emit('test_event');

      // Assert
      expect(callback).not.toHaveBeenCalled();
    });

    it('should allow multiple listeners for same event', () => {
      // Arrange
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      // Act
      appEvents.on('test_event', callback1);
      appEvents.on('test_event', callback2);
      appEvents.emit('test_event');

      // Assert
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('emit', () => {
    it('should pass arguments to callback', () => {
      // Arrange
      const callback = jest.fn();
      appEvents.on('test_event', callback);

      // Act
      appEvents.emit('test_event', 'arg1', 'arg2', { key: 'value' });

      // Assert
      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', { key: 'value' });
    });

    it('should not throw when emitting event with no listeners', () => {
      // Arrange & Act & Assert
      expect(() => {
        appEvents.emit('nonexistent_event');
      }).not.toThrow();
    });

    it('should handle errors in callbacks gracefully', () => {
      // Arrange
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = jest.fn();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      appEvents.on('test_event', errorCallback);
      appEvents.on('test_event', normalCallback);

      // Act
      appEvents.emit('test_event');

      // Assert
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled(); // 其他回调仍然被调用
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should call callback multiple times for multiple emits', () => {
      // Arrange
      const callback = jest.fn();
      appEvents.on('test_event', callback);

      // Act
      appEvents.emit('test_event');
      appEvents.emit('test_event');
      appEvents.emit('test_event');

      // Assert
      expect(callback).toHaveBeenCalledTimes(3);
    });
  });

  describe('off (unsubscribe)', () => {
    it('should remove specific listener', () => {
      // Arrange
      const callback = jest.fn();
      const unsubscribe = appEvents.on('test_event', callback);

      // Act
      unsubscribe();
      appEvents.emit('test_event');

      // Assert
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle unsubscribe when event map is empty', () => {
      // Arrange
      const callback = jest.fn();
      const unsubscribe = appEvents.on('test_event', callback);
      appEvents.clear(); // Manually clear events

      // Act & Assert
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should remove all listeners', () => {
      // Arrange
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      appEvents.on('event1', callback1);
      appEvents.on('event2', callback2);

      // Act
      appEvents.clear();
      appEvents.emit('event1');
      appEvents.emit('event2');

      // Assert
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });
  });

  describe('APP_EVENTS constants', () => {
    it('should have FAVORITE_CHANGED event', () => {
      expect(APP_EVENTS.FAVORITE_CHANGED).toBe('favorite_changed');
    });

    it('should have LIKE_CHANGED event', () => {
      expect(APP_EVENTS.LIKE_CHANGED).toBe('like_changed');
    });

    it('should have POST_FAVORITE_CHANGED event', () => {
      expect(APP_EVENTS.POST_FAVORITE_CHANGED).toBe('post_favorite_changed');
    });
  });

  describe('Real-world usage scenarios', () => {
    it('should handle FAVORITE_CHANGED event correctly', () => {
      // Arrange
      const callback = jest.fn();
      appEvents.on(APP_EVENTS.FAVORITE_CHANGED, callback);

      // Act
      appEvents.emit(APP_EVENTS.FAVORITE_CHANGED, {
        catfoodId: 'catfood-123',
        isFavorite: true,
      });

      // Assert
      expect(callback).toHaveBeenCalledWith({
        catfoodId: 'catfood-123',
        isFavorite: true,
      });
    });

    it('should handle LIKE_CHANGED event correctly', () => {
      // Arrange
      const callback = jest.fn();
      appEvents.on(APP_EVENTS.LIKE_CHANGED, callback);

      // Act
      appEvents.emit(APP_EVENTS.LIKE_CHANGED, {
        itemId: 'item-456',
        isLiked: true,
        newLikeCount: 10,
      });

      // Assert
      expect(callback).toHaveBeenCalledWith({
        itemId: 'item-456',
        isLiked: true,
        newLikeCount: 10,
      });
    });

    it('should allow component to unsubscribe on cleanup', () => {
      // Arrange - 模拟组件挂载
      const callback = jest.fn();
      const unsubscribe = appEvents.on(APP_EVENTS.FAVORITE_CHANGED, callback);

      // Act - 模拟组件卸载
      unsubscribe();

      // 发射事件
      appEvents.emit(APP_EVENTS.FAVORITE_CHANGED, { catfoodId: 'test' });

      // Assert - 回调不应被调用
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
