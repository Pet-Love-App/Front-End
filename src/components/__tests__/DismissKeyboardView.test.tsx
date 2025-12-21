import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DismissKeyboardView } from '../DismissKeyboardView';
import { Keyboard, Platform, View, Text } from 'react-native';

describe('DismissKeyboardView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Keyboard, 'addListener').mockImplementation(() => ({ remove: jest.fn() } as any));
    jest.spyOn(Keyboard, 'dismiss').mockImplementation(() => {});
  });

  it('should render children correctly', () => {
    // Arrange
    const testText = 'Test Content';

    // Act
    const { getByText } = render(
      <DismissKeyboardView>
        <Text>{testText}</Text>
      </DismissKeyboardView>
    );

    // Assert
    expect(getByText(testText)).toBeTruthy();
  });

  it('should subscribe to keyboard events on mount', () => {
    // Arrange

    // Act
    render(
      <DismissKeyboardView>
        <View />
      </DismissKeyboardView>
    );

    // Assert
    if (Platform.OS === 'ios') {
      expect(Keyboard.addListener).toHaveBeenCalledWith('keyboardWillShow', expect.any(Function));
      expect(Keyboard.addListener).toHaveBeenCalledWith('keyboardWillHide', expect.any(Function));
    } else {
      expect(Keyboard.addListener).toHaveBeenCalledWith('keyboardDidShow', expect.any(Function));
      expect(Keyboard.addListener).toHaveBeenCalledWith('keyboardDidHide', expect.any(Function));
    }
  });

  it('should dismiss keyboard on touch start when keyboard is visible', () => {
    // Arrange
    let showCallback: any;

    // Mock addListener to capture the callback
    (Keyboard.addListener as jest.Mock).mockImplementation((event, callback) => {
      if (event === (Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow')) {
        showCallback = callback;
      }
      return { remove: jest.fn() } as any;
    });

    const { getByTestId } = render(
      <DismissKeyboardView>
        <View testID="child-view" />
      </DismissKeyboardView>
    );

    // Simulate keyboard showing
    if (showCallback) {
      showCallback();
    }

    // Act
    fireEvent(getByTestId('dismiss-keyboard-view'), 'onTouchStart');

    // Assert
    expect(Keyboard.dismiss).toHaveBeenCalled();
  });

  it('should not dismiss keyboard on touch start when keyboard is hidden', () => {
    // Arrange
    let hideCallback: any;

    // Mock addListener to capture the callback
    (Keyboard.addListener as jest.Mock).mockImplementation((event, callback) => {
      if (event === (Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide')) {
        hideCallback = callback;
      }
      return { remove: jest.fn() } as any;
    });

    const { getByTestId } = render(
      <DismissKeyboardView>
        <View testID="child-view" />
      </DismissKeyboardView>
    );

    // Simulate keyboard hiding
    if (hideCallback) {
      hideCallback();
    }

    // Act
    fireEvent(getByTestId('dismiss-keyboard-view'), 'onTouchStart');

    // Assert
    expect(Keyboard.dismiss).not.toHaveBeenCalled();
  });
});
