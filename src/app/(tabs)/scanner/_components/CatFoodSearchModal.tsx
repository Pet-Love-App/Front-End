import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useCatFoodStore, useSearchResults } from '@/src/store/catFoodStore';
import type { CatFood } from '@/src/types/catFood';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, Modal } from 'react-native';
import { Button, Input, Separator, Spinner, Text, XStack, YStack } from 'tamagui';

/**
 * 搜索配置常量
 */
const SEARCH_CONFIG = {
  /** 搜索防抖延迟时间（毫秒） */
  DEBOUNCE_DELAY: 500,
  /** Modal 最大宽度 */
  MAX_WIDTH: 600,
  /** Modal 高度百分比 */
  HEIGHT_PERCENTAGE: '85%',
  /** Modal 最大高度 */
  MAX_HEIGHT: 700,
} as const;

/**
 * 猫粮搜索 Modal 组件属性
 */
interface CatFoodSearchModalProps {
  /** 是否显示模态框 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 选择猫粮回调 */
  onSelectCatFood: (catFood: CatFood) => void;
}

/**
 * 猫粮搜索模态框
 *
 * @description
 * 提供猫粮搜索功能的弹出式模态框组件，支持实时搜索和结果展示。
 *
 * @features
 * - ✅ 实时搜索：输入时自动搜索，无需点击按钮
 * - ✅ 防抖优化：避免频繁请求，提升性能
 * - ✅ 弹出式设计：居中显示，不占满整个屏幕
 * - ✅ 搜索数据库中的猫粮
 * - ✅ 显示搜索结果列表
 * - ✅ 支持选择猫粮进入详情/扫描流程
 *
 * @architecture
 * - Modal: React Native 原生组件，提供更好的平台体验
 * - FlatList: React Native 原生组件，优化列表性能
 * - UI Components: Tamagui 组件，统一主题和样式
 * - State Management: React Hooks (useState, useEffect, useCallback)
 * - Component Design: 组件化设计，将空状态提取为独立组件
 *
 * @example
 * ```tsx
 * <CatFoodSearchModal
 *   visible={showSearch}
 *   onClose={() => setShowSearch(false)}
 *   onSelectCatFood={(catFood) => handleSelectCatFood(catFood)}
 * />
 * ```
 */
export function CatFoodSearchModal({ visible, onClose, onSelectCatFood }: CatFoodSearchModalProps) {
  const [searchText, setSearchText] = useState('');
  const [searched, setSearched] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 使用 catFoodStore - 使用选择器避免不必要的重渲染
  const { results: catFoods, isLoading: loading } = useSearchResults();
  const searchCatFoods = useCatFoodStore((state) => state.searchCatFoods);

  /**
   * 搜索猫粮
   */
  const handleSearch = useCallback(
    async (text: string) => {
      const trimmedText = text.trim();
      if (!trimmedText) {
        setSearched(false);
        return;
      }

      try {
        await searchCatFoods(trimmedText);
        setSearched(true);
      } catch (error) {
        console.error('搜索失败:', error);
        setSearched(true);
      }
    },
    [searchCatFoods]
  );

  /**
   * 实时搜索 - 使用防抖避免频繁请求
   */
  useEffect(() => {
    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current as any);
    }

    // 如果搜索框为空，立即清空结果
    if (!searchText.trim()) {
      setSearched(false);
      return;
    }

    // 设置新的定时器，延迟后执行搜索
    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(searchText);
    }, SEARCH_CONFIG.DEBOUNCE_DELAY) as any;

    // 清理函数
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current as any);
      }
    };
  }, [searchText, handleSearch]);

  /**
   * 选择猫粮
   */
  const handleSelectCatFood = useCallback(
    (catFood: CatFood) => {
      onSelectCatFood(catFood);
      // 重置状态
      resetState();
    },
    [onSelectCatFood]
  );

  /**
   * 重置状态
   */
  const resetState = useCallback(() => {
    setSearchText('');
    setSearched(false);
  }, []);

  /**
   * 关闭模态框
   */
  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  /**
   * 清空搜索
   */
  const handleClear = useCallback(() => {
    setSearchText('');
  }, []);

  /**
   * 检查是否有成分信息
   */
  const hasIngredientInfo = useCallback((catFood: CatFood): boolean => {
    return catFood.ingredient && catFood.ingredient.length > 0;
  }, []);

  /**
   * 渲染猫粮卡片
   */
  const renderCatFoodItem = useCallback(
    ({ item, index }: { item: CatFood; index: number }) => {
      const hasInfo = hasIngredientInfo(item);

      return (
        <YStack paddingBottom="$3">
          <YStack
            backgroundColor="$background"
            borderRadius="$4"
            borderWidth={1}
            borderColor="$gray5"
            overflow="hidden"
            pressStyle={{ opacity: 0.9 }}
          >
            {/* 猫粮基本信息 */}
            <XStack padding="$3" gap="$3" alignItems="center">
              {/* 猫粮图片 */}
              {item.imageUrl ? (
                <YStack
                  width={80}
                  height={80}
                  borderRadius="$3"
                  overflow="hidden"
                  backgroundColor="$gray3"
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: 80, height: 80 }}
                    resizeMode="cover"
                  />
                </YStack>
              ) : (
                <YStack
                  width={80}
                  height={80}
                  backgroundColor="$gray3"
                  borderRadius="$3"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconSymbol name="photo" size={32} color="$gray9" />
                </YStack>
              )}

              {/* 猫粮信息 */}
              <YStack flex={1} gap="$2">
                {/* 名称 */}
                <Text fontSize="$5" fontWeight="bold" numberOfLines={2}>
                  {item.name}
                </Text>

                {/* 品牌 */}
                <Text fontSize="$3" color="$gray10">
                  {item.brand || '未知品牌'}
                </Text>

                {/* 评分 */}
                <XStack alignItems="center" gap="$2">
                  <XStack alignItems="center" gap="$1">
                    <IconSymbol name="star.fill" size={14} color="$yellow9" />
                    <Text fontSize="$3" fontWeight="600">
                      {item.score.toFixed(1)}
                    </Text>
                  </XStack>
                  <Text fontSize="$2" color="$gray10">
                    ({item.countNum}人评价)
                  </Text>
                </XStack>

                {/* 成分信息状态标签 */}
                <XStack alignItems="center" gap="$2">
                  {hasInfo ? (
                    <XStack
                      alignItems="center"
                      gap="$1"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      backgroundColor="$green3"
                      borderRadius="$2"
                    >
                      <IconSymbol name="checkmark.seal.fill" size={14} color="$green10" />
                      <Text fontSize="$2" color="$green10" fontWeight="600">
                        已有成分信息
                      </Text>
                    </XStack>
                  ) : (
                    <XStack
                      alignItems="center"
                      gap="$1"
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      backgroundColor="$orange3"
                      borderRadius="$2"
                    >
                      <IconSymbol
                        name="exclamationmark.triangle.fill"
                        size={14}
                        color="$orange10"
                      />
                      <Text fontSize="$2" color="$orange10" fontWeight="600">
                        暂无成分信息
                      </Text>
                    </XStack>
                  )}
                </XStack>
              </YStack>
            </XStack>

            <Separator />

            {/* 操作按钮区域 */}
            <XStack padding="$3" gap="$2">
              {hasInfo ? (
                <Button
                  flex={1}
                  size="$3"
                  themeInverse
                  icon={<IconSymbol name="doc.text.magnifyingglass" size={18} color="$color" />}
                  onPress={() => handleSelectCatFood(item)}
                >
                  查看详情
                </Button>
              ) : (
                <Button
                  flex={1}
                  size="$3"
                  theme="orange"
                  icon={<IconSymbol name="camera.fill" size={18} color="$color" />}
                  onPress={() => handleSelectCatFood(item)}
                >
                  拍照录入成分
                </Button>
              )}
            </XStack>
          </YStack>
        </YStack>
      );
    },
    [handleSelectCatFood, hasIngredientInfo]
  );

  /**
   * 渲染列表空状态
   */
  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return <EmptyState searched={searched} />;
  }, [loading, searched]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
      transparent
      statusBarTranslucent
    >
      {/* 半透明背景层 - 使用 Tamagui YStack */}
      <YStack
        flex={1}
        backgroundColor="rgba(0, 0, 0, 0.5)"
        justifyContent="center"
        alignItems="center"
        padding="$5"
        pressStyle={{ opacity: 1 }}
        onPress={handleClose}
      >
        {/* Modal 内容区域 */}
        <YStack
          width="100%"
          maxWidth={SEARCH_CONFIG.MAX_WIDTH}
          height={SEARCH_CONFIG.HEIGHT_PERCENTAGE}
          maxHeight={SEARCH_CONFIG.MAX_HEIGHT}
          backgroundColor="$background"
          borderRadius="$6"
          overflow="hidden"
          pressStyle={{ opacity: 1 }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <XStack
            paddingHorizontal="$4"
            paddingTop="$4"
            paddingBottom="$3"
            justifyContent="space-between"
            alignItems="center"
            borderBottomWidth={1}
            borderBottomColor="$gray5"
            backgroundColor="$background"
          >
            <Text fontSize="$7" fontWeight="bold" color="$color">
              搜索猫粮
            </Text>
            <Button
              circular
              icon={<IconSymbol name="xmark.circle.fill" size={28} color="$gray10" />}
              chromeless
              onPress={handleClose}
              accessibilityLabel="关闭搜索"
            />
          </XStack>

          {/* 搜索栏 */}
          <XStack paddingHorizontal="$4" paddingVertical="$3">
            <XStack
              flex={1}
              alignItems="center"
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderWidth={1}
              borderColor="$gray7"
              borderRadius="$4"
              backgroundColor="$background"
              focusStyle={{
                borderColor: '$blue8',
              }}
            >
              {loading ? (
                <Spinner size="small" color="$gray10" />
              ) : (
                <IconSymbol name="magnifyingglass" size={20} color="$gray10" />
              )}
              <Input
                flex={1}
                placeholder="输入猫粮名称或品牌..."
                value={searchText}
                onChangeText={setSearchText}
                returnKeyType="search"
                size="$4"
                borderWidth={0}
                backgroundColor="transparent"
                autoFocus
                placeholderTextColor="$gray9"
                accessibilityLabel="搜索猫粮输入框"
              />
              {searchText.length > 0 && (
                <Button
                  circular
                  size="$2"
                  chromeless
                  icon={<IconSymbol name="xmark.circle.fill" size={20} color="$gray10" />}
                  onPress={handleClear}
                  accessibilityLabel="清空搜索"
                />
              )}
            </XStack>
          </XStack>

          <Separator />

          {/* 结果列表 - 使用 React Native FlatList 优化性能 */}
          <YStack flex={1}>
            <FlatList
              data={catFoods}
              renderItem={renderCatFoodItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: 16, flexGrow: 1 }}
              ListEmptyComponent={renderEmpty}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </YStack>
        </YStack>
      </YStack>
    </Modal>
  );
}

/**
 * 空状态组件
 */
interface EmptyStateProps {
  searched: boolean;
}

function EmptyState({ searched }: EmptyStateProps) {
  if (!searched) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$10" gap="$3">
        <IconSymbol name="magnifyingglass" size={64} color="$gray9" />
        <Text fontSize="$6" fontWeight="600" color="$gray12">
          输入猫粮名称或品牌开始搜索
        </Text>
        <Text fontSize="$3" color="$gray10" textAlign="center">
          例如：皇家、渴望、爱肯拿等
        </Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$10" gap="$3">
      <IconSymbol name="exclamationmark.circle" size={64} color="$gray9" />
      <Text fontSize="$6" fontWeight="600" color="$gray12">
        未找到相关猫粮
      </Text>
      <Text fontSize="$3" color="$gray10" textAlign="center">
        请尝试其他关键词
      </Text>
    </YStack>
  );
}
