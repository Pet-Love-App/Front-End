import { tamaguiConfig } from '@/tamagui.config';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PortalProvider } from '@tamagui/portal';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider } from 'tamagui';

import { useCustomFonts } from '../hooks/useFonts';
import { useThemeAwareColorScheme } from '../hooks/useThemeAwareColorScheme';
import { useDeepLink } from '../hooks/useDeepLink';
import { DesktopPet } from '../components/DesktopPet';
import { ToastManager, AlertManager } from '../components/dialogs';
import { DismissKeyboardView } from '../components/DismissKeyboardView';
import { useUserStore } from '../store/userStore';

SplashScreen.preventAutoHideAsync();

// 移除默认锚点，让应用从 index 开始
// export const unstable_settings = {
//   anchor: '(tabs)',
// };

export default function RootLayout() {
  const colorScheme = useThemeAwareColorScheme();
  const fontsLoaded = useCustomFonts();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  // 处理深度链接（邮箱验证、密码重置回调）
  useDeepLink();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider testID="app-root">
      <TamaguiProvider config={tamaguiConfig}>
        <PortalProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <DismissKeyboardView>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" options={{ headerShown: false }} />
              </Stack>
              {/* 只有登录后才显示桌宠 */}
              {isAuthenticated && <DesktopPet />}
              <ToastManager />
              <AlertManager />
              <StatusBar
                style={colorScheme === 'dark' ? 'light' : 'dark'}
                translucent
                backgroundColor="transparent"
              />
            </DismissKeyboardView>
          </ThemeProvider>
        </PortalProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}
