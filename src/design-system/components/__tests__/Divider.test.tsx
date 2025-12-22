import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Divider } from '../Divider';

describe('Divider Component', () => {
  it('renders correctly without label', () => {
    render(<Divider testID="divider" />);
    expect(screen.getByTestId('divider')).toBeTruthy();
  });

  it('renders correctly with label', () => {
    render(<Divider label="Or" />);
    expect(screen.getByText('Or')).toBeTruthy();
  });

  it('applies vertical orientation', () => {
    render(<Divider testID="divider-vertical" orientation="vertical" />);
    expect(screen.getByTestId('divider-vertical')).toBeTruthy();
  });

  it('applies thickness variants', () => {
    render(<Divider testID="divider-thick" thickness="thick" />);
    expect(screen.getByTestId('divider-thick')).toBeTruthy();
  });
});
