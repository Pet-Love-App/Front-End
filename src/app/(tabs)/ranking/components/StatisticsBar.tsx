/**
 * 统计信息栏 - 显示筛选结果数量和排序方式
 */
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { primaryScale, warningScale, errorScale, neutralScale } from '@/src/design-system/tokens';

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
  const hasFilter = searchQuery.trim() || selectedBrand !== 'all';

  return (
    <XStack
      paddingHorizontal="$4"
      paddingVertical="$3"
      alignItems="center"
      justifyContent="space-between"
      backgroundColor="white"
      borderTopWidth={1}
      borderTopColor={neutralScale.neutral2}
    >
      <XStack alignItems="center" gap="$2.5">
        <YStack
          width={32}
          height={32}
          borderRadius="$8"
          backgroundColor={neutralScale.neutral2}
          alignItems="center"
          justifyContent="center"
        >
          <IconSymbol name="list.bullet" size={18} color={primaryScale.primary7} />
        </YStack>
        {hasFilter ? (
          <Text fontSize={14} color={neutralScale.neutral9} fontWeight="600">
            找到{' '}
            <Text fontWeight="800" color={primaryScale.primary7} fontSize={15}>
              {filteredCount}
            </Text>{' '}
            个结果
            {filteredCount > 0 && totalCount > 0 && (
              <Text color={neutralScale.neutral7} fontSize={13}>
                {' '}
                / 共 {totalCount} 个
              </Text>
            )}
          </Text>
        ) : (
          <Text fontSize={14} color={neutralScale.neutral9} fontWeight="600">
            共{' '}
            <Text fontWeight="800" color={primaryScale.primary7} fontSize={15}>
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
        backgroundColor={neutralScale.neutral1}
        borderRadius="$8"
        borderWidth={1}
        borderColor={neutralScale.neutral3}
      >
        <IconSymbol
          name="chart.line.uptrend.xyaxis"
          size={14}
          color={sortBy === 'score' ? warningScale.warning8 : errorScale.error8}
        />
        <Text fontSize={13} color={neutralScale.neutral10} fontWeight="700">
          {sortBy === 'score' ? '按评分' : '按点赞'}
        </Text>
      </XStack>
    </XStack>
  );
}
