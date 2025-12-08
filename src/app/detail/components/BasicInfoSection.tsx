import { LinearGradient } from 'expo-linear-gradient';
import { Card, Separator, Text, XStack, YStack } from 'tamagui';
import { IconSymbol, type SymbolName } from '@/src/components/ui/IconSymbol';
import { warningScale, infoScale, errorScale, neutralScale } from '@/src/design-system/tokens';

interface BasicInfoSectionProps {
  brand: string;
  score: number | null;
  countNum: number;
  catfoodId: number;
}

interface StatItemProps {
  icon: SymbolName;
  iconColor: string;
  label: string;
  value: string;
  gradientColors: [string, string];
  accentColor: string;
}

function StatItem({ icon, iconColor, label, value, gradientColors, accentColor }: StatItemProps) {
  return (
    <YStack flex={1} position="relative" borderRadius="$6" overflow="hidden">
      <YStack position="absolute" width="100%" height="100%">
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', height: '100%' }}
        />
      </YStack>

      <YStack
        padding="$3"
        alignItems="center"
        gap="$2"
        borderWidth={2}
        borderColor={accentColor}
        borderRadius="$6"
      >
        <YStack
          width={44}
          height={44}
          borderRadius="$8"
          backgroundColor="white"
          borderWidth={2}
          borderColor={accentColor}
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <IconSymbol name={icon} size={24} color={iconColor} />
        </YStack>

        <Text fontSize="$1" color={neutralScale.neutral10} textAlign="center" fontWeight="600">
          {label}
        </Text>

        <Text fontSize="$6" fontWeight="900" color={iconColor} letterSpacing={-0.5}>
          {value}
        </Text>
      </YStack>
    </YStack>
  );
}

export function BasicInfoSection({ brand, score, countNum }: BasicInfoSectionProps) {
  const likeCount = countNum || 0;

  return (
    <Card
      padding="$4"
      marginHorizontal="$3"
      marginBottom="$3"
      backgroundColor="white"
      borderRadius="$6"
      borderWidth={1}
      borderColor={neutralScale.neutral3}
    >
      <YStack gap="$4">
        <XStack alignItems="center" gap="$2.5">
          <YStack
            padding="$2"
            borderRadius="$10"
            backgroundColor={infoScale.info2}
            borderWidth={2}
            borderColor={infoScale.info6}
          >
            <IconSymbol name="info.circle.fill" size={24} color={infoScale.info9} />
          </YStack>
          <YStack flex={1}>
            <Text fontSize="$6" fontWeight="800" color="$foreground" letterSpacing={-0.5}>
              基本信息
            </Text>
            <Text fontSize="$2" color={neutralScale.neutral9} fontWeight="500" marginTop="$1">
              Basic Information
            </Text>
          </YStack>
        </XStack>

        <Separator borderColor={neutralScale.neutral3} />

        <XStack
          padding="$4"
          backgroundColor={neutralScale.neutral1}
          borderRadius="$5"
          alignItems="center"
          gap="$3"
          borderWidth={1.5}
          borderColor={neutralScale.neutral4}
        >
          <YStack
            padding="$2"
            borderRadius="$8"
            backgroundColor="white"
            borderWidth={1.5}
            borderColor={neutralScale.neutral5}
          >
            <IconSymbol name="building.2.fill" size={22} color={neutralScale.neutral10} />
          </YStack>
          <YStack flex={1}>
            <Text fontSize="$2" color={neutralScale.neutral9} fontWeight="500" marginBottom="$1">
              品牌名称
            </Text>
            <Text fontSize="$5" fontWeight="800" color="$foreground" letterSpacing={-0.3}>
              {brand || '未知品牌'}
            </Text>
          </YStack>
        </XStack>

        <Separator borderColor={neutralScale.neutral3} />

        <YStack gap="$2">
          <Text fontSize="$3" color={neutralScale.neutral10} fontWeight="600" marginBottom="$1">
            产品数据
          </Text>
          <XStack gap="$3">
            <StatItem
              icon="star.fill"
              iconColor={warningScale.warning8}
              label="综合评分"
              value={score ? score.toFixed(1) : '0.0'}
              gradientColors={[warningScale.warning2, warningScale.warning3]}
              accentColor={warningScale.warning5}
            />

            <StatItem
              icon="person.2.fill"
              iconColor={infoScale.info8}
              label="评价人数"
              value={`${countNum || 0}`}
              gradientColors={[infoScale.info2, infoScale.info3]}
              accentColor={infoScale.info5}
            />

            <StatItem
              icon="heart.fill"
              iconColor={errorScale.error8}
              label="点赞数量"
              value={`${likeCount}`}
              gradientColors={[errorScale.error2, errorScale.error3]}
              accentColor={errorScale.error5}
            />
          </XStack>
        </YStack>
      </YStack>
    </Card>
  );
}
