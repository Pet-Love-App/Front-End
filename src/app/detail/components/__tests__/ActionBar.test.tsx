import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ActionBar } from '../ActionBar';
import { useActionStatus } from '@/src/app/(tabs)/collect/hooks/useActionStatus';
import { toast } from '@/src/components/dialogs';
import { View } from 'react-native';

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
  const { View } = require('react-native');
  return {
    Button: jest.fn(({ children, onPress, ...props }) => (
      <View onPress={onPress} {...props} testID={props.testID || 'mock-button'}>
        {children}
      </View>
    )),
  };
});

jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
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
    const { getAllByTestId } = render(<ActionBar catfoodId={123} />);
    const buttons = getAllByTestId('mock-button');
    expect(buttons.length).toBe(2); // Favorite and Like buttons
  });

  it('should handle favorite toggle', async () => {
    const { getAllByTestId } = render(<ActionBar catfoodId={123} />);
    const buttons = getAllByTestId('mock-button');
    const favoriteButton = buttons[0]; // Assuming first button is favorite based on code order

    fireEvent.press(favoriteButton);

    await waitFor(() => {
      expect(mockToggleFavorite).toHaveBeenCalled();
    });
  });

  it('should handle like toggle', async () => {
    const { getAllByTestId } = render(<ActionBar catfoodId={123} />);
    const buttons = getAllByTestId('mock-button');
    const likeButton = buttons[1]; // Assuming second button is like based on code order

    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(mockToggleLike).toHaveBeenCalled();
    });
  });

  it('should handle error during favorite toggle', async () => {
    mockToggleFavorite.mockRejectedValueOnce(new Error('Failed'));
    const { getAllByTestId } = render(<ActionBar catfoodId={123} />);
    const buttons = getAllByTestId('mock-button');
    const favoriteButton = buttons[0];

    fireEvent.press(favoriteButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('收藏操作失败，请稍后重试');
    });
  });

  it('should handle error during like toggle', async () => {
    mockToggleLike.mockRejectedValueOnce(new Error('Failed'));
    const { getAllByTestId } = render(<ActionBar catfoodId={123} />);
    const buttons = getAllByTestId('mock-button');
    const likeButton = buttons[1];

    fireEvent.press(likeButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('点赞操作失败，请稍后重试');
    });
  });
});
