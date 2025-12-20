import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AIReportButton } from '../AIReportButton';
import { View } from 'react-native';

// Mock external dependencies
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
}));

// Mock design system components if necessary, or let them render if they are simple.
// For now, I'll mock Button to ensure isolation and easier testing of props.
jest.mock('@/src/design-system/components', () => {
  const { View } = require('react-native');
  return {
    Button: jest.fn(({ children, onPress, ...props }) => (
      <View onPress={onPress} {...props} testID="ai-report-button">
        {children}
      </View>
    )),
  };
});

describe('AIReportButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state correctly', () => {
    const { getByText } = render(
      <AIReportButton hasReport={false} isLoading={true} onPress={mockOnPress} />
    );

    expect(getByText('加载中...')).toBeTruthy();
  });

  it('should render nothing when not loading and no report', () => {
    const { toJSON } = render(
      <AIReportButton hasReport={false} isLoading={false} onPress={mockOnPress} />
    );

    expect(toJSON()).toBeNull();
  });

  it('should render button when report exists and not loading', () => {
    const { getByText, getByTestId } = render(
      <AIReportButton hasReport={true} isLoading={false} onPress={mockOnPress} />
    );

    expect(getByText('查看 AI 分析报告')).toBeTruthy();
    
    const button = getByTestId('ai-report-button');
    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
