import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/src/store/userStore';

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
const { ForumHeader } = require('../ForumHeader');
// Lightweight tamagui mock to simplify rendering
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text, TextInput } = require('react-native');
  const mk = (Comp: any) => (p: any) => React.createElement(Comp, p, p.children);
  return {
    styled: (Comp: any) => mk(Comp),
    XStack: mk(View),
    YStack: mk(View),
    Text: mk(Text),
    Input: mk(TextInput),
    Stack: mk(View),
    useTheme: () => ({}),
  };
});

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@/src/store/userStore', () => ({
  useUserStore: jest.fn(),
}));

jest.mock('@tamagui/lucide-icons', () => ({
  Bell: 'Bell',
  Search: 'Search',
  X: 'X',
  User: 'User',
}));

// No provider needed with lightweight tamagui mock

describe('ForumHeader', () => {
  const mockOnSearch = jest.fn();
  const mockOnNotificationPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      user: { avatar_url: 'http://example.com/avatar.jpg' },
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <ForumHeader
        onSearch={mockOnSearch}
        onNotificationPress={mockOnNotificationPress}
        {...props}
      />
    );
  };

  it('应该渲染标题', () => {
    const { getByText } = renderComponent({ title: '自定义标题' });
    expect(getByText('自定义标题')).toBeTruthy();
  });

  it('应该渲染用户头像', () => {
    const { UNSAFE_getByType } = renderComponent();
    // 检查是否渲染了 Image (RNImage)
    const images = UNSAFE_getByType('Image' as any);
    expect(images).toBeTruthy();
  });

  it('输入搜索内容并提交', () => {
    const { getByTestId } = renderComponent();
    const input = getByTestId('forum-search-input');

    fireEvent.changeText(input, 'test query');
    fireEvent(input, 'submitEditing');

    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('点击清除按钮清空搜索', () => {
    const { getByTestId } = renderComponent();
    const input = getByTestId('forum-search-input');

    // First type something
    fireEvent.changeText(input, 'test query');

    // Find and press clear button
    const clearBtn = getByTestId('forum-search-clear');
    fireEvent.press(clearBtn);

    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('点击通知图标应该触发 onNotificationPress', () => {
    const { UNSAFE_getByType } = renderComponent();
    // Bell 图标在 Pressable 中
    const bellIcon = UNSAFE_getByType('Bell' as any);
    fireEvent.press(bellIcon);
    expect(mockOnNotificationPress).toHaveBeenCalled();
  });

  it('输入搜索内容应该触发 onSearch', () => {
    const { getByPlaceholderText } = renderComponent();
    const input = getByPlaceholderText('搜索帖子、标签、用户...');

    fireEvent.changeText(input, '猫咪');
    // 组件在提交事件时触发 onSearch
    fireEvent(input, 'onSubmitEditing');
    expect(mockOnSearch).toHaveBeenCalledWith('猫咪');
  });

  it('点击清除按钮应该清空搜索框', () => {
    const { getByPlaceholderText, getByTestId } = renderComponent();
    const input = getByPlaceholderText('搜索帖子、标签、用户...');

    fireEvent.changeText(input, '猫咪');

    // 查找清除按钮 (X 图标)
    const clearButton = getByTestId('forum-search-clear');
    fireEvent.press(clearButton);

    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('点击头像应该跳转到个人主页', () => {
    const { UNSAFE_getByType } = renderComponent();
    // The avatar is the first image
    const images = UNSAFE_getByType('Image' as any);
    fireEvent.press(images);

    expect(router.push).toHaveBeenCalledWith('/(tabs)/profile');
  });
});

describe('额外覆盖场景 - ForumHeader', () => {
  it('点击右侧操作按钮触发对应事件', () => {
    // The component doesn't seem to support generic 'actions' prop based on the source code.
    // It has specific props like onNotificationPress.
    // We will test onNotificationPress instead.
    const onNotificationPress = jest.fn();
    const { UNSAFE_getByType } = render(<ForumHeader onNotificationPress={onNotificationPress} />);

    const bellIcon = UNSAFE_getByType('Bell' as any);
    fireEvent.press(bellIcon);
    expect(onNotificationPress).toHaveBeenCalled();
  });
});
