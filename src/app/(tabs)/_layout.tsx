import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';

import { HapticTab } from '@/src/components/HapticTab';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';

export default function TabLayout() {
  const colorScheme = useThemeAwareColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="collect"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarButton: HapticTab,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 65 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 10,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="collect"
        options={{
          title: '收藏',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="doc.text.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: '论坛',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="bubble.left.and.bubble.right.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: '',
          tabBarIcon: ({ color: _color, focused: _focused }) => (
            <View
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: Colors[colorScheme ?? 'light'].scanButtonBackground,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 30,
                borderWidth: 3,
                borderColor: Colors[colorScheme ?? 'light'].scanButtonBorder,
              }}
            >
              <IconSymbol
                size={35}
                name="viewfinder.circle.fill"
                color={Colors[colorScheme ?? 'light'].scanButtonIcon}
              />
              {/* <LottieAnimation
                source={require('@/assets/animations/scan_face.json')}
                width={80}
                height={80}
              /> */}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="ranking"
        options={{
          title: '榜单',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
