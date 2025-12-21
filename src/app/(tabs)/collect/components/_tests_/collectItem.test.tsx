import React from 'react';
import { render } from '@testing-library/react-native';

import CollectListItem from '../collectItem';
import { fireEvent } from '@testing-library/react-native';

// Mocks for UI libs and tokens used by the component
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const Card = (props: any) => React.createElement(View, props, props.children);
  Card.Header = Card;
  Card.Footer = Card;
  return {
    Card,
    Separator: (p: any) => React.createElement(View, p),
    Text: (p: any) => React.createElement(Text, p, p.children),
    XStack: (p: any) => React.createElement(View, p, p.children),
    YStack: (p: any) => React.createElement(View, p, p.children),
  };
});

jest.mock('@/src/components/ui/IconSymbol', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return { IconSymbol: ({ name }: any) => React.createElement(Text, null, name) };
});

jest.mock('@/src/design-system/components', () => {
  const React = require('react');
  const { TouchableOpacity } = require('react-native');
  return { Button: (props: any) => React.createElement(TouchableOpacity, props, props.children) };
});

jest.mock('@/src/design-system/tokens', () => ({
  primaryScale: {},
  successScale: { success9: '#0f0' },
  infoScale: { info9: '#0ff' },
  warningScale: { warning9: '#ff0', warning2: '#fff' },
  errorScale: { error9: '#f00', error2: '#fee' },
  neutralScale: {
    neutral1: '#fff',
    neutral2: '#eee',
    neutral3: '#ddd',
    neutral6: '#666',
    neutral7: '#777',
    neutral8: '#888',
    neutral9: '#999',
  },
}));

describe('CollectListItem', () => {
  it('returns null when no catfood provided', () => {
    const favorite: any = { id: 'fav1', createdAt: new Date().toISOString() };
    const { toJSON } = render(<CollectListItem favorite={favorite} />);
    expect(toJSON()).toBeNull();
  });

  it('renders name, brand and date when catfood present', () => {
    const favorite: any = {
      id: 'fav2',
      createdAt: new Date().toISOString(),
      catfood: { id: 'c1', name: 'Chicken Mix', brand: 'BrandA' },
    };

    const { getByText } = render(<CollectListItem favorite={favorite} />);
    expect(getByText('Chicken Mix')).toBeTruthy();
    expect(getByText('BrandA')).toBeTruthy();
    // date text contains '收藏于'
    expect(getByText(/收藏于/)).toBeTruthy();
  });

  it('shows score when provided', () => {
    const favorite: any = {
      id: 'fav3',
      createdAt: new Date().toISOString(),
      catfood: { id: 'c2', name: 'Top Food', score: 95 },
    };

    const { getByText } = render(<CollectListItem favorite={favorite} />);
    expect(getByText('Top Food')).toBeTruthy();
    expect(getByText('95')).toBeTruthy();
  });

  it('calls onDelete when cancel button is pressed', () => {
    const favorite: any = { id: 'fav4', createdAt: '', catfood: { id: 'c4', name: 'test' } };
    const onDelete = jest.fn();
    const { getByText } = render(<CollectListItem favorite={favorite} onDelete={onDelete} />);

    fireEvent.press(getByText('取消收藏'));
    expect(onDelete).toHaveBeenCalledWith('fav4', 'c4');
  });
});
