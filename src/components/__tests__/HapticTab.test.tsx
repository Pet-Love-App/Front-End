import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HapticTab } from '../HapticTab';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

describe('HapticTab', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    // Arrange
    const props = {
      state: {} as any,
      descriptors: {} as any,
      navigation: {} as any,
    };

    // Act
    const { toJSON } = render(
      <NavigationContainer>
        <HapticTab {...props}>
          <></>
        </HapticTab>
      </NavigationContainer>
    );

    // Assert
    expect(toJSON()).toBeTruthy();
  });

  it('should trigger haptic feedback on press in (iOS)', () => {
    // Arrange
    Platform.OS = 'ios';
    process.env.EXPO_OS = 'ios';
    const props = {
      state: {} as any,
      descriptors: {} as any,
      navigation: {} as any,
      onPressIn: jest.fn(),
    };

    const { getByRole } = render(
      <NavigationContainer>
        <HapticTab {...props}>
          <></>
        </HapticTab>
      </NavigationContainer>
    );

    // Act
    fireEvent(getByRole('button'), 'pressIn');

    // Assert
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(props.onPressIn).toHaveBeenCalled();
  });

  it('should not trigger haptic feedback on press in (Android)', () => {
    // Arrange
    Platform.OS = 'android';
    process.env.EXPO_OS = 'android';
    const props = {
      state: {} as any,
      descriptors: {} as any,
      navigation: {} as any,
      onPressIn: jest.fn(),
    };

    const { getByRole } = render(
      <NavigationContainer>
        <HapticTab {...props}>
          <></>
        </HapticTab>
      </NavigationContainer>
    );

    // Act
    fireEvent(getByRole('button'), 'pressIn');

    // Assert
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
    expect(props.onPressIn).toHaveBeenCalled();
  });
});
