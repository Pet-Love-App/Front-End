import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { CollectScreen } from '../CollectScreen';

if (typeof navigator === 'undefined') {
  global.navigator = {
    userAgent: 'node.js',
  } as any;
}

// Simplified tamagui mock used in other tests
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text, ScrollView, TextInput, TouchableOpacity } = require('react-native');
  const SpinnerInner = (p: any) => React.createElement(View, p, p.children || null);
  const ClickableView = (p: any) =>
    p.onPress
      ? React.createElement(TouchableOpacity, { ...p, accessibilityRole: 'button' }, p.children)
      : React.createElement(View, p, p.children);
  return {
    Input: (p: any) => React.createElement(TextInput, p, null),
    ScrollView: (p: any) => React.createElement(ScrollView, p, p.children),
    Spinner: (p: any) => React.createElement(SpinnerInner, p, null),
    Text: (p: any) => React.createElement(Text, p, p.children),
    XStack: (p: any) => React.createElement(View, p, p.children),
    YStack: (p: any) => React.createElement(ClickableView, p, p.children),
  };
});

// Mock child components and icons
jest.mock('@/src/components/AppHeader', () => ({
  AppHeader: ({ title, rightElement }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(
      View,
      { accessibilityRole: 'header' },
      React.createElement(Text, null, title),
      rightElement
    );
  },
}));
jest.mock('@/src/components/ui/IconSymbol', () => ({ IconSymbol: 'IconSymbol' }));
jest.mock('@/src/app/tabs/collect/components/collectItem', () => ({
  __esModule: true,
  default: ({ favorite }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    const name = favorite?.catfood?.name || favorite?.name || '';
    return React.createElement(
      View,
      { accessibilityRole: 'text' },
      React.createElement(Text, null, name)
    );
  },
}));
jest.mock('@/src/app/tabs/collect/components/PostCollectItem', () => ({
  __esModule: true,
  default: ({ post }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    const content = post?.content || '';
    return React.createElement(
      View,
      { accessibilityRole: 'text' },
      React.createElement(Text, null, content)
    );
  },
}));
jest.mock('@/src/app/tabs/forum/components/post-detail', () => ({
  __esModule: true,
  PostDetailScreen: ({ visible, post }: any) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    if (!visible) return null;
    return React.createElement(
      View,
      { accessibilityLabel: 'post-detail' },
      React.createElement(Text, null, String(post?.id || ''))
    );
  },
}));

// Mock hooks used by the screen
const mockUseCollectData = jest.fn();
const mockUseCollectFilter = jest.fn();
const mockUsePostCollectData = jest.fn();

jest.mock('../../hooks', () => ({
  useCollectData: () => mockUseCollectData(),
  useCollectFilter: (favorites: any) => mockUseCollectFilter(favorites),
  usePostCollectData: () => mockUsePostCollectData(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: any) => children,
}));

describe('CollectScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state for catfood tab', () => {
    mockUseCollectData.mockReturnValue({
      favorites: [],
      isLoading: true,
      error: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
    });
    mockUseCollectFilter.mockReturnValue({
      currentTab: 'catfood',
      setCurrentTab: jest.fn(),
      searchText: '',
      setSearchText: jest.fn(),
      filteredFavorites: [],
      favoritesCount: 0,
    });
    mockUsePostCollectData.mockReturnValue({
      favoritePosts: [],
      isLoadingPosts: false,
      postError: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
      selectedPost: null,
      closePostDetail: jest.fn(),
      handlePostDeleted: jest.fn(),
    });

    const { getByText } = render(<CollectScreen />);
    expect(getByText('加载中...')).toBeTruthy();
  });

  it('shows empty message when no catfood favorites', () => {
    mockUseCollectData.mockReturnValue({
      favorites: [],
      isLoading: false,
      error: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
    });
    mockUseCollectFilter.mockReturnValue({
      currentTab: 'catfood',
      setCurrentTab: jest.fn(),
      searchText: '',
      setSearchText: jest.fn(),
      filteredFavorites: [],
      favoritesCount: 0,
    });
    mockUsePostCollectData.mockReturnValue({
      favoritePosts: [],
      isLoadingPosts: false,
      postError: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
      selectedPost: null,
      closePostDetail: jest.fn(),
      handlePostDeleted: jest.fn(),
    });

    const { getByText } = render(<CollectScreen />);
    expect(getByText(/还没有收藏任何猫粮/)).toBeTruthy();
  });

  it('renders catfood list items', () => {
    // Screen expects flattened favorite items before normalizing
    const fav = [{ id: 'c1', favoriteId: 'f1', name: 'Chicken Mix' }];
    mockUseCollectData.mockReturnValue({
      favorites: fav,
      isLoading: false,
      error: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
    });
    mockUseCollectFilter.mockReturnValue({
      currentTab: 'catfood',
      setCurrentTab: jest.fn(),
      searchText: '',
      setSearchText: jest.fn(),
      filteredFavorites: fav,
      favoritesCount: 1,
    });
    mockUsePostCollectData.mockReturnValue({
      favoritePosts: [],
      isLoadingPosts: false,
      postError: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
      selectedPost: null,
      closePostDetail: jest.fn(),
      handlePostDeleted: jest.fn(),
    });

    const { getByText } = render(<CollectScreen />);
    expect(getByText('Chicken Mix')).toBeTruthy();
  });

  it('renders posts tab and items', () => {
    mockUseCollectData.mockReturnValue({
      favorites: [],
      isLoading: false,
      error: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
    });
    mockUseCollectFilter.mockReturnValue({
      currentTab: 'post',
      setCurrentTab: jest.fn(),
      searchText: '',
      setSearchText: jest.fn(),
      filteredFavorites: [],
      favoritesCount: 0,
    });
    const posts = [{ id: 1, content: 'Post A', author: { username: 'user' } }];
    mockUsePostCollectData.mockReturnValue({
      favoritePosts: posts,
      isLoadingPosts: false,
      postError: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
      selectedPost: null,
      closePostDetail: jest.fn(),
      handlePostDeleted: jest.fn(),
    });

    const { getByText } = render(<CollectScreen />);
    expect(getByText('Post A')).toBeTruthy();
  });

  it('shows error state for catfood tab', () => {
    mockUseCollectData.mockReturnValue({
      favorites: [],
      isLoading: false,
      error: '出错了',
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
    });
    mockUseCollectFilter.mockReturnValue({
      currentTab: 'catfood',
      setCurrentTab: jest.fn(),
      searchText: '',
      setSearchText: jest.fn(),
      filteredFavorites: [],
      favoritesCount: 0,
    });
    mockUsePostCollectData.mockReturnValue({
      favoritePosts: [],
      isLoadingPosts: false,
      postError: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
      selectedPost: null,
      closePostDetail: jest.fn(),
      handlePostDeleted: jest.fn(),
    });

    const { getByText } = render(<CollectScreen />);
    expect(getByText(/出错了/)).toBeTruthy();
    expect(getByText(/下拉刷新重试/)).toBeTruthy();
  });

  it('search no match shows specific message on catfood', () => {
    const fav = [{ id: 'c1', favoriteId: 'f1', name: 'Chicken' }];
    mockUseCollectData.mockReturnValue({
      favorites: fav,
      isLoading: false,
      error: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
    });
    mockUseCollectFilter.mockReturnValue({
      currentTab: 'catfood',
      setCurrentTab: jest.fn(),
      searchText: 'abc',
      setSearchText: jest.fn(),
      filteredFavorites: [],
      favoritesCount: 1,
    });
    mockUsePostCollectData.mockReturnValue({
      favoritePosts: [],
      isLoadingPosts: false,
      postError: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
      selectedPost: null,
      closePostDetail: jest.fn(),
      handlePostDeleted: jest.fn(),
    });

    const { getByText, queryByText } = render(<CollectScreen />);
    expect(getByText(/未找到匹配的收藏/)).toBeTruthy();
    expect(queryByText('Chicken')).toBeNull();
  });

  it('post tab: loading, error, empty with search', () => {
    mockUseCollectData.mockReturnValue({
      favorites: [],
      isLoading: false,
      error: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
    });

    // loading first
    mockUseCollectFilter.mockReturnValue({
      currentTab: 'post',
      setCurrentTab: jest.fn(),
      searchText: '',
      setSearchText: jest.fn(),
      filteredFavorites: [],
      favoritesCount: 0,
    });
    mockUsePostCollectData.mockReturnValue({
      favoritePosts: [],
      isLoadingPosts: true,
      postError: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
      selectedPost: null,
      closePostDetail: jest.fn(),
      handlePostDeleted: jest.fn(),
    });
    const { getByText, rerender } = render(<CollectScreen />);
    expect(getByText('加载中...')).toBeTruthy();

    // error state
    mockUsePostCollectData.mockReturnValue({
      favoritePosts: [],
      isLoadingPosts: false,
      postError: '失败了',
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
      selectedPost: null,
      closePostDetail: jest.fn(),
      handlePostDeleted: jest.fn(),
    });
    rerender(<CollectScreen />);
    expect(getByText(/失败了/)).toBeTruthy();

    // empty with search
    mockUseCollectFilter.mockReturnValue({
      currentTab: 'post',
      setCurrentTab: jest.fn(),
      searchText: 'xxx',
      setSearchText: jest.fn(),
      filteredFavorites: [],
      favoritesCount: 0,
    });
    mockUsePostCollectData.mockReturnValue({
      favoritePosts: [],
      isLoadingPosts: false,
      postError: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
      selectedPost: null,
      closePostDetail: jest.fn(),
      handlePostDeleted: jest.fn(),
    });
    rerender(<CollectScreen />);
    expect(getByText(/未找到匹配的帖子收藏/)).toBeTruthy();
  });

  it('tab switching triggers setCurrentTab and header shows count', () => {
    const setCurrentTab = jest.fn();
    mockUseCollectData.mockReturnValue({
      favorites: [{ id: 'c1', favoriteId: 'f1', name: 'Chicken' }],
      isLoading: false,
      error: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
    });
    mockUseCollectFilter.mockReturnValue({
      currentTab: 'catfood',
      setCurrentTab,
      searchText: '',
      setSearchText: jest.fn(),
      filteredFavorites: [{ id: 'c1', favoriteId: 'f1', name: 'Chicken' }],
      favoritesCount: 1,
    });
    mockUsePostCollectData.mockReturnValue({
      favoritePosts: [{ id: 1, content: 'P' }],
      isLoadingPosts: false,
      postError: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
      selectedPost: null,
      closePostDetail: jest.fn(),
      handlePostDeleted: jest.fn(),
    });

    const { getByText, getAllByRole } = render(<CollectScreen />);
    // header includes title and count rightElement
    expect(getByText('我的收藏')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();

    // press 帖子收藏 tab (two YStacks with onPress -> role button)
    const buttons = getAllByRole('button');
    // The second button corresponds to 帖子收藏
    fireEvent.press(buttons[1]);
    expect(setCurrentTab).toHaveBeenCalledWith('post');
  });

  it('shows post detail when selectedPost exists', () => {
    mockUseCollectData.mockReturnValue({
      favorites: [],
      isLoading: false,
      error: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
    });
    mockUseCollectFilter.mockReturnValue({
      currentTab: 'post',
      setCurrentTab: jest.fn(),
      searchText: '',
      setSearchText: jest.fn(),
      filteredFavorites: [],
      favoritesCount: 0,
    });
    mockUsePostCollectData.mockReturnValue({
      favoritePosts: [],
      isLoadingPosts: false,
      postError: null,
      refreshing: false,
      handleRefresh: jest.fn(),
      handleDelete: jest.fn(),
      handlePress: jest.fn(),
      selectedPost: { id: 99, content: 'Hello' },
      closePostDetail: jest.fn(),
      handlePostDeleted: jest.fn(),
    });

    const { getByLabelText, getByText } = render(<CollectScreen />);
    expect(getByLabelText('post-detail')).toBeTruthy();
    expect(getByText('99')).toBeTruthy();
  });
});
