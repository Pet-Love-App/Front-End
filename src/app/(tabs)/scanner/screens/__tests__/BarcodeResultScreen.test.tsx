import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BarcodeResultScreen } from '../BarcodeResultScreen';
import { supabase } from '@/src/lib/supabase';
import * as Clipboard from 'expo-clipboard';
import { Alert, View, Text as RNText, TouchableOpacity } from 'react-native';

// Mock dependencies
jest.mock('@/src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('tamagui', () => {
  const { View, Text: RNText } = require('react-native');
  return {
    Card: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Text: ({ children, ...props }: any) => <RNText {...props}>{children}</RNText>,
    XStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    YStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
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
  const { Text: RNText } = require('react-native');
  return {
    IconSymbol: () => <RNText>IconSymbol</RNText>,
  };
});

describe('BarcodeResultScreen', () => {
  const mockInsets = { top: 20, bottom: 20, left: 0, right: 0 };
  const mockOnGoBack = jest.fn();
  const mockScannedCode = '123456789';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
  });

  it('renders correctly and searches for cat food', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: { id: '1', name: 'Test Food' },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    const { getByText } = render(
      <BarcodeResultScreen
        scannedCode={mockScannedCode}
        insets={mockInsets}
        onGoBack={mockOnGoBack}
      />
    );

    expect(getByText('扫描成功')).toBeTruthy();
    expect(getByText(mockScannedCode)).toBeTruthy();

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('catfoods');
      expect(mockEq).toHaveBeenCalledWith('barcode', mockScannedCode);
      expect(getByText(/Test Food/)).toBeTruthy();
    });
  });

  it('handles cat food not found', async () => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' }, // Not found error code
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    const { getByText } = render(
      <BarcodeResultScreen
        scannedCode={mockScannedCode}
        insets={mockInsets}
        onGoBack={mockOnGoBack}
      />
    );

    await waitFor(() => {
      expect(getByText('数据库中暂无此猫粮')).toBeTruthy();
    });
  });

  it('handles copy code', async () => {
    const { getByText, getAllByText } = render(
      <BarcodeResultScreen
        scannedCode={mockScannedCode}
        insets={mockInsets}
        onGoBack={mockOnGoBack}
      />
    );

    // Wait for the initial render to settle
    await waitFor(() => {
      // Sometimes text might be split or rendered differently, try getAllByText or regex
      expect(getAllByText(/复制条码/).length).toBeGreaterThan(0);
    });

    const copyButton = getByText(/复制条码/);
    fireEvent.press(copyButton);

    await waitFor(() => {
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith(mockScannedCode);
      expect(Alert.alert).toHaveBeenCalledWith('已复制', '条码已复制到剪贴板');
    });
  });
});
