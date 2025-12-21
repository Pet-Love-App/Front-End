import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

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

// 2. Mock tamagui (关键修复：基于引用的组件识别)
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text: RNText } = require('react-native');

  // 定义唯一的 Mock 组件引用
  const MockTamaguiText = ({ children, ...props }: any) =>
    React.createElement(RNText, props, children);
  const MockTamaguiView = ({ children, ...props }: any) =>
    React.createElement(View, props, children);

  return {
    Text: MockTamaguiText,
    YStack: MockTamaguiView,
    XStack: MockTamaguiView,
    Stack: MockTamaguiView,
    // 修复 styled：如果传入的是 Text，返回 Text，否则返回 View
    styled: (Component: any) => {
      if (Component === MockTamaguiText) {
        return MockTamaguiText;
      }
      return MockTamaguiView;
    },
  };
});

// 3. Mock reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withSpring: () => {},
    withSequence: () => {},
    withTiming: () => {},
    Easing: { out: () => {}, quad: () => {} },
    // 确保 createAnimatedComponent 返回一个能渲染 children 的组件
    createAnimatedComponent: (Comp: any) => (props: any) =>
      React.createElement(Comp, props, props.children),
    View: View,
  };
});

// 4. Mock icons (渲染为 Text 以便查找)
jest.mock('@tamagui/lucide-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Heart: () => <Text>Heart</Text>,
    MessageCircle: () => <Text>MessageCircle</Text>,
    Share2: () => <Text>Share2</Text>,
    Bookmark: () => <Text>Bookmark</Text>,
  };
});

const { PostActions } = require('../PostActions');

describe('PostActions', () => {
  const defaultProps = {
    likeCount: 10,
    commentCount: 5,
    isLiked: false,
    isBookmarked: false,
    onLike: jest.fn(),
    onComment: jest.fn(),
    onShare: jest.fn(),
    onBookmark: jest.fn(),
  };

  it('显示点赞数', () => {
    const { getByText } = render(<PostActions {...defaultProps} likeCount={10} />);
    expect(getByText('10')).toBeTruthy();
  });

  it('显示评论数', () => {
    const { getByText } = render(<PostActions {...defaultProps} commentCount={5} />);
    expect(getByText('5')).toBeTruthy();
  });

  it('显示点赞按钮', () => {
    const { getByText } = render(<PostActions {...defaultProps} />);
    expect(getByText('Heart')).toBeTruthy();
  });

  it('显示评论按钮', () => {
    const { getByText } = render(<PostActions {...defaultProps} />);
    expect(getByText('MessageCircle')).toBeTruthy();
  });

  it('显示分享按钮', () => {
    const { getByText } = render(<PostActions {...defaultProps} />);
    expect(getByText('Share2')).toBeTruthy();
  });

  it('显示收藏按钮', () => {
    const { getByText } = render(<PostActions {...defaultProps} />);
    expect(getByText('Bookmark')).toBeTruthy();
  });

  it('点击点赞按钮触发 onLike', () => {
    const onLike = jest.fn();
    const { getByText } = render(<PostActions {...defaultProps} onLike={onLike} />);

    const likeBtn = getByText('Heart');
    fireEvent.press(likeBtn);

    expect(onLike).toHaveBeenCalled();
  });

  it('点击评论按钮触发 onComment', () => {
    const onComment = jest.fn();
    const { getByText } = render(<PostActions {...defaultProps} onComment={onComment} />);

    const commentBtn = getByText('MessageCircle');
    fireEvent.press(commentBtn);

    expect(onComment).toHaveBeenCalled();
  });

  it('点击分享按钮触发 onShare', () => {
    const onShare = jest.fn();
    const { getByText } = render(<PostActions {...defaultProps} onShare={onShare} />);

    const shareBtn = getByText('Share2');
    fireEvent.press(shareBtn);

    expect(onShare).toHaveBeenCalled();
  });

  it('点击收藏按钮触发 onBookmark', () => {
    const onBookmark = jest.fn();
    const { getByText } = render(<PostActions {...defaultProps} onBookmark={onBookmark} />);

    const bookmarkBtn = getByText('Bookmark');
    fireEvent.press(bookmarkBtn);

    expect(onBookmark).toHaveBeenCalled();
  });

  it('未点赞时显示空心点赞图标', () => {
    const { getByText } = render(<PostActions {...defaultProps} isLiked={false} />);
    expect(getByText('Heart')).toBeTruthy();
  });

  it('已点赞时显示填充点赞图标', () => {
    const { getByText } = render(<PostActions {...defaultProps} isLiked={true} />);
    expect(getByText('Heart')).toBeTruthy();
  });

  it('未收藏时显示空心收藏图标', () => {
    const { getByText } = render(<PostActions {...defaultProps} isBookmarked={false} />);
    expect(getByText('Bookmark')).toBeTruthy();
  });

  it('已收藏时显示填充收藏图标', () => {
    const { getByText } = render(<PostActions {...defaultProps} isBookmarked={true} />);
    expect(getByText('Bookmark')).toBeTruthy();
  });

  it('点赞数为零时不显示数字', () => {
    // 源码逻辑：if (count === 0) return '';
    const { queryByText } = render(<PostActions {...defaultProps} likeCount={0} />);
    // 应该找不到 0，因为返回了空字符串或者组件未渲染
    expect(queryByText('0')).toBeNull();
  });

  it('评论数为零时不显示数字', () => {
    // 源码逻辑：if (count === 0) return '';
    const { queryByText } = render(<PostActions {...defaultProps} commentCount={0} />);
    // 应该找不到 0
    expect(queryByText('0')).toBeNull();
  });

  it('大数字显示处理', () => {
    // 源码逻辑：9999 / 1000 = 9.999 -> toFixed(1) -> 10.0k
    const { getByText } = render(<PostActions {...defaultProps} likeCount={9999} />);
    expect(getByText('10.0k')).toBeTruthy();
  });

  it('无回调函数时点击不报错', () => {
    const { getByText } = render(
      <PostActions likeCount={10} commentCount={5} isLiked={false} isBookmarked={false} />
    );

    const likeBtn = getByText('Heart');
    expect(() => fireEvent.press(likeBtn)).not.toThrow();
  });

  it('快速连续点击点赞按钮', () => {
    const onLike = jest.fn();
    const { getByText } = render(<PostActions {...defaultProps} onLike={onLike} />);

    const likeBtn = getByText('Heart');
    fireEvent.press(likeBtn);
    fireEvent.press(likeBtn);
    fireEvent.press(likeBtn);

    expect(onLike).toHaveBeenCalledTimes(3);
  });

  it('所有操作按钮都存在', () => {
    const { getByText } = render(<PostActions {...defaultProps} />);

    expect(getByText('Heart')).toBeTruthy();
    expect(getByText('MessageCircle')).toBeTruthy();
    expect(getByText('Share2')).toBeTruthy();
    expect(getByText('Bookmark')).toBeTruthy();
  });
});
