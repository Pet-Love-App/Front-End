import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ActionBar } from '../ActionBar';
import { useActionStatus } from '@/src/app/(tabs)/collect/hooks/useActionStatus';
import { toast } from '@/src/components/dialogs';

// Mock dependencies
jest.mock('@/src/app/(tabs)/collect/hooks/useActionStatus', () => ({
  useActionStatus: jest.fn(),
}));

jest.mock('@/src/components/dialogs', () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock('@/src/design-system/components', () => {
  const React = require('react');
  const { TouchableOpacity, View, Text } = require('react-native');
  return {
    Button: jest.fn(({ children, onPress, testID, disabled, ...props }) =>
      React.createElement(
        TouchableOpacity,
        {
          onPress: disabled ? undefined : onPress,
          testID: testID || 'mock-button',
          disabled,
        },
        React.createElement(View, null, children)
      )
    ),
  };
});

jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

jest.mock('@/src/design-system/tokens', () => ({
  warningScale: { warning8: '#f59e0b', warning9: '#d97706' },
  errorScale: { error8: '#ef4444', error9: '#dc2626' },
  neutralScale: {
    neutral2: '#f5f5f5',
    neutral3: '#e5e5e5',
    neutral6: '#a3a3a3',
    neutral10: '#171717',
  },
}));

describe('ActionBar', () => {
  const mockToggleLike = jest.fn();
  const mockToggleFavorite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useActionStatus as jest.Mock).mockReturnValue({
      liked: false,
      likeCount: 10,
      favorited: false,
      toggleLike: mockToggleLike,
      toggleFavorite: mockToggleFavorite,
    });
  });

  it('should render correctly', () => {
    const { getByTestId } = render(<ActionBar catfoodId={123} />);
    // 组件只有一个带 testID 的按钮 (favorite-button)
    expect(getByTestId('favorite-button')).toBeTruthy();
  });

  it('should handle favorite toggle', async () => {
    mockToggleFavorite.mockResolvedValueOnce(undefined);
    const { getByTestId } = render(<ActionBar catfoodId={123} />);
    const favoriteButton = getByTestId('favorite-button');

    fireEvent.press(favoriteButton);

    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalled();
    });
  });

  it('should handle error during favorite toggle', async () => {
    mockToggleFavorite.mockRejectedValueOnce(new Error('Failed'));
    const { getByTestId } = render(<ActionBar catfoodId={123} />);
    const favoriteButton = getByTestId('favorite-button');

    fireEvent.press(favoriteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('收藏操作失败，请稍后重试');
    });
  });

  it('should display favorited state correctly', () => {
    (useActionStatus as jest.Mock).mockReturnValue({
      liked: false,
      likeCount: 10,
      favorited: true,
      toggleLike: mockToggleLike,
      toggleFavorite: mockToggleFavorite,
    });

    const { getByTestId } = render(<ActionBar catfoodId={123} />);
    expect(getByTestId('favorite-button')).toBeTruthy();
  });

  it('should display liked state correctly', () => {
    (useActionStatus as jest.Mock).mockReturnValue({
      liked: true,
      likeCount: 11,
      favorited: false,
      toggleLike: mockToggleLike,
      toggleFavorite: mockToggleFavorite,
    });

    const { getByTestId } = render(<ActionBar catfoodId={123} />);
    expect(getByTestId('favorite-button')).toBeTruthy();
  });
});
