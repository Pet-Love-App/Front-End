/**
 * 营养信息录入提示 - 引导用户补充缺失的营养数据
 */
import { router } from 'expo-router';
import { Card, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale, neutralScale } from '@/src/design-system/tokens';

interface NutritionInputPromptProps {
  catfoodId: number;
  catfoodName: string;
}

export function NutritionInputPrompt({ catfoodId, catfoodName }: NutritionInputPromptProps) {
  // 跳转到扫描页录入配料表
  const handleScanIngredients = () => {
    router.push({
      pathname: '/(tabs)/scanner',
      params: { catfoodId: String(catfoodId), catfoodName, scanType: 'ingredients' },
    });
  };

  // 跳转到扫描页录入条形码
  const handleScanBarcode = () => {
    router.push({
      pathname: '/(tabs)/scanner',
      params: { catfoodId: String(catfoodId), catfoodName, scanType: 'barcode' },
    });
  };

  return (
    <Card
      size="$2"
      bordered
      backgroundColor={neutralScale.neutral1}
      borderColor={neutralScale.neutral4}
      marginHorizontal="$3"
      marginBottom="$3"
      paddingVertical="$2.5"
      paddingHorizontal="$3"
      borderRadius="$4"
    >
      <YStack gap="$2">
        <XStack alignItems="center" gap="$2">
          <IconSymbol name="info.circle" size={16} color={neutralScale.neutral9} />
          <Text fontSize="$2" color={neutralScale.neutral10} fontWeight="500">
            暂无营养成分信息，帮助完善数据
          </Text>
        </XStack>

        <XStack gap="$2" flexWrap="wrap">
          {/* 录入配料表 */}
          <XStack
            flex={1}
            minWidth={140}
            paddingVertical="$2"
            paddingHorizontal="$3"
            backgroundColor="white"
            borderRadius="$3"
            borderWidth={1.5}
            borderColor={primaryScale.primary4}
            alignItems="center"
            justifyContent="center"
            gap="$1.5"
            pressStyle={{ opacity: 0.7, scale: 0.98 }}
            onPress={handleScanIngredients}
          >
            <IconSymbol name="camera.fill" size={16} color={primaryScale.primary7} />
            <Text fontSize="$2" color={primaryScale.primary7} fontWeight="600">
              拍摄配料表
            </Text>
          </XStack>

          {/* 扫描条形码 */}
          <XStack
            flex={1}
            minWidth={140}
            paddingVertical="$2"
            paddingHorizontal="$3"
            backgroundColor="white"
            borderRadius="$3"
            borderWidth={1.5}
            borderColor={neutralScale.neutral6}
            alignItems="center"
            justifyContent="center"
            gap="$1.5"
            pressStyle={{ opacity: 0.7, scale: 0.98 }}
            onPress={handleScanBarcode}
          >
            <IconSymbol name="barcode.viewfinder" size={16} color={neutralScale.neutral10} />
            <Text fontSize="$2" color={neutralScale.neutral10} fontWeight="600">
              扫描条形码
            </Text>
          </XStack>
        </XStack>
      </YStack>
    </Card>
  );
}
