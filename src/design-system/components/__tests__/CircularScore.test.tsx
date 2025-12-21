import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CircularScore } from '../CircularScore';

// Mock react-native-reanimated and react-native-svg if not already globally mocked
// Assuming global mocks exist or these components render safely in test environment

describe('CircularScore Component', () => {
  it('renders correctly with a score', () => {
    render(<CircularScore score={85} size="md" testID="circular-score" />);
    expect(screen.getByTestId('circular-score')).toBeTruthy();
    expect(screen.getByText('85')).toBeTruthy();
  });

  it('displays correct label for excellent score', () => {
    render(<CircularScore score={95} size="md" />);
    expect(screen.getByText('优秀')).toBeTruthy();
  });

  it('displays correct label for good score', () => {
    render(<CircularScore score={75} size="md" />);
    expect(screen.getByText('良好')).toBeTruthy();
  });

  it('displays correct label for average score', () => {
    render(<CircularScore score={55} size="md" />);
    expect(screen.getByText('一般')).toBeTruthy();
  });

  it('displays correct label for poor score', () => {
    render(<CircularScore score={35} size="md" />);
    expect(screen.getByText('较差')).toBeTruthy();
  });

  it('displays correct label for bad score', () => {
    render(<CircularScore score={10} size="md" />);
    expect(screen.getByText('不推荐')).toBeTruthy();
  });

  it('applies size variants', () => {
    render(<CircularScore score={80} size="lg" testID="circular-score-lg" />);
    expect(screen.getByTestId('circular-score-lg')).toBeTruthy();
  });
});
