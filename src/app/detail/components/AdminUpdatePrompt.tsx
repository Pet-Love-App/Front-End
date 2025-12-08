import { router } from 'expo-router';
import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale } from '@/src/design-system/tokens';

interface AdminUpdatePromptProps {
  catfoodId: number;
  catfoodName: string;
}

export function AdminUpdatePrompt({ catfoodId, catfoodName }: AdminUpdatePromptProps) {
  const handleUpdateIngredients = () => {
    router.push({
      pathname: '/(tabs)/scanner',
      params: {
        catfoodId: String(catfoodId),
        catfoodName,
        scanType: 'ingredients',
      },
    });
  };

  return (
    <Card
      size="$2"
      bordered
      backgroundColor={primaryScale.primary2}
      borderColor={primaryScale.primary5}
      marginHorizontal="$3"
      marginBottom="$3"
      paddingVertical="$3"
      paddingHorizontal="$3.5"
      borderRadius="$4"
      borderWidth={1.5}
    >
      <YStack gap="$2.5">
        <XStack alignItems="center" gap="$2">
          <IconSymbol name="crown.fill" size={18} color={primaryScale.primary9} />
          <Text fontSize="$3" color={primaryScale.primary10} fontWeight="700">
            管理员权限
          </Text>
        </XStack>

        <Text fontSize="$2" color={primaryScale.primary10} lineHeight={18}>
          可以重新扫描并覆盖更新已有的营养成分数据
        </Text>

        <XStack
          paddingVertical="$2.5"
          paddingHorizontal="$3.5"
          backgroundColor={primaryScale.primary8}
          borderRadius="$3"
          alignItems="center"
          justifyContent="center"
          gap="$2"
          pressStyle={{
            opacity: 0.8,
            scale: 0.98,
          }}
          onPress={handleUpdateIngredients}
        >
          <IconSymbol name="arrow.triangle.2.circlepath" size={18} color="white" />
          <Text fontSize="$3" color="white" fontWeight="700">
            重新扫描更新
          </Text>
        </XStack>
      </YStack>
    </Card>
  );
}
