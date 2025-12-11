import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable } from 'react-native';
import { Button, Text, TextArea, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { useResponsiveLayout } from '@/src/hooks/useResponsiveLayout';
import { supabaseCatfoodService, supabaseCommentService } from '@/src/lib/supabase';
import { useCatFoodStore } from '@/src/store/catFoodStore';
import { warningScale, neutralScale, successScale, errorScale } from '@/src/design-system/tokens';

interface RatingSectionProps {
  catfoodId: number;
}

export function RatingSection({ catfoodId }: RatingSectionProps) {
  const [myRating, setMyRating] = useState<number>(0);
  const [myComment, setMyComment] = useState<string>('');
  const [myRatingId, setMyRatingId] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const fetchCatFoodById = useCatFoodStore((state) => state.fetchCatFoodById);
  const { width, isExtraSmallScreen } = useResponsiveLayout();

  // 响应式计算星星尺寸和间距
  const starConfig = useMemo(() => {
    // 计算可用宽度（减去卡片内边距和其他元素）
    const cardPadding = 32; // $4 的像素值
    const ratingDisplayWidth = myRating > 0 ? 60 : 0; // 评分显示的宽度
    const availableWidth = width - cardPadding * 2 - ratingDisplayWidth - 40; // 40px 留作余量

    // 计算每个星星的最大宽度
    const minStarSize = 36; // 最小星星尺寸
    const maxStarSize = 48; // 最大星星尺寸
    const starCount = 5;
    const minGap = 4; // 最小间距
    const maxGap = 8; // 最大间距

    // 根据可用宽度动态计算
    let starSize = maxStarSize;
    let gap = maxGap;

    // 如果空间不够，逐步缩小
    while (
      starSize >= minStarSize &&
      starSize * starCount + gap * (starCount - 1) > availableWidth
    ) {
      starSize -= 2;
      if (starSize < 40) {
        gap = minGap;
      }
    }

    return {
      size: Math.max(minStarSize, starSize),
      iconSize: Math.max(20, Math.floor(starSize * 0.58)),
      gap: gap,
    };
  }, [width, myRating]);

  // 加载用户的评分
  useEffect(() => {
    const loadMyRating = async () => {
      try {
        console.log('🔍 开始加载用户评分...');
        const { data: rating, error } = await supabaseCatfoodService.getUserRating(
          String(catfoodId)
        );
        if (error) {
          console.log('ℹ️ 用户尚未评分（正常）');
          return;
        }
        if (rating) {
          console.log('✅ 加载到已有评分:', rating);
          setMyRating(rating.score);
          setMyComment(rating.comment || '');
          setMyRatingId(rating.id);
          setHasRated(true);
        } else {
          console.log('ℹ️ 用户尚未评分');
        }
      } catch (error: any) {
        console.error('⚠️ 加载评分时出错:', error);
      }
    };
    loadMyRating();
  }, [catfoodId]);

  // 处理评分（无弹窗，静默更新）
  const handleRate = useCallback(
    async (score: number) => {
      console.log('🌟 点击评分:', score);

      if (loading) {
        console.log('⏳ 正在加载中，忽略点击');
        return;
      }

      try {
        setLoading(true);

        // 立即更新UI（乐观更新）
        setMyRating(score);
        setHasRated(true);

        console.log('📡 开始提交评分...');
        const { error } = await supabaseCatfoodService.createRating(
          String(catfoodId),
          score,
          myComment
        );

        if (error) {
          throw new Error(error.message);
        }

        console.log('✅ 评分提交成功');

        // 刷新猫粮数据以更新平均分
        console.log('🔄 刷新猫粮数据...');
        await fetchCatFoodById(catfoodId);
        console.log('✅ 数据刷新完成');

        // 不弹窗，只在控制台记录成功
      } catch (error: any) {
        console.error('❌ 评分失败:', error);

        // 回滚UI
        setMyRating(0);
        setHasRated(false);

        // 只在出错时才弹窗提示
        let errorMessage = '评分失败，请稍后重试';
        if (error.message?.includes('未登录')) {
          errorMessage = '请先登录后再评分';
        } else if (error.message) {
          errorMessage = error.message;
        }

        Alert.alert('评分失败', errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [catfoodId, myComment, loading, fetchCatFoodById]
  );

  // 处理评论提交
  const handleSubmit = useCallback(async () => {
    if (myRating === 0) {
      Alert.alert('提示', '请先选择评分');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      // 提交评分
      const { error: ratingError } = await supabaseCatfoodService.createRating(
        String(catfoodId),
        myRating,
        myComment
      );

      if (ratingError) {
        throw new Error(ratingError.message);
      }

      // 如果有评论内容，同时创建评论记录（显示在评论区）
      if (myComment.trim()) {
        try {
          const { error: commentError } = await supabaseCommentService.createComment({
            targetType: 'catfood',
            targetId: catfoodId,
            content: `⭐ ${myRating}星评价：${myComment}`,
          });
          if (commentError) {
            console.warn('创建评论失败，但评分已成功:', commentError);
          }
        } catch (commentError) {
          console.warn('创建评论失败，但评分已成功:', commentError);
          // 评论创建失败不影响评分成功
        }
      }

      setHasRated(true);

      // 刷新猫粮数据以更新平均分
      await fetchCatFoodById(catfoodId);

      // 只有首次评分或提交评论时才提示
      if (!hasRated || myComment.trim()) {
        Alert.alert('成功', myComment.trim() ? '评分和评论已发布！' : '评分成功！');
      }
      // 否则静默更新，不弹窗
    } catch (error: any) {
      console.error('提交评分失败:', error);
      Alert.alert('错误', '提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [catfoodId, myRating, myComment, loading, hasRated, fetchCatFoodById]);

  // 处理删除评分
  const handleDelete = useCallback(async () => {
    if (!myRatingId) {
      Alert.alert('提示', '没有可删除的评分');
      return;
    }

    Alert.alert('确认删除', '确定要删除您的评分吗？删除后猫粮的平均分会重新计算。', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            console.log('🗑️ 开始删除评分，ID:', myRatingId);

            // 删除评分
            const { error } = await supabaseCatfoodService.deleteRating(String(catfoodId));

            if (error) {
              throw new Error(error.message);
            }

            console.log('✅ 评分删除成功');

            // 重置状态
            setMyRating(0);
            setMyComment('');
            setMyRatingId(null);
            setHasRated(false);

            // 刷新猫粮数据以更新平均分
            await fetchCatFoodById(catfoodId);
            console.log('✅ 数据刷新完成');

            // 静默删除，不弹窗提示
          } catch (error: any) {
            console.error('❌ 删除评分失败:', error);
            Alert.alert('删除失败', error.message || '删除评分失败，请稍后重试');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }, [myRatingId, catfoodId, fetchCatFoodById]);

  return (
    <YStack
      marginHorizontal="$3"
      marginBottom="$3"
      borderRadius={20}
      backgroundColor="white"
      overflow="hidden"
      borderWidth={1}
      borderColor={neutralScale.neutral3}
    >
      {/* 标题栏 */}
      <XStack
        padding="$4"
        alignItems="center"
        gap="$3"
        borderBottomWidth={1}
        borderBottomColor={neutralScale.neutral2}
      >
        <YStack
          width={44}
          height={44}
          borderRadius={22}
          backgroundColor={warningScale.warning2}
          alignItems="center"
          justifyContent="center"
        >
          <IconSymbol name="star.fill" size={22} color={warningScale.warning6} />
        </YStack>
        <YStack flex={1}>
          <Text fontSize="$5" fontWeight="700" color={neutralScale.neutral12}>
            {hasRated ? '我的评分' : '给这款猫粮打分'}
          </Text>
          <Text fontSize={11} color={neutralScale.neutral8} marginTop={2}>
            {hasRated ? 'My Rating' : 'Rate This Product'}
          </Text>
        </YStack>
      </XStack>

      <YStack padding="$4" gap="$4">
        {/* 星星评分 */}
        <YStack gap="$3">
          <Text fontSize="$3" color={neutralScale.neutral10} fontWeight="600">
            选择评分
          </Text>
          <XStack
            gap={starConfig.gap}
            alignItems="center"
            flexWrap="nowrap"
            justifyContent="flex-start"
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= (hoverRating || myRating);
              return (
                <Pressable
                  key={star}
                  onPress={() => {
                    console.log('🎯 Pressable onPress 触发，星级:', star);
                    handleRate(star);
                  }}
                  onPressIn={() => {
                    console.log('👆 onPressIn:', star);
                    setHoverRating(star);
                  }}
                  onPressOut={() => {
                    console.log('👇 onPressOut');
                    setHoverRating(0);
                  }}
                  disabled={loading}
                  style={{ zIndex: 10 }}
                >
                  <YStack
                    width={starConfig.size}
                    height={starConfig.size}
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor={isActive ? warningScale.warning2 : neutralScale.neutral2}
                    borderRadius={starConfig.size / 2}
                    borderWidth={2}
                    borderColor={isActive ? warningScale.warning5 : neutralScale.neutral4}
                    pressStyle={{ scale: 0.9 }}
                    pointerEvents="none"
                  >
                    <IconSymbol
                      name={isActive ? 'star.fill' : 'star'}
                      size={starConfig.iconSize}
                      color={isActive ? warningScale.warning6 : neutralScale.neutral6}
                    />
                  </YStack>
                </Pressable>
              );
            })}
            {myRating > 0 && (
              <YStack
                paddingHorizontal={isExtraSmallScreen ? '$2.5' : '$3'}
                paddingVertical="$2"
                backgroundColor={warningScale.warning6}
                borderRadius={16}
                marginLeft="$2"
              >
                <Text color="white" fontSize={isExtraSmallScreen ? '$3' : '$4'} fontWeight="800">
                  {myRating}.0
                </Text>
              </YStack>
            )}
          </XStack>
          {myRating === 0 && (
            <Text fontSize="$2" color={neutralScale.neutral7}>
              点击星星进行评分
            </Text>
          )}
        </YStack>

        {/* 评论输入 */}
        {myRating > 0 && (
          <>
            <YStack gap="$2">
              <Text fontSize="$3" color={neutralScale.neutral10} fontWeight="600">
                评价内容（选填）
              </Text>
              <TextArea
                placeholder="说说你的使用感受吧..."
                value={myComment}
                onChangeText={setMyComment}
                numberOfLines={4}
                backgroundColor={neutralScale.neutral1}
                borderColor={neutralScale.neutral4}
                borderRadius={12}
                padding="$3"
                fontSize="$3"
                maxLength={500}
              />
              <Text fontSize="$1" color={neutralScale.neutral7} textAlign="right">
                {myComment.length}/500
              </Text>
            </YStack>

            {/* 提交按钮 */}
            <Button
              size="$4"
              backgroundColor={warningScale.warning6}
              borderWidth={0}
              borderRadius={12}
              onPress={handleSubmit}
              disabled={loading}
              pressStyle={{
                scale: 0.98,
                backgroundColor: warningScale.warning7,
              }}
              icon={
                <IconSymbol
                  name={hasRated ? 'checkmark.circle.fill' : 'paperplane.fill'}
                  size={20}
                  color="white"
                />
              }
            >
              <Text color="white" fontSize="$4" fontWeight="700">
                {loading ? '提交中...' : hasRated ? '更新评分' : '提交评分'}
              </Text>
            </Button>
          </>
        )}

        {/* 提示信息 */}
        {hasRated && (
          <YStack gap="$3">
            <YStack
              padding="$3"
              backgroundColor={successScale.success1}
              borderRadius={12}
              borderWidth={1}
              borderColor={successScale.success4}
            >
              <XStack alignItems="center" gap="$2">
                <IconSymbol name="checkmark.circle.fill" size={18} color={successScale.success7} />
                <Text fontSize="$2" color={successScale.success9} fontWeight="500">
                  您已评分，可以随时修改或删除
                </Text>
              </XStack>
            </YStack>

            {/* 删除评分按钮 */}
            <Button
              size="$3"
              backgroundColor="transparent"
              borderWidth={1.5}
              borderColor={errorScale.error5}
              borderRadius={10}
              onPress={handleDelete}
              disabled={loading}
              pressStyle={{
                scale: 0.98,
                backgroundColor: errorScale.error1,
              }}
              icon={<IconSymbol name="trash" size={16} color={errorScale.error7} />}
            >
              <Text color={errorScale.error7} fontSize="$3" fontWeight="600">
                删除我的评分
              </Text>
            </Button>
          </YStack>
        )}
      </YStack>
    </YStack>
  );
}
