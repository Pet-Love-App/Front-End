import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';

if (typeof navigator === 'undefined') {
  // @ts-ignore
  global.navigator = { userAgent: 'node.js' };
}
if (typeof (global as any).addEventListener === 'undefined') {
  (global as any).addEventListener = jest.fn();
}
if (typeof (global as any).window === 'undefined') {
  (global as any).window = {} as any;
}
if (typeof (global as any).window.matchMedia === 'undefined') {
  (global as any).window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}

// Mock tamagui and icons to avoid theme requirement
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const mk = (Comp: any) => (p: any) => React.createElement(Comp, p, p.children);
  return { Stack: mk(View), Text: (p: any) => React.createElement(Text, p, p.children) };
});
jest.mock('@tamagui/lucide-icons', () => ({ ImageOff: 'ImageOff' }));

// Capture props of expo-image to control callbacks
const lastPropsRef: any = { current: null };
jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Image = (p: any) => {
    lastPropsRef.current = p;
    return React.createElement(View, { ...p, testID: p.testID || 'expo-image' });
  };
  return { Image };
});

const { PostImage } = require('../PostImage');

describe('PostImage', () => {
  it('无效 URL 显示占位符', () => {
    const { getByTestId } = render(<PostImage uri="" width={100} height={100} />);
    expect(getByTestId('post-image-placeholder')).toBeTruthy();
  });

  it('加载失败显示错误占位', async () => {
    const { getByTestId } = render(<PostImage uri="https://valid" width={100} height={100} />);
    await act(async () => {
      lastPropsRef.current.onError && lastPropsRef.current.onError();
    });
    expect(getByTestId('post-image-error')).toBeTruthy();
  });

  it('加载成功隐藏 loading 覆盖层', async () => {
    const { queryByTestId } = render(
      <PostImage uri="https://valid-image" width={120} height={80} />
    );
    await act(async () => {
      lastPropsRef.current.onLoad && lastPropsRef.current.onLoad();
    });
    expect(queryByTestId('post-image-loading')).toBeNull();
    expect(queryByTestId('post-image')).toBeTruthy();
  });
});

describe('额外覆盖场景 - PostImage', () => {
  it('当图片加载失败时应显示占位或回退样式', async () => {
    // 假设组件支持 onError 或错误状态渲染
    const { getByTestId } = render(
      <PostImage uri="https://example.com/broken.jpg" width={100} height={100} />
    );

    // 触发错误事件（若内部 Image 使用 onError）
    await act(async () => {
      lastPropsRef.current.onError && lastPropsRef.current.onError();
    });

    // 断言至少组件仍然可见，或渲染了错误占位
    expect(getByTestId('post-image-error')).toBeTruthy();
  });
});
