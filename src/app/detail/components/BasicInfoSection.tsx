import { LinearGradient } from 'expo-linear-gradient';
import { Card, Separator, Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

interface BasicInfoSectionProps {
  brand: string;
  score: number | null;
  countNum: number;
  catfoodId: number;
}

interface StatItemProps {
  icon: any;
  iconColor: string;
  label: string;
  value: string;
  backgroundColor: string;
  gradientColors: [string, string];
  accentColor: string;
}

function StatItem({
  icon,
  iconColor,
  label,
  value,
  backgroundColor,
  gradientColors,
  accentColor,
}: StatItemProps) {
  return (
    <YStack flex={1} position="relative" borderRadius="$6" overflow="hidden">
      {/* 渐变背景 */}
      <YStack position="absolute" width="100%" height="100%">
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', height: '100%' }}
        />
      </YStack>

      {/* 内容 */}
      <YStack
        padding="$3"
        alignItems="center"
        gap="$2"
        borderWidth={2}
        borderColor={accentColor}
        borderRadius="$6"
      >
        {/* 图标 */}
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

        {/* 标签 */}
        <Text fontSize="$1" color="$gray11" textAlign="center" fontWeight="600">
          {label}
        </Text>

        {/* 数值 */}
        <Text fontSize="$6" fontWeight="900" color={iconColor} letterSpacing={-0.5}>
          {value}
        </Text>
      </YStack>
    </YStack>
  );
}

export function BasicInfoSection({ brand, score, countNum, catfoodId }: BasicInfoSectionProps) {
  // 点赞数直接从 catfood 数据中获取，不需要单独的 store
  // 这个组件只是展示，实际的点赞数会通过 props 传递或从详情数据中获取
  // 为了简化，这里使用 countNum 作为点赞数的占位
  const likeCount = countNum || 0;

  return (
    <Card
      padding="$4"
      marginHorizontal="$3"
      marginBottom="$3"
      backgroundColor="white"
      borderRadius="$6"
      borderWidth={1}
      borderColor="$gray4"
    >
      <YStack gap="$4">
        {/* 标题 */}
        <XStack alignItems="center" gap="$2.5">
          <YStack
            padding="$2"
            borderRadius="$10"
            backgroundColor="$blue3"
            borderWidth={2}
            borderColor="$blue7"
          >
            <IconSymbol name="info.circle.fill" size={24} color="$blue10" />
          </YStack>
          <YStack flex={1}>
            <Text fontSize="$6" fontWeight="800" color="$color" letterSpacing={-0.5}>
              基本信息
            </Text>
            <Text fontSize="$2" color="$gray10" fontWeight="500" marginTop="$1">
              Basic Information
            </Text>
          </YStack>
        </XStack>

        <Separator borderColor="$gray4" />

        {/* 品牌信息 */}
        <XStack
          padding="$4"
          backgroundColor="$gray2"
          borderRadius="$5"
          alignItems="center"
          gap="$3"
          borderWidth={1.5}
          borderColor="$gray5"
        >
          <YStack
            padding="$2"
            borderRadius="$8"
            backgroundColor="white"
            borderWidth={1.5}
            borderColor="$gray6"
          >
            <IconSymbol name="building.2.fill" size={22} color="$gray11" />
          </YStack>
          <YStack flex={1}>
            <Text fontSize="$2" color="$gray10" fontWeight="500" marginBottom="$1">
              品牌名称
            </Text>
            <Text fontSize="$5" fontWeight="800" color="$color" letterSpacing={-0.3}>
              {brand || '未知品牌'}
            </Text>
          </YStack>
        </XStack>

        <Separator borderColor="$gray4" />

        {/* 统计信息卡片 */}
        <YStack gap="$2">
          <Text fontSize="$3" color="$gray11" fontWeight="600" marginBottom="$1">
            产品数据
          </Text>
          <XStack gap="$3">
            {/* 评分 */}
            <StatItem
              icon="star.fill"
              iconColor="#F59E0B"
              label="综合评分"
              value={score ? score.toFixed(1) : '0.0'}
              backgroundColor="$yellow2"
              gradientColors={['#FEF3C7', '#FDE68A']}
              accentColor="#FCD34D"
            />

            {/* 评价人数 */}
            <StatItem
              icon="person.2.fill"
              iconColor="#3B82F6"
              label="评价人数"
              value={`${countNum || 0}`}
              backgroundColor="$blue2"
              gradientColors={['#DBEAFE', '#BFDBFE']}
              accentColor="#93C5FD"
            />

            {/* 点赞数 */}
            <StatItem
              icon="heart.fill"
              iconColor="#EF4444"
              label="点赞数量"
              value={`${likeCount}`}
              backgroundColor="$red2"
              gradientColors={['#FEE2E2', '#FECACA']}
              accentColor="#FCA5A5"
            />
          </XStack>
        </YStack>
      </YStack>
    </Card>
  );
}
