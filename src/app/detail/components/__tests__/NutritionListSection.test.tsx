import React from 'react';
import { render } from '@testing-library/react-native';
import { NutritionListSection } from '../NutritionListSection';

const mockIngredients = [
  { id: 1, name: 'Protein', label: 'High' },
  { id: 2, name: 'Fat', label: 'Medium' },
];

describe('NutritionListSection', () => {
  it('should return null if ingredients is empty', () => {
    const { toJSON } = render(<NutritionListSection ingredients={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('should render correctly with ingredients', () => {
    const { getByText } = render(<NutritionListSection ingredients={mockIngredients as any} />);

    expect(getByText('营养成分详情')).toBeTruthy();
    expect(getByText('Protein')).toBeTruthy();
    expect(getByText('High')).toBeTruthy();
    expect(getByText('Fat')).toBeTruthy();
    expect(getByText('Medium')).toBeTruthy();
  });
});
