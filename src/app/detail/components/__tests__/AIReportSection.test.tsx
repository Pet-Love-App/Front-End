import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AIReportSection } from '../AIReportSection';
import { useItemDetail } from '@/src/hooks';
import { View } from 'react-native';

// Mock dependencies
jest.mock('react-native-chart-kit', () => ({
  PieChart: 'PieChart',
}));

jest.mock('@/src/design-system/components', () => {
  const { View } = require('react-native');
  return {
    Button: jest.fn(({ children, onPress, ...props }) => (
      <View onPress={onPress} {...props} testID="mock-button">
        {children}
      </View>
    )),
  };
});

jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

jest.mock('@/src/components/dialogs', () => ({
  toast: {
    show: jest.fn(),
  },
}));

jest.mock('@/src/hooks', () => ({
  useItemDetail: jest.fn(),
  useThemeAwareColorScheme: jest.fn().mockReturnValue('light'),
}));

jest.mock('../AdditiveDetailModal', () => ({
  AdditiveDetailModal: 'AdditiveDetailModal',
}));

jest.mock('../NutrientBar', () => ({
  NutrientBar: 'NutrientBar',
}));

jest.mock('../StreamingText', () => ({
  StreamingText: 'StreamingText',
}));

const mockReport = {
  id: 1,
  catfood_id: 123,
  tags: ['tag1', 'tag2'],
  safety: 'Safety analysis content',
  nutrient: 'Nutrient analysis content',
  additives: ['additive1'],
  ingredients: ['ingredient1'],
  created_at: '2023-01-01',
  updated_at: '2023-01-02',
  percentage: true,
  percent_data: {
    protein: 10,
    fat: 5,
  },
};

describe('AIReportSection', () => {
  const mockOnGeneratePress = jest.fn();
  const mockOnStopPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useItemDetail as jest.Mock).mockReturnValue({
      item: null,
      baikeInfo: null,
      modalVisible: false,
      fetchAdditive: jest.fn(),
      closeModal: jest.fn(),
    });
  });

  it('should render loading state', () => {
    const { getByText } = render(
      <AIReportSection isLoading={true} />
    );
    expect(getByText('正在加载 AI 分析报告...')).toBeTruthy();
  });

  it('should render report content when report is provided', () => {
    const { getByText } = render(
      <AIReportSection report={mockReport as any} />
    );
    expect(getByText('Safety analysis content')).toBeTruthy();
    expect(getByText('Nutrient analysis content')).toBeTruthy();
  });

  it('should render generate button when showGenerateButton is true', () => {
    const { getAllByTestId } = render(
      <AIReportSection showGenerateButton={true} onGeneratePress={mockOnGeneratePress} />
    );
    
    const buttons = getAllByTestId('mock-button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
