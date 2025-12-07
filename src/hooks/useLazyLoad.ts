/**
 * 懒加载状态管理 Hook
 * 用于管理组件的加载状态和延迟渲染
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';

interface UseLazyLoadOptions {
  /** 延迟时间（毫秒） */
  delay?: number;
  /** 是否在交互完成后加载 */
  waitForInteraction?: boolean;
  /** 是否立即开始加载 */
  immediate?: boolean;
}

interface UseLazyLoadReturn {
  /** 是否准备好渲染 */
  isReady: boolean;
  /** 是否正在加载 */
  isLoading: boolean;
  /** 手动触发加载 */
  startLoading: () => void;
  /** 重置状态 */
  reset: () => void;
}

/**
 * 懒加载状态管理 Hook
 */
export function useLazyLoad(options: UseLazyLoadOptions = {}): UseLazyLoadReturn {
  const { delay = 0, waitForInteraction = true, immediate = true } = options;

  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interactionRef = useRef<ReturnType<typeof InteractionManager.runAfterInteractions> | null>(
    null
  );

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (interactionRef.current) {
      interactionRef.current.cancel();
      interactionRef.current = null;
    }
  }, []);

  const startLoading = useCallback(() => {
    cleanup();
    setIsLoading(true);

    const doLoad = () => {
      if (delay > 0) {
        timeoutRef.current = setTimeout(() => {
          setIsReady(true);
          setIsLoading(false);
        }, delay);
      } else {
        setIsReady(true);
        setIsLoading(false);
      }
    };

    if (waitForInteraction) {
      interactionRef.current = InteractionManager.runAfterInteractions(doLoad);
    } else {
      doLoad();
    }
  }, [cleanup, delay, waitForInteraction]);

  const reset = useCallback(() => {
    cleanup();
    setIsReady(false);
    setIsLoading(false);
  }, [cleanup]);

  useEffect(() => {
    if (immediate) {
      startLoading();
    }

    return cleanup;
  }, [immediate, startLoading, cleanup]);

  return {
    isReady,
    isLoading,
    startLoading,
    reset,
  };
}

// ==================== 批量懒加载 Hook ====================

interface UseBatchLazyLoadOptions {
  /** 总数量 */
  total: number;
  /** 每批数量 */
  batchSize?: number;
  /** 批次间隔（毫秒） */
  interval?: number;
}

interface UseBatchLazyLoadReturn {
  /** 当前可见数量 */
  visibleCount: number;
  /** 是否全部加载完成 */
  isComplete: boolean;
  /** 加载进度 (0-1) */
  progress: number;
  /** 重置 */
  reset: () => void;
}

/**
 * 批量懒加载 Hook
 * 用于长列表的渐进式渲染
 */
export function useBatchLazyLoad(options: UseBatchLazyLoadOptions): UseBatchLazyLoadReturn {
  const { total, batchSize = 10, interval = 100 } = options;

  const [visibleCount, setVisibleCount] = useState(Math.min(batchSize, total));
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visibleCount >= total) return;

    intervalRef.current = setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + batchSize, total));
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [visibleCount, total, batchSize, interval]);

  const reset = useCallback(() => {
    setVisibleCount(Math.min(batchSize, total));
  }, [batchSize, total]);

  return {
    visibleCount,
    isComplete: visibleCount >= total,
    progress: total > 0 ? visibleCount / total : 1,
    reset,
  };
}

// ==================== 视口懒加载 Hook ====================

interface UseViewportLazyLoadOptions {
  /** 是否启用 */
  enabled?: boolean;
  /** 触发阈值（像素） */
  threshold?: number;
}

/**
 * 视口懒加载 Hook
 * 当组件进入视口时触发加载
 */
export function useViewportLazyLoad(options: UseViewportLazyLoadOptions = {}) {
  const { enabled = true, threshold = 100 } = options;

  const [isVisible, setIsVisible] = useState(!enabled);
  const [hasLoaded, setHasLoaded] = useState(!enabled);

  const onViewableChange = useCallback(
    (info: { viewableItems: { isViewable: boolean }[] }) => {
      if (!enabled || hasLoaded) return;

      const isNowVisible = info.viewableItems.some((item) => item.isViewable);
      if (isNowVisible) {
        setIsVisible(true);
        setHasLoaded(true);
      }
    },
    [enabled, hasLoaded]
  );

  return {
    isVisible,
    hasLoaded,
    onViewableChange,
    viewabilityConfig: {
      viewAreaCoveragePercentThreshold: threshold,
    },
  };
}
