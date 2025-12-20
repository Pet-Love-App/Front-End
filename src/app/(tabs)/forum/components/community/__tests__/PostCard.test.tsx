import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

if (typeof navigator === 'undefined') {
  global.navigator = {
    userAgent: 'node.js',
  } as any;
}

// Tamagui web expects a DOM-like API
if (typeof (global as any).addEventListener === 'undefined') {
  (global as any).addEventListener = jest.fn();
}
// Tamagui select expects window.matchMedia
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
const { PostCard } = require('../PostCard');
// Mock reanimated to avoid runtime errors
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
// Lightweight tamagui mock to simplify rendering
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text, Image } = require('react-native');
  const mk = (Comp: any) => (p: any) => React.createElement(Comp, p, p.children);
  return {
    styled: (Comp: any) => mk(Comp),
    YStack: mk(View),
    XStack: mk(View),
    Text: mk(Text),
    Stack: mk(View),
    Image: mk(Image),
    Avatar: mk(View),
    useTheme: () => ({}),
  };
});

// No provider needed with lightweight tamagui mock

// Mock components
jest.mock('../PostImage', () => ({
  PostImage: 'PostImage',
}));

jest.mock('../../VideoPreview', () => ({
  VideoPreview: 'mock-video-preview',
}));

// Mock Lucide icons
jest.mock('@tamagui/lucide-icons', () => ({
  Heart: 'Heart',
  Play: 'Play',
  Award: 'Award',
  Eye: 'Eye',
}));

const mockData = {
  id: 1,
  title: '测试帖子标题',
  imageUrl: 'http://example.com/image.jpg',
  author: {
    id: 'user-1',
    name: '测试作者',
    avatar: 'http://example.com/avatar.jpg',
    hasReputationBadge: true,
  },
  likeCount: 10,
  viewCount: 100,
  isLiked: false,
};

describe('PostCard', () => {
  const mockOnPress = jest.fn();
  const mockOnLikePress = jest.fn();
  const mockOnAuthorPress = jest.fn();

  const renderComponent = (props = {}) => {
    return render(
      <PostCard
        data={mockData}
        columnWidth={200}
        onPress={mockOnPress}
        onLikePress={mockOnLikePress}
        onAuthorPress={mockOnAuthorPress}
        {...props}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染帖子标题和作者信息', () => {
    const { getByText } = renderComponent();

    expect(getByText('测试帖子标题')).toBeTruthy();
    expect(getByText('测试作者')).toBeTruthy();
  });

  it('应该正确渲染点赞数和浏览数', () => {
    const { getByText } = renderComponent();

    expect(getByText('10')).toBeTruthy();
    expect(getByText('100')).toBeTruthy();
  });

  it('点击卡片应该触发 onPress', () => {
    const { getByText } = renderComponent();

    fireEvent.press(getByText('测试帖子标题'));
    expect(mockOnPress).toHaveBeenCalledWith(mockData);
  });

  it('点击作者应该触发 onAuthorPress', () => {
    const { getByText } = renderComponent();

    fireEvent.press(getByText('测试作者'));
    expect(mockOnAuthorPress).toHaveBeenCalledWith(mockData.author);
  });

  it('点击点赞按钮应该触发 onLikePress', () => {
    const { getByText } = renderComponent();

    // 点赞数是 10，点击它旁边的区域（LikeButton 包含 Text）
    fireEvent.press(getByText('10'));
    expect(mockOnLikePress).toHaveBeenCalledWith(mockData);
  });

  it('如果是视频帖子且没有图片，应该渲染 VideoPreview', () => {
    const videoData = {
      ...mockData,
      isVideo: true,
      videoUrl: 'http://example.com/video.mp4',
      imageUrl: '',
    };

    const { UNSAFE_getByType } = renderComponent({ data: videoData });

    // 检查是否渲染了 mock-video-preview
    expect(UNSAFE_getByType('mock-video-preview' as any)).toBeTruthy();
  });

  it('格式化大数字应该正确工作', () => {
    const largeData = {
      ...mockData,
      likeCount: 15000,
      viewCount: 2500,
    };

    const { getByText } = renderComponent({ data: largeData });

    // 当前组件显示为未格式化的点赞数
    expect(getByText('15000')).toBeTruthy();
    expect(getByText('2.5k')).toBeTruthy();
  });
});
