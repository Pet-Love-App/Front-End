/**
 * 宠物健康服务
 * 提供健康档案和体重记录的 CRUD 操作
 */

import { supabase } from '../client';
import { logger } from '../helpers';
import type {
  PetHealthRecord,
  CreateHealthRecordParams,
  UpdateHealthRecordParams,
  PetWeightRecord,
  CreateWeightRecordParams,
  UpdateWeightRecordParams,
  HealthReminder,
  WeightStatistics,
} from '@/src/types/petHealth';

// ==================== 健康档案 ====================

/**
 * 获取宠物的健康记录列表
 */
export async function getPetHealthRecords(petId: number, recordType?: 'vaccine' | 'deworming') {
  logger.query('pet_health_records', 'getPetHealthRecords', { petId, recordType });

  try {
    let query = supabase
      .from('pet_health_records')
      .select('*')
      .eq('pet_id', petId)
      .order('date', { ascending: false });

    if (recordType) {
      query = query.eq('record_type', recordType);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('pet_health_records', 'getPetHealthRecords', error);
      return { data: null, error };
    }

    logger.success('pet_health_records', 'getPetHealthRecords');
    return { data: data as PetHealthRecord[], error: null };
  } catch (err) {
    logger.error('pet_health_records', 'getPetHealthRecords', err);
    return { data: null, error: err };
  }
}

/**
 * 创建健康记录
 */
export async function createHealthRecord(params: CreateHealthRecordParams) {
  logger.query('pet_health_records', 'createHealthRecord', { params });

  try {
    const { data, error } = await supabase
      .from('pet_health_records')
      .insert(params)
      .select()
      .single();

    if (error) {
      logger.error('pet_health_records', 'createHealthRecord', error);
      return { data: null, error };
    }

    logger.success('pet_health_records', 'createHealthRecord');
    return { data: data as PetHealthRecord, error: null };
  } catch (err) {
    logger.error('pet_health_records', 'createHealthRecord', err);
    return { data: null, error: err };
  }
}

/**
 * 更新健康记录
 */
export async function updateHealthRecord(id: number, params: UpdateHealthRecordParams) {
  logger.query('pet_health_records', 'updateHealthRecord', { id, params });

  try {
    const { data, error } = await supabase
      .from('pet_health_records')
      .update(params)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('pet_health_records', 'updateHealthRecord', error);
      return { data: null, error };
    }

    logger.success('pet_health_records', 'updateHealthRecord');
    return { data: data as PetHealthRecord, error: null };
  } catch (err) {
    logger.error('pet_health_records', 'updateHealthRecord', err);
    return { data: null, error: err };
  }
}

/**
 * 删除健康记录
 */
export async function deleteHealthRecord(id: number) {
  logger.query('pet_health_records', 'deleteHealthRecord', { id });

  try {
    const { error } = await supabase.from('pet_health_records').delete().eq('id', id);

    if (error) {
      logger.error('pet_health_records', 'deleteHealthRecord', error);
      return { error };
    }

    logger.success('pet_health_records', 'deleteHealthRecord');
    return { error: null };
  } catch (err) {
    logger.error('pet_health_records', 'deleteHealthRecord', err);
    return { error: err };
  }
}

/**
 * 获取健康提醒（即将到期的疫苗/驱虫）
 */
export async function getHealthReminders(petId?: number): Promise<{
  data: HealthReminder[] | null;
  error: any;
}> {
  logger.query('pet_health_records', 'getHealthReminders', { petId });

  try {
    // 获取所有有 next_date 的记录
    let query = supabase
      .from('pet_health_records')
      .select('*, pets!inner(name)')
      .not('next_date', 'is', null)
      .gte('next_date', new Date().toISOString().split('T')[0]); // 未来的日期

    if (petId) {
      query = query.eq('pet_id', petId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('pet_health_records', 'getHealthReminders', error);
      return { data: null, error };
    }

    // 转换为提醒格式
    const reminders: HealthReminder[] = (data || []).map((record: any) => {
      const dueDate = new Date(record.next_date);
      const today = new Date();
      const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: record.id,
        pet_id: record.pet_id,
        pet_name: record.pets.name,
        type: record.record_type,
        name: record.name,
        due_date: record.next_date,
        days_until: daysUntil,
        is_overdue: daysUntil < 0,
      };
    });

    // 按日期排序
    reminders.sort((a, b) => a.days_until - b.days_until);

    logger.success('pet_health_records', 'getHealthReminders');
    return { data: reminders, error: null };
  } catch (err) {
    logger.error('pet_health_records', 'getHealthReminders', err);
    return { data: null, error: err };
  }
}

// ==================== 体重记录 ====================

/**
 * 获取宠物的体重记录列表
 */
export async function getPetWeightRecords(petId: number, limit?: number) {
  logger.query('pet_weight_records', 'getPetWeightRecords', { petId, limit });

  try {
    let query = supabase
      .from('pet_weight_records')
      .select('*')
      .eq('pet_id', petId)
      .order('recorded_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('pet_weight_records', 'getPetWeightRecords', error);
      return { data: null, error };
    }

    logger.success('pet_weight_records', 'getPetWeightRecords');
    return { data: data as PetWeightRecord[], error: null };
  } catch (err) {
    logger.error('pet_weight_records', 'getPetWeightRecords', err);
    return { data: null, error: err };
  }
}

/**
 * 创建体重记录
 */
export async function createWeightRecord(params: CreateWeightRecordParams) {
  logger.query('pet_weight_records', 'createWeightRecord', { params });

  try {
    const { data, error } = await supabase
      .from('pet_weight_records')
      .insert({
        ...params,
        record_date: params.record_date || new Date().toISOString().split('T')[0],
        recorded_at: params.recorded_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.error('pet_weight_records', 'createWeightRecord', error);
      return { data: null, error };
    }

    logger.success('pet_weight_records', 'createWeightRecord');
    return { data: data as PetWeightRecord, error: null };
  } catch (err) {
    logger.error('pet_weight_records', 'createWeightRecord', err);
    return { data: null, error: err };
  }
}

/**
 * 更新体重记录
 */
export async function updateWeightRecord(id: number, params: UpdateWeightRecordParams) {
  logger.query('pet_weight_records', 'updateWeightRecord', { id, params });

  try {
    const { data, error } = await supabase
      .from('pet_weight_records')
      .update(params)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('pet_weight_records', 'updateWeightRecord', error);
      return { data: null, error };
    }

    logger.success('pet_weight_records', 'updateWeightRecord');
    return { data: data as PetWeightRecord, error: null };
  } catch (err) {
    logger.error('pet_weight_records', 'updateWeightRecord', err);
    return { data: null, error: err };
  }
}

/**
 * 删除体重记录
 */
export async function deleteWeightRecord(id: number) {
  logger.query('pet_weight_records', 'deleteWeightRecord', { id });

  try {
    const { error } = await supabase.from('pet_weight_records').delete().eq('id', id);

    if (error) {
      logger.error('pet_weight_records', 'deleteWeightRecord', error);
      return { error };
    }

    logger.success('pet_weight_records', 'deleteWeightRecord');
    return { error: null };
  } catch (err) {
    logger.error('pet_weight_records', 'deleteWeightRecord', err);
    return { error: err };
  }
}

/**
 * 获取体重统计数据
 */
export async function getWeightStatistics(petId: number): Promise<{
  data: WeightStatistics | null;
  error: any;
}> {
  logger.query('pet_weight_records', 'getWeightStatistics', { petId });

  try {
    const { data, error } = await getPetWeightRecords(petId);

    if (error || !data || data.length === 0) {
      return { data: null, error: error || 'No data' };
    }

    const weights = data.map((r) => r.weight);
    const current = weights[0]; // 最新的
    const previous = weights[1] || current;
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const avg = weights.reduce((sum, w) => sum + w, 0) / weights.length;
    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 2) {
      trend = change > 0 ? 'up' : 'down';
    }

    const statistics: WeightStatistics = {
      current,
      min,
      max,
      avg: Math.round(avg * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 10) / 10,
      trend,
    };

    logger.success('pet_weight_records', 'getWeightStatistics');
    return { data: statistics, error: null };
  } catch (err) {
    logger.error('pet_weight_records', 'getWeightStatistics', err);
    return { data: null, error: err };
  }
}
