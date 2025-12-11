import { Stack } from 'expo-router';

export default function DetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        presentation: 'card',
        animation: 'slide_from_right',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerShadowVisible: false,
        headerTintColor: '#333',
        headerBackTitle: '返回',
      }}
    />
  );
}
