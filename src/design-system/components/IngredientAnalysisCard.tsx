/**
 * IngredientAnalysisCard - 猫粮成分分析卡片
 *
 * "Hero Screen" 核心组件
 * 设计风格: Premium 营养报告卡片
 */

import React from 'react';
import { ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled, YStack, XStack, Text, Stack, Separator, GetProps } from 'tamagui';

import { CircularScore } from './CircularScore';
import { IngredientTagList, IngredientType } from './IngredientTag';

// ============================================================================
// 类型定义
// ============================================================================
export interface IngredientData {
  name: string;
  type: IngredientType;
  percentage?: number;
  description?: string;
}

export interface NutritionData {
  label: string;
  value: number;
  unit: string;
  target?: number; // 推荐值
}

export interface IngredientAnalysisCardProps {
  /** 猫粮名称 */
  name: string;
  /** 品牌 */
  brand?: string;
  /** 封面图片 URL */
  imageUrl?: string;
  /** 总体评分 0-100 */
  score: number;
  /** 成分列表 */
  ingredients: IngredientData[];
  /** 营养数据 */
  nutritionData?: NutritionData[];
  /** 简短分析总结 */
  summary?: string;
  /** 点击成分标签回调 */
  onIngredientPress?: (ingredient: IngredientData) => void;
  /** 点击查看详情 */
  onViewDetails?: () => void;
  /** 是否紧凑模式 */
  compact?: boolean;
  testID?: string;
}

// ============================================================================
// 样式组件
// ============================================================================
const CardContainer = styled(YStack, {
  name: 'IngredientAnalysisCard',
  backgroundColor: '$cardBackground',
  borderRadius: '$8',
  overflow: 'hidden',
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 1,
  shadowRadius: 24,
  elevation: 8,

  variants: {
    compact: {
      true: {
        borderRadius: '$6',
      },
    },
  } as const,
});

const HeaderImageContainer = styled(Stack, {
  name: 'HeaderImageContainer',
  height: 200,
  width: '100%',
  overflow: 'hidden',

  variants: {
    compact: {
      true: {
        height: 140,
      },
    },
  } as const,
});

const HeaderOverlay = styled(Stack, {
  name: 'HeaderOverlay',
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 100,
  justifyContent: 'flex-end',
  paddingHorizontal: '$4',
  paddingBottom: '$3',
});

const BrandBadge = styled(Stack, {
  name: 'BrandBadge',
  position: 'absolute',
  top: '$3',
  left: '$3',
  paddingHorizontal: '$2.5',
  paddingVertical: '$1',
  borderRadius: '$4',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
});

const BrandText = styled(Text, {
  name: 'BrandText',
  fontSize: '$2',
  fontWeight: '600',
  color: '$color',
});

const ProductName = styled(Text, {
  name: 'ProductName',
  fontSize: '$6',
  fontWeight: '700',
  color: '#FFFFFF',
  textShadowColor: 'rgba(0, 0, 0, 0.3)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 2,
});

const ContentSection = styled(YStack, {
  name: 'ContentSection',
  padding: '$4',
  gap: '$4',
});

const ScoreSection = styled(XStack, {
  name: 'ScoreSection',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$4',
});

const ScoreInfo = styled(YStack, {
  name: 'ScoreInfo',
  flex: 1,
  gap: '$2',
});

const SummaryText = styled(Text, {
  name: 'SummaryText',
  fontSize: '$3',
  lineHeight: 22,
  color: '$colorMuted',
});

const SectionTitle = styled(Text, {
  name: 'SectionTitle',
  fontSize: '$4',
  fontWeight: '600',
  color: '$color',
  marginBottom: '$2',
});

const IngredientsSection = styled(YStack, {
  name: 'IngredientsSection',
  gap: '$3',
});

const IngredientGroup = styled(YStack, {
  name: 'IngredientGroup',
  gap: '$2',
});

const GroupLabel = styled(XStack, {
  name: 'GroupLabel',
  alignItems: 'center',
  gap: '$2',
  marginBottom: '$1',
});

const GroupIcon = styled(Text, {
  name: 'GroupIcon',
  fontSize: '$3',
});

const GroupTitle = styled(Text, {
  name: 'GroupTitle',
  fontSize: '$2',
  fontWeight: '500',
  color: '$colorMuted',
});

const NutritionSection = styled(YStack, {
  name: 'NutritionSection',
  gap: '$3',
});

const NutritionBar = styled(XStack, {
  name: 'NutritionBar',
  alignItems: 'center',
  gap: '$3',
});

const NutritionLabel = styled(Text, {
  name: 'NutritionLabel',
  fontSize: '$2',
  color: '$colorMuted',
  width: 80,
});

const NutritionBarTrack = styled(Stack, {
  name: 'NutritionBarTrack',
  flex: 1,
  height: 8,
  borderRadius: 4,
  backgroundColor: '$color3',
  overflow: 'hidden',
});

const NutritionBarFill = styled(Stack, {
  name: 'NutritionBarFill',
  height: '100%',
  borderRadius: 4,
});

const NutritionValue = styled(Text, {
  name: 'NutritionValue',
  fontSize: '$2',
  fontWeight: '600',
  color: '$color',
  width: 50,
  textAlign: 'right',
});

const ViewDetailsButton = styled(Stack, {
  name: 'ViewDetailsButton',
  paddingVertical: '$3',
  paddingHorizontal: '$4',
  borderRadius: '$6',
  backgroundColor: '$primary',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  pressStyle: {
    opacity: 0.9,
    scale: 0.98,
  },
  animation: 'quick',
});

const ViewDetailsText = styled(Text, {
  name: 'ViewDetailsText',
  fontSize: '$3',
  fontWeight: '600',
  color: '$primaryContrast',
});

// ============================================================================
// 辅助组件
// ============================================================================
function groupIngredients(ingredients: IngredientData[]) {
  const safe = ingredients.filter((i) => i.type === 'safe' || i.type === 'premium');
  const caution = ingredients.filter((i) => i.type === 'caution');
  const risk = ingredients.filter((i) => i.type === 'risk');
  const neutral = ingredients.filter((i) => i.type === 'neutral');

  return { safe, caution, risk, neutral };
}

function getNutritionColor(value: number, target?: number): string {
  if (!target) return '#7FB093'; // sage7
  const ratio = value / target;
  if (ratio >= 0.9 && ratio <= 1.1) return '#22C55E'; // 接近目标
  if (ratio >= 0.7 && ratio <= 1.3) return '#EAB308'; // 稍有偏差
  return '#F43F5E'; // 偏差较大
}

// ============================================================================
// 主组件
// ============================================================================
export function IngredientAnalysisCard({
  name,
  brand,
  imageUrl,
  score,
  ingredients,
  nutritionData,
  summary,
  onIngredientPress,
  onViewDetails,
  compact,
  testID,
}: IngredientAnalysisCardProps) {
  const { safe, caution, risk } = groupIngredients(ingredients);

  const handleIngredientPress = (ingredient: { name: string; type?: IngredientType }) => {
    const fullIngredient = ingredients.find(
      (i) => i.name === ingredient.name && i.type === ingredient.type
    );
    if (fullIngredient && onIngredientPress) {
      onIngredientPress(fullIngredient);
    }
  };

  return (
    <CardContainer compact={compact} testID={testID}>
      {/* 头部图片区域 */}
      <HeaderImageContainer compact={compact}>
        {imageUrl ? (
          <ImageBackground
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 100,
              }}
            />
            {brand && (
              <BrandBadge>
                <BrandText>{brand}</BrandText>
              </BrandBadge>
            )}
            <HeaderOverlay>
              <ProductName numberOfLines={2}>{name}</ProductName>
            </HeaderOverlay>
          </ImageBackground>
        ) : (
          <Stack backgroundColor="$primary" width="100%" height="100%" justifyContent="flex-end">
            <LinearGradient
              colors={['rgba(127, 176, 147, 0.8)', 'rgba(127, 176, 147, 1)']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            {brand && (
              <BrandBadge>
                <BrandText>{brand}</BrandText>
              </BrandBadge>
            )}
            <HeaderOverlay>
              <ProductName numberOfLines={2}>{name}</ProductName>
            </HeaderOverlay>
          </Stack>
        )}
      </HeaderImageContainer>

      <ContentSection>
        {/* 评分区域 */}
        <ScoreSection>
          <CircularScore score={score} size={compact ? 'md' : 'lg'} label="综合评分" />
          <ScoreInfo>
            {summary && <SummaryText numberOfLines={compact ? 2 : 4}>{summary}</SummaryText>}
          </ScoreInfo>
        </ScoreSection>

        <Separator marginVertical="$2" />

        {/* 成分区域 */}
        <IngredientsSection>
          <SectionTitle>成分分析</SectionTitle>

          {/* 安全/优质成分 */}
          {safe.length > 0 && (
            <IngredientGroup>
              <GroupLabel>
                <GroupIcon>✓</GroupIcon>
                <GroupTitle>优质成分 ({safe.length})</GroupTitle>
              </GroupLabel>
              <IngredientTagList
                ingredients={safe}
                size="sm"
                maxDisplay={compact ? 4 : 8}
                onTagPress={handleIngredientPress}
              />
            </IngredientGroup>
          )}

          {/* 警告成分 */}
          {caution.length > 0 && (
            <IngredientGroup>
              <GroupLabel>
                <GroupIcon>⚠</GroupIcon>
                <GroupTitle>需关注 ({caution.length})</GroupTitle>
              </GroupLabel>
              <IngredientTagList
                ingredients={caution}
                size="sm"
                maxDisplay={compact ? 3 : 6}
                onTagPress={handleIngredientPress}
              />
            </IngredientGroup>
          )}

          {/* 风险成分 */}
          {risk.length > 0 && (
            <IngredientGroup>
              <GroupLabel>
                <GroupIcon>✕</GroupIcon>
                <GroupTitle>不推荐 ({risk.length})</GroupTitle>
              </GroupLabel>
              <IngredientTagList
                ingredients={risk}
                size="sm"
                maxDisplay={compact ? 3 : 6}
                onTagPress={handleIngredientPress}
              />
            </IngredientGroup>
          )}
        </IngredientsSection>

        {/* 营养数据区域 */}
        {nutritionData && nutritionData.length > 0 && !compact && (
          <>
            <Separator marginVertical="$2" />
            <NutritionSection>
              <SectionTitle>营养成分</SectionTitle>
              {nutritionData.slice(0, 5).map((item, index) => (
                <NutritionBar key={`${item.label}-${index}`}>
                  <NutritionLabel>{item.label}</NutritionLabel>
                  <NutritionBarTrack>
                    <NutritionBarFill
                      width={`${Math.min(item.value, 100)}%`}
                      backgroundColor={getNutritionColor(item.value, item.target) as any}
                    />
                  </NutritionBarTrack>
                  <NutritionValue>
                    {item.value}
                    {item.unit}
                  </NutritionValue>
                </NutritionBar>
              ))}
            </NutritionSection>
          </>
        )}

        {/* 查看详情按钮 */}
        {onViewDetails && (
          <ViewDetailsButton onPress={onViewDetails}>
            <ViewDetailsText>查看完整分析报告</ViewDetailsText>
          </ViewDetailsButton>
        )}
      </ContentSection>
    </CardContainer>
  );
}

export type IngredientAnalysisCardType = GetProps<typeof IngredientAnalysisCard>;
