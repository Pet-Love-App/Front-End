import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CommentItem } from '../CommentItem';
import { View, Text, TouchableOpacity } from 'react-native';

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    YStack: ({ children, ...props }: any) => (
      <View testID="ystack" {...props}>
        {children}
      </View>
    ),
    XStack: ({ children, ...props }: any) => (
      <View testID="xstack" {...props}>
        {children}
      </View>
    ),
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    Separator: () => <View testID="separator" />,
  };
});

// Mock dependencies
jest.mock('@/src/components/ui/IconSymbol', () => {
  const { View } = require('react-native');
  return {
    IconSymbol: ({ name }: { name: string }) => <View testID={`icon-${name}`} />,
  };
});

jest.mock('@/src/components/ui/OptimizedImage', () => {
  const { View } = require('react-native');
  return {
    AvatarImage: () => <View testID="avatar-image" />,
  };
});

describe('CommentItem', () => {
  const mockComment = {
    id: 1,
    content: 'Test Comment',
    createdAt: '2024-01-01T00:00:00Z',
    author: {
      id: 'user-1',
      username: 'Test User',
      avatarUrl: 'http://example.com/avatar.png',
    },
    likes: 5,
    isLiked: false,
  };

  const defaultProps = {
    comment: mockComment,
    currentUserId: 'user-2',
    onLike: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render comment content correctly', () => {
    // Arrange & Act
    const { getByText, getByTestId } = render(<CommentItem {...defaultProps} />);

    // Assert
    expect(getByText('Test User')).toBeTruthy();
    expect(getByText('Test Comment')).toBeTruthy();
    expect(getByText('5')).toBeTruthy(); // Like count
    expect(getByTestId('avatar-image')).toBeTruthy();
  });

  it('should show delete button for owner', () => {
    // Arrange
    const props = { ...defaultProps, currentUserId: 'user-1' };

    // Act
    const { getByTestId } = render(<CommentItem {...props} />);

    // Assert
    expect(getByTestId('icon-trash')).toBeTruthy();
  });

  it('should not show delete button for non-owner', () => {
    // Arrange
    const props = { ...defaultProps, currentUserId: 'user-2' };

    // Act
    const { queryByTestId } = render(<CommentItem {...props} />);

    // Assert
    expect(queryByTestId('icon-trash')).toBeNull();
  });

  it('should handle like action', () => {
    // Arrange
    const { getByTestId } = render(<CommentItem {...defaultProps} />);
    const likeButton = getByTestId('like-button');

    // Act
    fireEvent.press(likeButton);

    // Assert
    expect(defaultProps.onLike).toHaveBeenCalledWith(mockComment.id);
  });

  it('should handle delete action', () => {
    // Arrange
    const props = { ...defaultProps, currentUserId: 'user-1' };
    const { getByTestId } = render(<CommentItem {...props} />);
    const deleteButton = getByTestId('delete-button');

    // Act
    fireEvent.press(deleteButton);

    // Assert
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockComment.id);
  });
});
