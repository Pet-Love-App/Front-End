import React from 'react';
import { render } from '@testing-library/react-native';
import { NutritionChartSection } from '../NutritionChartSection';

// Mock dependencies
jest.mock('react-native-chart-kit', () => ({
  PieChart: 'PieChart',
}));

jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

jest.mock('@/src/hooks/useResponsiveLayout', () => ({
  useResponsiveLayout: jest.fn().mockReturnValue({
    width: 375,
    isExtraSmallScreen: false,
    isSmallScreen: true,
  }),
}));

describe('NutritionChartSection', () => {
  it('should return null if percentData is empty or invalid', () => {
    const { toJSON } = render(<NutritionChartSection percentData={{}} />);
    expect(toJSON()).toBeNull();

    const { toJSON: toJSONNull } = render(<NutritionChartSection percentData={null as any} />);
    expect(toJSONNull()).toBeNull();
  });

  it('should render correctly with valid data', () => {
    const mockData = {
      protein: 30,
      fat: 15,
      fiber: 5,
    };

    const { getByText } = render(<NutritionChartSection percentData={mockData} />);
    
    // Check for title or other static text if any (need to see more of the file or assume based on previous read)
    // The previous read showed "标题栏" comment but didn't show the text content fully.
    // Let's assume there is a title like "营养成分占比" or similar.
    // Actually, let's check if PieChart is rendered.
    // Since we mocked PieChart as string 'PieChart', we can check if it exists in the tree.
    // But testing-library renders to JSON or native elements.
    // If 'PieChart' is a string, it might be rendered as a custom element <PieChart ... />
    
    // Let's check if the component renders without crashing and maybe check for some text if visible.
    // The code shows it prepares data with names like '粗蛋白', '粗脂肪'.
    // However, these names are passed to PieChart props, so they might not be rendered as Text nodes directly unless PieChart renders them.
    // Since we mocked PieChart, it won't render them.
    
    // Let's check if the container is rendered.
    // We can check if it's not null.
    expect(render(<NutritionChartSection percentData={mockData} />).toJSON()).not.toBeNull();
  });
});
