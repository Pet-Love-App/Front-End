import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CameraPermissionModal } from '../CameraPermissionModal';
import { View, TouchableOpacity, Text } from 'react-native';

// Mock dependencies
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, style }: any) => <View style={style}>{children}</View>,
  };
});

jest.mock('@/src/design-system/components', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: ({ onPress, children, ...props }: any) => (
      <TouchableOpacity onPress={onPress} {...props}>
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

jest.mock('@/src/constants/theme', () => ({
  Colors: {
    light: {
      primary: 'blue',
    },
  },
}));

describe('CameraPermissionModal', () => {
  const mockProps = {
    visible: true,
    onRequestPermission: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when visible', () => {
    const { getByText } = render(<CameraPermissionModal {...mockProps} />);

    expect(getByText('需要相机权限')).toBeTruthy();
    expect(
      getByText('为了扫描猫粮成分表，需要访问您的相机。我们不会存储或上传您的照片。')
    ).toBeTruthy();
    expect(getByText('授予相机权限')).toBeTruthy();
    expect(getByText('稍后再说')).toBeTruthy();
  });

  it('should handle request permission', () => {
    const { getByText } = render(<CameraPermissionModal {...mockProps} />);
    const requestButton = getByText('授予相机权限');
    fireEvent.press(requestButton);
    expect(mockProps.onRequestPermission).toHaveBeenCalledTimes(1);
  });

  it('should handle close', () => {
    const { getByText } = render(<CameraPermissionModal {...mockProps} />);
    const closeButton = getByText('稍后再说');
    fireEvent.press(closeButton);
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not render close button if onClose is not provided', () => {
    const { queryByText } = render(
      <CameraPermissionModal visible={true} onRequestPermission={mockProps.onRequestPermission} />
    );
    expect(queryByText('稍后再说')).toBeNull();
  });
});
