import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { OcrResultView } from '../OcrResultView';
import * as Clipboard from 'expo-clipboard';
import { Alert, View, Text as RNText, TouchableOpacity, TextInput as RNTextInput } from 'react-native';

// Mock dependencies
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@/src/design-system/components', () => {
  const { TouchableOpacity } = require('react-native');
  return {
    Button: ({ onPress, children, ...props }: any) => (
      <TouchableOpacity onPress={onPress} {...props} testID={props.testID}>
        {children}
      </TouchableOpacity>
    ),
  };
});
jest.mock('@/src/components/ui/IconSymbol', () => {
  const { Text } = require('react-native');
  return {
    IconSymbol: () => <Text>IconSymbol</Text>,
  };
});
jest.mock('@/src/hooks/useThemeAwareColorScheme', () => ({
  useThemeAwareColorScheme: () => 'light',
}));
jest.mock('@/src/constants/theme', () => ({
  Colors: {
    light: {
      background: '#ffffff',
      text: '#000000',
      tint: '#007aff',
      icon: '#000000',
    },
  },
}));

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View, Text, TextInput } = require('react-native');
  return {
    Card: ({ children }: any) => <View>{children}</View>,
    ScrollView: ({ children }: any) => <View>{children}</View>,
    Spinner: () => <Text>Spinner</Text>,
    Text: ({ children }: any) => <Text>{children}</Text>,
    XStack: ({ children, onPress, ...props }: any) => (
      <View {...props}>
        {children}
      </View>
    ),
    YStack: ({ children, onPress, ...props }: any) => (
      <View {...props}>
        {children}
      </View>
    ),
    TextInput: (props: any) => <TextInput {...props} />,
  };
});

describe('OcrResultView', () => {
  let mockOcrResult: any;
  const mockOnGenerateReport = jest.fn();
  const mockOnRetake = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
    mockOcrResult = {
      text: 'Detected Text',
      confidence: 0.9,
    };
  });

  it('renders correctly with OCR result', () => {
    const { getByText } = render(
      <OcrResultView
        ocrResult={mockOcrResult}
        onGenerateReport={mockOnGenerateReport}
        onRetake={mockOnRetake}
        onClose={mockOnClose}
      />
    );

    expect(getByText('识别结果')).toBeTruthy();
    expect(getByText('Detected Text')).toBeTruthy();
  });

  it('handles copy text', async () => {
    const { getByText } = render(
      <OcrResultView
        ocrResult={mockOcrResult}
        onGenerateReport={mockOnGenerateReport}
        onRetake={mockOnRetake}
        onClose={mockOnClose}
      />
    );

    const copyButton = getByText('复制');
    fireEvent.press(copyButton);

    await waitFor(() => {
      expect(Clipboard.setStringAsync).toHaveBeenCalledWith('Detected Text');
      expect(Alert.alert).toHaveBeenCalledWith('✅ 已复制', '识别文本已复制到剪贴板');
    });
  });

  it('handles generate report action', () => {
    const { getByText } = render(
      <OcrResultView
        ocrResult={mockOcrResult}
        onGenerateReport={mockOnGenerateReport}
        onRetake={mockOnRetake}
        onClose={mockOnClose}
      />
    );

    const generateButton = getByText('生成 AI 报告');
    fireEvent.press(generateButton);
    expect(mockOnGenerateReport).toHaveBeenCalled();
  });

  it('handles edit mode', () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <OcrResultView
        ocrResult={mockOcrResult}
        onGenerateReport={mockOnGenerateReport}
        onRetake={mockOnRetake}
        onClose={mockOnClose}
      />
    );

    // Enter edit mode
    const editButton = getByText('编辑');
    fireEvent.press(editButton);

    const input = getByPlaceholderText('请输入或编辑识别的文本...');
    expect(input).toBeTruthy();

    // Change text
    fireEvent.changeText(input, 'Edited Text');

    // Save
    const saveButton = getByText('保存');
    fireEvent.press(saveButton);

    expect(Alert.alert).toHaveBeenCalledWith('✅ 已保存', '识别文本已更新');
    expect(mockOcrResult.text).toBe('Edited Text');

    // Should exit edit mode
    expect(queryByText('保存')).toBeNull();
  });

  it('handles cancel edit', async () => {
    const { getByText, getByPlaceholderText, queryByText } = render(
      <OcrResultView
        ocrResult={mockOcrResult}
        onGenerateReport={mockOnGenerateReport}
        onRetake={mockOnRetake}
        onClose={mockOnClose}
      />
    );

    // Enter edit mode
    const editButton = getByText('编辑');
    fireEvent.press(editButton);

    const input = getByPlaceholderText('请输入或编辑识别的文本...');
    fireEvent.changeText(input, 'Edited Text');

    // Cancel
    const cancelButton = getByText('取消');
    fireEvent.press(cancelButton);

    // Should revert text (in display, though ocrResult wasn't mutated yet)
    // And exit edit mode
    expect(queryByText('取消')).toBeNull();

    // Wait for the text to revert
    await waitFor(() => {
      expect(getByText('Detected Text')).toBeTruthy();
    });
  });
});
