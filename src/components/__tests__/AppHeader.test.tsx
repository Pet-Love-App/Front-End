import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AppHeader } from '../AppHeader';
import { useUserStore } from '@/src/store/userStore';
import { supabaseForumService, supabase } from '@/src/lib/supabase';
import { useRouter } from 'expo-router';
import { View, Text as RNText } from 'react-native';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useFocusEffect: jest.fn((cb) => cb()), // Execute callback immediately
}));

jest.mock('@/src/store/userStore', () => ({
  useUserStore: jest.fn(),
}));

jest.mock('@/src/lib/supabase', () => ({
  supabaseForumService: {
    getNotifications: jest.fn(),
  },
  supabase: {
    channel: jest.fn(),
    removeChannel: jest.fn(),
  },
}));

jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

// Mock Tamagui
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    Text: ({ children, testID, ...props }: any) => (
      <Text testID={testID} {...props}>
        {children}
      </Text>
    ),
    XStack: ({ children, testID, ...props }: any) => (
      <View testID={testID} {...props}>
        {children}
      </View>
    ),
    YStack: ({ children, testID, ...props }: any) => (
      <View testID={testID} {...props}>
        {children}
      </View>
    ),
  };
});

describe('AppHeader', () => {
  const mockRouter = { push: jest.fn() };
  const mockInsets = { top: 20, bottom: 0, left: 0, right: 0 };
  const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useUserStore as unknown as jest.Mock).mockReturnValue({
      user: { id: '123', avatarUrl: 'test.jpg' },
    });
    (supabase.channel as jest.Mock).mockReturnValue(mockChannel);
    (supabaseForumService.getNotifications as jest.Mock).mockResolvedValue({ data: [] });
  });

  it('should render title correctly', () => {
    // Arrange & Act
    const { getByText } = render(<AppHeader title="Test Title" insets={mockInsets} />);

    // Assert
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('should render avatar when showAvatar is true', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <AppHeader title="Test" insets={mockInsets} showAvatar={true} />
    );

    // Assert
    expect(getByTestId('avatar-button')).toBeTruthy();
  });

  it('should navigate to profile on avatar press', () => {
    // Arrange
    const { getByTestId } = render(
      <AppHeader title="Test" insets={mockInsets} showAvatar={true} />
    );

    // Act
    fireEvent.press(getByTestId('avatar-button'));

    // Assert
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/profile');
  });

  it('should fetch unread count on mount', async () => {
    // Arrange
    (supabaseForumService.getNotifications as jest.Mock).mockResolvedValue({ data: [1, 2, 3] });

    // Act
    render(<AppHeader title="Test" insets={mockInsets} showNotification={true} />);

    // Assert
    await waitFor(() => {
      expect(supabaseForumService.getNotifications).toHaveBeenCalledWith(true);
    });
  });

  it('should subscribe to notifications', () => {
    // Arrange & Act
    render(<AppHeader title="Test" insets={mockInsets} showNotification={true} />);

    // Assert
    expect(supabase.channel).toHaveBeenCalledWith('app_header_notifications');
    expect(mockChannel.on).toHaveBeenCalled();
    expect(mockChannel.subscribe).toHaveBeenCalled();
  });

  it('should navigate to notifications on notification press', () => {
    // Arrange
    const { getByTestId } = render(
      <AppHeader title="Test" insets={mockInsets} showNotification={true} />
    );

    // Act
    fireEvent.press(getByTestId('notification-button'));

    // Assert
    expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/forum/notifications');
  });
});
