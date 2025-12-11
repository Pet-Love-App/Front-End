/**
 * AI 报告收藏列表项 - 展示收藏的分析报告
 */
import { Card, Separator, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import type { FavoriteReport } from '@/src/services/api';
import {
  primaryScale,
  successScale,
  infoScale,
  warningScale,
  neutralScale,
} from '@/src/design-system/tokens';

interface ReportCollectItemProps {
  favoriteReport: FavoriteReport;
  onDelete?: (favoriteId: number) => void;
  onPress?: () => void;
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

// 根据标签内容返回对应颜色
function getTagColor(tag: string): string {
  if (tag.includes('高蛋白') || tag.includes('优质')) return successScale.success9;
  if (tag.includes('低碳水') || tag.includes('健康')) return infoScale.info9;
  if (tag.includes('天然') || tag.includes('无添加')) return '#8b5cf6';
  return warningScale.warning9;
}

export default function ReportCollectItem({
  favoriteReport,
  onDelete,
  onPress,
}: ReportCollectItemProps) {
  const { report } = favoriteReport;
  if (!report) return null;

  // 提取营养摘要
  const getNutrientSummary = () => {
    const { percent_data } = report;
    if (!percent_data) return '暂无营养数据';

    const summary = [];
    if (percent_data.crude_protein != null) summary.push(`蛋白质 ${percent_data.crude_protein}%`);
    if (percent_data.crude_fat != null) summary.push(`脂肪 ${percent_data.crude_fat}%`);
    if (percent_data.carbohydrates != null) summary.push(`碳水 ${percent_data.carbohydrates}%`);

    return summary.length > 0 ? summary.slice(0, 3).join(' · ') : '暂无营养数据';
  };

  return (
    <Card
      size="$4"
      bordered
      borderColor={neutralScale.neutral3}
      backgroundColor="white"
      pressStyle={{ scale: 0.98, opacity: 0.95 }}
      animation="quick"
      onPress={onPress}
    >
      <Card.Header padding="$4">
        <YStack gap="$3">
          {/* 头部：名称和时间 */}
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack flex={1} gap="$1.5">
              <Text fontSize={18} fontWeight="700" color="$foreground" numberOfLines={2}>
                {report.catfood_name}
              </Text>
              <XStack alignItems="center" gap="$1">
                <IconSymbol name="clock" size={14} color={neutralScale.neutral7} />
                <Text fontSize={12} color={neutralScale.neutral7}>
                  收藏于 {formatDate(favoriteReport.createdAt)}
                </Text>
              </XStack>
            </YStack>

            {/* 报告图标 */}
            <YStack
              backgroundColor={primaryScale.primary2}
              padding="$2.5"
              borderRadius="$4"
              borderWidth={2}
              borderColor={primaryScale.primary4}
            >
              <IconSymbol name="doc.text.fill" size={24} color={primaryScale.primary7} />
            </YStack>
          </XStack>

          {/* 标签 */}
          {report.tags && report.tags.length > 0 && (
            <XStack gap="$2" flexWrap="wrap">
              {report.tags.slice(0, 4).map((tag: string, index: number) => {
                const tagColor = getTagColor(tag);
                return (
                  <YStack
                    key={index}
                    backgroundColor={tagColor + '15'}
                    paddingHorizontal="$2.5"
                    paddingVertical="$1"
                    borderRadius="$2"
                    borderWidth={1}
                    borderColor={tagColor + '40'}
                  >
                    <Text fontSize={12} fontWeight="600" color={tagColor}>
                      {tag}
                    </Text>
                  </YStack>
                );
              })}
            </XStack>
          )}

          {/* 营养摘要 */}
          {report.percentage && (
            <XStack
              backgroundColor={neutralScale.neutral1}
              padding="$2.5"
              borderRadius="$3"
              alignItems="center"
              gap="$2"
            >
              <IconSymbol name="chart.bar.fill" size={16} color={neutralScale.neutral9} />
              <Text fontSize={13} color={neutralScale.neutral9} flex={1}>
                {getNutrientSummary()}
              </Text>
            </XStack>
          )}

          {/* 安全性摘要 */}
          {report.safety && (
            <YStack gap="$1">
              <Text fontSize={13} fontWeight="600" color="$foreground">
                安全性分析
              </Text>
              <Text fontSize={13} color={neutralScale.neutral9} numberOfLines={2}>
                {report.safety}
              </Text>
            </YStack>
          )}
        </YStack>
      </Card.Header>

      {onDelete && (
        <>
          <Separator borderColor={neutralScale.neutral2} />
          <Card.Footer padding="$3" paddingTop="$2">
            <XStack justifyContent="space-between" width="100%" alignItems="center">
              <XStack alignItems="center" gap="$1.5">
                <IconSymbol name="doc.text.viewfinder" size={14} color={neutralScale.neutral7} />
                <Text fontSize={12} color={neutralScale.neutral7}>
                  ID: {report.id}
                </Text>
              </XStack>
              <Button
                size="$3"
                chromeless
                color={neutralScale.neutral8}
                icon={<IconSymbol name="heart.slash" size={16} color={neutralScale.neutral8} />}
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete(favoriteReport.id);
                }}
                pressStyle={{ scale: 0.95, opacity: 0.7 }}
              >
                取消收藏
              </Button>
            </XStack>
          </Card.Footer>
        </>
      )}
    </Card>
  );
}
