/**
 * 基本信息区域组件 - 现代购物App风格
 * 精美的产品数据展示
 */
import { LinearGradient } from 'expo-linear-gradient';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol, type SymbolName } from '@/src/components/ui/IconSymbol';
import {
  warningScale,
  infoScale,
  errorScale,
  neutralScale,
  primaryScale,
} from '@/src/design-system/tokens';

interface BasicInfoSectionProps {
  brand: string;
  score: number | null;
  countNum: number;
  catfoodId: number;
}

interface StatCardProps {
  icon: SymbolName;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: string;
  unit?: string;
  valueColor: string;
  bgGradient: readonly [string, string];
}

function StatCard({
  icon,
  iconBgColor,
  iconColor,
  label,
  value,
  unit,
  valueColor,
  bgGradient,
}: StatCardProps) {
  return (
    <YStack flex={1} borderRadius={16} overflow="hidden">
      <LinearGradient
        colors={bgGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          padding: 16,
          alignItems: 'center',
          gap: 10,
          borderRadius: 16,
        }}
      >
        {/* 图标容器 */}
        <YStack
          width={48}
          height={48}
          borderRadius={24}
          backgroundColor={iconBgColor}
          alignItems="center"
          justifyContent="center"
        >
          <IconSymbol name={icon} size={24} color={iconColor} />
        </YStack>

        {/* 数值 */}
        <XStack alignItems="baseline" gap={2}>
          <Text fontSize={28} fontWeight="900" color={valueColor} letterSpacing={-1}>
            {value}
          </Text>
          {unit && (
            <Text fontSize={12} fontWeight="600" color={valueColor} opacity={0.7}>
              {unit}
            </Text>
          )}
        </XStack>

        {/* 标签 */}
        <Text fontSize={12} color={neutralScale.neutral8} fontWeight="600">
          {label}
        </Text>
      </LinearGradient>
    </YStack>
  );
}

export function BasicInfoSection({ brand, score, countNum }: BasicInfoSectionProps) {
  const likeCount = countNum || 0;

  return (
    <YStack
      marginHorizontal="$3"
      marginBottom="$3"
      borderRadius={20}
      backgroundColor="white"
      overflow="hidden"
      borderWidth={1}
      borderColor={neutralScale.neutral3}
    >
      {/* 品牌信息 */}
      <XStack
        padding="$4"
        alignItems="center"
        gap="$3"
        borderBottomWidth={1}
        borderBottomColor={neutralScale.neutral2}
      >
        <YStack
          width={48}
          height={48}
          borderRadius={24}
          backgroundColor={primaryScale.primary2}
          alignItems="center"
          justifyContent="center"
        >
          <IconSymbol name="building.2.fill" size={22} color={primaryScale.primary8} />
        </YStack>
        <YStack flex={1} gap={2}>
          <Text fontSize={11} color={neutralScale.neutral8} fontWeight="500">
            品牌
          </Text>
          <Text fontSize="$5" fontWeight="800" color={neutralScale.neutral12} letterSpacing={-0.3}>
            {brand || '未知品牌'}
          </Text>
        </YStack>
        <YStack
          backgroundColor={primaryScale.primary2}
          paddingHorizontal="$3"
          paddingVertical="$1.5"
          borderRadius={20}
        >
          <Text fontSize={11} fontWeight="700" color={primaryScale.primary9}>
            官方认证
          </Text>
        </YStack>
      </XStack>

      {/* 产品数据统计 */}
      <YStack padding="$4" gap="$4">
        <XStack alignItems="center" gap="$2">
          <YStack width={4} height={16} borderRadius={2} backgroundColor={primaryScale.primary7} />
          <Text fontSize="$4" fontWeight="700" color={neutralScale.neutral11}>
            产品数据
          </Text>
        </XStack>

        <XStack gap="$3">
          <StatCard
            icon="star.fill"
            iconBgColor={warningScale.warning3}
            iconColor={warningScale.warning8}
            label="综合评分"
            value={score ? score.toFixed(1) : '0.0'}
            valueColor={warningScale.warning9}
            bgGradient={[warningScale.warning1, '#FFFFFF']}
          />

          <StatCard
            icon="person.2.fill"
            iconBgColor={infoScale.info3}
            iconColor={infoScale.info8}
            label="评价人数"
            value={`${countNum || 0}`}
            unit="人"
            valueColor={infoScale.info9}
            bgGradient={[infoScale.info1, '#FFFFFF']}
          />

          <StatCard
            icon="heart.fill"
            iconBgColor={errorScale.error3}
            iconColor={errorScale.error7}
            label="获赞数量"
            value={`${likeCount}`}
            valueColor={errorScale.error8}
            bgGradient={[errorScale.error1, '#FFFFFF']}
          />
        </XStack>
      </YStack>
    </YStack>
  );
}
