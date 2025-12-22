import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// 导入组件
import { CommentInput } from '../CommentInput';

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

// 2. Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// 3. Mock tamagui (关键修复)
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text, TextInput } = require('react-native');

  // 通用 Mock 组件
  const MockView = ({ children, ...props }: any) => React.createElement(View, props, children);

  return {
    // 关键修复：styled 接收 Component 参数并渲染它
    // 这样 styled(Input) 会渲染 TextInput，styled(Text) 会渲染 Text
    styled:
      (Component: any) =>
      ({ children, ...props }: any) =>
        React.createElement(Component, props, children),

    Stack: MockView,
    YStack: MockView,
    XStack: MockView,
    Text: Text, // 直接使用 RN Text
    Input: TextInput, // 直接使用 RN TextInput，确保 ref 和 onChangeText 正常工作
  };
});

// 4. Mock reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withSpring: (v: any) => v,
    createAnimatedComponent: (Comp: any) => Comp,
    View: View,
  };
});

// 5. Mock icons (关键修复：渲染为 Text 以便 getByText 查找)
jest.mock('@tamagui/lucide-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Send: () => <Text>Send</Text>,
    X: () => <Text>X</Text>,
    AtSign: () => <Text>AtSign</Text>,
  };
});

describe('CommentInput', () => {
  const mockComment = {
    id: 1,
    post_id: 'post-123',
    author_id: 'user-1',
    content: '被回复的评论',
    author: { username: '评论用户' }, // 注意：源代码使用的是 comment.author.username
    author_name: '评论用户', // 兼容旧数据结构
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    like_count: 5,
    is_liked: false,
    is_author: false,
  };

  const defaultProps = {
    value: '',
    onChangeText: jest.fn(),
    onSubmit: jest.fn(),
    replyTarget: null,
    onCancelReply: jest.fn(),
    disabled: false,
  };

  // 修复：更新匹配规则以包含 "写下"
  const placeholderRegex = /写下|输入|评论|说点什么/i;

  it('显示输入框占位符', () => {
    const { getByPlaceholderText } = render(<CommentInput {...defaultProps} />);
    expect(getByPlaceholderText(placeholderRegex)).toBeTruthy();
  });

  it('输入文本时触发 onChangeText', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <CommentInput {...defaultProps} onChangeText={onChangeText} />
    );

    const input = getByPlaceholderText(placeholderRegex);
    fireEvent.changeText(input, '测试评论');

    expect(onChangeText).toHaveBeenCalledWith('测试评论');
  });

  it('显示输入的文本内容', () => {
    const { getByPlaceholderText } = render(<CommentInput {...defaultProps} value="我的评论" />);
    const input = getByPlaceholderText(placeholderRegex);
    expect(input.props.value === '我的评论').toBeTruthy();
  });

  it('有回复目标时显示回复信息', () => {
    const { getByText } = render(<CommentInput {...defaultProps} replyTarget={mockComment} />);
    // 源代码中有 "回复 {username}"
    expect(getByText(/回复/i)).toBeTruthy();
  });

  it('显示回复目标的用户名', () => {
    const { getByText } = render(<CommentInput {...defaultProps} replyTarget={mockComment} />);
    expect(getByText(/评论用户/)).toBeTruthy();
  });

  it('点击取消回复时触发 onCancelReply', () => {
    const onCancelReply = jest.fn();
    const { getByText } = render(
      <CommentInput {...defaultProps} replyTarget={mockComment} onCancelReply={onCancelReply} />
    );

    // 现在 X 图标被 Mock 为 <Text>X</Text>，可以被找到
    const cancelBtn = getByText('X');
    fireEvent.press(cancelBtn);

    expect(onCancelReply).toHaveBeenCalled();
  });

  it('无回复目标时不显示回复信息', () => {
    const { queryByText } = render(<CommentInput {...defaultProps} replyTarget={null} />);
    expect(queryByText(/评论用户/)).toBeFalsy();
  });

  it('点击发送按钮触发 onSubmit', () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <CommentInput
        {...defaultProps}
        value="测试评论" // 必须有值，否则按钮可能禁用
        onSubmit={onSubmit}
      />
    );

    // 现在 Send 图标被 Mock 为 <Text>Send</Text>
    const sendBtn = getByText('Send');
    fireEvent.press(sendBtn);

    expect(onSubmit).toHaveBeenCalled();
  });

  it('内容为空时发送按钮应禁用或不触发', () => {
    const onSubmit = jest.fn();
    const { getByText } = render(<CommentInput {...defaultProps} value="" onSubmit={onSubmit} />);

    const sendBtn = getByText('Send');
    fireEvent.press(sendBtn);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disabled 属性时禁用输入', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <CommentInput {...defaultProps} onChangeText={onChangeText} disabled={true} />
    );

    const input = getByPlaceholderText(placeholderRegex);
    // 验证 editable 属性
    expect(input.props.editable).toBe(false);
  });

  it('长文本输入支持', () => {
    const longText = '这是一条很长的评论。'.repeat(10);
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <CommentInput {...defaultProps} value={longText} onChangeText={onChangeText} />
    );

    const input = getByPlaceholderText(placeholderRegex);
    expect(input.props.value === longText).toBeTruthy();
  });

  it('清空文本时更新内容', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText, rerender } = render(
      <CommentInput {...defaultProps} value="测试" onChangeText={onChangeText} />
    );

    rerender(<CommentInput {...defaultProps} value="" onChangeText={onChangeText} />);

    const input = getByPlaceholderText(placeholderRegex);
    expect(input.props.value === '').toBeTruthy();
  });

  it('从有回复目标切换到无回复目标', () => {
    const onCancelReply = jest.fn();
    const { rerender, queryByText } = render(
      <CommentInput {...defaultProps} replyTarget={mockComment} onCancelReply={onCancelReply} />
    );

    expect(queryByText(/评论用户/)).toBeTruthy();

    rerender(<CommentInput {...defaultProps} replyTarget={null} onCancelReply={onCancelReply} />);

    expect(queryByText(/评论用户/)).toBeFalsy();
  });

  it('多次输入和提交的流程', () => {
    const onChangeText = jest.fn();
    const onSubmit = jest.fn();

    const { getByPlaceholderText, getByText, rerender } = render(
      <CommentInput {...defaultProps} value="" onChangeText={onChangeText} onSubmit={onSubmit} />
    );

    // 第一次输入
    const input = getByPlaceholderText(placeholderRegex);
    fireEvent.changeText(input, '评论1');
    expect(onChangeText).toHaveBeenCalledWith('评论1');

    // 模拟父组件更新 value
    rerender(
      <CommentInput
        {...defaultProps}
        value="评论1"
        onChangeText={onChangeText}
        onSubmit={onSubmit}
      />
    );

    // 第一次提交
    const sendBtn = getByText('Send');
    fireEvent.press(sendBtn);
    expect(onSubmit).toHaveBeenCalled();

    // 清空后再次输入
    rerender(
      <CommentInput {...defaultProps} value="" onChangeText={onChangeText} onSubmit={onSubmit} />
    );

    fireEvent.changeText(input, '评论2');
    expect(onChangeText).toHaveBeenCalledWith('评论2');
  });
});
