import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

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

// Mock tamagui
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const mk = (Comp: any) => (p: any) => React.createElement(Comp, p, p.children);
  return { Stack: mk(View), Text: (p: any) => React.createElement(Text, p, p.children) };
});

// 不需要覆盖 react-native 整体，避免 DevMenu TurboModule 初始化报错

// Mock thumbnail util
jest.mock('@/src/utils/videoThumbnail', () => ({
  generateVideoThumbnail: jest.fn(),
}));

const { generateVideoThumbnail } = require('@/src/utils/videoThumbnail');
const { VideoPreview } = require('../VideoPreview');

describe('VideoPreview', () => {
  it('加载中显示加载状态', async () => {
    let resolvePromise: any;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    (generateVideoThumbnail as jest.Mock).mockImplementation(() => promise);
    const { getByTestId, unmount } = render(<VideoPreview videoUri="v1" width={120} height={80} />);
    expect(getByTestId('video-preview-loading')).toBeTruthy();
    unmount();
    resolvePromise(null); // Resolve to avoid unmounted component warning
  });

  it('缩略图生成失败显示默认提示', async () => {
    (generateVideoThumbnail as jest.Mock).mockResolvedValueOnce(null);
    const { getByTestId, findByTestId, unmount } = render(
      <VideoPreview videoUri="v2" width={100} height={60} />
    );
    // Component should eventually show "视频预览" when thumbnail fails
    // Initial state shows loading
    expect(getByTestId('video-preview-loading')).toBeTruthy();
    // Wait for error state
    await findByTestId('video-preview-error');
    unmount();
  });

  it('缩略图生成异常显示默认提示', async () => {
    (generateVideoThumbnail as jest.Mock).mockRejectedValueOnce(new Error('boom'));
    const { getByTestId, findByTestId, unmount } = render(
      <VideoPreview videoUri="v3" width={100} height={60} />
    );
    // Initial state shows loading
    expect(getByTestId('video-preview-loading')).toBeTruthy();
    // Wait for error state
    await findByTestId('video-preview-error');
    unmount();
  });
});

describe('额外覆盖场景 - VideoPreview', () => {
  it('当提供封面图时应优先渲染封面', async () => {
    // Mock successful thumbnail generation
    (generateVideoThumbnail as jest.Mock).mockResolvedValueOnce('thumbnail-uri');

    const { findByTestId, unmount } = render(
      <VideoPreview videoUri="https://example.com/video.mp4" width={100} height={100} />
    );

    const thumbnail = await findByTestId('video-preview-thumbnail');
    expect(thumbnail).toBeTruthy();
    unmount();
  });

  it('点击播放按钮应触发 onPress', async () => {
    (generateVideoThumbnail as jest.Mock).mockResolvedValueOnce('thumbnail-uri');
    const onPress = jest.fn();

    const { findByTestId, unmount } = render(
      <VideoPreview
        videoUri="https://example.com/video.mp4"
        width={100}
        height={100}
        onPress={onPress}
        showPlayButton={true}
      />
    );

    // Wait for loading to finish and play button to appear
    await findByTestId('video-play-button');

    // Press the container (since onPress is on the Stack)
    fireEvent.press(await findByTestId('video-preview-container'));
    expect(onPress).toHaveBeenCalled();
    unmount();
  });
});
