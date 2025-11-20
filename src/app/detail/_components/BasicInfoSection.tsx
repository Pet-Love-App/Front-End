import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useLikeStore } from '@/src/store/likeStore';
import { useEffect, useState } from 'react';
import { Card, Separator, Text, XStack, YStack } from 'tamagui';

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
}

function StatItem({ icon, iconColor, label, value, backgroundColor }: StatItemProps) {
  return (
    <YStack
      flex={1}
      padding="$3"
      backgroundColor={backgroundColor}
      borderRadius="$4"
      alignItems="center"
      gap="$2"
      borderWidth={1}
      borderColor="$borderColor"
    >
      <IconSymbol name={icon} size={24} color={iconColor} />
      <Text fontSize="$2" color="$gray10" textAlign="center">
        {label}
      </Text>
      <Text fontSize="$6" fontWeight="bold" color="$color">
        {value}
      </Text>
    </YStack>
  );
}

export function BasicInfoSection({ brand, score, countNum, catfoodId }: BasicInfoSectionProps) {
  const getLikeCount = useLikeStore((state) => state.getLikeCount);
  // 直接从 store 中读取缓存的点赞数（会自动响应变化）
  const cachedLikeCount = useLikeStore((state) => state.likeCounts[catfoodId]);
  const [likeCount, setLikeCount] = useState(cachedLikeCount || 0);

  // 初始加载时获取点赞数
  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const count = await getLikeCount(catfoodId);
        setLikeCount(count);
      } catch (error) {
        console.error('获取点赞数失败:', error);
      }
    };
    fetchLikeCount();
  }, [catfoodId, getLikeCount]);

  // 监听 store 中的点赞数变化，自动更新
  useEffect(() => {
    if (cachedLikeCount !== undefined) {
      setLikeCount(cachedLikeCount);
    }
  }, [cachedLikeCount]);

  return (
    <Card
      elevate
      padding="$4"
      marginHorizontal="$4"
      marginBottom="$3"
      backgroundColor="$background"
      borderRadius="$5"
    >
      <YStack gap="$3">
        {/* 标题 */}
        <XStack alignItems="center" gap="$2" marginBottom="$2">
          <IconSymbol name="info.circle.fill" size={20} color="$blue10" />
          <Text fontSize="$6" fontWeight="bold" color="$color">
            基本信息
          </Text>
        </XStack>

        {/* 品牌信息 */}
        <XStack
          padding="$3"
          backgroundColor="$gray2"
          borderRadius="$3"
          alignItems="center"
          gap="$2"
        >
          <IconSymbol name="building.2.fill" size={18} color="$gray11" />
          <Text fontSize="$3" color="$gray11">
            品牌：
          </Text>
          <Text fontSize="$4" fontWeight="600" color="$color">
            {brand || '未知品牌'}
          </Text>
        </XStack>

        <Separator />

        {/* 统计信息卡片 */}
        <XStack gap="$3">
          {/* 评分 */}
          <StatItem
            icon="star.fill"
            iconColor="$yellow9"
            label="评分"
            value={score ? score.toFixed(1) : '0.0'}
            backgroundColor="$yellow2"
          />

          {/* 评价人数 */}
          <StatItem
            icon="person.2.fill"
            iconColor="$blue9"
            label="评价人数"
            value={`${countNum || 0}`}
            backgroundColor="$blue2"
          />

          {/* 点赞数 */}
          <StatItem
            icon="heart.fill"
            iconColor="$red9"
            label="点赞数"
            value={`${likeCount}`}
            backgroundColor="$red2"
          />
        </XStack>
      </YStack>
    </Card>
  );
}
