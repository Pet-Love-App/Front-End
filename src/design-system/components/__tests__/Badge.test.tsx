import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Badge } from '../Badge';
import { Text } from 'tamagui';

describe('Badge Component', () => {
  it('renders children correctly', () => {
    render(
      <Badge>
        <Text>New</Text>
      </Badge>
    );
    expect(screen.getByText('New')).toBeTruthy();
  });

  it('applies variants', () => {
    render(
      <Badge variant="success" testID="badge-success">
        <Text>Success</Text>
      </Badge>
    );
    expect(screen.getByTestId('badge-success')).toBeTruthy();
  });

  it('applies size variants', () => {
    render(
      <Badge size="lg" testID="badge-lg">
        <Text>Large</Text>
      </Badge>
    );
    expect(screen.getByTestId('badge-lg')).toBeTruthy();
  });

  it('handles outline prop', () => {
    render(
      <Badge outline={true} testID="badge-outline">
        <Text>Outline</Text>
      </Badge>
    );
    expect(screen.getByTestId('badge-outline')).toBeTruthy();
  });
});
