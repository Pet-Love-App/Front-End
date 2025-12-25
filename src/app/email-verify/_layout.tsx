/**
 * 邮箱验证页面布局
 */
import { Stack } from 'expo-router';

export default function EmailVerifyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="waiting" />
    </Stack>
  );
}
