import { Stack } from 'expo-router';

export default function DetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: '返回',
      }}
    />
  );
}
