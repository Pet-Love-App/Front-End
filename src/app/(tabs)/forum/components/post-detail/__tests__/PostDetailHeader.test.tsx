import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, Pressable } from 'react-native';

// 4. 正确导入组件 (关键修复：使用 import 替代 require)
import { PostDetailHeader } from '../PostDetailHeader';

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

// 2. Mock Tamagui (使用更健壮的工厂函数)
jest.mock('tamagui', () => {
  const React = require('react');
  const { View } = require('react-native');

  // 通用 Mock 组件
  const MockComponent = ({ children, ...props }: any) => React.createElement(View, props, children);

  return {
    styled: () => MockComponent, // styled 返回一个组件
    Stack: MockComponent,
    XStack: MockComponent,
    YStack: MockComponent,
  };
});

// 3. Mock Icons (关键修复：返回组件而非字符串，确保 getByText 能找到)
jest.mock('@tamagui/lucide-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    ChevronLeft: () => <Text>ChevronLeft</Text>,
    MoreHorizontal: () => <Text>MoreHorizontal</Text>, // 注意：源代码用的是 MoreHorizontal
    MoreVertical: () => <Text>MoreVertical</Text>,
    Edit3: () => <Text>Edit3</Text>,
    Trash2: () => <Text>Trash2</Text>,
    Flag: () => <Text>Flag</Text>,
    Share2: () => <Text>Share2</Text>,
    X: () => <Text>X</Text>,
  };
});

describe('PostDetailHeader', () => {
  const defaultProps = {
    isAuthor: false,
    onClose: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onShare: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('显示返回按钮', () => {
    const { getByText } = render(<PostDetailHeader {...defaultProps} />);
    expect(getByText('ChevronLeft')).toBeTruthy();
  });

  it('点击返回按钮触发 onClose', () => {
    const onClose = jest.fn();
    const { getByText } = render(<PostDetailHeader {...defaultProps} onClose={onClose} />);

    const backBtn = getByText('ChevronLeft');
    fireEvent.press(backBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it('非作者时不显示编辑删除选项', () => {
    const { queryByText } = render(<PostDetailHeader {...defaultProps} isAuthor={false} />);
    // 确保图标不存在
    expect(queryByText('Edit3')).toBeNull();
    expect(queryByText('Trash2')).toBeNull();
  });

  it('作者时显示更多操作菜单入口', () => {
    const { getByText } = render(<PostDetailHeader {...defaultProps} isAuthor={true} />);
    // 源代码中使用的是 MoreHorizontal，这里我们需要匹配 Mock 的输出
    expect(getByText('MoreHorizontal')).toBeTruthy();
  });

  it('作者点击更多菜单显示选项', () => {
    const { getByText } = render(<PostDetailHeader {...defaultProps} isAuthor={true} />);

    const moreBtn = getByText('MoreHorizontal');
    fireEvent.press(moreBtn);

    // 菜单应该显示编辑和删除选项
    expect(getByText('Edit3')).toBeTruthy();
    expect(getByText('Trash2')).toBeTruthy();
  });

  it('点击编辑按钮触发 onEdit', () => {
    const onEdit = jest.fn();
    const { getByText } = render(
      <PostDetailHeader {...defaultProps} isAuthor={true} onEdit={onEdit} />
    );

    // 先打开菜单
    const moreBtn = getByText('MoreHorizontal');
    fireEvent.press(moreBtn);

    // 点击编辑
    const editBtn = getByText('Edit3');
    fireEvent.press(editBtn);

    expect(onEdit).toHaveBeenCalled();
  });

  it('点击删除按钮显示确认对话框', () => {
    // Mock Alert.alert
    const spyAlert = jest.spyOn(require('react-native').Alert, 'alert');

    const { getByText } = render(<PostDetailHeader {...defaultProps} isAuthor={true} />);

    // 先打开菜单
    const moreBtn = getByText('MoreHorizontal');
    fireEvent.press(moreBtn);

    // 点击删除
    const deleteBtn = getByText('Trash2');
    fireEvent.press(deleteBtn);

    expect(spyAlert).toHaveBeenCalled();
  });

  it('非作者时显示分享按钮', () => {
    const { getByText } = render(<PostDetailHeader {...defaultProps} isAuthor={false} />);

    // 打开菜单 (非作者也有菜单，只是内容不同)
    const moreBtn = getByText('MoreHorizontal');
    fireEvent.press(moreBtn);

    expect(getByText('Share2')).toBeTruthy();
  });

  it('点击分享按钮触发 onShare', () => {
    const onShare = jest.fn();
    const { getByText } = render(
      <PostDetailHeader {...defaultProps} isAuthor={false} onShare={onShare} />
    );

    // 打开菜单
    const moreBtn = getByText('MoreHorizontal');
    fireEvent.press(moreBtn);

    const shareBtn = getByText('Share2');
    fireEvent.press(shareBtn);

    expect(onShare).toHaveBeenCalled();
  });

  it('作者时不显示举报按钮在菜单中', () => {
    const { getByText, queryByText } = render(
      <PostDetailHeader {...defaultProps} isAuthor={true} />
    );

    const moreBtn = getByText('MoreHorizontal');
    fireEvent.press(moreBtn);

    // 作者菜单中不应该有举报选项
    expect(queryByText('Flag')).toBeNull();
  });

  it('无操作回调时不报错', () => {
    const { getByText } = render(<PostDetailHeader isAuthor={true} onClose={jest.fn()} />);

    const moreBtn = getByText('MoreHorizontal');
    expect(() => fireEvent.press(moreBtn)).not.toThrow();
  });

  it('isAuthor 属性变化时更新菜单显示', () => {
    const { rerender, getByText, queryByText } = render(
      <PostDetailHeader {...defaultProps} isAuthor={false} />
    );

    // 初始状态：非作者，打开菜单应有 Flag
    const moreBtn1 = getByText('MoreHorizontal');
    fireEvent.press(moreBtn1);
    expect(getByText('Flag')).toBeTruthy();
    expect(queryByText('Trash2')).toBeNull();

    // 更新为作者
    rerender(<PostDetailHeader {...defaultProps} isAuthor={true} />);

    // 重新打开菜单（rerender 后 modal 状态可能重置，或者需要重新获取按钮）
    const moreBtn2 = getByText('MoreHorizontal');
    fireEvent.press(moreBtn2);

    // 此时应有 Trash2，无 Flag
    expect(getByText('Trash2')).toBeTruthy();
    expect(queryByText('Flag')).toBeNull();
  });
});
