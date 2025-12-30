import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Onboarding } from '../Onboarding';
import { useRouter } from 'expo-router';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../OnboardingSlide', () => 'OnboardingSlide');

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    View: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    YStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    XStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Button: ({ children, onPress, ...props }: any) => (
      <TouchableOpacity onPress={onPress} {...props}>
        {children}
      </TouchableOpacity>
    ),
  };
});

describe('Onboarding', () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render correctly', () => {
    // Arrange & Act
    const { getByText } = render(<Onboarding />);

    // Assert
    expect(getByText('跳过')).toBeTruthy();
  });

  it('should handle skip button press', async () => {
    // Arrange
    const { getByText } = render(<Onboarding />);
    const skipButton = getByText('跳过');

    // Act
    fireEvent.press(skipButton);

    // Assert
    await waitFor(() => {
      // AsyncStorage usage was removed from implementation
      // expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      //   expect.stringContaining('hasSeenOnboarding'),
      //   'true'
      // );
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/collect');
    });
  });

  // Note: Testing scroll behavior and "Start" button requires more complex setup or integration testing
  // as the "Start" button is only visible on the last slide, which requires scrolling.
  // We can mock the ScrollView or manually trigger scroll events if needed, but for unit tests,
  // testing the skip button and initial render is a good start.
});
