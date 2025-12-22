/**
 * 统计信息栏 - 显示筛选结果数量和排序方式
 */
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface StatisticsBarProps {
  searchQuery: string;
  selectedBrand: string;
  filteredCount: number;
  totalCount: number;
  sortBy: 'score' | 'likes';
}

export function StatisticsBar({
  searchQuery,
  selectedBrand,
  filteredCount,
  totalCount,
  sortBy,
}: StatisticsBarProps) {
  const colors = useThemeColors();
  const hasFilter = searchQuery.trim() || selectedBrand !== 'all';

  return (
    <XStack
      paddingHorizontal="$4"
      paddingVertical="$3"
      alignItems="center"
      justifyContent="space-between"
      backgroundColor={colors.cardBackground as any}
      borderTopWidth={1}
      borderTopColor={colors.borderMuted as any}
    >
      <XStack alignItems="center" gap="$2.5">
        <YStack
          width={32}
          height={32}
          borderRadius="$8"
          backgroundColor={colors.backgroundMuted as any}
          alignItems="center"
          justifyContent="center"
        >
          <IconSymbol name="list.bullet" size={18} color={colors.primary} />
        </YStack>
        {hasFilter ? (
          <Text fontSize={14} color={colors.textSecondary as any} fontWeight="600">
            找到{' '}
            <Text fontWeight="800" color={colors.primary as any} fontSize={15}>
              {filteredCount}
            </Text>{' '}
            个结果
            {filteredCount > 0 && totalCount > 0 && (
              <Text color={colors.textTertiary as any} fontSize={13}>
                {' '}
                / 共 {totalCount} 个
              </Text>
            )}
          </Text>
        ) : (
          <Text fontSize={14} color={colors.textSecondary as any} fontWeight="600">
            共{' '}
            <Text fontWeight="800" color={colors.primary as any} fontSize={15}>
              {filteredCount}
            </Text>{' '}
            个优质猫粮
          </Text>
        )}
      </XStack>

      {/* 排序指示器 */}
      <XStack
        alignItems="center"
        gap="$2"
        paddingHorizontal="$3"
        paddingVertical="$2"
        backgroundColor={colors.backgroundSubtle as any}
        borderRadius="$8"
        borderWidth={1}
        borderColor={colors.borderMuted as any}
      >
        <IconSymbol
          name="chart.line.uptrend.xyaxis"
          size={14}
          color={sortBy === 'score' ? colors.warning : colors.error}
        />
        <Text fontSize={13} color={colors.textSecondary as any} fontWeight="700">
          {sortBy === 'score' ? '按评分' : '按点赞'}
        </Text>
      </XStack>
    </XStack>
  );
}
