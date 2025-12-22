import React from 'react';
import { render } from '@testing-library/react-native';
import { ListFooter } from '../ListFooter';

// Mock tamagui
jest.mock('tamagui', () => ({
  YStack: 'YStack',
  Text: 'Text',
}));

describe('ListFooter', () => {
  it('renders nothing when not loading', () => {
    const { toJSON } = render(<ListFooter isLoadingMore={false} />);
    expect(toJSON()).toBeNull();
  });

  it('renders correctly when loading', () => {
    const { getByText } = render(<ListFooter isLoadingMore={true} />);
    expect(getByText('加载更多猫粮中...')).toBeTruthy();
  });
});
