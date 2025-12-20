import React from 'react';
import { render } from '@testing-library/react-native';
import { SafetyAnalysisSection } from '../SafetyAnalysisSection';

// Mock dependencies
jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

describe('SafetyAnalysisSection', () => {
  it('should return null if safety is empty', () => {
    const { toJSON } = render(<SafetyAnalysisSection safety="" />);
    expect(toJSON()).toBeNull();
  });

  it('should render correctly with safety content', () => {
    const { getByText } = render(<SafetyAnalysisSection safety="Test Safety Analysis" />);

    expect(getByText('安全性分析')).toBeTruthy();
    expect(getByText('Safety Analysis')).toBeTruthy();
    expect(getByText('安全')).toBeTruthy();
    expect(getByText('Test Safety Analysis')).toBeTruthy();
  });
});
