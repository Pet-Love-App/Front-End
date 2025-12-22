import React from 'react';
import { render } from '@testing-library/react-native';
import RootLayout from '../_layout';
import { useUserStore } from '../../store/userStore';
import { useCustomFonts } from '../../hooks/useFonts';
import { useThemeAwareColorScheme } from '../../hooks/useThemeAwareColorScheme';
import { useDeepLink } from '../../hooks/useDeepLink';

// Mock dependencies
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => <></>,
}));

jest.mock('expo-router', () => ({
  Stack: Object.assign(({ children }: { children: React.ReactNode }) => <>{children}</>, {
    Screen: () => <></>,
  }),
}));

jest.mock('@tamagui/portal', () => ({
  PortalProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('tamagui', () => ({
  TamaguiProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Theme: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@react-navigation/native', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DarkTheme: {},
  DefaultTheme: {},
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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

jest.mock('../../store/userStore', () => ({
  useUserStore: jest.fn(),
}));

jest.mock('../../components/DesktopPet', () => ({
  DesktopPet: () => <></>,
}));

jest.mock('../../components/dialogs', () => ({
  ToastManager: () => <></>,
  AlertManager: () => <></>,
}));

jest.mock('../../components/DismissKeyboardView', () => ({
  DismissKeyboardView: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/tamagui.config', () => ({
  tamaguiConfig: {},
}));

describe('RootLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useCustomFonts as jest.Mock).mockReturnValue(true);
    (useThemeAwareColorScheme as jest.Mock).mockReturnValue('light');
    (useUserStore as unknown as jest.Mock).mockReturnValue(false);
  });

  it('should render correctly when fonts are loaded', () => {
    const { toJSON } = render(<RootLayout />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('should return null when fonts are not loaded', () => {
    (useCustomFonts as jest.Mock).mockReturnValue(false);
    const { toJSON } = render(<RootLayout />);
    expect(toJSON()).toBeNull();
  });

  it('should call useDeepLink', () => {
    render(<RootLayout />);
    expect(useDeepLink).toHaveBeenCalled();
  });
});
