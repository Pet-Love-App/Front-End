import React from 'react';
import { render, screen } from '@testing-library/react-native';
import * as SplashScreen from 'expo-splash-screen';

import RootLayout from '../_layout';
import { useCustomFonts } from '../../hooks/useFonts';
import { useThemeAwareColorScheme } from '../../hooks/useThemeAwareColorScheme';
import { useUserStore } from '../../store/userStore';

// Arrange: Common mocks
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    Stack: ({ children, screenOptions }: any) =>
      React.createElement('mock-stack', { screenOptions: JSON.stringify(screenOptions) }, children),
    // Provide Screen to avoid runtime issues when rendering children
    StackScreen: ({ name, options }: any) =>
      React.createElement('mock-screen', { name, options: JSON.stringify(options) }),
  };
});

// Map Stack.Screen to mock-screen for children created by RootLayout
jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children, screenOptions }: any) =>
    React.createElement('mock-stack', { screenOptions: JSON.stringify(screenOptions) }, children);
  Stack.Screen = ({ name, options }: any) =>
    React.createElement('mock-screen', { name, options: JSON.stringify(options) });
  return { Stack };
});

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-status-bar', () => {
  const React = require('react');
  return {
    StatusBar: ({ style }: any) => React.createElement('mock-statusbar', { style }),
  };
});

jest.mock('react-native-reanimated', () => ({}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children, testID }: any) =>
      React.createElement('mock-safe-area', { testID }, children),
  };
});

jest.mock(
  '../../../tamagui.config',
  () => ({
    tamaguiConfig: {},
  }),
  { virtual: true }
);

jest.mock('tamagui', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    TamaguiProvider: ({ children }: any) => React.createElement(View, {}, children),
    createTamagui: jest.fn(),
    createTokens: jest.fn(),
    View: View,
    Text: View,
    // ... add other components if needed
  };
});

jest.mock('@tamagui/themes', () => ({
  themes: {},
  tokens: {},
}));

jest.mock('@tamagui/portal', () => {
  const React = require('react');
  return {
    PortalProvider: ({ children }: any) => React.createElement('mock-portal', null, children),
  };
});

jest.mock('@tamagui/react-native-media-driver', () => ({
  createMedia: jest.fn(),
}));

jest.mock('@tamagui/animations-react-native', () => ({
  createAnimations: jest.fn(),
}));

jest.mock('@tamagui/shorthands', () => ({
  shorthands: {},
}));

jest.mock('../../hooks/useFonts', () => ({
  useCustomFonts: jest.fn(),
}));

jest.mock('../../hooks/useThemeAwareColorScheme', () => ({
  useThemeAwareColorScheme: jest.fn(),
}));

jest.mock('../../hooks/useDeepLink', () => ({
  useDeepLink: jest.fn(),
}));

jest.mock('../../components/DesktopPet', () => {
  const React = require('react');
  return {
    DesktopPet: () => React.createElement('mock-desktop-pet'),
  };
});

jest.mock('../../components/dialogs', () => {
  const React = require('react');
  return {
    ToastManager: () => React.createElement('mock-toast'),
    AlertManager: () => React.createElement('mock-alert'),
  };
});

jest.mock('../../components/DismissKeyboardView', () => {
  const React = require('react');
  return {
    DismissKeyboardView: ({ children }: any) =>
      React.createElement('mock-dismiss-keyboard', null, children),
  };
});

jest.mock('../../store/userStore', () => ({
  useUserStore: (selector: any) => selector({ isAuthenticated: false }),
}));

jest.mock('../../lib/sentry', () => {
  const React = require('react');
  return {
    initSentry: jest.fn(),
    SentryErrorBoundary: ({ children }: any) =>
      React.createElement('mock-sentry-boundary', null, children),
  };
});

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ARRANGE ACT ASSERT: 不加载字体时返回 null', () => {
    // Arrange
    (useCustomFonts as jest.Mock).mockReturnValue(false);

    // Act
    const { toJSON } = render(<RootLayout />);

    // Assert
    expect(toJSON()).toBeNull();
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
  });

  it('ARRANGE ACT ASSERT: 字体加载后隐藏启动屏并渲染根节点', () => {
    // Arrange
    (useCustomFonts as jest.Mock).mockReturnValue(true);
    (useThemeAwareColorScheme as jest.Mock).mockReturnValue('dark');

    // Act
    render(<RootLayout />);

    // Assert
    expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('app-root')).toBeTruthy();
  });

  it('ARRANGE ACT ASSERT: Stack headerShown 为 false（全局）', () => {
    // Arrange
    (useCustomFonts as jest.Mock).mockReturnValue(true);
    (useThemeAwareColorScheme as jest.Mock).mockReturnValue('light');

    // Act
    const { UNSAFE_getByType } = render(<RootLayout />);
    const stack = UNSAFE_getByType('mock-stack' as any);

    // Assert
    expect(stack.props.screenOptions).toContain('"headerShown":false');
  });

  it('ARRANGE ACT ASSERT: 所有屏幕都隐藏头部', () => {
    // Arrange
    (useCustomFonts as jest.Mock).mockReturnValue(true);
    (useThemeAwareColorScheme as jest.Mock).mockReturnValue('dark');

    // Act
    const { UNSAFE_getAllByType } = render(<RootLayout />);
    const screens = UNSAFE_getAllByType('mock-screen' as any);

    // Assert
    expect(screens.length).toBeGreaterThan(0);
    for (const s of screens) {
      expect(s.props.options).toContain('"headerShown":false');
    }
  });

  it('ARRANGE ACT ASSERT: 认证用户显示桌宠', () => {
    // Arrange
    (useCustomFonts as jest.Mock).mockReturnValue(true);
    (useThemeAwareColorScheme as jest.Mock).mockReturnValue('dark');
    // Mock store to authenticated
    jest
      .spyOn(require('../../store/userStore'), 'useUserStore')
      .mockImplementation((selector: any) => selector({ isAuthenticated: true }));

    // Act
    const { UNSAFE_queryByType } = render(<RootLayout />);

    // Assert
    expect(UNSAFE_queryByType('mock-desktop-pet' as any)).not.toBeNull();
  });

  it('ARRANGE ACT ASSERT: 未认证用户不显示桌宠', () => {
    // Arrange
    (useCustomFonts as jest.Mock).mockReturnValue(true);
    (useThemeAwareColorScheme as jest.Mock).mockReturnValue('dark');
    jest
      .spyOn(require('../../store/userStore'), 'useUserStore')
      .mockImplementation((selector: any) => selector({ isAuthenticated: false }));

    // Act
    const { UNSAFE_queryByType } = render(<RootLayout />);

    // Assert
    expect(UNSAFE_queryByType('mock-desktop-pet' as any)).toBeNull();
  });

  it('ARRANGE ACT ASSERT: StatusBar 在暗色主题下为 light，在亮色主题下为 dark', () => {
    // Arrange
    (useCustomFonts as jest.Mock).mockReturnValue(true);

    // Act dark
    (useThemeAwareColorScheme as jest.Mock).mockReturnValue('dark');
    const darkRender = render(<RootLayout />);
    const darkBar = darkRender.UNSAFE_getByType('mock-statusbar' as any);
    // Assert dark
    expect(darkBar.props.style).toBe('light');

    // Act light
    darkRender.unmount();
    (useThemeAwareColorScheme as jest.Mock).mockReturnValue('light');
    const lightRender = render(<RootLayout />);
    const lightBar = lightRender.UNSAFE_getByType('mock-statusbar' as any);
    // Assert light
    expect(lightBar.props.style).toBe('dark');
  });

  it('ARRANGE ACT ASSERT: 渲染 Toast 和 Alert 管理器', () => {
    // Arrange
    (useCustomFonts as jest.Mock).mockReturnValue(true);
    (useThemeAwareColorScheme as jest.Mock).mockReturnValue('light');

    // Act
    const { UNSAFE_getByType } = render(<RootLayout />);

    // Assert
    expect(UNSAFE_getByType('mock-toast' as any)).toBeTruthy();
    expect(UNSAFE_getByType('mock-alert' as any)).toBeTruthy();
  });
});
