import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { OptimizedImage, AvatarImage, ProductImage } from '../OptimizedImage';
import { Image } from 'expo-image';

// Mock expo-image
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: (props: any) => <View testID="expo-image-mock" {...props} />,
  };
});

describe('OptimizedImage Component', () => {
  it('renders correctly with string source', () => {
    // Arrange
    const props = {
      source: 'https://example.com/image.jpg',
      contentFit: 'contain' as const,
    };

    // Act
    const { getByTestId } = render(<OptimizedImage {...props} />);

    // Assert
    const image = getByTestId('expo-image-mock');
    expect(image.props.source).toEqual({ uri: 'https://example.com/image.jpg' });
    expect(image.props.contentFit).toBe('contain');
  });

  it('renders correctly with object source', () => {
    // Arrange
    const props = {
      source: { uri: 'https://example.com/image.jpg' },
    };

    // Act
    const { getByTestId } = render(<OptimizedImage {...props} />);

    // Assert
    const image = getByTestId('expo-image-mock');
    expect(image.props.source).toEqual({ uri: 'https://example.com/image.jpg' });
  });

  it('passes blurhash to placeholder', () => {
    // Arrange
    const props = {
      source: 'https://example.com/image.jpg',
      blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj',
    };

    // Act
    const { getByTestId } = render(<OptimizedImage {...props} />);

    // Assert
    const image = getByTestId('expo-image-mock');
    expect(image.props.placeholder).toEqual({ blurhash: 'LEHV6nWB2yk8pyo0adR*.7kCMdnj' });
  });
});

describe('AvatarImage Component', () => {
  it('renders correctly with default size', () => {
    // Arrange
    const props = {
      source: 'https://example.com/avatar.jpg',
    };

    // Act
    const { getByTestId } = render(<AvatarImage {...props} />);

    // Assert
    const image = getByTestId('expo-image-mock');
    const flattenedStyle = StyleSheet.flatten(image.props.style);
    
    expect(flattenedStyle.width).toBe(50);
    expect(flattenedStyle.height).toBe(50);
    expect(flattenedStyle.borderRadius).toBe(25);
  });

  it('renders correctly with custom size', () => {
    // Arrange
    const props = {
      source: 'https://example.com/avatar.jpg',
      size: 100,
    };

    // Act
    const { getByTestId } = render(<AvatarImage {...props} />);

    // Assert
    const image = getByTestId('expo-image-mock');
    const flattenedStyle = StyleSheet.flatten(image.props.style);
    
    expect(flattenedStyle.width).toBe(100);
    expect(flattenedStyle.height).toBe(100);
    expect(flattenedStyle.borderRadius).toBe(50);
  });
});

describe('ProductImage Component', () => {
  it('renders correctly with default props', () => {
    // Arrange
    const props = {
      source: 'https://example.com/product.jpg',
    };

    // Act
    const { getByTestId } = render(<ProductImage {...props} />);

    // Assert
    const image = getByTestId('expo-image-mock');
    const flattenedStyle = StyleSheet.flatten(image.props.style);
    
    expect(flattenedStyle.aspectRatio).toBe(1);
    expect(flattenedStyle.borderRadius).toBe(12);
  });

  it('renders correctly with custom props', () => {
    // Arrange
    const props = {
      source: 'https://example.com/product.jpg',
      aspectRatio: 1.5,
      borderRadius: 8,
    };

    // Act
    const { getByTestId } = render(<ProductImage {...props} />);

    // Assert
    const image = getByTestId('expo-image-mock');
    const flattenedStyle = StyleSheet.flatten(image.props.style);
    
    expect(flattenedStyle.aspectRatio).toBe(1.5);
    expect(flattenedStyle.borderRadius).toBe(8);
  });
});
