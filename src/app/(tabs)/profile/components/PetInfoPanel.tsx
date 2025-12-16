import { memo, useCallback, useState } from 'react';
import { Image, ScrollView, Alert } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';
import { Trash2 } from '@tamagui/lucide-icons';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import type { Pet } from '@/src/schemas/pet.schema';
import { Button } from '@/src/design-system/components';
import { PetHealthRecords } from './PetHealthRecords';
import { PetWeightChart } from './PetWeightChart';
import { PetWeightRecords } from './PetWeightRecords';

/**
 * 宠物信息面板组件的 Props 接口
 */
interface PetInfoPanelProps {
  /** 宠物数据 */
  pet: Pet;
  /** 删除宠物回调 */
  onDelete?: (petId: number) => Promise<void>;
}

/**
 * Tab 配置常量
 * 使用 as const 确保类型安全
 */
const TABS = [
  { key: 'info', label: '基本信息', icon: 'info.circle.fill' },
  { key: 'health', label: '健康档案', icon: 'heart.fill' },
  { key: 'activity', label: '活动记录', icon: 'chart.bar.fill' },
] as const;

/** Tab 键类型 */
type TabKey = (typeof TABS)[number]['key'];

/**
 * 信息行组件 - 用于显示键值对信息
 */
interface InfoRowProps {
  label: string;
  value: string;
  colors: (typeof Colors)[keyof typeof Colors];
}

const InfoRow = memo(function InfoRow({ label, value, colors }: InfoRowProps) {
  return (
    <XStack justifyContent="space-between" paddingVertical="$2.5" paddingHorizontal="$1">
      <Text fontSize={14} color={colors.icon}>
        {label}
      </Text>
      <Text fontSize={14} fontWeight="600" color={colors.text}>
        {value}
      </Text>
    </XStack>
  );
});

/**
 * 宠物信息面板组件
 *
 * 功能：
 * - 展示宠物的头像和基本信息
 * - 提供多个 Tab 切换查看不同类型的信息
 * - 支持主题切换
 *
 * @component
 * @example
 * ```tsx
 * <PetInfoPanel pet={selectedPet} />
 * ```
 */
export const PetInfoPanel = memo(function PetInfoPanel({ pet, onDelete }: PetInfoPanelProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [deleting, setDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * 处理 Tab 切换
   * 使用 useCallback 避免不必要的重渲染
   */
  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);

  /**
   * 刷新体重数据
   */
  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  /**
   * 处理删除宠物
   */
  const handleDelete = useCallback(() => {
    if (!onDelete) return;

    Alert.alert('确认删除', `确定要删除 ${pet.name} 吗？此操作无法撤销。`, [
      {
        text: '取消',
        style: 'cancel',
      },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);
            await onDelete(pet.id);
          } catch (error) {
            // 错误已在 Hook 中处理
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }, [onDelete, pet.id, pet.name]);

  return (
    <YStack width="90%" marginTop="$4" gap="$3">
      {/* Pet Header Card */}
      <Card
        padding="$4"
        backgroundColor={colors.background}
        borderWidth={1}
        borderColor={colors.icon + '15'}
        borderRadius="$4"
      >
        <XStack gap="$4" alignItems="center">
          {/* Pet Photo */}
          {pet.photo_url ? (
            <YStack width={80} height={80} borderRadius="$4" overflow="hidden" borderWidth={0}>
              <Image
                source={{ uri: pet.photo_url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </YStack>
          ) : (
            <YStack
              width={80}
              height={80}
              borderRadius="$4"
              backgroundColor="$orange3"
              alignItems="center"
              justifyContent="center"
              borderWidth={0}
            >
              <Text fontSize={48}>🐱</Text>
            </YStack>
          )}

          {/* Pet Basic Info */}
          <YStack flex={1} gap="$1.5">
            <Text fontSize={20} fontWeight="700" color={colors.text}>
              {pet.name}
            </Text>
            <XStack gap="$2" alignItems="center" flexWrap="wrap">
              <XStack
                paddingHorizontal="$2.5"
                paddingVertical="$1"
                backgroundColor="#FEF3E8"
                borderRadius="$2"
              >
                <Text fontSize={13} fontWeight="600" color="#D97706">
                  {pet.species_display ?? pet.species}
                </Text>
              </XStack>
              {pet.breed && (
                <Text fontSize={14} color={colors.icon}>
                  {pet.breed}
                </Text>
              )}
              {pet.age != null && (
                <>
                  <Text fontSize={14} color={colors.icon + '60'}>
                    •
                  </Text>
                  <Text fontSize={14} color={colors.icon}>
                    {pet.age}岁
                  </Text>
                </>
              )}
            </XStack>
          </YStack>
        </XStack>
      </Card>

      {/* Divider */}
      <YStack width="100%" alignItems="center" paddingVertical="$2">
        <YStack width="90%" height={1} backgroundColor={colors.icon + '15'} />
      </YStack>

      {/* Tab Navigation */}
      <XStack gap="$2" paddingHorizontal="$1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <YStack
              key={tab.key}
              flex={1}
              paddingVertical="$3"
              borderRadius="$3"
              backgroundColor={isActive ? '#FEBE98' : '$gray3'}
              alignItems="center"
              justifyContent="center"
              pressStyle={{ scale: 0.97, opacity: 0.8 }}
              onPress={() => handleTabChange(tab.key)}
              cursor="pointer"
              gap="$1"
              animation="quick"
            >
              <IconSymbol
                name={tab.icon as any}
                size={20}
                color={isActive ? 'white' : colors.icon}
              />
              <Text fontSize={13} fontWeight="600" color={isActive ? 'white' : colors.text}>
                {tab.label}
              </Text>
            </YStack>
          );
        })}
      </XStack>

      {/* Tab Content */}
      <Card
        padding="$4"
        backgroundColor={colors.background}
        borderWidth={1}
        borderColor={colors.icon + '20'}
        borderRadius="$4"
        minHeight={200}
      >
        {activeTab === 'info' && (
          <YStack gap="$4">
            <XStack alignItems="center" gap="$2">
              <IconSymbol name="info.circle.fill" size={20} color="#FEBE98" />
              <Text fontSize={16} fontWeight="700" color={colors.text}>
                基本信息
              </Text>
            </XStack>

            {pet.description && (
              <>
                <YStack gap="$2.5">
                  <Text fontSize={14} fontWeight="600" color={colors.icon}>
                    📝 描述
                  </Text>
                  <YStack
                    padding="$3"
                    backgroundColor="$gray2"
                    borderRadius="$3"
                    borderLeftWidth={3}
                    borderLeftColor={colors.icon + '30'}
                  >
                    <Text fontSize={14} color={colors.text} lineHeight={22}>
                      {pet.description}
                    </Text>
                  </YStack>
                </YStack>
                <YStack height={1} backgroundColor={colors.icon + '20'} marginVertical="$2" />
              </>
            )}

            <YStack gap="$1">
              <InfoRow
                label="宠物类型"
                value={pet.species_display ?? pet.species}
                colors={colors}
              />
              <YStack height={1} backgroundColor={colors.icon + '15'} />

              {pet.breed && (
                <>
                  <InfoRow label="品种" value={pet.breed} colors={colors} />
                  <YStack height={1} backgroundColor={colors.icon + '15'} />
                </>
              )}

              {pet.age != null && <InfoRow label="年龄" value={`${pet.age}岁`} colors={colors} />}
            </YStack>
          </YStack>
        )}

        {activeTab === 'health' && (
          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <PetHealthRecords petId={pet.id} petName={pet.name} />
          </ScrollView>
        )}

        {activeTab === 'activity' && (
          <ScrollView
            style={{ maxHeight: 400 }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <YStack gap="$4">
              <PetWeightChart petId={pet.id} petName={pet.name} refreshTrigger={refreshTrigger} />
              <PetWeightRecords petId={pet.id} petName={pet.name} onRefresh={handleRefresh} />
            </YStack>
          </ScrollView>
        )}
      </Card>

      {/* 删除按钮 - 放在最下方 */}
      {onDelete && (
        <>
          <YStack height={1} backgroundColor={colors.icon + '15'} marginVertical="$3" />
          <Button
            fullWidth
            variant="danger"
            leftIcon={<Trash2 size={18} />}
            onPress={handleDelete}
            loading={deleting}
            disabled={deleting}
          >
            删除宠物
          </Button>
        </>
      )}
    </YStack>
  );
});
