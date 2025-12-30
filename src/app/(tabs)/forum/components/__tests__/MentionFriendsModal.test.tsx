import React from 'react';
import { render } from '@testing-library/react-native';
import { MentionFriendsModal } from '../MentionFriendsModal';

// Mock dependencies
jest.mock('@/src/lib/supabase', () => ({
  supabaseFriendsService: {
    getMyFriends: jest.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

jest.mock('@/src/hooks/useThemeColors', () => ({
  useThemeColors: jest.fn().mockReturnValue({
    cardBackground: '#ffffff',
    text: '#000000',
  }),
  useIsDarkMode: jest.fn().mockReturnValue(false),
}));

jest.mock('@/src/components/UserProfileModal', () => ({
  UserProfileModal: () => null,
}));

jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text, TextInput } = require('react-native');
  return {
    YStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    XStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Stack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    Input: (props: any) => <TextInput {...props} />,
    Button: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Sheet: ({ children }: any) => <View>{children}</View>,
    usePropsAndStyle: jest.fn().mockReturnValue([{}, {}]),
  };
});

jest.mock('@tamagui/lucide-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Search: () => <View testID="search-icon" />,
    X: () => <View testID="close-icon" />,
  };
});

describe('MentionFriendsModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  it('should render correctly when visible', () => {
    const { getByPlaceholderText } = render(
      <MentionFriendsModal visible={true} onClose={mockOnClose} onConfirm={mockOnConfirm} />
    );

    expect(getByPlaceholderText('搜索好友')).toBeTruthy();
  });
});
