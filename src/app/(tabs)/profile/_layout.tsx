import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '个人中心',
        }}
      />
      <Stack.Screen
        name="messages"
        options={{
          title: '消息',
        }}
      />
      <Stack.Screen
        name="chat"
        options={{
          title: '聊天',
        }}
      />
      <Stack.Screen
        name="friends"
        options={{
          title: '我的好友',
        }}
      />
      <Stack.Screen
        name="settings/index"
        options={{
          title: '设置',
        }}
      />
    </Stack>
  );
}
