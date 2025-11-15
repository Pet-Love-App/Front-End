import { CatFoodCard } from '@/src/components/CatFoodCard';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { searchCatFood, type CatFood } from '@/src/services/api';
import React, { useCallback, useState } from 'react';
import { FlatList, Modal } from 'react-native';
import { Button, Input, Separator, Spinner, Text, XStack, YStack } from 'tamagui';

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
 * 功能：
 * - 搜索数据库中的猫粮
 * - 显示搜索结果列表
 * - 支持选择猫粮进入详情/扫描流程
 *
 * 设计原则：
 * - Modal 使用 React Native 原生组件，提供更好的平台体验
 * - FlatList 使用 React Native 原生组件，优化列表性能
 * - 布局和 UI 元素使用 Tamagui 组件，统一主题和样式
 * - 状态管理清晰，使用 useState 管理本地状态
 * - 组件化设计，将空状态提取为独立组件
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
  const [catFoods, setCatFoods] = useState<CatFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  /**
   * 搜索猫粮
   */
  const handleSearch = useCallback(async () => {
    const trimmedText = searchText.trim();
    if (!trimmedText) return;

    try {
      setLoading(true);
      const response = await searchCatFood({ name: trimmedText });
      setCatFoods(response.results || []);
      setSearched(true);
    } catch (error) {
      console.error('搜索失败:', error);
      setCatFoods([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }, [searchText]);

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
    setCatFoods([]);
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
   * 渲染猫粮卡片
   */
  const renderCatFoodItem = useCallback(
    ({ item, index }: { item: CatFood; index: number }) => (
      <YStack paddingBottom="$3">
        <CatFoodCard
          catfood={item}
          index={index}
          onPress={handleSelectCatFood}
          showRank={false}
          showNutritionInfo={true}
        />
      </YStack>
    ),
    [handleSelectCatFood]
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
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* 使用 Tamagui 组件构建 UI */}
      <YStack flex={1} backgroundColor="$background">
        {/* 头部 */}
        <XStack
          paddingHorizontal="$4"
          paddingTop="$10"
          paddingBottom="$3"
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor="$gray5"
        >
          <Text fontSize="$8" fontWeight="bold">
            搜索猫粮
          </Text>
          <Button
            circular
            icon={<IconSymbol name="xmark.circle.fill" size={32} color="$gray10" />}
            chromeless
            onPress={handleClose}
          />
        </XStack>

        {/* 搜索栏 */}
        <XStack paddingHorizontal="$4" paddingVertical="$3" gap="$3">
          <XStack
            flex={1}
            alignItems="center"
            paddingHorizontal="$3"
            borderWidth={1}
            borderColor="$gray7"
            borderRadius="$4"
            backgroundColor="$background"
          >
            <IconSymbol name="magnifyingglass" size={20} color="$gray10" />
            <Input
              flex={1}
              placeholder="输入猫粮名称或品牌..."
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              size="$4"
              borderWidth={0}
              backgroundColor="transparent"
            />
            {searchText.length > 0 && (
              <Button
                circular
                size="$2"
                chromeless
                icon={<IconSymbol name="xmark.circle.fill" size={20} color="$gray10" />}
                onPress={handleClear}
              />
            )}
          </XStack>
          <Button
            size="$4"
            themeInverse
            onPress={handleSearch}
            disabled={loading || !searchText.trim()}
            minWidth={80}
          >
            {loading ? <Spinner size="small" color="$color" /> : '搜索'}
          </Button>
        </XStack>

        <Separator />

        {/* 结果列表 - 使用 React Native FlatList 优化性能 */}
        <FlatList
          data={catFoods}
          renderItem={renderCatFoodItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
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
