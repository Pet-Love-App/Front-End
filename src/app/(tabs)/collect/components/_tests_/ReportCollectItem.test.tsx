import React from 'react';
import { render } from '@testing-library/react-native';

import ReportCollectItem from '../ReportCollectItem';
import { fireEvent } from '@testing-library/react-native';

jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const Card = (props: any) => React.createElement(View, props, props.children);
  Card.Header = (props: any) => React.createElement(View, props, props.children);
  Card.Footer = (props: any) => React.createElement(View, props, props.children);
  return {
    Card,
    Separator: (props: any) => React.createElement(View, props),
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
  primaryScale: { primary2: '#eee', primary4: '#ddd', primary7: '#777' },
  successScale: { success9: '#0f0' },
  infoScale: { info9: '#0ff' },
  warningScale: { warning9: '#ff0' },
  neutralScale: {
    neutral1: '#fff',
    neutral2: '#eee',
    neutral3: '#ddd',
    neutral7: '#777',
    neutral9: '#999',
  },
}));

describe('ReportCollectItem', () => {
  it('returns null when no report provided', () => {
    const { toJSON } = render(
      <ReportCollectItem
        favoriteReport={{ id: 1, reportId: 10, createdAt: '', report: null as any }}
      />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders report name, tags and nutrient summary', () => {
    const favoriteReport: any = {
      id: 1,
      reportId: 10,
      createdAt: new Date().toISOString(),
      report: {
        id: 10,
        catfood_name: 'NutriMix',
        percent_data: { crude_protein: 30, crude_fat: 10, carbohydrates: 20 },
        tags: ['高蛋白', '天然配方'],
        percentage: true,
        safety: '安全',
      },
    };

    const { getByText } = render(<ReportCollectItem favoriteReport={favoriteReport} />);
    expect(getByText('NutriMix')).toBeTruthy();
    // nutrient summary contains '蛋白质'
    expect(getByText(/蛋白质/)).toBeTruthy();
    // tag text should be rendered
    expect(getByText('高蛋白')).toBeTruthy();
  });

  it('calls onDelete when cancel button is pressed', () => {
    const favoriteReport: any = {
      id: 1,
      reportId: 10,
      createdAt: '',
      report: { id: 10, catfood_name: 'test' },
    };
    const onDelete = jest.fn();
    const { getByText } = render(
      <ReportCollectItem favoriteReport={favoriteReport} onDelete={onDelete} />
    );

    fireEvent.press(getByText('取消收藏'), { stopPropagation: jest.fn() });
    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('calls onPress when card is pressed', () => {
    const favoriteReport: any = {
      id: 1,
      reportId: 10,
      createdAt: '',
      report: { id: 10, catfood_name: 'test' },
    };
    const onPress = jest.fn();
    const { getByText } = render(
      <ReportCollectItem favoriteReport={favoriteReport} onPress={onPress} />
    );

    fireEvent.press(getByText('test'));
    expect(onPress).toHaveBeenCalled();
  });
});
