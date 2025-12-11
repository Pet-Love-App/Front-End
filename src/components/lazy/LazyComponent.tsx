import React, { ComponentType, lazy, Suspense, useEffect, useState } from 'react';
import { Spinner, Text, YStack } from 'tamagui';

import { logger } from '@/src/utils/logger';
import { primaryScale, infoScale, errorScale } from '@/src/design-system/tokens';

interface LazyComponentProps<P> {
  factory: () => Promise<{ default: ComponentType<P> }>;
  componentProps?: P;
  fallback?: React.ReactNode;
  minLoadTime?: number;
  maxRetries?: number;
  onError?: (error: Error) => void;
}

interface LazyState {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
}

function DefaultFallback() {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$4">
      <Spinner size="large" color={primaryScale.primary7} />
      <Text fontSize="$3" color="$foregroundMuted" marginTop="$2">
        加载中...
      </Text>
    </YStack>
  );
}

function ErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <YStack flex={1} alignItems="center" justifyContent="center" padding="$4" gap="$3">
      <Text fontSize="$5" color={errorScale.error7}>
        ⚠️ 加载失败
      </Text>
      <Text fontSize="$3" color="$foregroundMuted" textAlign="center">
        {error.message || '组件加载出错，请重试'}
      </Text>
      <YStack
        paddingHorizontal="$4"
        paddingVertical="$2"
        backgroundColor={infoScale.info2}
        borderRadius="$3"
        pressStyle={{ opacity: 0.7 }}
        onPress={onRetry}
      >
        <Text color={infoScale.info9} fontWeight="600">
          点击重试
        </Text>
      </YStack>
    </YStack>
  );
}

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

interface WithLazyLoadOptions {
  fallback?: React.ReactNode;
  minLoadTime?: number;
}

export function withLazyLoad<P extends object>(
  factory: () => Promise<{ default: ComponentType<P> }>,
  options: WithLazyLoadOptions = {}
): ComponentType<P> {
  const { fallback, minLoadTime = 200 } = options;

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
