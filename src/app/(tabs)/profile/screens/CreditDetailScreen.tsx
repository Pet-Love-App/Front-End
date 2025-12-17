// src/app/(tabs)/profile/screens/CreditDetailScreen.tsx
import { ScrollView } from 'react-native';
import { YStack, Text, Card, XStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useReputation } from '@/src/hooks/useReputation';
import { REPUTATION_DIMENSIONS } from '@/src/constants/badges';
import { neutralScale } from '@/src/design-system/tokens';

export function CreditDetailScreen() {
  const { reputation, loading } = useReputation();

  if (loading || !reputation) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center">
        <Text>加载中...</Text>
      </YStack>
    );
  }

  return (
    <ScrollView>
      <YStack padding="$4" gap="$4">
        {/* 总分展示 */}
        <Card backgroundColor="white" borderRadius={20} padding="$5">
          <YStack alignItems="center" gap="$2">
            <Text fontSize={48} fontWeight="800" color="#8B5CF6">
              {reputation.score}
            </Text>
            <Text fontSize={16} color={neutralScale.neutral9}>
              信誉总分
            </Text>
          </YStack>
        </Card>

        {/* 各维度详情 */}
        <YStack gap="$3">
          {Object.entries(REPUTATION_DIMENSIONS).map(([key, dimension]) => {
            const value = reputation[key as keyof typeof reputation] as number;
            const percentage = (value / dimension.max) * 100;

            return (
              <Card key={key} backgroundColor="white" borderRadius={16} padding="$4">
                <YStack gap="$3">
                  <XStack alignItems="center" justifyContent="space-between">
                    <XStack alignItems="center" gap="$2">
                      <IconSymbol name={dimension.icon as any} size={20} color={dimension.color} />
                      <Text fontSize={16} fontWeight="600" color={neutralScale.neutral12}>
                        {dimension.label}
                      </Text>
                    </XStack>
                    <Text fontSize={18} fontWeight="700" color={dimension.color}>
                      {value}/{dimension.max}
                    </Text>
                  </XStack>

                  {/* 进度条 */}
                  <YStack
                    height={8}
                    backgroundColor={neutralScale.neutral2}
                    borderRadius={4}
                    overflow="hidden"
                  >
                    <YStack
                      height="100%"
                      width={`${percentage}%`}
                      backgroundColor={dimension.color}
                      borderRadius={4}
                    />
                  </YStack>
                </YStack>
              </Card>
            );
          })}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
