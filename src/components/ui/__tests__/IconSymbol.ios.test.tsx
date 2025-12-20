import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from '../IconSymbol.ios';
import { SymbolView } from 'expo-symbols';

// Mock expo-symbols
jest.mock('expo-symbols', () => ({
  SymbolView: (props: any) => {
    const { View } = require('react-native');
    return <View testID="symbol-view-mock" {...props} />;
  },
}));

describe('IconSymbol (iOS) Component', () => {
  it('renders correctly with default props', () => {
    // Arrange
    const props = {
      name: 'heart.fill' as const,
      color: 'red',
    };

    // Act
    const { getByTestId } = render(<IconSymbol {...props} />);

    // Assert
    const symbolView = getByTestId('symbol-view-mock');
    expect(symbolView.props.name).toBe('heart.fill');
    expect(symbolView.props.tintColor).toBe('red');
    expect(symbolView.props.weight).toBe('regular');

    // Check default size style
    const style = symbolView.props.style.find((s: any) => s.width === 24);
    expect(style).toBeDefined();
    expect(style.height).toBe(24);
  });

  it('renders correctly with custom props', () => {
    // Arrange
    const props = {
      name: 'camera.fill' as const,
      size: 30,
      color: 'blue',
      weight: 'bold' as const,
    };

    // Act
    const { getByTestId } = render(<IconSymbol {...props} />);

    // Assert
    const symbolView = getByTestId('symbol-view-mock');
    expect(symbolView.props.name).toBe('camera.fill');
    expect(symbolView.props.tintColor).toBe('blue');
    expect(symbolView.props.weight).toBe('bold');

    // Check custom size style
    const style = symbolView.props.style.find((s: any) => s.width === 30);
    expect(style).toBeDefined();
    expect(style.height).toBe(30);
  });
});
