/**
 * 标签筛选组件
 * 显示可用标签并允许用户选择筛选
 * 性能优化：使用 React.memo 避免不必要的重新渲染
 */

import React from 'react';
import { ScrollView } from 'react-native';
import { Button, Spinner, Text, XStack, YStack } from 'tamagui';
import { ForumColors } from '../constants';
import { useForumTags } from '../hooks/useForumTags';

interface TagFilterProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export const TagFilter = React.memo(function TagFilter({
  selectedTags,
  onTagsChange,
}: TagFilterProps) {
  const { tags, loading } = useForumTags();

  const toggleTag = (name: string) => {
    if (selectedTags.includes(name)) {
      onTagsChange(selectedTags.filter((t) => t !== name));
    } else {
      onTagsChange([...selectedTags, name]);
    }
  };

  const clearFilters = () => {
    onTagsChange([]);
  };

  return (
    <YStack gap="$2">
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontWeight="700" color={ForumColors.clay}>
          标签筛选
        </Text>
        <Button size="$2" chromeless onPress={clearFilters} color={ForumColors.clay}>
          清空
        </Button>
      </XStack>

      {loading ? (
        <XStack justifyContent="center" paddingVertical="$2">
          <Spinner size="small" />
        </XStack>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6 }}
        >
          <XStack gap="$2" alignItems="center">
            {tags.map((tag) => {
              const active = selectedTags.includes(tag.name);
              return (
                <Button
                  key={tag.id}
                  size="$2"
                  onPress={() => toggleTag(tag.name)}
                  backgroundColor={active ? ForumColors.clay : '#fff'}
                  color={active ? '#fff' : ForumColors.darkText}
                  borderWidth={1}
                  borderColor={`${ForumColors.clay}55`}
                >
                  #{tag.name}
                </Button>
              );
            })}
          </XStack>
        </ScrollView>
      )}
    </YStack>
  );
});
