import { Pressable, ScrollView } from 'react-native';
import { Text, XStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';

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
  const colors = useThemeColors();
  const isDark = useIsDarkMode();

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
          backgroundColor={
            (sortBy === 'score' && selectedBrand === 'all'
              ? colors.selected
              : colors.cardBackground) as any
          }
          borderWidth={2}
          borderColor={
            (sortBy === 'score' && selectedBrand === 'all' ? colors.primary : colors.border) as any
          }
          alignItems="center"
        >
          <Text
            fontSize={14}
            fontWeight="700"
            color={
              (sortBy === 'score' && selectedBrand === 'all'
                ? colors.primary
                : colors.textSecondary) as any
            }
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
          backgroundColor={
            (sortBy === 'score' ? colors.warningMuted : colors.cardBackground) as any
          }
          borderWidth={2}
          borderColor={(sortBy === 'score' ? colors.warning : colors.border) as any}
          alignItems="center"
        >
          <Text
            fontSize={14}
            fontWeight="700"
            color={(sortBy === 'score' ? colors.warning : colors.textSecondary) as any}
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
          backgroundColor={(sortBy === 'likes' ? colors.errorMuted : colors.cardBackground) as any}
          borderWidth={2}
          borderColor={(sortBy === 'likes' ? colors.error : colors.border) as any}
          alignItems="center"
        >
          <Text
            fontSize={14}
            fontWeight="700"
            color={(sortBy === 'likes' ? colors.error : colors.textSecondary) as any}
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
          backgroundColor={
            (selectedBrand !== 'all' ? colors.selected : colors.cardBackground) as any
          }
          borderWidth={2}
          borderColor={(selectedBrand !== 'all' ? colors.primary : colors.border) as any}
          gap="$2"
          alignItems="center"
        >
          <Text
            fontSize={14}
            fontWeight="700"
            color={(selectedBrand !== 'all' ? colors.primary : colors.textSecondary) as any}
            letterSpacing={0.3}
            numberOfLines={1}
            maxWidth={120}
          >
            {selectedBrand === 'all' ? '品牌' : selectedBrand}
          </Text>
          <IconSymbol
            name={brandMenuExpanded ? 'chevron.up' : 'chevron.down'}
            size={14}
            color={(selectedBrand !== 'all' ? colors.primary : colors.textTertiary) as any}
          />
        </XStack>
      </Pressable>
    </ScrollView>
  );
}
