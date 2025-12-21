import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AdditiveBubble } from '../AdditiveBubble';

// Mock dependencies
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return {
    ...Reanimated,
    useSharedValue: jest.fn((initialValue) => ({ value: initialValue })),
    useAnimatedStyle: jest.fn((cb) => cb()),
    withRepeat: jest.fn((anim) => anim),
    withSequence: jest.fn((...anims) => anims[0]),
    withSpring: jest.fn((toValue) => toValue),
  };
});

const mockAdditive = {
  id: 1,
  name: 'Additive 1',
  description: 'Description 1',
  risk_level: 'Low',
};

describe('AdditiveBubble', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly', () => {
    const { getByText } = render(
      <AdditiveBubble additive={mockAdditive as any} index={0} total={5} onPress={mockOnPress} />
    );

    expect(getByText('Additive 1')).toBeTruthy();
  });

  it('should handle press', () => {
    const { getByText } = render(
      <AdditiveBubble additive={mockAdditive as any} index={0} total={5} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Additive 1'));
    expect(mockOnPress).toHaveBeenCalledWith(mockAdditive);
  });
});
