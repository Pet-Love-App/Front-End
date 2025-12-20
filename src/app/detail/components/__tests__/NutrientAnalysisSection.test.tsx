import React from 'react';
import { render } from '@testing-library/react-native';
import { NutrientAnalysisSection } from '../NutrientAnalysisSection';

// Mock dependencies
jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

describe('NutrientAnalysisSection', () => {
  it('should return null if nutrient is empty', () => {
    const { toJSON } = render(<NutrientAnalysisSection nutrient="" />);
    expect(toJSON()).toBeNull();
  });

  it('should render correctly with nutrient content', () => {
    const { getByText } = render(<NutrientAnalysisSection nutrient="Test Nutrient Analysis" />);
    
    expect(getByText('营养分析')).toBeTruthy();
    expect(getByText('Nutrition Analysis')).toBeTruthy();
    expect(getByText('Test Nutrient Analysis')).toBeTruthy();
  });
});
