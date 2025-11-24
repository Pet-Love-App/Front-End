import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Text, XStack, YStack } from 'tamagui';

interface StatisticsBarProps {
  searchQuery: string;
  selectedBrand: string;
  filteredCount: number;
  totalCount: number;
  sortBy: 'score' | 'likes';
}

/**
 * 统计信息栏组件
 * 显示筛选结果数量和排序方式
 */
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
      borderTopColor="#F3F4F6"
    >
      <XStack alignItems="center" gap="$2.5">
        <YStack
          width={32}
          height={32}
          borderRadius="$8"
          backgroundColor="#F3F4F6"
          alignItems="center"
          justifyContent="center"
        >
          <IconSymbol name="list.bullet" size={18} color="#FEBE98" />
        </YStack>
        {hasFilter ? (
          <Text fontSize={14} color="#4B5563" fontWeight="600">
            找到{' '}
            <Text fontWeight="800" color="#FEBE98" fontSize={15}>
              {filteredCount}
            </Text>{' '}
            个结果
            {filteredCount > 0 && totalCount > 0 && (
              <Text color="#9CA3AF" fontSize={13}>
                {' '}
                / 共 {totalCount} 个
              </Text>
            )}
          </Text>
        ) : (
          <Text fontSize={14} color="#4B5563" fontWeight="600">
            共{' '}
            <Text fontWeight="800" color="#FEBE98" fontSize={15}>
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
        backgroundColor="#F9FAFB"
        borderRadius="$8"
        borderWidth={1}
        borderColor="#E5E7EB"
      >
        <IconSymbol
          name="arrow.up.arrow.down"
          size={14}
          color={sortBy === 'score' ? '#F59E0B' : '#EF4444'}
        />
        <Text fontSize={13} color="#374151" fontWeight="700">
          {sortBy === 'score' ? '按评分' : '按点赞'}
        </Text>
      </XStack>
    </XStack>
  );
}
