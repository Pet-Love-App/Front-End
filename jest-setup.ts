import 'react-native-gesture-handler/jestSetup';

// Mock global window/document for Tamagui if needed, but carefully
// Tamagui web components might need these, but in RN test env they might not be present.
// If we are testing for React Native, we should mock Tamagui components to be simple Views.

// Mock Tamagui components globally to avoid "addEventListener" errors
jest.mock('tamagui', () => {
  const { View, Text, TextInput } = require('react-native');
  return {
    View: View,
    Text: Text,
    YStack: View,
    XStack: View,
    ZStack: View,
    Stack: View,
    Button: jest.fn(({ onPress, disabled, children, ...props }) => {
      const React = require('react');
      const { TouchableOpacity } = require('react-native');
      return React.createElement(
        TouchableOpacity,
        {
          onPress: disabled ? undefined : onPress,
          disabled: disabled,
          ...props,
        },
        children
      );
    }),
    Card: Object.assign(View, {
      Header: View,
      Footer: View,
      Background: View,
    }),
    Image: View,
    Input: TextInput, // Use TextInput for Input
    ScrollView: View,
    Sheet: View,
    Switch: View,
    TextArea: TextInput, // Use TextInput for TextArea
    Separator: View,
    Spinner: View,
    H1: Text,
    H2: Text,
    H3: Text,
    H4: Text,
    H5: Text,
    H6: Text,
    Paragraph: Text,
    SizableText: Text,
    // Add other Tamagui components as needed
    styled: (Component: any) => Component,
    createStyledContext: () => ({}),
    useTheme: () => ({}),
    useMedia: () => ({}),
  };
});

// Mock safe area context globally
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn(({ children }) => children),
    SafeAreaView: jest.fn(({ children }) => children),
    useSafeAreaInsets: jest.fn(() => inset),
  };
});

// Mock other libraries that might cause issues
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock 'react-native-chart-kit' for PieChart
jest.mock('react-native-chart-kit', () => ({
  PieChart: 'PieChart',
  BarChart: 'BarChart',
}));

// Mock '@sentry/react-native' to avoid ESM issues
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: jest.fn((component) => component),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setTags: jest.fn(),
  setExtra: jest.fn(),
  setExtras: jest.fn(),
  setContext: jest.fn(),
  withScope: jest.fn((callback) => callback({ setTag: jest.fn(), setExtra: jest.fn() })),
  startTransaction: jest.fn(() => ({ finish: jest.fn() })),
  getCurrentHub: jest.fn(() => ({
    getScope: jest.fn(() => ({
      setUser: jest.fn(),
      setTag: jest.fn(),
    })),
  })),
  Severity: {
    Fatal: 'fatal',
    Error: 'error',
    Warning: 'warning',
    Info: 'info',
    Debug: 'debug',
  },
  ReactNavigationInstrumentation: jest.fn(),
  ReactNativeTracing: jest.fn(),
}));
