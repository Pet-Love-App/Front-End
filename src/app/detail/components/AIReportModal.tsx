/**
 * AI 报告详情模态框
 */

import { Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button, H3, H5, Separator, Spinner, Text, XStack, YStack } from 'tamagui';

import { getNutritionColor, getNutritionLabel } from '@/src/constants/nutrition';
import type { AIReportData } from '@/src/services/api';
import { useFavorite } from '@/src/hooks';

import { NutrientBar } from './NutrientBar';

interface AIReportModalProps {
  visible: boolean;
  report: AIReportData | null;
  onClose: () => void;
}

export function AIReportModal({ visible, report, onClose }: AIReportModalProps) {
  const insets = useSafeAreaInsets();
  const { isFavorited, isToggling, toggle } = useFavorite({ catfoodId: report?.catfood_id });

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
        <ModalHeader
          catfoodId={report.catfood_id}
          isFavorited={isFavorited}
          isToggling={isToggling}
          onToggleFavorite={toggle}
          onClose={onClose}
          topInset={insets.top}
        />

        {/* 内容 */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: Math.max(insets.bottom + 16, 32) }}
        >
          <TagsSection tags={report.tags} />
          <Separator marginVertical="$3" />

          <AnalysisSection
            icon="🛡️"
            title="安全性分析"
            content={report.safety}
            bgColor="$green2"
            borderColor="$green6"
          />
          <Separator marginVertical="$3" />

          <AnalysisSection
            icon="🍖"
            title="营养分析"
            content={report.nutrient}
            bgColor="$orange2"
            borderColor="$orange6"
          />

          {report.percentage && report.percent_data && (
            <>
              <Separator marginVertical="$3" />
              <NutritionSection percentData={report.percent_data} />
            </>
          )}

          <ItemsSection
            icon="⚗️"
            title="识别到的添加剂"
            items={report.additives}
            bgColor="$purple2"
            borderColor="$purple6"
            textColor="$purple11"
          />
          <ItemsSection
            icon="🧪"
            title="识别到的营养成分"
            items={report.ingredients}
            bgColor="$green2"
            borderColor="$green6"
            textColor="$green11"
          />

          <TimestampSection createdAt={report.created_at} updatedAt={report.updated_at} />
        </ScrollView>
      </YStack>
    </Modal>
  );
}

// ==================== 子组件 ====================

function ModalHeader({
  catfoodId,
  isFavorited,
  isToggling,
  onToggleFavorite,
  onClose,
  topInset,
}: {
  catfoodId: number;
  isFavorited: boolean;
  isToggling: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
  topInset: number;
}) {
  return (
    <XStack
      paddingHorizontal="$4"
      paddingTop={Math.max(topInset, 16)}
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
          猫粮 ID: {catfoodId}
        </Text>
      </YStack>

      <XStack gap="$2" alignItems="center">
        <Button
          size="$3"
          circular
          chromeless
          disabled={isToggling}
          pressStyle={{ opacity: 0.7 }}
          onPress={onToggleFavorite}
          icon={
            isToggling ? (
              <Spinner size="small" />
            ) : (
              <Feather name="heart" size={20} color={isFavorited ? '#ef4444' : undefined} />
            )
          }
        />
        <Button
          size="$3"
          circular
          chromeless
          pressStyle={{ opacity: 0.7 }}
          onPress={onClose}
          icon={<Feather name="x" size={20} />}
        />
      </XStack>
    </XStack>
  );
}

function TagsSection({ tags }: { tags?: string[] }) {
  if (!tags?.length) return null;

  return (
    <YStack gap="$2" marginBottom="$4">
      <H5 color="$gray12" fontWeight="600">
        🏷️ 产品特征
      </H5>
      <XStack gap="$2" flexWrap="wrap">
        {tags.map((tag, i) => (
          <YStack
            key={i}
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
  );
}

function AnalysisSection({
  icon,
  title,
  content,
  bgColor,
  borderColor,
}: {
  icon: string;
  title: string;
  content?: string;
  bgColor: string;
  borderColor: string;
}) {
  if (!content) return null;

  return (
    <YStack gap="$2" marginBottom="$4">
      <H5 color="$gray12" fontWeight="600">
        {icon} {title}
      </H5>
      <YStack
        backgroundColor={bgColor}
        padding="$3"
        borderRadius="$3"
        borderWidth={1}
        borderColor={borderColor}
      >
        <Text fontSize="$3" color="$gray12" lineHeight={22}>
          {content}
        </Text>
      </YStack>
    </YStack>
  );
}

function NutritionSection({ percentData }: { percentData: Record<string, number | null> }) {
  const validEntries = Object.entries(percentData).filter(
    ([_, v]) => v !== null && v !== undefined
  );

  if (validEntries.length === 0) return null;

  return (
    <YStack gap="$3" marginBottom="$4">
      <H5 color="$gray12" fontWeight="600">
        📊 营养成分占比
      </H5>
      {validEntries.map(([key, value]) => (
        <NutrientBar
          key={key}
          label={getNutritionLabel(key)}
          value={value as number}
          color={getNutritionColor(key)}
        />
      ))}
    </YStack>
  );
}

function ItemsSection({
  icon,
  title,
  items,
  bgColor,
  borderColor,
  textColor,
}: {
  icon: string;
  title: string;
  items?: string[];
  bgColor: string;
  borderColor: string;
  textColor: string;
}) {
  if (!items?.length) return null;

  return (
    <>
      <Separator marginVertical="$3" />
      <YStack gap="$2" marginBottom="$4">
        <H5 color="$gray12" fontWeight="600">
          {icon} {title}
        </H5>
        <XStack gap="$2" flexWrap="wrap">
          {items.map((item, i) => (
            <YStack
              key={i}
              paddingHorizontal="$2.5"
              paddingVertical="$1.5"
              backgroundColor={bgColor}
              borderRadius="$2"
              borderWidth={1}
              borderColor={borderColor}
            >
              <Text fontSize="$2" color={textColor}>
                {item}
              </Text>
            </YStack>
          ))}
        </XStack>
      </YStack>
    </>
  );
}

function TimestampSection({ createdAt, updatedAt }: { createdAt: string; updatedAt: string }) {
  return (
    <YStack marginTop="$3" alignItems="center">
      <Text fontSize="$2" color="$gray10">
        报告生成时间: {new Date(createdAt).toLocaleString('zh-CN')}
      </Text>
      {updatedAt !== createdAt && (
        <Text fontSize="$2" color="$gray10" marginTop="$1">
          最后更新: {new Date(updatedAt).toLocaleString('zh-CN')}
        </Text>
      )}
    </YStack>
  );
}
