import React from 'react';
import { render } from '@testing-library/react-native';
import { NutritionPieChart } from '../NutritionPieChart';
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
    XStack: ({ children, onPress, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
    YStack: ({ children, onPress, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
  };
});

describe('NutritionPieChart', () => {
  const mockReport = {
    percentage: true,
    percent_data: {
      protein: 30,
      fat: 20,
      fiber: 5,
      ash: 5,
      moisture: 10,
      others: 30,
    },
  } as any;

  it('renders correctly with data', () => {
    const { getByText, getByTestId } = render(
      <NutritionPieChart report={mockReport} />
    );

    expect(getByText('营养成分占比')).toBeTruthy();
    expect(getByTestId('pie-chart')).toBeTruthy();
    expect(getByText('粗蛋白: 30')).toBeTruthy();
    expect(getByText('粗脂肪: 20')).toBeTruthy();
  });

  it('does not render when no data', () => {
    const emptyReport = {
      percentage: false,
      percent_data: null,
    } as any;

    const { toJSON } = render(
      <NutritionPieChart report={emptyReport} />
    );

    expect(toJSON()).toBeNull();
  });

  it('handles unknown nutrients', () => {
    const unknownReport = {
      percentage: true,
      percent_data: {
        unknown_nutrient: 10,
      },
    } as any;

    const { getByText } = render(
      <NutritionPieChart report={unknownReport} />
    );

    expect(getByText('unknown_nutrient: 10')).toBeTruthy();
  });
});
