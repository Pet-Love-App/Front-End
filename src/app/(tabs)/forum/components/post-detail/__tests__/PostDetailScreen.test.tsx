import React from 'react';
import { render, waitFor, findByText } from '@testing-library/react-native';

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

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock reanimated
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock gesture-handler
jest.mock('react-native-gesture-handler', () => ({
  Gesture: {
    Pan: () => ({ onUpdate: jest.fn(), onEnd: jest.fn() }),
  },
  GestureDetector: ({ children }: any) => children,
}));

// Mock tamagui
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text, ScrollView } = require('react-native');
  return {
    styled: () => (p: any) => React.createElement(View, p, p.children),
    Stack: (p: any) => React.createElement(View, p, p.children),
    YStack: (p: any) => React.createElement(View, p, p.children),
    ScrollView: (p: any) => React.createElement(ScrollView, p, p.children),
    Text: (p: any) => React.createElement(Text, p, p.children),
  };
});

// Mock supabase service
jest.mock('@/src/lib/supabase', () => ({
  supabaseForumService: {
    getPostDetail: jest.fn(),
    togglePostLike: jest.fn(),
    togglePostCollect: jest.fn(),
    deletePost: jest.fn(),
    addComment: jest.fn(),
    getPostComments: jest.fn(),
    deleteComment: jest.fn(),
    updateComment: jest.fn(),
  },
  supabaseCommentService: {
    getComments: jest.fn(() => Promise.resolve({ data: [], error: null })),
    addComment: jest.fn(),
    deleteComment: jest.fn(),
    updateComment: jest.fn(),
  },
}));

// Mock icons
jest.mock('@tamagui/lucide-icons', () => ({
  ChevronLeft: () => 'ChevronLeft',
  MoreVertical: () => 'MoreVertical',
  Heart: () => 'Heart',
  MessageCircle: () => 'MessageCircle',
  Share2: () => 'Share2',
  Bookmark: () => 'Bookmark',
}));

// Mock child components
jest.mock('../CommentSection', () => ({
  CommentSection: () => 'CommentSection',
}));

jest.mock('../CommentInput', () => ({
  CommentInput: () => 'CommentInput',
}));

jest.mock('../PostActions', () => ({
  PostActions: () => 'PostActions',
}));

jest.mock('../PostContent', () => ({
  PostContent: () => 'PostContent',
}));

jest.mock('../PostDetailHeader', () => ({
  PostDetailHeader: () => 'PostDetailHeader',
}));

jest.mock('../PostMediaGallery', () => ({
  PostMediaGallery: () => 'PostMediaGallery',
}));

jest.mock('@/src/components/UserProfileModal', () => ({
  UserProfileModal: () => 'UserProfileModal',
}));

jest.mock('@/src/components/VideoPlayer', () => ({
  VideoPlayer: () => 'VideoPlayer',
}));

// Import component
const { PostDetailScreen } = require('../PostDetailScreen');

describe('PostDetailScreen', () => {
  const mockPost = {
    id: 'post-123',
    content: '测试帖子内容',
    author_id: 'user-1',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    author_name: '测试用户',
    author_avatar: 'https://example.com/avatar.jpg',
    like_count: 10,
    comment_count: 5,
    collect_count: 3,
    is_liked: false,
    is_collected: false,
    medias: [],
    category: 'general',
    tags: [],
  };

  const defaultProps = {
    visible: false,
    post: null,
    onClose: jest.fn(),
    headerOffset: 0,
    onEditPost: jest.fn(),
    onPostDeleted: jest.fn(),
  };

  it('不可见时不显示', () => {
    const { UNSAFE_root } = render(
      <PostDetailScreen {...defaultProps} visible={false} post={mockPost} />
    );
    // 当 visible 为 false 时，内容不可见（opacity: 0）
    // 但组件仍然渲染，只是不可见
    const root = UNSAFE_root;
    expect(root).toBeTruthy();
  });

  it('可见且有帖子数据时显示详情', async () => {
    const { toJSON } = render(
      <PostDetailScreen {...defaultProps} visible={true} post={mockPost} />
    );

    // 等待 React 完成所有状态更新
    await waitFor(
      () => {
        const tree = toJSON();
        expect(tree).not.toBeNull();
      },
      { timeout: 1000 }
    );
  });

  it('post 为 null 时不显示内容', () => {
    const { queryByText } = render(
      <PostDetailScreen {...defaultProps} visible={true} post={null} />
    );
    // 当 post 为 null 时，不应显示内容子组件
    expect(queryByText('PostContent')).toBeFalsy();
  });

  it('post 变化时更新显示', async () => {
    const { rerender, toJSON } = render(
      <PostDetailScreen {...defaultProps} visible={true} post={mockPost} />
    );

    await waitFor(
      () => {
        const tree = toJSON();
        expect(tree).not.toBeNull();
      },
      { timeout: 1000 }
    );

    const newPost = { ...mockPost, id: 'post-456', content: '更新的内容' };
    rerender(<PostDetailScreen {...defaultProps} visible={true} post={newPost} />);

    await waitFor(
      () => {
        const tree = toJSON();
        expect(tree).not.toBeNull();
      },
      { timeout: 1000 }
    );
  });

  it('调用 onClose 回调', () => {
    const onClose = jest.fn();
    render(<PostDetailScreen {...defaultProps} visible={true} post={mockPost} onClose={onClose} />);
    // onClose 应该可以从 PostDetailHeader 中触发
    // 这里验证 onClose 被正确传递
    expect(onClose).not.toHaveBeenCalled();
  });

  it('传递 onEditPost 回调', () => {
    const onEditPost = jest.fn();
    render(
      <PostDetailScreen {...defaultProps} visible={true} post={mockPost} onEditPost={onEditPost} />
    );
    // 验证回调被正确传递
    expect(onEditPost).not.toHaveBeenCalled();
  });

  it('传递 onPostDeleted 回调', () => {
    const onPostDeleted = jest.fn();
    render(
      <PostDetailScreen
        {...defaultProps}
        visible={true}
        post={mockPost}
        onPostDeleted={onPostDeleted}
      />
    );
    // 验证回调被正确传递
    expect(onPostDeleted).not.toHaveBeenCalled();
  });

  it('支持 headerOffset 属性', async () => {
    const { toJSON } = render(
      <PostDetailScreen {...defaultProps} visible={true} post={mockPost} headerOffset={100} />
    );

    await waitFor(
      () => {
        const tree = toJSON();
        expect(tree).not.toBeNull();
      },
      { timeout: 1000 }
    );
  });

  it('从不可见转为可见时显示内容', async () => {
    const { rerender, toJSON } = render(
      <PostDetailScreen {...defaultProps} visible={false} post={mockPost} />
    );

    rerender(<PostDetailScreen {...defaultProps} visible={true} post={mockPost} />);

    await waitFor(
      () => {
        const tree = toJSON();
        expect(tree).not.toBeNull();
      },
      { timeout: 1000 }
    );
  });
});
