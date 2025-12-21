import React from 'react';
import { render } from '@testing-library/react-native';

import PostCollectItem from '../PostCollectItem';
import { fireEvent } from '@testing-library/react-native';

jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const Card = (props: any) => React.createElement(View, props, props.children);
  Card.Header = Card;
  return {
    Card,
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
  const { TouchableOpacity, Text } = require('react-native');
  return {
    Button: (props: any) =>
      React.createElement(
        TouchableOpacity,
        props,
        typeof props.children === 'string'
          ? React.createElement(Text, null, props.children)
          : props.children
      ),
  };
});
jest.mock('@/src/design-system/tokens', () => ({
  primaryScale: { primary9: '#f00' },
  neutralScale: {
    neutral2: '#eee',
    neutral3: '#ddd',
    neutral6: '#666',
    neutral7: '#777',
    neutral8: '#888',
    neutral9: '#999',
  },
  errorScale: { error9: '#f00', error2: '#fee' },
}));

describe('PostCollectItem', () => {
  it('renders post content, author and counts', () => {
    const post: any = {
      content: 'Hello world',
      createdAt: new Date().toISOString(),
      author: { username: 'u1' },
      favoritesCount: 3,
      commentsCount: 2,
      media: [],
    };

    const { getByText } = render(<PostCollectItem post={post} />);
    expect(getByText('Hello world')).toBeTruthy();
    expect(getByText('u1')).toBeTruthy();
    expect(getByText('3')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });

  it('calls onDelete when delete button is pressed', () => {
    const post: any = { content: 'test', author: { username: 'u' } };
    const onDelete = jest.fn();
    const { getByText } = render(<PostCollectItem post={post} onDelete={onDelete} />);

    // The delete button contains the 'trash' icon text due to our mock
    fireEvent.press(getByText('trash'), { stopPropagation: jest.fn() });
    expect(onDelete).toHaveBeenCalled();
  });

  it('calls onPress when card is pressed', () => {
    const post: any = { content: 'test', author: { username: 'u' } };
    const onPress = jest.fn();
    const { getByText } = render(<PostCollectItem post={post} onPress={onPress} />);

    fireEvent.press(getByText('test'));
    expect(onPress).toHaveBeenCalled();
  });
});
