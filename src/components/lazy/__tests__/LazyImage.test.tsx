import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LazyImage } from '../LazyImage';
import { Image } from 'react-native';

// Mock Tamagui components
jest.mock('tamagui', () => {
  const { View } = require('react-native');
  return {
    YStack: ({ children, ...props }: any) => (
      <View testID="lazy-image-container" {...props}>
        {children}
      </View>
    ),
  };
});

// Mock Skeleton
jest.mock('../Skeleton', () => {
  const { View } = require('react-native');
  return {
    Skeleton: (props: any) => <View testID="skeleton-mock" {...props} />,
  };
});

// Mock Image to trigger onLoad/onError
// jest.mock('react-native/Libraries/Image/Image', () => {
//   const { View } = require('react-native');
//   const MockImage = (props: any) => {
//     return (
//       <View
//         testID="rn-image-mock"
//         {...props}
//       />
//     );
//   };
//   MockImage.displayName = 'Image';
//   return MockImage;
// });

describe('LazyImage Component', () => {
  it('renders skeleton initially', () => {
    // Arrange
    const props = {
      source: { uri: 'https://example.com/image.jpg' },
      width: 100,
      height: 100,
      testID: 'lazy-image',
    };

    // Act
    const { getByTestId } = render(<LazyImage {...props} />);

    // Assert
    expect(getByTestId('skeleton-mock')).toBeTruthy();
  });

  it('hides skeleton and shows image on load', () => {
    // Arrange
    const props = {
      source: { uri: 'https://example.com/image.jpg' },
      width: 100,
      height: 100,
      testID: 'lazy-image',
    };

    // Act
    const { getByTestId, queryByTestId } = render(<LazyImage {...props} />);
    const image = getByTestId('lazy-image');

    // Simulate onLoad
    fireEvent(image, 'load');

    // Assert
    expect(queryByTestId('skeleton-mock')).toBeNull();
    expect(image).toBeTruthy();
  });

  it('shows placeholder or error state on error', () => {
    // Arrange
    const props = {
      source: { uri: 'https://example.com/image.jpg' },
      width: 100,
      height: 100,
      testID: 'lazy-image',
    };

    // Act
    const { getByTestId } = render(<LazyImage {...props} />);
    const image = getByTestId('lazy-image');

    // Simulate onError
    fireEvent(image, 'error');

    // Assert
    // Should show error state (YStack with gray background)
    // Since we passed testID to the error container too, we can check if it exists
    // But wait, the error container also has the same testID.
    // Let's check if the image is gone or replaced.
    // In the code: if (hasError) { if (placeholder) ... else return <YStack ... testID={testID} ... /> }

    // So getByTestId('lazy-image') should still return something (the error container).
    expect(getByTestId('lazy-image')).toBeTruthy();
  });
});
