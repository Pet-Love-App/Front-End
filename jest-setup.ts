import 'react-native-gesture-handler/jestSetup';

// Mock global window/document for Tamagui if needed, but carefully
// Tamagui web components might need these, but in RN test env they might not be present.
// If we are testing for React Native, we should mock Tamagui components to be simple Views.

if (typeof window === 'undefined') {
  // @ts-ignore
  global.window = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    matchMedia: jest.fn(() => ({
      matches: false,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      media: '',
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  };
} else if (!window.addEventListener) {
  window.addEventListener = jest.fn();
  window.removeEventListener = jest.fn();
}

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
    // Add styled mock
    styled: (Component: any) => Component,
    // Add other missing exports that might be used
    createTamagui: jest.fn(),
    TamaguiProvider: ({ children }: any) => children,
    Theme: ({ children }: any) => children,
    useTheme: () => ({
      color: '#000000',
      background: '#ffffff',
      borderColor: '#cccccc',
      // Add other theme keys as needed
      get: (key: string) => {
        if (key === 'color') return '#000000';
        if (key === 'background') return '#ffffff';
        return '#cccccc';
      },
    }),
    useMedia: () => ({
      sm: true,
      md: true,
      lg: true,
      xl: true,
    }),
    useToastController: () => ({
      show: jest.fn(),
      hide: jest.fn(),
    }),
    // Mock GetProps as a type helper (runtime it's undefined or object, but for jest it doesn't matter much if not called)
    // If it's used as a value:
    GetProps: {},
    isTamaguiElement: jest.fn(),
    spacer: View,
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

// Mock @tamagui/toast
jest.mock('@tamagui/toast', () => ({
  ToastViewport: ({ children }: any) => children,
  Toast: ({ children }: any) => children,
  ToastTitle: ({ children }: any) => children,
  ToastDescription: ({ children }: any) => children,
  useToastController: () => ({
    show: jest.fn(),
    hide: jest.fn(),
  }),
  useToastState: () => null,
}));

// Mock @tamagui/core and @tamagui/web to prevent "Missing theme" errors
const mockTamaguiCore = {
  useTheme: () => ({
    color: '#000000',
    background: '#ffffff',
    borderColor: '#cccccc',
    get: (key: string) => {
      if (key === 'color') return '#000000';
      if (key === 'background') return '#ffffff';
      return '#cccccc';
    },
  }),
  useThemeName: () => 'light',
  useMedia: () => ({ sm: true, md: true, lg: true, xl: true }),
  styled: (Component: any) => Component,
  createTamagui: jest.fn(),
  TamaguiProvider: ({ children }: any) => children,
  Theme: ({ children }: any) => children,
  Stack: ({ children }: any) => children,
  View: ({ children }: any) => children,
  Text: ({ children }: any) => children,
};

jest.mock('@tamagui/core', () => mockTamaguiCore);
jest.mock('@tamagui/web', () => mockTamaguiCore);
