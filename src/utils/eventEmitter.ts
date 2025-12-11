/**
 * 简单的事件发射器
 * 用于组件间通信，如收藏变更通知
 */

type EventCallback = (...args: any[]) => void;

class EventEmitter {
  private events: Map<string, Set<EventCallback>> = new Map();

  /**
   * 订阅事件
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);

    // 返回取消订阅函数
    return () => {
      this.events.get(event)?.delete(callback);
    };
  }

  /**
   * 发射事件
   */
  emit(event: string, ...args: any[]): void {
    this.events.get(event)?.forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Event handler error for "${event}":`, error);
      }
    });
  }

  /**
   * 移除所有事件监听
   */
  clear(): void {
    this.events.clear();
  }
}

// 导出单例
export const appEvents = new EventEmitter();

// 定义事件名常量
export const APP_EVENTS = {
  FAVORITE_CHANGED: 'favorite_changed',
  LIKE_CHANGED: 'like_changed',
  POST_FAVORITE_CHANGED: 'post_favorite_changed',
} as const;
