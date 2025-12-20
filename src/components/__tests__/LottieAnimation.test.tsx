import React from 'react';
import { render } from '@testing-library/react-native';
import { LottieAnimation } from '../LottieAnimation';
import LottieView from 'lottie-react-native';
import { View } from 'react-native';

// Mock LottieView
jest.mock('lottie-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  return React.forwardRef((props: any, ref: any) => {
    return <View testID="lottie-view" {...props} />;
  });
});

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    View: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    styled: (Component: any) => Component,
  };
});

describe('LottieAnimation', () => {
  it('should render with default props', () => {
    // Arrange
    const source = require('@/assets/animations/cat_loader.json');

    // Act
    const { getByTestId } = render(<LottieAnimation source={source} />);
    const lottieView = getByTestId('lottie-view');

    // Assert
    expect(lottieView).toBeTruthy();
    expect(lottieView.props.autoPlay).toBe(true);
    expect(lottieView.props.loop).toBe(true);
    expect(lottieView.props.speed).toBe(1);
  });

  it('should render with custom props', () => {
    // Arrange
    const source = require('@/assets/animations/cat_loader.json');
    const props = {
      width: 100,
      height: 100,
      autoPlay: false,
      loop: false,
      speed: 0.5,
    };

    // Act
    const { getByTestId } = render(<LottieAnimation source={source} {...props} />);
    const lottieView = getByTestId('lottie-view');

    // Assert
    expect(lottieView.props.style).toEqual(expect.arrayContaining([{ width: 100, height: 100 }, undefined]));
    expect(lottieView.props.autoPlay).toBe(false);
    expect(lottieView.props.loop).toBe(false);
    expect(lottieView.props.speed).toBe(0.5);
  });

  it('should render message when provided', () => {
    // Arrange
    const source = require('@/assets/animations/cat_loader.json');
    const message = 'Loading...';

    // Act
    const { getByText } = render(<LottieAnimation source={source} message={message} />);

    // Assert
    expect(getByText(message)).toBeTruthy();
  });

  it('should apply container style', () => {
    // Arrange
    const source = require('@/assets/animations/cat_loader.json');
    const containerStyle = { backgroundColor: 'red' };

    // Act
    const { getByTestId } = render(
      <LottieAnimation source={source} containerStyle={containerStyle} testID="custom-container" />
    );
    
    const container = getByTestId('custom-container');
    
    // Assert
    expect(container.props.style).toEqual(expect.arrayContaining([expect.objectContaining({ alignItems: 'center' }), containerStyle]));
  });
});
