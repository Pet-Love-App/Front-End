import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { IngredientAnalysisCard } from '../IngredientAnalysisCard';

const mockIngredients = [
  { name: 'Chicken', type: 'safe' as const, percentage: 50 },
  { name: 'Corn', type: 'caution' as const, percentage: 20 },
];

const mockNutrition = [
  { label: 'Protein', value: 30, unit: '%' },
  { label: 'Fat', value: 15, unit: '%' },
];

describe('IngredientAnalysisCard Component', () => {
  it('renders correctly with basic props', () => {
    render(
      <IngredientAnalysisCard
        name="Premium Cat Food"
        score={90}
        ingredients={mockIngredients}
        testID="analysis-card"
      />
    );
    expect(screen.getByTestId('analysis-card')).toBeTruthy();
    expect(screen.getByText('Premium Cat Food')).toBeTruthy();
    expect(screen.getByText('90')).toBeTruthy();
  });

  it('renders brand if provided', () => {
    render(
      <IngredientAnalysisCard
        name="Food"
        brand="BestBrand"
        score={80}
        ingredients={mockIngredients}
      />
    );
    expect(screen.getByText('BestBrand')).toBeTruthy();
  });

  it('renders nutrition data', () => {
    render(
      <IngredientAnalysisCard
        name="Food"
        score={80}
        ingredients={mockIngredients}
        nutritionData={mockNutrition}
      />
    );
    expect(screen.getByText('Protein')).toBeTruthy();
    expect(screen.getByText('30%')).toBeTruthy();
  });

  it('handles ingredient press', () => {
    const onIngredientPress = jest.fn();
    render(
      <IngredientAnalysisCard
        name="Food"
        score={80}
        ingredients={mockIngredients}
        onIngredientPress={onIngredientPress}
      />
    );
    // Assuming IngredientTag is pressable and triggers the callback
    // We need to find the ingredient tag.
    // Since IngredientTag renders text "Chicken", we can press that.
    fireEvent.press(screen.getByText('Chicken'));
    expect(onIngredientPress).toHaveBeenCalledWith(mockIngredients[0]);
  });

  it('handles view details press', () => {
    const onViewDetails = jest.fn();
    render(
      <IngredientAnalysisCard
        name="Food"
        score={80}
        ingredients={mockIngredients}
        onViewDetails={onViewDetails}
      />
    );
    fireEvent.press(screen.getByText('查看完整分析报告'));
    expect(onViewDetails).toHaveBeenCalled();
  });
});
