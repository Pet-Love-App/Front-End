import { useRouter } from 'expo-router';
import { Button, Text, YStack } from 'tamagui';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <YStack f={1} jc="center" ai="center" bg="$background" p="$4">
      <Text fontSize={80} mb="$4">
        🐾
      </Text>
      <Text fontSize="$8" fontWeight="bold" mb="$2">
        页面走丢了
      </Text>
      <Text fontSize="$5" opacity={0.7} mb="$6">
        找不到这个页面
      </Text>

      <Button size="$5" theme="blue" onPress={() => router.push('/(tabs)/collect')}>
        返回首页
      </Button>
    </YStack>
  );
}
