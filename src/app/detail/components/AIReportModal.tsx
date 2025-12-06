/**
 * AIReportModal Component
 *
 */

import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button, H3, H5, Separator, Spinner, Text, XStack, YStack } from 'tamagui';

import { aiReportService } from '@/src/services/api';
import type { AIReportData } from '@/src/services/api';

interface AIReportModalProps {
  /** 是否显示 */
  visible: boolean;
  /** AI 报告数据 */
  report: AIReportData | null;
  /** 关闭回调 */
  onClose: () => void;
}

/**
 * AI 报告详情模态框
 */
export function AIReportModal({ visible, report, onClose }: AIReportModalProps) {
  const insets = useSafeAreaInsets();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // 检查是否已收藏
  useEffect(() => {
    const checkFavorite = async () => {
      if (report?.id) {
        try {
          const result = await aiReportService.checkFavoriteReport(report.id);
          setIsFavorited(result);
        } catch (error) {
          console.error('检查收藏状态失败:', error);
        }
      }
    };
    checkFavorite();
  }, [report?.id]);

  // 切换收藏状态
  const handleToggleFavorite = async () => {
    if (!report?.id) return;

    setIsTogglingFavorite(true);
    try {
      const result = await aiReportService.toggleFavoriteReport(report.id);
      setIsFavorited(result.is_favorited);
      Alert.alert('✅ 成功', result.is_favorited ? '已收藏此报告' : '已取消收藏');
    } catch (error) {
      Alert.alert('❌ 失败', '操作失败，请重试');
      console.error('切换报告收藏失败:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  if (!report) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <YStack flex={1} backgroundColor="$background">
        {/* 头部 */}
        <XStack
          paddingHorizontal="$4"
          paddingTop={Math.max(insets.top, 16)}
          paddingBottom="$3"
          backgroundColor="$blue5"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
          alignItems="center"
          justifyContent="space-between"
        >
          <YStack flex={1}>
            <H3 color="$blue11" fontWeight="700">
              AI 分析报告
            </H3>
            <Text fontSize="$2" color="$gray11" marginTop="$1">
              {report.catfood_name}
            </Text>
          </YStack>

          <XStack gap="$2" alignItems="center">
            {/* 收藏按钮 */}
            <Button
              size="$3"
              circular
              icon={
                isTogglingFavorite ? (
                  <Spinner size="small" />
                ) : (
                  <Feather
                    name={isFavorited ? 'heart' : 'heart'}
                    size={20}
                    color={isFavorited ? '#ef4444' : undefined}
                  />
                )
              }
              onPress={handleToggleFavorite}
              chromeless
              pressStyle={{ opacity: 0.7 }}
              disabled={isTogglingFavorite}
            />

            {/* 关闭按钮 */}
            <Button
              size="$3"
              circular
              icon={<Feather name="x" size={20} />}
              onPress={onClose}
              chromeless
              pressStyle={{ opacity: 0.7 }}
            />
          </XStack>
        </XStack>

        {/* 内容区 */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Math.max(insets.bottom + 16, 32),
          }}
        >
          {/* 标签 */}
          {report.tags && report.tags.length > 0 && (
            <YStack gap="$2" marginBottom="$4">
              <H5 color="$gray12" fontWeight="600">
                🏷️ 产品特征
              </H5>
              <XStack gap="$2" flexWrap="wrap">
                {report.tags.map((tag: string, index: number) => (
                  <YStack
                    key={index}
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    backgroundColor="$blue3"
                    borderRadius="$3"
                    borderWidth={1}
                    borderColor="$blue6"
                  >
                    <Text fontSize="$3" color="$blue11" fontWeight="500">
                      {tag}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </YStack>
          )}

          <Separator marginVertical="$3" />

          {/* 安全性分析 */}
          {report.safety && (
            <YStack gap="$2" marginBottom="$4">
              <H5 color="$gray12" fontWeight="600">
                🛡️ 安全性分析
              </H5>
              <YStack
                backgroundColor="$green2"
                padding="$3"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$green6"
              >
                <Text fontSize="$3" color="$gray12" lineHeight={22}>
                  {report.safety}
                </Text>
              </YStack>
            </YStack>
          )}

          <Separator marginVertical="$3" />

          {/* 营养分析 */}
          {report.nutrient && (
            <YStack gap="$2" marginBottom="$4">
              <H5 color="$gray12" fontWeight="600">
                🍖 营养分析
              </H5>
              <YStack
                backgroundColor="$orange2"
                padding="$3"
                borderRadius="$3"
                borderWidth={1}
                borderColor="$orange6"
              >
                <Text fontSize="$3" color="$gray12" lineHeight={22}>
                  {report.nutrient}
                </Text>
              </YStack>
            </YStack>
          )}

          {/* 营养成分占比 */}
          {report.percentage && report.percent_data && (
            <>
              <Separator marginVertical="$3" />
              <YStack gap="$3" marginBottom="$4">
                <H5 color="$gray12" fontWeight="600">
                  📊 营养成分占比
                </H5>

                {report.percent_data.crude_protein !== null && (
                  <NutrientItem
                    label="粗蛋白"
                    value={report.percent_data.crude_protein}
                    color="$red9"
                  />
                )}

                {report.percent_data.crude_fat !== null && (
                  <NutrientItem
                    label="粗脂肪"
                    value={report.percent_data.crude_fat}
                    color="$orange9"
                  />
                )}

                {report.percent_data.carbohydrates !== null && (
                  <NutrientItem
                    label="碳水化合物"
                    value={report.percent_data.carbohydrates}
                    color="$yellow9"
                  />
                )}

                {report.percent_data.crude_fiber !== null && (
                  <NutrientItem
                    label="粗纤维"
                    value={report.percent_data.crude_fiber}
                    color="$green9"
                  />
                )}

                {report.percent_data.crude_ash !== null && (
                  <NutrientItem
                    label="粗灰分"
                    value={report.percent_data.crude_ash}
                    color="$gray9"
                  />
                )}

                {report.percent_data.others !== null && (
                  <NutrientItem
                    label="其他成分"
                    value={report.percent_data.others}
                    color="$blue9"
                  />
                )}
              </YStack>
            </>
          )}

          {/* 识别到的添加剂 */}
          {report.additives && report.additives.length > 0 && (
            <>
              <Separator marginVertical="$3" />
              <YStack gap="$2" marginBottom="$4">
                <H5 color="$gray12" fontWeight="600">
                  ⚗️ 识别到的添加剂
                </H5>
                <XStack gap="$2" flexWrap="wrap">
                  {report.additives.map((additive: string, index: number) => (
                    <YStack
                      key={index}
                      paddingHorizontal="$2.5"
                      paddingVertical="$1.5"
                      backgroundColor="$purple2"
                      borderRadius="$2"
                      borderWidth={1}
                      borderColor="$purple6"
                    >
                      <Text fontSize="$2" color="$purple11">
                        {additive}
                      </Text>
                    </YStack>
                  ))}
                </XStack>
              </YStack>
            </>
          )}

          {/* 识别到的营养成分 */}
          {report.ingredients && report.ingredients.length > 0 && (
            <>
              <Separator marginVertical="$3" />
              <YStack gap="$2" marginBottom="$4">
                <H5 color="$gray12" fontWeight="600">
                  🧪 识别到的营养成分
                </H5>
                <XStack gap="$2" flexWrap="wrap">
                  {report.ingredients.map((ingredient: string, index: number) => (
                    <YStack
                      key={index}
                      paddingHorizontal="$2.5"
                      paddingVertical="$1.5"
                      backgroundColor="$green2"
                      borderRadius="$2"
                      borderWidth={1}
                      borderColor="$green6"
                    >
                      <Text fontSize="$2" color="$green11">
                        {ingredient}
                      </Text>
                    </YStack>
                  ))}
                </XStack>
              </YStack>
            </>
          )}

          {/* 报告时间 */}
          <YStack marginTop="$3" alignItems="center">
            <Text fontSize="$2" color="$gray10">
              报告生成时间: {new Date(report.created_at).toLocaleString('zh-CN')}
            </Text>
            {report.updated_at !== report.created_at && (
              <Text fontSize="$2" color="$gray10" marginTop="$1">
                最后更新: {new Date(report.updated_at).toLocaleString('zh-CN')}
              </Text>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </Modal>
  );
}

/**
 * 营养成分项组件
 */
function NutrientItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <XStack
      backgroundColor="$gray2"
      padding="$3"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderColor"
      alignItems="center"
      justifyContent="space-between"
    >
      <Text fontSize="$3" color="$gray12" fontWeight="500">
        {label}
      </Text>
      <XStack gap="$2" alignItems="center">
        <YStack
          height={8}
          width={`${Math.min(value, 100)}%`}
          maxWidth={120}
          backgroundColor={color}
          borderRadius="$2"
          minWidth={20}
        />
        <Text fontSize="$4" color={color} fontWeight="700" minWidth={60} textAlign="right">
          {value.toFixed(1)}%
        </Text>
      </XStack>
    </XStack>
  );
}
