import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PhotoPreview } from '../PhotoPreview';
import { View, TouchableOpacity, Text } from 'react-native';

// Mock dependencies
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 20, bottom: 20 }),
}));

jest.mock('@/src/design-system/components', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: jest.fn(({ onPress, children, ...props }) => {
      return (
        <TouchableOpacity onPress={onPress} {...props}>
          <Text>{children}</Text>
        </TouchableOpacity>
      );
    }),
  };
});

jest.mock('@/src/components/ui/IconSymbol', () => {
  const { Text } = require('react-native');
  return {
    IconSymbol: ({ name }: any) => <Text>IconSymbol-{name}</Text>,
  };
});

describe('PhotoPreview', () => {
  const mockProps = {
    photoUri: 'file://test.jpg',
    visible: true,
    onConfirm: jest.fn(),
    onRetake: jest.fn(),
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when visible and photoUri is provided', () => {
    const { getByText } = render(<PhotoPreview {...mockProps} />);

    expect(getByText('照片预览')).toBeTruthy();
    expect(getByText('请确认照片清晰可见，配料表信息完整')).toBeTruthy();
    expect(getByText('重新拍照')).toBeTruthy();
    expect(getByText('确认使用')).toBeTruthy();
  });

  it('should return null when photoUri is null', () => {
    const { toJSON } = render(<PhotoPreview {...mockProps} photoUri={null} />);
    expect(toJSON()).toBeNull();
  });

  it('should handle cancel action', () => {
    const { getByText } = render(<PhotoPreview {...mockProps} />);
    const cancelButton = getByText('IconSymbol-xmark').parent;
    fireEvent.press(cancelButton);
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('should handle retake action', () => {
    const { getByText } = render(<PhotoPreview {...mockProps} />);
    const retakeButton = getByText('重新拍照').parent;
    fireEvent.press(retakeButton);
    expect(mockProps.onRetake).toHaveBeenCalledTimes(1);
  });

  it('should handle confirm action', () => {
    const { getByText } = render(<PhotoPreview {...mockProps} />);
    const confirmButton = getByText('确认使用').parent;
    fireEvent.press(confirmButton);
    expect(mockProps.onConfirm).toHaveBeenCalledTimes(1);
  });
});
