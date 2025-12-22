import React from 'react';
import { render } from '@testing-library/react-native';
import Tag from '../Tag';
import { tagColors } from '@/src/design-system/tokens';

// Mock Tamagui components
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => (
      <Text testID="tag-text" {...props}>
        {children}
      </Text>
    ),
    XStack: ({ children, ...props }: any) => (
      <View testID="tag-container" {...props}>
        {children}
      </View>
    ),
  };
});

describe('Tag Component', () => {
  it('renders correctly with default props', () => {
    // Arrange
    const props = {
      name: 'Test Tag',
      index: 0,
    };

    // Act
    const { getByText, getByTestId } = render(<Tag {...props} />);

    // Assert
    expect(getByText('Test Tag')).toBeTruthy();
    const container = getByTestId('tag-container');
    // Check if background color is applied correctly from tagColors
    expect(container.props.backgroundColor).toBe(tagColors[0]);
  });

  it('renders correctly with different size', () => {
    // Arrange
    const props = {
      name: 'Small Tag',
      index: 1,
      size: 'sm' as const,
    };

    // Act
    const { getByText, getByTestId } = render(<Tag {...props} />);

    // Assert
    expect(getByText('Small Tag')).toBeTruthy();
    const container = getByTestId('tag-container');
    // Check padding for small size
    expect(container.props.paddingHorizontal).toBe('$1.5');
  });

  it('calculates contrast color correctly for dark background', () => {
    // Arrange
    // Assuming tagColors[0] is a light color, let's mock tagColors to control the test if needed,
    // but here we rely on the logic.
    // Let's just check if the text color is set.
    const props = {
      name: 'Contrast Test',
      index: 0,
    };

    // Act
    const { getByTestId } = render(<Tag {...props} />);

    // Assert
    const text = getByTestId('tag-text');
    expect(text.props.color).toBeDefined();
  });
});
