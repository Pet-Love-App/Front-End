import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
// @ts-ignore - 忽略找不到模块的报错，假设路径正确
import { MasonryFeed } from '../MasonryFeed';

// --- 1. 全局环境 Mock (Arrange) ---

// Mock window & navigator for React Native environment in Jest
if (typeof navigator === 'undefined') {
  // @ts-ignore
  global.navigator = { userAgent: 'node.js' };
}
if (typeof (global as any).window === 'undefined') {
  (global as any).window = {} as any;
}

// Mock matchMedia
Object.defineProperty((global as any).window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// --- 2. 依赖库 Mock ---

// Mock Tamagui
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    styled: (Component: any) => Component,
    Stack: (p: any) => React.createElement(View, { ...p, testID: p.testID }, p.children),
    YStack: (p: any) => React.createElement(View, { ...p, testID: p.testID }, p.children),
    Text: (p: any) => React.createElement(Text, p, p.children),
    Spinner: () => React.createElement(Text, { testID: 'loading-spinner' }, 'Loading...'),
  };
});

// Mock PostCard
jest.mock('../PostCard', () => ({
  PostCard: ({ data, onPress }: any) => {
    const { Text, TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity testID={`post-${data.id}`} onPress={() => onPress && onPress(data)}>
        <Text>{data.title}</Text>
      </TouchableOpacity>
    );
  },
}));

// --- 3. 测试套件 ---

describe('MasonryFeed Component', () => {
  // 准备测试数据
  const mockPosts = [
    {
      id: 'post-1',
      title: '帖子标题1',
      content: '内容1',
      author: { id: 'user-1', name: '用户1' },
      like_count: 10,
      is_liked: false,
      height: 200,
    },
    {
      id: 'post-2',
      title: '帖子标题2',
      content: '内容2',
      author: { id: 'user-2', name: '用户2' },
      like_count: 20,
      is_liked: true,
      height: 250,
    },
  ];

  const defaultProps = {
    // 关键修复：这里使用 as any 解决类型不匹配导致的标红
    data: mockPosts as any,
    onPostPress: jest.fn(),
    onLikePress: jest.fn(),
    onAuthorPress: jest.fn(),
    onRefresh: jest.fn(),
    onEndReached: jest.fn(),
    isLoading: false,
    isRefreshing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该正确渲染帖子列表', () => {
    // Arrange & Act
    // 关键修复：data={mockPosts as any}
    render(<MasonryFeed {...defaultProps} data={mockPosts as any} />);

    // Assert
    expect(screen.getByText('帖子标题1')).toBeTruthy();
    expect(screen.getByText('帖子标题2')).toBeTruthy();
  });

  it('当数据为空时，应该显示空状态', () => {
    // Arrange & Act
    render(<MasonryFeed {...defaultProps} data={[]} />);

    // Assert
    expect(screen.getByText(/还没有帖子/i)).toBeTruthy();
  });

  it('当 isLoading 为 true 且无数据时，应该显示加载指示器', () => {
    // Arrange & Act
    render(<MasonryFeed {...defaultProps} data={[]} isLoading={true} />);

    // Assert
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
    expect(screen.queryByText(/还没有帖子/i)).toBeNull();
  });

  it('点击帖子时应该触发 onPostPress 回调', () => {
    // Arrange
    const onPostPressMock = jest.fn();
    render(<MasonryFeed {...defaultProps} data={mockPosts as any} onPostPress={onPostPressMock} />);

    // Act
    const postItem = screen.getByTestId('post-post-1');
    fireEvent.press(postItem);

    // Assert
    expect(onPostPressMock).toHaveBeenCalledTimes(1);
    expect(onPostPressMock).toHaveBeenCalledWith(mockPosts[0]);
  });

  it('支持自定义空状态组件 (ListEmptyComponent)', () => {
    // Arrange
    // 修复：在 React Native 中，文本必须包裹在 <Text> 组件内，
    // 否则 getByText 可能无法正确找到它，且在真实设备上会报错。
    const CustomEmpty = () => <Text>自定义空页面</Text>;

    // Act
    render(<MasonryFeed {...defaultProps} data={[]} ListEmptyComponent={<CustomEmpty />} />);

    // Assert
    expect(screen.getByText('自定义空页面')).toBeTruthy();
    expect(screen.queryByText('还没有帖子')).toBeNull();
  });

  it('下拉刷新时应该触发 onRefresh', async () => {
    // Arrange
    const onRefreshMock = jest.fn().mockResolvedValue(undefined);
    render(<MasonryFeed {...defaultProps} data={mockPosts as any} onRefresh={onRefreshMock} />);

    // Act
    // 获取 ScrollView 组件实例
    const scrollView = screen.UNSAFE_getByType(ScrollView);

    // 关键修复：强制转换为 any 以访问 props，避免 TS 报错
    const { refreshControl } = (scrollView as any).props;

    // 修复：使用 act 包裹导致状态更新的操作
    // 因为这里是手动调用 props 方法，而不是使用 fireEvent，所以需要手动 act
    await act(async () => {
      if (refreshControl && refreshControl.props.onRefresh) {
        await refreshControl.props.onRefresh();
      }
    });

    // Assert
    expect(onRefreshMock).toHaveBeenCalledTimes(1);
  });
});
