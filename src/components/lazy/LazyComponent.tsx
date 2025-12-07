/**
 * 懒加载组件工具
 * 提供 React.lazy 的封装，支持加载状态和错误处理
 */

import React, { ComponentType, lazy, Suspense, useEffect, useState } from 'react';
import { Spinner, Text, YStack } from 'tamagui';

import { logger } from '@/src/utils/logger';

// ==================== 类型定义 ====================

interface LazyComponentProps<P> {
  /** 动态导入函数 */
  factory: () => Promise<{ default: ComponentType<P> }>;
  /** 传递给组件的 props */
  componentProps?: P;
  /** 自定义加载组件 */
  fallback?: React.ReactNode;
  /** 最小加载时间（毫秒），防止闪烁 */
  minLoadTime?: number;
  /** 加载失败后的重试次数 */
  maxRetries?: number;
  /** 加载失败回调 */
  onError?: (error: Error) => void;
}

interface LazyState {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
}

// ==================== 默认加载组件 ====================

function DefaultFallback() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
      <Spinner size="large" color="$blue10" />
      <Text fontSize="$3" color="$gray10" marginTop="$2">
        加载中...
      </Text>
    </YStack>
  );
}

function ErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" gap="$3">
      <Text fontSize="$5" color="$red10">
        ⚠️ 加载失败
      </Text>
      <Text fontSize="$3" color="$gray10" textAlign="center">
        {error.message || '组件加载出错，请重试'}
      </Text>
      <YStack
        paddingHorizontal="$4"
        paddingVertical="$2"
        backgroundColor="$blue5"
        borderRadius="$3"
        pressStyle={{ opacity: 0.7 }}
        onPress={onRetry}
      >
        <Text color="$blue11" fontWeight="600">
          点击重试
        </Text>
      </YStack>
    </YStack>
  );
}

// ==================== LazyComponent ====================

/**
 * 懒加载组件
 * 支持加载状态、错误处理、重试机制
 */
export function LazyComponent<P extends object>({
  factory,
  componentProps,
  fallback,
  minLoadTime = 200,
  maxRetries = 3,
  onError,
}: LazyComponentProps<P>) {
  const [state, setState] = useState<LazyState>({
    isLoading: true,
    error: null,
    retryCount: 0,
  });

  const [LazyComp, setLazyComp] = useState<ComponentType<P> | null>(null);

  const loadComponent = async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));

    const startTime = Date.now();

    try {
      const module = await factory();

      // 确保最小加载时间，防止闪烁
      const elapsed = Date.now() - startTime;
      if (elapsed < minLoadTime) {
        await new Promise((resolve) => setTimeout(resolve, minLoadTime - elapsed));
      }

      setLazyComp(() => module.default);
      setState((s) => ({ ...s, isLoading: false }));
    } catch (error) {
      const err = error as Error;
      logger.error('懒加载组件失败', err);

      setState((s) => ({
        ...s,
        isLoading: false,
        error: err,
        retryCount: s.retryCount + 1,
      }));

      onError?.(err);
    }
  };

  useEffect(() => {
    loadComponent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = () => {
    if (state.retryCount < maxRetries) {
      loadComponent();
    }
  };

  if (state.isLoading) {
    return <>{fallback || <DefaultFallback />}</>;
  }

  if (state.error) {
    return <ErrorFallback error={state.error} onRetry={handleRetry} />;
  }

  if (LazyComp) {
    return <LazyComp {...(componentProps as P)} />;
  }

  return null;
}

// ==================== withLazyLoad HOC ====================

interface WithLazyLoadOptions {
  /** 自定义加载组件 */
  fallback?: React.ReactNode;
  /** 最小加载时间 */
  minLoadTime?: number;
}

/**
 * 懒加载高阶组件
 * 使用 React.lazy 和 Suspense 实现
 */
export function withLazyLoad<P extends object>(
  factory: () => Promise<{ default: ComponentType<P> }>,
  options: WithLazyLoadOptions = {}
): ComponentType<P> {
  const { fallback, minLoadTime = 200 } = options;

  // 包装工厂函数，添加最小加载时间
  const wrappedFactory = async () => {
    const startTime = Date.now();
    const module = await factory();

    const elapsed = Date.now() - startTime;
    if (elapsed < minLoadTime) {
      await new Promise((resolve) => setTimeout(resolve, minLoadTime - elapsed));
    }

    return module;
  };

  const LazyComp = lazy(wrappedFactory);

  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComp {...props} />
      </Suspense>
    );
  };
}

// ==================== createLazyComponent ====================

/**
 * 创建懒加载组件的便捷函数
 */
export function createLazyComponent<P extends object>(
  factory: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComp = lazy(factory);

  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComp {...props} />
      </Suspense>
    );
  };
}
