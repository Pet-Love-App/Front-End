/**
 * 营养数据常量和工具函数
 */

/** 图表配色方案 */
export const CHART_COLORS = [
  '#E74C3C', // 红色 - 蛋白质
  '#2ECC71', // 绿色 - 纤维
  '#3498DB', // 蓝色 - 水分
  '#F1C40F', // 黄色 - 碳水
  '#9B59B6', // 紫色 - 其他
  '#1ABC9C', // 青绿色
  '#E67E22', // 橙色 - 脂肪
  '#34495E', // 深蓝色
  '#95A5A6', // 灰色 - 灰分
  '#2C3E50', // 深灰色
] as const;

/** 营养成分中文名称映射 */
export const NUTRITION_NAME_MAP: Record<string, string> = {
  protein: '粗蛋白',
  crude_protein: '粗蛋白',
  fat: '粗脂肪',
  crude_fat: '粗脂肪',
  carbohydrates: '碳水化合物',
  fiber: '粗纤维',
  crude_fiber: '粗纤维',
  ash: '粗灰分',
  crude_ash: '粗灰分',
  moisture: '水分',
  others: '其它',
};

/** 营养成分颜色映射 */
export const NUTRITION_COLOR_MAP: Record<string, string> = {
  protein: '$red9',
  crude_protein: '$red9',
  fat: '$orange9',
  crude_fat: '$orange9',
  carbohydrates: '$yellow9',
  fiber: '$green9',
  crude_fiber: '$green9',
  ash: '$gray9',
  crude_ash: '$gray9',
  moisture: '$blue9',
  others: '$purple9',
};

export interface PieChartDataItem {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

/**
 * 准备饼图数据
 */
export function preparePieChartData(
  percentData: Record<string, number | null> | undefined
): PieChartDataItem[] {
  if (!percentData || typeof percentData !== 'object') {
    return [];
  }

  const validEntries = Object.entries(percentData).filter(
    ([_, value]) => typeof value === 'number' && value > 0
  );

  if (validEntries.length === 0) {
    return [];
  }

  return validEntries.map(([key, value], index) => ({
    name: NUTRITION_NAME_MAP[key] || key,
    population: parseFloat((value as number).toFixed(1)),
    color: CHART_COLORS[index % CHART_COLORS.length],
    legendFontColor: '#666',
    legendFontSize: 12,
  }));
}

/**
 * 检查是否有有效的营养数据
 */
export function hasValidNutritionData(
  percentage: boolean | null | undefined,
  percentData: Record<string, number | null> | undefined
): boolean {
  return (
    percentage === true &&
    !!percentData &&
    typeof percentData === 'object' &&
    Object.keys(percentData).length > 0
  );
}

/**
 * 获取营养成分显示名称
 */
export function getNutritionLabel(key: string): string {
  return NUTRITION_NAME_MAP[key] || key;
}

/**
 * 获取营养成分颜色
 */
export function getNutritionColor(key: string): string {
  return NUTRITION_COLOR_MAP[key] || '$blue9';
}
