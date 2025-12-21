import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// 1. 基础环境 Mock
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

// 2. 核心修复：Mock react-native
// 重点：Mock FlatList 以避免虚拟化导致的渲染问题
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // 覆写 Image.getSize
  RN.Image.getSize = jest.fn((uri, success, failure) => {
    if (typeof success === 'function') {
      success(800, 600);
    }
    return Promise.resolve({ width: 800, height: 600 });
  });

  // 覆写 FlatList：直接渲染所有项目，禁用虚拟化
  RN.FlatList = ({ data, renderItem, keyExtractor, ...props }: any) => {
    const React = require('react');
    return React.createElement(
      RN.View,
      props,
      data.map((item: any, index: number) =>
        React.createElement(
          RN.View,
          { key: keyExtractor ? keyExtractor(item, index) : index },
          renderItem({ item, index })
        )
      )
    );
  };

  return RN;
});

// 3. Mock tamagui
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text: RNText } = require('react-native');

  const MockTamaguiView = ({ children, ...props }: any) =>
    React.createElement(View, props, children);
  const MockTamaguiText = ({ children, ...props }: any) =>
    React.createElement(RNText, props, children);

  return {
    styled: (Component: any) => (Component === RNText ? MockTamaguiText : MockTamaguiView),
    Stack: MockTamaguiView,
    XStack: MockTamaguiView,
    YStack: MockTamaguiView,
    Text: MockTamaguiText,
    // FlatList 已经在 react-native mock 中处理了，这里不需要再次 mock 或透传
  };
});

// 4. Mock reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withSpring: () => {},
    createAnimatedComponent: (Comp: any) => (props: any) =>
      React.createElement(Comp, props, props.children),
    View: View,
  };
});

// 5. Mock icons
jest.mock('@tamagui/lucide-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Play: () => <Text>Play</Text>,
  };
});

// 6. Mock OptimizedImage
jest.mock('@/src/components/ui/OptimizedImage', () => ({
  OptimizedImage: (props: any) => {
    const React = require('react');
    const { Image } = require('react-native');
    // 透传 props，确保 testID 存在
    return React.createElement(Image, { ...props, testID: 'optimized-image' });
  },
}));

// 7. Mock VideoPreview
jest.mock('../../VideoPreview', () => ({
  VideoPreview: ({ videoUri }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text>{`VideoPreview-${videoUri}`}</Text>;
  },
}));

const { PostMediaGallery } = require('../PostMediaGallery');

describe('PostMediaGallery', () => {
  const mockImageMedia = {
    id: 'media-1',
    mediaType: 'image',
    fileUrl: 'https://example.com/image.jpg',
    duration: null,
    width: 800,
    height: 600,
  };

  const mockVideoMedia = {
    id: 'media-2',
    mediaType: 'video',
    fileUrl: 'https://example.com/video.mp4',
    duration: 30,
    width: 800,
    height: 600,
  };

  const defaultProps = {
    media: [],
    onMediaPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('无媒体时不显示', () => {
    const { queryByText } = render(<PostMediaGallery {...defaultProps} media={[]} />);
    expect(queryByText(/image|video/i)).toBeFalsy();
  });

  it('单张图片显示', async () => {
    const { getByTestId } = render(<PostMediaGallery {...defaultProps} media={[mockImageMedia]} />);
    await waitFor(() => {
      expect(getByTestId('optimized-image')).toBeTruthy();
    });
  });

  it('视频媒体显示视频标识', () => {
    const { getByText } = render(<PostMediaGallery {...defaultProps} media={[mockVideoMedia]} />);
    expect(getByText(/VideoPreview/)).toBeTruthy();
  });

  it('点击媒体触发回调', async () => {
    const onMediaPress = jest.fn();
    const { getByTestId } = render(
      <PostMediaGallery {...defaultProps} media={[mockImageMedia]} onMediaPress={onMediaPress} />
    );

    await waitFor(() => expect(getByTestId('optimized-image')).toBeTruthy());

    const media = getByTestId('optimized-image');
    fireEvent.press(media);

    expect(onMediaPress).toHaveBeenCalledWith(mockImageMedia, 0);
  });

  it('无回调函数时点击不报错', async () => {
    const { getByTestId } = render(<PostMediaGallery {...defaultProps} media={[mockImageMedia]} />);

    await waitFor(() => expect(getByTestId('optimized-image')).toBeTruthy());

    const media = getByTestId('optimized-image');
    expect(() => fireEvent.press(media)).not.toThrow();
  });

  it('视频媒体显示视频预览', () => {
    const { getByText } = render(<PostMediaGallery {...defaultProps} media={[mockVideoMedia]} />);
    expect(getByText(/VideoPreview/)).toBeTruthy();
  });

  it('图片媒体不显示视频标识', async () => {
    const { queryByText, getByTestId } = render(
      <PostMediaGallery {...defaultProps} media={[mockImageMedia]} />
    );
    await waitFor(() => expect(getByTestId('optimized-image')).toBeTruthy());
    expect(queryByText(/VideoPreview/)).toBeFalsy();
  });

  it('清空媒体列表', async () => {
    const { rerender, queryByTestId, getByTestId } = render(
      <PostMediaGallery {...defaultProps} media={[mockImageMedia]} />
    );

    await waitFor(() => expect(getByTestId('optimized-image')).toBeTruthy());

    rerender(<PostMediaGallery {...defaultProps} media={[]} />);

    expect(queryByTestId('optimized-image')).toBeFalsy();
  });

  it('正确显示媒体 URL', async () => {
    const customUrl = 'https://custom.com/custom-image.jpg';
    const media = { ...mockImageMedia, fileUrl: customUrl };

    const { getByTestId } = render(<PostMediaGallery {...defaultProps} media={[media]} />);

    await waitFor(() => {
      const image = getByTestId('optimized-image');
      expect(image.props.source).toBe(customUrl);
    });
  });
});
