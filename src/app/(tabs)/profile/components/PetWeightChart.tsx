/**
 * 宠物体重折线图组件
 * 使用 react-native-chart-kit 显示体重变化趋势
 */

import { useState, useEffect, useCallback } from 'react';
import { YStack, XStack, Text, Card } from 'tamagui';
import { LineChart } from 'react-native-chart-kit';
import { TrendingUp, TrendingDown, Minus } from '@tamagui/lucide-icons';
import { Button } from '@/src/design-system/components';
import { supabasePetHealthService } from '@/src/lib/supabase';
import type { PetWeightRecord, WeightStatistics } from '@/src/types/petHealth';
import type { LayoutChangeEvent } from 'react-native';

interface Props {
  petId: number;
  petName: string;
  refreshTrigger?: number; // 用于触发刷新的时间戳
}

export function PetWeightChart({ petId, petName, refreshTrigger }: Props) {
  const [records, setRecords] = useState<PetWeightRecord[]>([]);
  const [stats, setStats] = useState<WeightStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartWidth, setChartWidth] = useState(300); // 默认宽度

  const loadData = useCallback(async () => {
    setLoading(true);
    const [recordsRes, statsRes] = await Promise.all([
      supabasePetHealthService.getPetWeightRecords(petId, 30), // 最近30条
      supabasePetHealthService.getWeightStatistics(petId),
    ]);
    setRecords(recordsRes.data || []);
    setStats(statsRes.data);
    setLoading(false);
  }, [petId]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTrigger]);

  // 动态计算图表宽度
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    // 减去 Card 的 padding ($3 = 12px on each side)
    setChartWidth(width - 24);
  };

  if (loading) {
    return (
      <Card padding="$4">
        <Text textAlign="center" color="$gray10">
          加载中...
        </Text>
      </Card>
    );
  }

  if (!records.length) {
    return (
      <Card padding="$6" alignItems="center">
        <Text color="$gray10" marginBottom="$2">
          暂无体重记录
        </Text>
        <Button size="sm" variant="primary">
          添加第一条记录
        </Button>
      </Card>
    );
  }

  // 准备图表数据（最近10条，倒序）
  const chartData = records
    .slice(0, 10)
    .reverse()
    .map((r) => ({
      weight: r.weight,
      date: new Date(r.record_date).toLocaleDateString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
      }),
    }));

  return (
    <YStack gap="$4">
      {/* 统计卡片 */}
      {stats && (
        <XStack gap="$2">
          <Card flex={1} padding="$3" backgroundColor="$blue2">
            <Text fontSize="$2" color="$gray11" marginBottom="$1">
              当前体重
            </Text>
            <Text fontSize="$7" fontWeight="bold" color="$blue11">
              {stats.current} kg
            </Text>
          </Card>

          <Card
            flex={1}
            padding="$3"
            backgroundColor={
              stats.trend === 'up' ? '$orange2' : stats.trend === 'down' ? '$green2' : '$gray2'
            }
          >
            <Text fontSize="$2" color="$gray11" marginBottom="$1">
              变化
            </Text>
            <XStack alignItems="center" gap="$1">
              {stats.trend === 'up' ? (
                <TrendingUp size={16} color="$orange10" />
              ) : stats.trend === 'down' ? (
                <TrendingDown size={16} color="$green10" />
              ) : (
                <Minus size={16} color="$gray10" />
              )}
              <Text
                fontSize="$5"
                fontWeight="600"
                color={
                  stats.trend === 'up'
                    ? '$orange10'
                    : stats.trend === 'down'
                      ? '$green10'
                      : '$gray10'
                }
              >
                {stats.change > 0 ? '+' : ''}
                {stats.change} kg
              </Text>
            </XStack>
          </Card>
        </XStack>
      )}

      {/* 折线图 */}
      <Card padding="$3" onLayout={handleLayout}>
        <Text fontSize="$5" fontWeight="600" marginBottom="$3">
          体重变化趋势
        </Text>
        {chartWidth > 0 && (
          <LineChart
            data={{
              labels: chartData.map((d) => d.date),
              datasets: [
                {
                  data: chartData.map((d) => d.weight),
                },
              ],
            }}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#3b82f6',
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        )}

        {/* 统计信息 */}
        {stats && (
          <XStack
            justifyContent="space-around"
            marginTop="$3"
            paddingTop="$3"
            borderTopWidth={1}
            borderColor="$gray5"
          >
            <YStack alignItems="center">
              <Text fontSize="$2" color="$gray11">
                最小
              </Text>
              <Text fontSize="$4" fontWeight="600">
                {stats.min} kg
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize="$2" color="$gray11">
                平均
              </Text>
              <Text fontSize="$4" fontWeight="600">
                {stats.avg} kg
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text fontSize="$2" color="$gray11">
                最大
              </Text>
              <Text fontSize="$4" fontWeight="600">
                {stats.max} kg
              </Text>
            </YStack>
          </XStack>
        )}
      </Card>
    </YStack>
  );
}
