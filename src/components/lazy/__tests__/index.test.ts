jest.mock('tamagui', () => {
  const React = require('react');
  const Component = ({ children }: { children: any }) => children;
  return {
    Text: Component,
    XStack: Component,
    YStack: Component,
    Button: Component,
    Input: Component,
    TextArea: Component,
    ScrollView: Component,
    View: Component,
    Stack: Component,
    Spinner: Component,
    Dialog: {
      ...Component,
      Trigger: Component,
      Portal: Component,
      Overlay: Component,
      Content: Component,
      Title: Component,
      Description: Component,
      Close: Component,
    },
  };
});

import * as LazyComponents from '../index';

describe('Lazy Components Index Export', () => {
  it('should export all lazy components', () => {
    expect(LazyComponents.createLazyComponent).toBeDefined();
    expect(LazyComponents.LazyComponent).toBeDefined();
    expect(LazyComponents.withLazyLoad).toBeDefined();
    expect(LazyComponents.LazyImage).toBeDefined();
    expect(LazyComponents.preloadImage).toBeDefined();
    expect(LazyComponents.preloadImages).toBeDefined();
    expect(LazyComponents.Skeleton).toBeDefined();
    expect(LazyComponents.SkeletonAIReport).toBeDefined();
    expect(LazyComponents.SkeletonCard).toBeDefined();
    expect(LazyComponents.SkeletonDetail).toBeDefined();
    expect(LazyComponents.SkeletonList).toBeDefined();
    expect(LazyComponents.SkeletonText).toBeDefined();
  });
});
