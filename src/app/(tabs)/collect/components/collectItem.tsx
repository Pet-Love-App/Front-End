/**
 * 猫粮收藏列表项 - 展示收藏的猫粮信息
 */
import { Image } from 'react-native';
import { Card, Separator, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useResponsive } from '@/src/hooks/useResponsive';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';
import type { CatfoodFavorite } from '@/src/types/collect';
import { successScale, infoScale, warningScale, errorScale } from '@/src/design-system/tokens';

interface CollectListItemProps {
  favorite: CatfoodFavorite;
  onDelete?: (favoriteId: string, catfoodId: string) => void;
}

// 格式化日期为相对时间
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 月前`;
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// 根据分数获取颜色
function getScoreColor(score: number) {
  if (score >= 90) return successScale.success9;
  if (score >= 75) return infoScale.info9;
  if (score >= 60) return warningScale.warning9;
  return errorScale.error9;
}

export default function CollectListItem({ favorite, onDelete }: CollectListItemProps) {
  const { catfood } = favorite;
  const { sf, sw, isSmall, spacing, fontSize: fs, iconSize } = useResponsive();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

  if (!catfood) return null;

  const scoreColor = catfood.score != null ? getScoreColor(catfood.score) : null;

  // 响应式图片尺寸
  const imageSize = isSmall ? sw(70) : sw(80);

  return (
    <Card
      size="$4"
      bordered
      borderColor={colors.border as any}
      backgroundColor={colors.cardBackground as any}
    >
      <Card.Header padding={spacing.lg as any}>
        <XStack gap={spacing.md as any} alignItems="center">
          {/* 猫粮图片 */}
          <YStack
            borderRadius="$3"
            overflow="hidden"
            borderWidth={1}
            borderColor={colors.border as any}
          >
            {catfood.imageUrl ? (
              <Image
                source={{ uri: catfood.imageUrl }}
                style={{ width: imageSize, height: imageSize, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : (
              <YStack
                width={imageSize}
                height={imageSize}
                backgroundColor={colors.backgroundMuted as any}
                alignItems="center"
                justifyContent="center"
              >
                <IconSymbol name="photo" size={iconSize.xl} color={colors.textTertiary} />
              </YStack>
            )}
          </YStack>

          {/* 猫粮信息 */}
          <YStack flex={1} gap="$1">
            <Text
              fontSize={isSmall ? fs.lg : fs.xl}
              fontWeight="700"
              color={colors.text as any}
              numberOfLines={2}
            >
              {catfood.name}
            </Text>
            {catfood.brand && (
              <XStack alignItems="center" gap="$1">
                <IconSymbol name="building.2" size={iconSize.sm} color={colors.textSecondary} />
                <Text fontSize={fs.md} color={colors.textSecondary as any} numberOfLines={1}>
                  {catfood.brand}
                </Text>
              </XStack>
            )}
            <XStack alignItems="center" gap="$1" marginTop="$1">
              <IconSymbol name="clock" size={iconSize.sm} color={colors.textTertiary} />
              <Text fontSize={fs.sm} color={colors.textTertiary as any}>
                收藏于 {formatDate(favorite.createdAt)}
              </Text>
            </XStack>
          </YStack>

          {/* 评分显示 */}
          {catfood.score != null && scoreColor && (
            <YStack alignItems="center" gap="$1" minWidth={sw(60)}>
              <YStack
                backgroundColor={(scoreColor + '15') as any}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$4"
                borderWidth={2}
                borderColor={scoreColor as any}
              >
                <Text fontSize={isSmall ? fs.xxl : fs.xxxl} fontWeight="800" color={scoreColor}>
                  {catfood.score}
                </Text>
              </YStack>
              <Text fontSize={fs.sm} color={colors.textSecondary as any} fontWeight="500">
                综合评分
              </Text>
            </YStack>
          )}
        </XStack>
      </Card.Header>

      {onDelete && (
        <>
          <Separator borderColor={colors.borderMuted as any} />
          <Card.Footer padding="$3" paddingTop="$2">
            <XStack justifyContent="flex-end" width="100%" alignItems="center">
              <Button
                size="$3"
                backgroundColor={colors.backgroundMuted as any}
                borderWidth={1}
                borderColor={colors.border as any}
                color={colors.textSecondary as any}
                paddingHorizontal="$4"
                height={sw(36)}
                icon={<IconSymbol name="heart.slash" size={iconSize.md} color={colors.error} />}
                onPress={() => onDelete(favorite.id, catfood.id)}
                pressStyle={{
                  scale: 0.97,
                  opacity: 0.8,
                  backgroundColor: colors.errorMuted as any,
                }}
              >
                <Text fontSize={fs.md} fontWeight="600" color={colors.error as any}>
                  取消收藏
                </Text>
              </Button>
            </XStack>
          </Card.Footer>
        </>
      )}
    </Card>
  );
}
