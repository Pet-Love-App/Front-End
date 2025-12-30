import React from 'react';
import { render } from '@testing-library/react-native';
import NotificationsScreen from '../notifications';

// Mock dependencies
jest.mock('@/src/lib/supabase', () => ({
  supabaseForumService: {
    getNotifications: jest.fn().mockResolvedValue({ data: [], error: null }),
    markNotificationsRead: jest.fn().mockResolvedValue({ error: null }),
  },
}));

jest.mock('@/src/hooks/useThemeColors', () => ({
  useThemeColors: jest.fn().mockReturnValue({
    background: '#ffffff',
    text: '#000000',
  }),
  useIsDarkMode: jest.fn().mockReturnValue(false),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({ top: 0, bottom: 0 }),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
  useNavigation: jest.fn().mockReturnValue({
    addListener: jest.fn(),
  }),
}));

jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    YStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    XStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Stack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    Spinner: () => <View testID="spinner" />,
    ScrollView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Button: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    usePropsAndStyle: jest.fn().mockReturnValue([{}, {}]),
  };
});

jest.mock('@tamagui/lucide-icons', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    ChevronLeft: () => <View testID="chevron-left" />,
    Bell: () => <View testID="bell-icon" />,
    MessageSquare: () => <View testID="message-icon" />,
    Heart: () => <View testID="heart-icon" />,
    UserPlus: () => <View testID="user-plus-icon" />,
  };
});

describe('NotificationsScreen', () => {
  it('should render correctly', () => {
    const { getByText } = render(<NotificationsScreen />);
    expect(getByText('消息通知')).toBeTruthy();
  });
});
