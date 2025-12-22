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

// 2. Mock tamagui (修复核心：基于引用的组件识别)
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text: RNText } = require('react-native');

  // 定义一个唯一的 Text Mock 组件引用
  const MockTamaguiText = ({ children, ...props }: any) =>
    React.createElement(RNText, props, children);

  // 通用 View Mock
  const MockTamaguiView = ({ children, ...props }: any) =>
    React.createElement(View, props, children);

  return {
    // 导出这个特定的 Text 引用
    Text: MockTamaguiText,

    // 导出 View 引用
    YStack: MockTamaguiView,
    XStack: MockTamaguiView,
    Stack: MockTamaguiView,

    // 关键修复：styled 函数
    styled: (Component: any) => {
      // 检查传入 styled 的组件是否是我们上面定义的 MockTamaguiText
      if (Component === MockTamaguiText) {
        return MockTamaguiText; // 如果是 Text，继续渲染为 Text
      }
      return MockTamaguiView; // 其他情况（如 YStack）渲染为 View
    },

    // Spinner 必须渲染为 Text 才能被 getByText 找到
    Spinner: () => React.createElement(RNText, {}, 'Loading...'),
  };
});

// 3. Mock reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withRepeat: () => {},
    withSequence: () => {},
    withTiming: () => {},
    Easing: { inOut: () => {}, ease: () => {} },
    // 确保 createAnimatedComponent 返回一个能渲染 children 的组件
    createAnimatedComponent: (Comp: any) => (props: any) =>
      React.createElement(Comp, props, props.children),
    View: View,
  };
});

// 4. Mock icons
jest.mock('@tamagui/lucide-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  // 图标渲染为 Text，方便调试，虽然通常不通过文本查找图标
  return {
    MessageCircle: () => <Text>MessageCircle</Text>,
    Sparkles: () => <Text>Sparkles</Text>,
  };
});

// 5. Mock CommentItem
jest.mock('../CommentItem', () => {
  const React = require('react');
  const { Text, TouchableOpacity, View } = require('react-native');
  return {
    CommentItem: ({ comment, onReply, onStartEdit, onDelete, isEditing }: any) => (
      <View>
        <Text>comment-{comment.id}</Text>
        {isEditing && <Text>正在编辑-{comment.id}</Text>}
        <TouchableOpacity onPress={() => onReply && onReply(comment)}>
          <Text>回复按钮</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onStartEdit && onStartEdit(comment)}>
          <Text>编辑按钮</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete && onDelete(comment.id)}>
          <Text>删除按钮</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

const { CommentSection } = require('../CommentSection');

describe('CommentSection', () => {
  const mockComment = {
    id: 1,
    post_id: 'post-123',
    author_id: 'user-1',
    content: '测试评论',
    author: { id: 'user-1', username: '评论用户' },
    created_at: '2024-01-01',
    like_count: 5,
    is_liked: false,
  };

  const defaultProps = {
    comments: [],
    isLoading: false,
    currentUserId: 'user-1',
    newComment: '',
    replyTarget: null,
    editingComment: null,
    onCommentChange: jest.fn(),
    onSubmitComment: jest.fn(),
    onToggleLike: jest.fn(),
    onSetReplyTarget: jest.fn(),
    onAuthorPress: jest.fn(),
    onStartEdit: jest.fn(),
    onSaveEdit: jest.fn(),
    onCancelEdit: jest.fn(),
    onEditChange: jest.fn(),
    onDeleteComment: jest.fn(),
  };

  it('无评论时显示空状态', () => {
    const { getByText } = render(<CommentSection {...defaultProps} comments={[]} />);
    // 现在 styled(Text) 会正确渲染为 RNText，getByText 可以找到了
    expect(getByText('还没有评论')).toBeTruthy();
    expect(getByText(/期待你的独到见解/)).toBeTruthy();
  });

  it('加载中时显示加载状态', () => {
    const { getByText } = render(
      <CommentSection {...defaultProps} isLoading={true} comments={[]} />
    );
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('显示评论列表标题', () => {
    const { getAllByText } = render(<CommentSection {...defaultProps} comments={[mockComment]} />);
    // HeaderTitle 是 styled(Text)，现在应该能被找到
    expect(getAllByText('评论').length).toBeGreaterThan(0);
  });

  it('显示评论数量', () => {
    const comments = [mockComment, { ...mockComment, id: 2 }];
    const { getByText } = render(<CommentSection {...defaultProps} comments={comments} />);
    // CommentCount 是 styled(Text)，现在应该能被找到
    expect(getByText('2')).toBeTruthy();
  });

  it('多个评论时全部显示', () => {
    const comments = [mockComment, { ...mockComment, id: 2 }, { ...mockComment, id: 3 }];
    const { getByText } = render(<CommentSection {...defaultProps} comments={comments} />);
    expect(getByText('comment-1')).toBeTruthy();
    expect(getByText('comment-2')).toBeTruthy();
    expect(getByText('comment-3')).toBeTruthy();
  });

  it('编辑评论时传递 isEditing 状态给子组件', () => {
    const { getByText } = render(
      <CommentSection
        {...defaultProps}
        comments={[mockComment]}
        editingComment={{ id: 1, content: '编辑的内容' }}
      />
    );
    expect(getByText('正在编辑-1')).toBeTruthy();
  });

  it('点击子组件的回复按钮触发 onSetReplyTarget', () => {
    const onSetReplyTarget = jest.fn();
    const { getByText } = render(
      <CommentSection
        {...defaultProps}
        comments={[mockComment]}
        onSetReplyTarget={onSetReplyTarget}
      />
    );

    fireEvent.press(getByText('回复按钮'));
    expect(onSetReplyTarget).toHaveBeenCalledWith(mockComment);
  });

  it('点击子组件的编辑按钮触发 onStartEdit', () => {
    const onStartEdit = jest.fn();
    const { getByText } = render(
      <CommentSection {...defaultProps} comments={[mockComment]} onStartEdit={onStartEdit} />
    );

    fireEvent.press(getByText('编辑按钮'));
    expect(onStartEdit).toHaveBeenCalledWith(mockComment);
  });

  it('点击子组件的删除按钮触发 onDeleteComment', () => {
    const onDeleteComment = jest.fn();
    const { getByText } = render(
      <CommentSection
        {...defaultProps}
        comments={[mockComment]}
        onDeleteComment={onDeleteComment}
      />
    );

    fireEvent.press(getByText('删除按钮'));
    expect(onDeleteComment).toHaveBeenCalledWith(mockComment.id);
  });

  it('评论列表为空和加载中的区别处理', () => {
    const { rerender, getByText, queryByText } = render(
      <CommentSection {...defaultProps} comments={[]} isLoading={false} />
    );
    expect(getByText('还没有评论')).toBeTruthy();
    expect(queryByText('Loading...')).toBeFalsy();

    rerender(<CommentSection {...defaultProps} comments={[]} isLoading={true} />);
    expect(getByText('Loading...')).toBeTruthy();
    expect(queryByText('还没有评论')).toBeFalsy();
  });
});
