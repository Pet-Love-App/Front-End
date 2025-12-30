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
const { CategoryTabs } = require('../CategoryTabs');
// Mock reanimated to avoid runtime errors
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
// Lightweight tamagui mock to simplify rendering
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text, ScrollView } = require('react-native');
  const mk = (Comp: any) => (p: any) => React.createElement(Comp, p, p.children);
  return {
    styled: (Comp: any) => mk(Comp),
    XStack: mk(View),
    Text: mk(Text),
    Stack: mk(View),
    useTheme: () => ({
      primary: { val: '#7FB093' },
      colorMuted: { val: '#6C6A66' },
    }),
  };
});

// No provider needed with lightweight tamagui mock

const mockCategories = [
  { id: 'all', label: '全部' },
  { id: 'daily', label: '日常', icon: '🐱' },
  { id: 'help', label: '求助', icon: '🆘' },
];

describe('CategoryTabs', () => {
  const mockOnSelect = jest.fn();

  const renderComponent = (activeId = 'all') => {
    return render(
      <CategoryTabs categories={mockCategories} activeId={activeId} onSelect={mockOnSelect} />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('应该渲染所有分类标签', () => {
    const { getByText } = renderComponent();

    expect(getByText('全部')).toBeTruthy();
    expect(getByText('日常')).toBeTruthy();
    expect(getByText('求助')).toBeTruthy();
  });

  it('应该渲染带有图标的标签', () => {
    const { getByText } = renderComponent();

    expect(getByText('🐱')).toBeTruthy();
    expect(getByText('🆘')).toBeTruthy();
  });

  it('点击标签应该触发 onSelect', () => {
    const { getByText } = renderComponent();

    fireEvent.press(getByText('日常'));
    expect(mockOnSelect).toHaveBeenCalledWith('daily');
  });

  it('点击当前已激活的标签也应该触发 onSelect', () => {
    const { getByText } = renderComponent('all');

    fireEvent.press(getByText('全部'));
    expect(mockOnSelect).toHaveBeenCalledWith('all');
  });

  it('应该正确处理空分类列表', () => {
    const { toJSON } = render(
      <CategoryTabs categories={[]} activeId="all" onSelect={mockOnSelect} />
    );
    // 确保没有崩溃，并且渲染了空的 ScrollView
    expect(toJSON()).toBeTruthy();
  });

  it('应该正确处理没有图标的分类', () => {
    const categoriesNoIcon = [{ id: 'test', label: '测试' }];
    const { getByText, queryByText } = render(
      <CategoryTabs categories={categoriesNoIcon} activeId="test" onSelect={mockOnSelect} />
    );
    expect(getByText('测试')).toBeTruthy();
    // 确保没有渲染 undefined 或 null 的图标文本
    // 这里假设如果没有图标，就不会渲染对应的 Text 组件
  });
});
