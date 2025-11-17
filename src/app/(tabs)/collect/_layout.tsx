import { Stack } from 'expo-router';

export default function ScannerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        title: '我的报告库',
      }}
    />
  );
}
