import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CommentList } from '../CommentList';
import { View, TouchableOpacity, Text } from 'react-native';

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    YStack: ({ children, ...props }: any) => (
      <View testID="ystack" {...props}>
        {children}
      </View>
    ),
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    Spinner: () => <View testID="spinner" />,
  };
});

// Mock dependencies
jest.mock('../CommentItem', () => {
  const { View, TouchableOpacity } = require('react-native');
  return {
    CommentItem: ({ comment, onDelete, onLike }: any) => (
      <View testID={`comment-item-${comment.id}`}>
        <TouchableOpacity testID={`like-btn-${comment.id}`} onPress={() => onLike(comment.id)} />
        <TouchableOpacity
          testID={`delete-btn-${comment.id}`}
          onPress={() => onDelete(comment.id)}
        />
      </View>
    ),
  };
});

jest.mock('@/src/design-system/components', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: ({ children, onPress, disabled }: any) => (
      <TouchableOpacity testID="load-more-button" onPress={onPress} disabled={disabled}>
        <Text>{children}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/src/components/ui/IconSymbol', () => {
  const { View } = require('react-native');
  return {
    IconSymbol: () => <View testID="icon-symbol" />,
  };
});

jest.mock('@/src/hooks/useThemeAwareColorScheme', () => ({
  useThemeAwareColorScheme: () => 'light',
}));

describe('CommentList', () => {
  const mockComments = [
    {
      id: 1,
      content: 'Comment 1',
      author: { id: 'u1', username: 'User 1', avatarUrl: 'http://example.com/1.png' },
      authorId: 'u1',
      targetType: 'post' as const,
      targetId: 101,
      parentId: null,
      likes: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      content: 'Comment 2',
      author: { id: 'u2', username: 'User 2', avatarUrl: 'http://example.com/2.png' },
      authorId: 'u2',
      targetType: 'post' as const,
      targetId: 101,
      parentId: null,
      likes: 5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  const defaultProps = {
    comments: mockComments,
    currentUserId: 'u1',
    isLoading: false,
    hasMore: false,
    onLike: jest.fn(),
    onDelete: jest.fn(),
    onLoadMore: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render list of comments', () => {
    // Arrange & Act
    const { getByTestId } = render(<CommentList {...defaultProps} />);

    // Assert
    expect(getByTestId('comment-item-1')).toBeTruthy();
    expect(getByTestId('comment-item-2')).toBeTruthy();
  });

  it('should render loading state when empty and loading', () => {
    // Arrange
    const props = { ...defaultProps, comments: [], isLoading: true };

    // Act
    const { getByText } = render(<CommentList {...props} />);

    // Assert
    expect(getByText('加载中...')).toBeTruthy();
  });

  it('should render empty state when no comments', () => {
    // Arrange
    const props = { ...defaultProps, comments: [] };

    // Act
    const { getByText } = render(<CommentList {...props} />);

    // Assert
    expect(getByText('还没有评论')).toBeTruthy();
  });

  it('should render load more button when hasMore is true', () => {
    // Arrange
    const props = { ...defaultProps, hasMore: true };

    // Act
    const { getByTestId } = render(<CommentList {...props} />);

    // Assert
    expect(getByTestId('load-more-button')).toBeTruthy();
  });

  it('should handle load more action', () => {
    // Arrange
    const props = { ...defaultProps, hasMore: true };
    const { getByTestId } = render(<CommentList {...props} />);
    const button = getByTestId('load-more-button');

    // Act
    fireEvent.press(button);

    // Assert
    expect(defaultProps.onLoadMore).toHaveBeenCalled();
  });
});
