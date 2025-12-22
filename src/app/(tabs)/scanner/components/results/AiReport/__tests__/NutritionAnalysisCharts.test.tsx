import React from 'react';
import { render } from '@testing-library/react-native';
import { NutritionAnalysisCharts } from '../NutritionAnalysisCharts';
import { View, Text as RNText } from 'react-native';

// Mock dependencies
jest.mock('react-native-chart-kit', () => {
  const { View, Text } = require('react-native');
  return {
    PieChart: ({ data }: any) => (
      <View testID="pie-chart">
        {data.map((item: any, index: number) => (
          <Text key={index}>
            {item.name}: {item.value}
          </Text>
        ))}
      </View>
    ),
    BarChart: ({ data }: any) => (
      <View testID="bar-chart">
        {data.labels.map((label: string, index: number) => (
          <Text key={index}>
            {label}: {data.datasets[0].data[index]}
          </Text>
        ))}
      </View>
    ),
  };
});

jest.mock('@/src/components/ui/IconSymbol', () => {
  const { Text } = require('react-native');
  return {
    IconSymbol: () => <Text>IconSymbol</Text>,
  };
});

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  const Card = ({ children }: any) => <View>{children}</View>;
  Card.Header = ({ children }: any) => <View>{children}</View>;

  return {
    Card,
    Text: ({ children }: any) => <Text>{children}</Text>,
    XStack: ({ children, onPress, ...props }: any) => <View {...props}>{children}</View>,
    YStack: ({ children, onPress, ...props }: any) => <View {...props}>{children}</View>,
  };
});

describe('NutritionAnalysisCharts', () => {
  const mockData = {
    protein: 30,
    fat: 20,
    fiber: 5,
    ash: 5,
    moisture: 10,
    others: 30,
  };

  it('renders correctly with data', () => {
    const { getByText, getByTestId } = render(<NutritionAnalysisCharts data={mockData} />);

    expect(getByTestId('pie-chart')).toBeTruthy();
    expect(getByTestId('bar-chart')).toBeTruthy();
    expect(getByText('粗蛋白: 30')).toBeTruthy();
    expect(getByText('粗脂肪: 20')).toBeTruthy();
  });

  it('renders empty state when no data', () => {
    const { getByText } = render(<NutritionAnalysisCharts data={{}} />);

    expect(getByText('暂无营养成分数据')).toBeTruthy();
  });

  it('renders empty state when data is null', () => {
    const { getByText } = render(<NutritionAnalysisCharts data={null as any} />);

    expect(getByText('暂无营养成分数据')).toBeTruthy();
  });

  it('handles unknown nutrients', () => {
    const unknownData = {
      unknown_nutrient: 10,
    };

    const { getByText } = render(<NutritionAnalysisCharts data={unknownData} />);

    expect(getByText('unknown_nutrient: 10')).toBeTruthy();
  });
});
