/**
 * 宠物健康相关类型定义
 */

// ==================== 健康档案 ====================

/** 健康记录类型 */
export type HealthRecordType = 'vaccine' | 'deworming';

/** 宠物健康记录 */
export interface PetHealthRecord {
  id: number;
  pet_id: number;
  record_type: HealthRecordType;

  // 基本信息
  name: string; // 疫苗名称或驱虫药名称
  date: string; // 接种/驱虫日期 (YYYY-MM-DD)
  next_date?: string | null; // 下次日期

  // 详细信息
  brand?: string | null; // 品牌
  batch_number?: string | null; // 批号
  dosage?: string | null; // 剂量
  location?: string | null; // 接种部位/给药方式
  veterinarian?: string | null; // 兽医
  clinic?: string | null; // 诊所
  notes?: string | null; // 备注

  // 附件
  image_urls?: string[] | null; // 照片

  // 时间戳
  created_at: string;
  updated_at: string;
}

/** 创建健康记录参数 */
export interface CreateHealthRecordParams {
  pet_id: number;
  record_type: HealthRecordType;
  name: string;
  date: string;
  next_date?: string;
  brand?: string;
  batch_number?: string;
  dosage?: string;
  location?: string;
  veterinarian?: string;
  clinic?: string;
  notes?: string;
  image_urls?: string[];
}

/** 更新健康记录参数 */
export type UpdateHealthRecordParams = Partial<Omit<CreateHealthRecordParams, 'pet_id'>>;

// ==================== 体重记录 ====================

/** 体重单位 */
export type WeightUnit = 'kg' | 'lb';

/** 精神状态 */
export type PetMood = 'active' | 'normal' | 'lethargic';

/** 宠物心情 (扩展版) */
export type Mood = 'happy' | 'active' | 'calm' | 'sleepy' | 'anxious' | 'sick';

/** 体况评分 (1-5 简化版) */
export type BodyConditionScore = 1 | 2 | 3 | 4 | 5;

/** 宠物体重记录 */
export interface PetWeightRecord {
  id: number;
  pet_id: number;

  // 体重数据
  weight: number; // 体重值
  unit: WeightUnit; // 单位

  // 记录信息
  record_date: string; // 记录日期 (YYYY-MM-DD)
  recorded_at: string; // 记录时间戳
  notes?: string | null; // 备注

  // 健康指标
  body_condition_score?: number | null; // 体况评分 1-9
  mood?: PetMood | null; // 精神状态

  // 时间戳
  created_at: string;
  updated_at: string;
}

/** 创建体重记录参数 */
export interface CreateWeightRecordParams {
  pet_id: number;
  weight: number;
  unit?: WeightUnit;
  record_date?: string; // 默认今天
  recorded_at?: string; // 默认现在
  notes?: string;
  body_condition_score?: number;
  mood?: PetMood;
}

/** 更新体重记录参数 */
export type UpdateWeightRecordParams = Partial<Omit<CreateWeightRecordParams, 'pet_id'>>;

// ==================== 图表数据 ====================

/** 体重图表数据点 */
export interface WeightChartDataPoint {
  date: string; // YYYY-MM-DD
  weight: number; // kg
  label: string; // 显示标签
}

/** 体重统计数据 */
export interface WeightStatistics {
  current: number; // 当前体重
  min: number; // 最小体重
  max: number; // 最大体重
  avg: number; // 平均体重
  change: number; // 变化量（相比上次）
  changePercent: number; // 变化百分比
  trend: 'up' | 'down' | 'stable'; // 趋势
}

// ==================== 健康提醒 ====================

/** 健康提醒项 */
export interface HealthReminder {
  id: number;
  pet_id: number;
  pet_name: string;
  type: HealthRecordType;
  name: string; // 疫苗/驱虫名称
  due_date: string; // 到期日期
  days_until: number; // 距离天数
  is_overdue: boolean; // 是否逾期
}
