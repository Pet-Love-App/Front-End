import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, Image, TextInput, Pressable } from 'react-native';

// 导入组件
import { CommentItem } from '../CommentItem';

// 1. 基础环境 Mock
if (typeof navigator === 'undefined') {
  // @ts-ignore
  global.navigator = { userAgent: 'node.js' };
}
if (typeof (global as any).addEventListener === 'undefined') {
  (global as any).addEventListener = jest.fn();
}

// 2. Mock Tamagui (关键修复)
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text: RNText, Image, TextInput } = require('react-native');

  // 创建一个通用的 Mock 组件 (用于 YStack, XStack 等)
  const MockComponent = ({ children, ...props }: any) => React.createElement(View, props, children);

  // 特殊处理 Avatar
  const MockAvatar = ({ children, ...props }: any) => React.createElement(View, props, children);
  MockAvatar.Image = (props: any) => React.createElement(Image, props);
  MockAvatar.Fallback = ({ children, ...props }: any) => React.createElement(View, props, children);

  return {
    // 关键修复：styled 现在接收 Component 参数并渲染它
    // 这样 styled(Text) 会渲染 RNText，styled(YStack) 会渲染 MockComponent
    styled:
      (Component: any) =>
      ({ children, ...props }: any) =>
        React.createElement(Component, props, children),

    Stack: MockComponent,
    YStack: MockComponent,
    XStack: MockComponent,
    // 导出 React Native 的 Text
    Text: RNText,
    TextArea: (props: any) => React.createElement(TextInput, { ...props, multiline: true }),
    Image: (props: any) => React.createElement(Image, props),
    Avatar: MockAvatar,
  };
});

// 3. Mock 图标
jest.mock('@tamagui/lucide-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Heart: () => <Text>HeartIcon</Text>,
    Reply: () => <Text>ReplyIcon</Text>,
    Edit3: () => <Text>Edit3Icon</Text>,
    Trash2: () => <Text>Trash2Icon</Text>,
    MoreHorizontal: () => <Text>MoreHorizontalIcon</Text>,
    User: () => <Text>UserIcon</Text>,
  };
});

// 4. Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withSpring: (v: any) => v,
    withSequence: (...args: any[]) => args[args.length - 1],
    createAnimatedComponent: (Comp: any) => Comp,
    View: View,
  };
});

// 5. Mock Design System Components
jest.mock('@/src/design-system/components', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  return {
    Button: (props: any) => (
      <Pressable {...props}>
        <Text>{props.children}</Text>
      </Pressable>
    ),
  };
});

// 6. Mock Tokens
jest.mock('@/src/design-system/tokens', () => ({
  primaryScale: { primary2: '#fff', primary3: '#fff', primary7: '#000', primary8: '#000' },
  neutralScale: {
    neutral2: '#fff',
    neutral3: '#ccc',
    neutral4: '#ccc',
    neutral7: '#888',
    neutral8: '#666',
    neutral11: '#333',
    neutral12: '#000',
  },
  errorScale: { error2: '#fee', error9: '#f00' },
}));

describe('CommentItem', () => {
  const mockOnReply = jest.fn();
  const mockOnLike = jest.fn();
  const mockOnStartEdit = jest.fn();
  const mockOnSaveEdit = jest.fn();
  const mockOnCancelEdit = jest.fn();
  const mockOnEditChange = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnAuthorPress = jest.fn();

  const defaultComment = {
    id: 1,
    author: {
      id: 'user1',
      username: '用户1',
      avatarUrl: 'https://example.com/avatar1.jpg',
    },
    authorId: 'user1',
    targetType: 'post' as const,
    targetId: 1,
    parentId: null,
    content: '这是一条评论',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likes: 5,
    isLiked: false,
    replies: [],
  };

  const defaultProps = {
    comment: defaultComment,
    isOwner: false,
    isEditing: false,
    editingContent: '',
    onLike: mockOnLike,
    onReply: mockOnReply,
    onAuthorPress: mockOnAuthorPress,
    onStartEdit: mockOnStartEdit,
    onSaveEdit: mockOnSaveEdit,
    onCancelEdit: mockOnCancelEdit,
    onEditChange: mockOnEditChange,
    onDelete: mockOnDelete,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('显示评论内容', () => {
    const { getByText } = render(<CommentItem {...defaultProps} />);
    // 现在 ContentText 是 Text 组件，可以被找到
    expect(getByText('这是一条评论')).toBeTruthy();
  });

  it('显示评论作者信息', () => {
    const { getByText } = render(<CommentItem {...defaultProps} />);
    expect(getByText('用户1')).toBeTruthy();
  });

  it('显示评论发布时间', () => {
    const { getByText } = render(<CommentItem {...defaultProps} />);
    expect(getByText(/刚刚|分钟前|小时前|天前/)).toBeTruthy();
  });

  it('显示点赞数', () => {
    const { getByText } = render(<CommentItem {...defaultProps} />);
    expect(getByText('5')).toBeTruthy();
  });

  it('点击点赞按钮', () => {
    const { getByText } = render(<CommentItem {...defaultProps} />);
    const likeIcon = getByText('HeartIcon');
    fireEvent.press(likeIcon);
    expect(mockOnLike).toHaveBeenCalledWith(1);
  });

  it('显示回复按钮', () => {
    const { getByText } = render(<CommentItem {...defaultProps} />);
    expect(getByText('回复')).toBeTruthy();
  });

  it('点击回复按钮', () => {
    const { getByText } = render(<CommentItem {...defaultProps} />);
    const replyBtn = getByText('回复');
    fireEvent.press(replyBtn);
    expect(mockOnReply).toHaveBeenCalledWith(defaultComment);
  });

  it('作者才能看到编辑删除菜单', () => {
    const { getByText } = render(<CommentItem {...defaultProps} isOwner={true} />);
    expect(getByText('编辑')).toBeTruthy();
    expect(getByText('删除')).toBeTruthy();
  });

  it('非作者不显示编辑删除菜单', () => {
    const { queryByText } = render(<CommentItem {...defaultProps} isOwner={false} />);
    expect(queryByText('编辑')).toBeNull();
    expect(queryByText('删除')).toBeNull();
  });

  it('显示作者标签 (OwnerBadge)', () => {
    const { getByText } = render(<CommentItem {...defaultProps} isOwner={true} />);
    expect(getByText('作者')).toBeTruthy();
  });

  it('评论已点赞显示高亮状态', () => {
    const { getByText } = render(
      <CommentItem {...defaultProps} comment={{ ...defaultComment, isLiked: true }} />
    );
    expect(getByText('HeartIcon')).toBeTruthy();
  });

  it('进入编辑模式显示输入框', () => {
    const { getByDisplayValue, getByText } = render(
      <CommentItem {...defaultProps} isEditing={true} editingContent="正在编辑的内容" />
    );
    expect(getByDisplayValue('正在编辑的内容')).toBeTruthy();
    expect(getByText('保存')).toBeTruthy();
    expect(getByText('取消')).toBeTruthy();
  });

  it('编辑模式下输入内容触发回调', () => {
    const { getByDisplayValue } = render(
      <CommentItem {...defaultProps} isEditing={true} editingContent="旧内容" />
    );
    const input = getByDisplayValue('旧内容');
    fireEvent.changeText(input, '新内容');
    expect(mockOnEditChange).toHaveBeenCalledWith('新内容');
  });

  it('点击保存编辑', () => {
    const { getByText } = render(<CommentItem {...defaultProps} isEditing={true} />);
    fireEvent.press(getByText('保存'));
    expect(mockOnSaveEdit).toHaveBeenCalled();
  });

  it('点击取消编辑', () => {
    const { getByText } = render(<CommentItem {...defaultProps} isEditing={true} />);
    fireEvent.press(getByText('取消'));
    expect(mockOnCancelEdit).toHaveBeenCalled();
  });

  it('点击删除按钮', () => {
    const { getByText } = render(<CommentItem {...defaultProps} isOwner={true} />);
    fireEvent.press(getByText('删除'));
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('无头像时显示首字母', () => {
    const noAvatarComment = {
      ...defaultComment,
      author: { ...defaultComment.author, avatarUrl: null, username: 'TestUser' },
    };
    const { getByText } = render(<CommentItem {...defaultProps} comment={noAvatarComment} />);
    expect(getByText('T')).toBeTruthy();
  });
});
