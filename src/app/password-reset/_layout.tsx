import { Stack } from 'expo-router';

export default function PasswordResetLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="verify" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
