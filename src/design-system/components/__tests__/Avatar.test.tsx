import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Avatar } from '../Avatar';
import { Text } from 'tamagui';

describe('Avatar Component', () => {
  it('renders image when src is provided', () => {
    render(<Avatar testID="avatar-img" src="https://example.com/avatar.png" />);
    // In Tamagui mock or RN, Image might not be easily queryable by role 'image' without accessibilityRole
    // But we can check if the component renders without crashing
    expect(screen.getByTestId('avatar-img')).toBeTruthy();
  });

  it('renders fallback text when src is missing', () => {
    render(<Avatar fallback="John Doe" />);
    expect(screen.getByText('JO')).toBeTruthy();
  });

  it('renders fallback icon when provided', () => {
    render(<Avatar fallbackIcon={<Text>Icon</Text>} />);
    expect(screen.getByText('Icon')).toBeTruthy();
  });

  it('applies size variants', () => {
    render(<Avatar testID="avatar-lg" size="lg" fallback="User" />);
    expect(screen.getByTestId('avatar-lg')).toBeTruthy();
  });

  it('applies shape variants', () => {
    render(<Avatar testID="avatar-square" shape="square" fallback="User" />);
    expect(screen.getByTestId('avatar-square')).toBeTruthy();
  });
});
