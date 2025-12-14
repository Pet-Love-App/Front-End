/**
 * AI 报告嵌入式展示组件
 *
 * 支持两种模式：
 * 1. 已有报告模式：显示保存的报告数据
 * 2. 流式生成模式：实时显示 AI 流式输出
 */

import { Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { Card, H4, H5, Separator, Spinner, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { toast } from '@/src/components/dialogs';
import {
  getNutritionColor,
  getNutritionLabel,
  hasValidNutritionData,
  preparePieChartData,
} from '@/src/constants/nutrition';
import { Colors } from '@/src/constants/theme';
import type { AIReportData } from '@/src/services/api';
import { useItemDetail, useThemeAwareColorScheme } from '@/src/hooks';

import { AdditiveDetailModal } from './AdditiveDetailModal';
import { NutrientBar } from './NutrientBar';
import { StreamingText } from './StreamingText';
import type { StreamingState } from '../hooks/useStreamingReport';

interface AIReportSectionProps {
  /** 已有的报告数据 */
  report?: AIReportData | null;
  /** 是否正在加载已有报告 */
  isLoading?: boolean;
  /** 流式状态（用于流式生成模式） */
  streamingState?: StreamingState | null;
  /** 是否显示生成按钮 */
  showGenerateButton?: boolean;
  /** 是否正在生成中（禁用按钮） */
  isGenerating?: boolean;
  /** 点击生成按钮的回调 */
  onGeneratePress?: () => void;
  /** 点击停止按钮的回调 */
  onStopPress?: () => void;
}

/** 饼图配置 */
const CHART_CONFIG = {
  backgroundColor: 'transparent',
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  decimalPlaces: 1,
};

export function AIReportSection({
  report,
  isLoading,
  streamingState,
  showGenerateButton = false,
  isGenerating = false,
  onGeneratePress,
  onStopPress,
}: AIReportSectionProps) {
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  const {
    item: selectedItem,
    baikeInfo,
    modalVisible,
    fetchAdditive,
    closeModal,
  } = useItemDetail();

  // 判断是否处于流式模式
  const isStreamingMode = streamingState?.isStreaming || streamingState?.isComplete;

  // 加载状态
  if (isLoading && !isStreamingMode) {
    return (
      <Card
        size="$4"
        bordered
        backgroundColor="$background"
        marginHorizontal="$3"
        marginBottom="$3"
      >
        <Card.Header>
          <YStack alignItems="center" paddingVertical="$4">
            <Spinner size="large" color={colors.tint} />
            <Text fontSize="$3" color="$gray10" marginTop="$2">
              正在加载 AI 分析报告...
            </Text>
          </YStack>
        </Card.Header>
      </Card>
    );
  }

  // 如果处于流式模式，显示流式内容
  if (isStreamingMode && streamingState) {
    return (
      <Card
        size="$4"
        backgroundColor="white"
        marginHorizontal="$3"
        marginBottom="$3"
        borderRadius="$6"
        borderWidth={2}
        borderColor={colors.tint + '40'}
        overflow="hidden"
      >
        {/* 头部 */}
        <Card.Header paddingBottom="$2" paddingHorizontal="$4" paddingTop="$4">
          <XStack alignItems="center" gap="$3" marginBottom="$3">
            <YStack
              width={48}
              height={48}
              alignItems="center"
              justifyContent="center"
              backgroundColor={colors.tint + '20'}
              borderRadius="$4"
              borderWidth={2}
              borderColor={colors.tint + '50'}
            >
              <IconSymbol name="doc.text.fill" size={24} color={colors.tint} />
            </YStack>
            <YStack flex={1} minWidth={0}>
              <H4 color="$gray12" fontWeight="800" letterSpacing={-0.4} numberOfLines={1}>
                AI 智能分析报告
              </H4>
              <Text fontSize="$2" color="$gray10" marginTop="$1" fontWeight="500" numberOfLines={1}>
                {streamingState.isStreaming ? '正在生成中...' : '分析完成'}
              </Text>
            </YStack>
            {/* 停止按钮 */}
            {streamingState.isStreaming && onStopPress && (
              <Button
                size="sm"
                height={36}
                paddingHorizontal="$3"
                backgroundColor="$red4"
                borderColor="$red7"
                borderWidth={1}
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                onPress={onStopPress}
              >
                <XStack alignItems="center" gap="$2">
                  <IconSymbol name="stop.fill" size={14} color="$red10" />
                  <Text fontSize="$3" color="$red10" fontWeight="600">
                    停止
                  </Text>
                </XStack>
              </Button>
            )}
          </XStack>
          <Separator borderColor="$borderColor" />
        </Card.Header>

        {/* 流式内容 */}
        <YStack minHeight={400} maxHeight={500}>
          <StreamingText
            content={streamingState.content}
            isStreaming={streamingState.isStreaming}
            isComplete={streamingState.isComplete}
            progress={streamingState.progress}
            error={streamingState.error}
          />
        </YStack>
      </Card>
    );
  }

  // 如果没有报告但显示生成按钮
  if (!report && showGenerateButton) {
    return (
      <Card
        size="$4"
        backgroundColor="white"
        marginHorizontal="$3"
        marginBottom="$3"
        borderRadius="$6"
        borderWidth={2}
        borderColor={colors.tint + '40'}
        borderStyle="dashed"
      >
        <Card.Header paddingHorizontal="$4" paddingVertical="$5">
          <YStack alignItems="center" gap="$4">
            <YStack
              width={64}
              height={64}
              alignItems="center"
              justifyContent="center"
              backgroundColor={colors.tint + '10'}
              borderRadius="$6"
            >
              <IconSymbol name="sparkles" size={36} color={colors.tint} />
            </YStack>
            <YStack alignItems="center" gap="$2" maxWidth="85%">
              <H4 color="$gray12" fontWeight="700" textAlign="center">
                AI 智能分析
              </H4>
              <Text fontSize="$3" color="$gray10" textAlign="center" lineHeight={20}>
                使用 AI 分析猫粮配料表，获取详细的安全性和营养分析报告
              </Text>
            </YStack>
            <Button
              size="lg"
              height={48}
              paddingHorizontal="$5"
              backgroundColor={colors.tint}
              borderRadius="$4"
              pressStyle={{ opacity: 0.9, scale: 0.98 }}
              disabled={isGenerating}
              onPress={onGeneratePress}
            >
              <XStack alignItems="center" gap="$2">
                {isGenerating ? (
                  <Spinner size="small" color="white" />
                ) : (
                  <IconSymbol name="wand.and.stars" size={20} color="white" />
                )}
                <Text color="white" fontWeight="600" fontSize="$5">
                  {isGenerating ? '生成中...' : '生成分析报告'}
                </Text>
              </XStack>
            </Button>
          </YStack>
        </Card.Header>
      </Card>
    );
  }

  if (!report) return null;

  // 营养成分点击（暂时使用 Alert）
  const handleIngredientPress = (name: string) => {
    toast.info(`${name}\n\n营养成分详情功能开发中`);
  };

  // 检查是否有有效营养数据
  const hasNutritionData = hasValidNutritionData(report.percentage, report.percent_data);
  const chartData = hasNutritionData ? preparePieChartData(report.percent_data) : [];
  const hasValidChartData = chartData.length > 0;

  return (
    <Card
      size="$4"
      backgroundColor="white"
      marginHorizontal="$3"
      marginBottom="$3"
      borderRadius="$6"
      borderWidth={2}
      borderColor={colors.tint + '40'}
    >
      {/* 头部 */}
      <Card.Header paddingBottom="$2" paddingHorizontal="$4" paddingTop="$4">
        <XStack alignItems="center" gap="$3" marginBottom="$3">
          <YStack
            width={48}
            height={48}
            alignItems="center"
            justifyContent="center"
            backgroundColor={colors.tint + '20'}
            borderRadius="$4"
            borderWidth={2}
            borderColor={colors.tint + '50'}
          >
            <IconSymbol name="doc.text.fill" size={24} color={colors.tint} />
          </YStack>
          <YStack flex={1} minWidth={0}>
            <H4 color="$gray12" fontWeight="800" letterSpacing={-0.4} numberOfLines={1}>
              AI 智能分析报告
            </H4>
            <Text fontSize="$2" color="$gray10" marginTop="$1" fontWeight="500" numberOfLines={1}>
              基于配料表的深度分析
            </Text>
          </YStack>
        </XStack>
        <Separator borderColor="$borderColor" />
      </Card.Header>

      <YStack padding="$4" gap="$4">
        {/* 产品标签 */}
        <TagsSection tags={report.tags} tintColor={colors.tint} />

        {/* 安全性分析 */}
        <AnalysisSection
          icon="shield.fill"
          iconColor="$green10"
          title="安全性分析"
          content={report.safety}
          bgColor="$green2"
          borderColor="$green6"
        />

        {/* 营养分析 */}
        <AnalysisSection
          icon="chart.bar.fill"
          iconColor="$orange10"
          title="营养分析"
          content={report.nutrient}
          bgColor="$orange2"
          borderColor="$orange6"
        />

        {/* 营养成分占比 */}
        {hasNutritionData && hasValidChartData && (
          <NutritionChartSection chartData={chartData} percentData={report.percent_data} />
        )}

        {/* 营养数据缺失提示 */}
        {report.percentage === true && !hasValidChartData && <NutritionDataMissingAlert />}

        {/* 识别的添加剂 */}
        <ItemListSection
          icon="flask.fill"
          iconColor="$purple10"
          title="识别的添加剂"
          items={report.additives}
          bgColor="$purple2"
          borderColor="$purple6"
          textColor="$purple11"
          onItemPress={fetchAdditive}
        />

        {/* 识别的营养成分 */}
        <ItemListSection
          icon="leaf.fill"
          iconColor="$green10"
          title="识别的营养成分"
          items={report.ingredients}
          bgColor="$green2"
          borderColor="$green6"
          textColor="$green11"
          onItemPress={handleIngredientPress}
        />

        {/* 时间戳 */}
        <TimestampFooter createdAt={report.created_at} updatedAt={report.updated_at} />
      </YStack>

      {/* 详情弹窗 */}
      <AdditiveDetailModal
        visible={modalVisible}
        additive={selectedItem}
        baikeInfo={baikeInfo}
        onClose={closeModal}
      />
    </Card>
  );
}

// ==================== 子组件 ====================

/** 标签区域 */
function TagsSection({ tags, tintColor }: { tags?: string[]; tintColor: string }) {
  if (!tags?.length) return null;

  return (
    <YStack gap="$2.5">
      <XStack alignItems="center" gap="$2">
        <IconSymbol name="tag.fill" size={18} color={tintColor} />
        <H5 color="$gray12" fontWeight="700" letterSpacing={-0.2} fontSize="$4">
          产品特征
        </H5>
      </XStack>
      <XStack gap="$2" flexWrap="wrap">
        {tags.map((tag, i) => (
          <YStack
            key={i}
            paddingHorizontal="$3"
            paddingVertical="$2"
            minHeight={32}
            justifyContent="center"
            backgroundColor="$blue3"
            borderRadius="$3"
            borderWidth={1}
            borderColor="$blue7"
          >
            <Text fontSize="$3" color="$blue11" fontWeight="600" numberOfLines={1}>
              {tag}
            </Text>
          </YStack>
        ))}
      </XStack>
    </YStack>
  );
}

/** 分析区域 */
function AnalysisSection({
  icon,
  iconColor,
  title,
  content,
  bgColor,
  borderColor,
}: {
  icon: string;
  iconColor: string;
  title: string;
  content?: string;
  bgColor: string;
  borderColor: string;
}) {
  if (!content) return null;

  return (
    <>
      <Separator borderColor="$borderColor" />
      <YStack gap="$2.5">
        <XStack alignItems="center" gap="$2">
          <IconSymbol name={icon as any} size={18} color={iconColor} />
          <H5 color="$gray12" fontWeight="700" letterSpacing={-0.2} fontSize="$4">
            {title}
          </H5>
        </XStack>
        <YStack
          backgroundColor={bgColor}
          padding="$3.5"
          borderRadius="$4"
          borderWidth={1}
          borderColor={borderColor}
        >
          <Text fontSize="$3" color="$gray12" lineHeight={22} fontWeight="500">
            {content}
          </Text>
        </YStack>
      </YStack>
    </>
  );
}

/** 营养图表区域 */
function NutritionChartSection({
  chartData,
  percentData,
}: {
  chartData: ReturnType<typeof preparePieChartData>;
  percentData: Record<string, number | null>;
}) {
  return (
    <>
      <Separator borderColor="$borderColor" />
      <YStack gap="$3">
        <XStack alignItems="center" gap="$2">
          <IconSymbol name="chart.pie.fill" size={20} color="$purple10" />
          <H5 color="$gray12" fontWeight="700" letterSpacing={-0.2}>
            营养成分占比
          </H5>
        </XStack>

        {/* 饼图 */}
        <YStack alignItems="center" marginVertical="$3">
          <PieChart
            data={chartData}
            width={Dimensions.get('window').width - 64}
            height={220}
            chartConfig={CHART_CONFIG}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend
            avoidFalseZero
          />
        </YStack>

        {/* 进度条 */}
        {Object.entries(percentData).map(([key, value]) => {
          if (value === null || value === undefined) return null;
          return (
            <NutrientBar
              key={key}
              label={getNutritionLabel(key)}
              value={value}
              color={getNutritionColor(key)}
            />
          );
        })}
      </YStack>
    </>
  );
}

/** 营养数据缺失提示 */
function NutritionDataMissingAlert() {
  return (
    <>
      <Separator borderColor="$borderColor" />
      <YStack gap="$2.5">
        <XStack alignItems="center" gap="$2">
          <IconSymbol name="exclamationmark.triangle.fill" size={20} color="$orange10" />
          <H5 color="$gray12" fontWeight="700" letterSpacing={-0.2}>
            营养成分占比
          </H5>
        </XStack>
        <YStack
          backgroundColor="$orange2"
          padding="$4"
          borderRadius="$4"
          borderWidth={1.5}
          borderColor="$orange6"
        >
          <Text fontSize="$3" color="$gray11" lineHeight={22} fontWeight="500">
            该报告标记支持营养成分占比分析，但未包含具体数据。
          </Text>
          <Text fontSize="$2" color="$gray10" marginTop="$2">
            提示：可以重新生成报告以获取最新的营养分析数据
          </Text>
        </YStack>
      </YStack>
    </>
  );
}

/** 项目列表区域 */
function ItemListSection({
  icon,
  iconColor,
  title,
  items,
  bgColor,
  borderColor,
  textColor,
  onItemPress,
}: {
  icon: string;
  iconColor: string;
  title: string;
  items?: string[];
  bgColor: string;
  borderColor: string;
  textColor: string;
  onItemPress: (name: string) => void;
}) {
  if (!items?.length) return null;

  return (
    <>
      <Separator borderColor="$borderColor" />
      <YStack gap="$2.5">
        <XStack alignItems="center" gap="$2">
          <IconSymbol name={icon as any} size={16} color={iconColor} />
          <H5 color="$gray12" fontWeight="600" fontSize="$3">
            {title}
          </H5>
        </XStack>
        <XStack gap="$2" flexWrap="wrap">
          {items.map((item, i) => (
            <YStack
              key={i}
              paddingHorizontal="$3"
              paddingVertical="$2"
              minHeight={36}
              justifyContent="center"
              backgroundColor={bgColor}
              borderRadius="$3"
              borderWidth={1}
              borderColor={borderColor}
              pressStyle={{ opacity: 0.7, scale: 0.98 }}
              cursor="pointer"
              onPress={() => onItemPress(item)}
            >
              <Text fontSize="$3" color={textColor} numberOfLines={1}>
                {item}
              </Text>
            </YStack>
          ))}
        </XStack>
      </YStack>
    </>
  );
}

/** 时间戳底部 */
function TimestampFooter({ createdAt, updatedAt }: { createdAt: string; updatedAt: string }) {
  return (
    <YStack marginTop="$2" paddingTop="$3" borderTopWidth={1} borderTopColor="$borderColor">
      <XStack alignItems="center" gap="$2">
        <IconSymbol name="clock.fill" size={14} color="$gray10" />
        <Text fontSize="$1" color="$gray10">
          报告生成于 {new Date(createdAt).toLocaleString('zh-CN')}
        </Text>
      </XStack>
      {updatedAt !== createdAt && (
        <XStack alignItems="center" gap="$2" marginTop="$1">
          <IconSymbol name="arrow.clockwise" size={14} color="$gray10" />
          <Text fontSize="$1" color="$gray10">
            最后更新于 {new Date(updatedAt).toLocaleString('zh-CN')}
          </Text>
        </XStack>
      )}
    </YStack>
  );
}
