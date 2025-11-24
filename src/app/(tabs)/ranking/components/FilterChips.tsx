import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Pressable, ScrollView } from 'react-native';
import { Text, XStack } from 'tamagui';

interface FilterChipsProps {
  sortBy: 'score' | 'likes';
  selectedBrand: string;
  onSortChange: (sort: 'score' | 'likes') => void;
  onResetFilters: () => void;
  onToggleBrandMenu: () => void;
  brandMenuExpanded: boolean;
}

/**
 * 快捷筛选标签组件
 * 用于排序和品牌筛选
 */
export function FilterChips({
  sortBy,
  selectedBrand,
  onSortChange,
  onResetFilters,
  onToggleBrandMenu,
  brandMenuExpanded,
}: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 10,
      }}
    >
      {/* 综合推荐 */}
      <Pressable onPress={onResetFilters}>
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$2.5"
          borderRadius="$12"
          backgroundColor={sortBy === 'score' && selectedBrand === 'all' ? '#FFF5ED' : 'white'}
          borderWidth={2}
          borderColor={sortBy === 'score' && selectedBrand === 'all' ? '#FEBE98' : '#E5E7EB'}
          gap="$2"
          alignItems="center"
        >
          <IconSymbol
            name="sparkles"
            size={16}
            color={sortBy === 'score' && selectedBrand === 'all' ? '#FEBE98' : '#6B7280'}
          />
          <Text
            fontSize={14}
            fontWeight="700"
            color={sortBy === 'score' && selectedBrand === 'all' ? '#1E40AF' : '#4B5563'}
            letterSpacing={0.3}
          >
            综合推荐
          </Text>
        </XStack>
      </Pressable>

      {/* 高评分 */}
      <Pressable onPress={() => onSortChange('score')}>
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$2.5"
          borderRadius="$12"
          backgroundColor={sortBy === 'score' ? '#FEF3C7' : 'white'}
          borderWidth={2}
          borderColor={sortBy === 'score' ? '#F59E0B' : '#E5E7EB'}
          gap="$2"
          alignItems="center"
        >
          <IconSymbol
            name="star.fill"
            size={16}
            color={sortBy === 'score' ? '#F59E0B' : '#6B7280'}
          />
          <Text
            fontSize={14}
            fontWeight="700"
            color={sortBy === 'score' ? '#D97706' : '#4B5563'}
            letterSpacing={0.3}
          >
            高评分
          </Text>
        </XStack>
      </Pressable>

      {/* 最受欢迎 */}
      <Pressable onPress={() => onSortChange('likes')}>
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$2.5"
          borderRadius="$12"
          backgroundColor={sortBy === 'likes' ? '#FEE2E2' : 'white'}
          borderWidth={2}
          borderColor={sortBy === 'likes' ? '#EF4444' : '#E5E7EB'}
          gap="$2"
          alignItems="center"
        >
          <IconSymbol
            name="heart.fill"
            size={16}
            color={sortBy === 'likes' ? '#EF4444' : '#6B7280'}
          />
          <Text
            fontSize={14}
            fontWeight="700"
            color={sortBy === 'likes' ? '#DC2626' : '#4B5563'}
            letterSpacing={0.3}
          >
            最受欢迎
          </Text>
        </XStack>
      </Pressable>

      {/* 品牌筛选 */}
      <Pressable onPress={onToggleBrandMenu}>
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$2.5"
          borderRadius="$12"
          backgroundColor={selectedBrand !== 'all' ? '#FFEDD5' : 'white'}
          borderWidth={2}
          borderColor={selectedBrand !== 'all' ? '#F97316' : '#E5E7EB'}
          gap="$2"
          alignItems="center"
        >
          <IconSymbol
            name="building.2.fill"
            size={16}
            color={selectedBrand !== 'all' ? '#F97316' : '#6B7280'}
          />
          <Text
            fontSize={14}
            fontWeight="700"
            color={selectedBrand !== 'all' ? '#EA580C' : '#4B5563'}
            letterSpacing={0.3}
            numberOfLines={1}
            maxWidth={120}
          >
            {selectedBrand === 'all' ? '品牌' : selectedBrand}
          </Text>
          <IconSymbol
            name={brandMenuExpanded ? 'chevron.up' : 'chevron.down'}
            size={14}
            color={selectedBrand !== 'all' ? '#F97316' : '#6B7280'}
          />
        </XStack>
      </Pressable>
    </ScrollView>
  );
}
