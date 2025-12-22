import { render, fireEvent } from '@testing-library/react-native';
import { PageHeader } from '../PageHeader';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { View, Text as RNText } from 'react-native';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');

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

describe('PageHeader', () => {
  const mockRouter = { back: jest.fn() };
  const mockInsets = { top: 20, bottom: 0, left: 0, right: 0 };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should render title and subtitle', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <PageHeader title="Test Title" subtitle="Test Subtitle" insets={mockInsets} />
    );

    // Assert
    expect(getByTestId('page-header-title').props.children).toBe('Test Title');
    expect(getByTestId('page-header-subtitle').props.children).toBe('Test Subtitle');
  });

  it('should render back button when showBackButton is true', () => {
    // Arrange & Act
    const { getByTestId } = render(
      <PageHeader title="Test" showBackButton={true} insets={mockInsets} />
    );

    // Assert
    expect(getByTestId('page-header-back-button')).toBeTruthy();
  });

  it('should navigate back on back button press', () => {
    // Arrange
    const { getByTestId } = render(
      <PageHeader title="Test" showBackButton={true} insets={mockInsets} />
    );

    // Act
    fireEvent.press(getByTestId('page-header-back-button'));

    // Assert
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it('should call custom onBackPress if provided', () => {
    // Arrange
    const onBackPress = jest.fn();
    const { getByTestId } = render(
      <PageHeader
        title="Test"
        showBackButton={true}
        onBackPress={onBackPress}
        insets={mockInsets}
      />
    );

    // Act
    fireEvent.press(getByTestId('page-header-back-button'));

    // Assert
    expect(onBackPress).toHaveBeenCalled();
    expect(mockRouter.back).not.toHaveBeenCalled();
  });

  it('should render right element', () => {
    // Arrange
    const RightElement = () => <TouchableOpacity testID="right-element" />;
    const { getByTestId } = render(
      <PageHeader title="Test" insets={mockInsets} rightElement={<RightElement />} />
    );

    // Assert
    expect(getByTestId('page-header-right-element')).toBeTruthy();
    expect(getByTestId('right-element')).toBeTruthy();
  });
});
