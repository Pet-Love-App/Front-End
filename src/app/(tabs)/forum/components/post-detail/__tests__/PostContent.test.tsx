import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text, Image } from 'react-native';

// 4. 导入待测组件
import { PostContent } from '../PostContent';

// 1. 基础环境 Mock
if (typeof navigator === 'undefined') {
  // @ts-ignore
  global.navigator = { userAgent: 'node.js' };
}

// 2. Mock Tamagui (关键修复)
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text: RNText, Image } = require('react-native');

  // 通用 Mock 组件
  const MockComponent = ({ children, ...props }: any) => React.createElement(View, props, children);

  // Avatar Mock
  const MockAvatar = ({ children, ...props }: any) => React.createElement(View, props, children);
  MockAvatar.Image = (props: any) =>
    React.createElement(Image, { ...props, testID: 'avatar-image' });
  MockAvatar.Fallback = ({ children, ...props }: any) => React.createElement(View, props, children);

  return {
    // 关键修改：styled 现在会渲染传入的 Component，而不是一律渲染 View
    // 这样 styled(Text) 就会渲染 RNText，styled(YStack) 就会渲染 MockComponent
    styled:
      (Component: any) =>
      ({ children, ...props }: any) =>
        React.createElement(Component, props, children),

    YStack: MockComponent,
    XStack: MockComponent,
    Stack: MockComponent,
    // 导出 React Native 的 Text 作为 Tamagui 的 Text
    Text: RNText,
    Avatar: MockAvatar,
  };
});

// 3. Mock Tag 组件
jest.mock('@/src/components/ui/Tag', () => {
  const { Text } = require('react-native');
  return ({ name }: any) => <Text testID="tag-item">{name}</Text>;
});

describe('PostContent', () => {
  const mockPost = {
    id: 'post-123',
    content: '这是帖子的内容',
    createdAt: new Date().toISOString(),
    author: {
      id: 'user-1',
      username: '张三',
      avatar: 'https://example.com/avatar.jpg',
    },
    likes: 10,
    comments: 5,
    category: 'share',
    tags: ['React', 'Native'],
  };

  const defaultProps = {
    post: mockPost as any,
    onAuthorPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('显示作者名称', () => {
    const { getByText } = render(<PostContent {...defaultProps} />);
    // 现在 AuthorName 是一个 Text 组件，getByText 可以正常工作
    expect(getByText('张三')).toBeTruthy();
  });

  it('显示作者头像', () => {
    const { getByTestId } = render(<PostContent {...defaultProps} />);
    expect(getByTestId('avatar-image')).toBeTruthy();
  });

  it('显示帖子内容', () => {
    const { getByText } = render(<PostContent {...defaultProps} />);
    expect(getByText('这是帖子的内容')).toBeTruthy();
  });

  it('显示发布时间', () => {
    const { getByText } = render(<PostContent {...defaultProps} />);
    expect(getByText('刚刚')).toBeTruthy();
  });

  it('显示帖子标签', () => {
    const { getByText } = render(<PostContent {...defaultProps} />);
    expect(getByText('React')).toBeTruthy();
    expect(getByText('Native')).toBeTruthy();
  });

  it('无标签时不显示标签区域', () => {
    const postNoTags = { ...mockPost, tags: [] };
    const { queryByTestId } = render(<PostContent {...defaultProps} post={postNoTags as any} />);
    expect(queryByTestId('tag-item')).toBeNull();
  });

  it('多个标签全部显示', () => {
    const postManyTags = { ...mockPost, tags: ['React', 'Native', 'JavaScript'] };
    const { getByText } = render(<PostContent {...defaultProps} post={postManyTags as any} />);
    expect(getByText('React')).toBeTruthy();
    expect(getByText('Native')).toBeTruthy();
    expect(getByText('JavaScript')).toBeTruthy();
  });

  it('点击作者名称触发回调', () => {
    const onAuthorPress = jest.fn();
    const { getByText } = render(<PostContent {...defaultProps} onAuthorPress={onAuthorPress} />);

    // AuthorName 现在是 Text，支持 onPress
    const authorName = getByText('张三');
    fireEvent.press(authorName);

    expect(onAuthorPress).toHaveBeenCalledWith('user-1');
  });

  it('显示分类标签', () => {
    const { getByText } = render(<PostContent {...defaultProps} />);
    expect(getByText('分享')).toBeTruthy();
  });

  it('长内容正确显示', () => {
    const longContent = '这是一条很长的内容。'.repeat(20);
    const longPost = { ...mockPost, content: longContent };
    const { getByText } = render(<PostContent {...defaultProps} post={longPost as any} />);
    expect(getByText(longContent)).toBeTruthy();
  });

  it('无作者头像时显示首字母Fallback', () => {
    const postNoAvatar = {
      ...mockPost,
      author: { ...mockPost.author, avatar: null, username: 'TestUser' },
    };
    const { getByText } = render(<PostContent {...defaultProps} post={postNoAvatar as any} />);
    expect(getByText('T')).toBeTruthy();
  });

  it('无回调函数时点击不报错', () => {
    const { getByText } = render(<PostContent {...defaultProps} onAuthorPress={undefined} />);
    const authorName = getByText('张三');
    expect(() => fireEvent.press(authorName)).not.toThrow();
  });

  it('帖子数据更新时重新渲染', () => {
    const { rerender, getByText, queryByText } = render(
      <PostContent {...defaultProps} post={mockPost as any} />
    );

    expect(getByText('张三')).toBeTruthy();

    const newPost = {
      ...mockPost,
      content: '新的内容',
      author: { ...mockPost.author, username: '李四' },
    };

    rerender(<PostContent {...defaultProps} post={newPost as any} />);

    expect(getByText('李四')).toBeTruthy();
    expect(queryByText('张三')).toBeNull();
    expect(getByText('新的内容')).toBeTruthy();
  });

  it('空内容正确处理', () => {
    const emptyPost = { ...mockPost, content: '' };
    const { getByText } = render(<PostContent {...defaultProps} post={emptyPost as any} />);
    expect(getByText('张三')).toBeTruthy();
  });
});
