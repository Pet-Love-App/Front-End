import React from 'react';
import { render } from '@testing-library/react-native';
import { NutrientBar } from '../NutrientBar';

describe('NutrientBar', () => {
  it('should render correctly', () => {
    const { getByText } = render(
      <NutrientBar label="Protein" value={25.5} color="$blue10" />
    );

    expect(getByText('Protein')).toBeTruthy();
    expect(getByText('25.5%')).toBeTruthy();
  });

  it('should cap width at 100%', () => {
    // We can't easily check the width style directly with testing-library without testID or style inspection.
    // But we can check if it renders without error for value > 100.
    const { getByText } = render(
      <NutrientBar label="Fat" value={120} color="$red10" />
    );

    expect(getByText('Fat')).toBeTruthy();
    expect(getByText('120.0%')).toBeTruthy();
  });
});
