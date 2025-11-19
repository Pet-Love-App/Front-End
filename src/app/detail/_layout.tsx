import { Stack } from 'expo-router';

export default function DetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: '返回',
        presentation: 'card',
        animation: 'slide_from_right',
      }}
    />
  );
}
