/**
 * 猫粮收藏扩展数据库操作接口
 * 
 * 提供添加剂、营养成分、评论的 CRUD 操作
 */

import { Additive, CatFoodDetailItem, Nutrition, TopComment } from '@/src/types/collect';
import { getCollectById } from './collectService';
import { getDatabase } from './database';

async function ensureAdditiveIdColumnExists() {
  const db = await getDatabase();
  try {
    const cols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(cat_food_additives)');
    const hasCol = Array.isArray(cols) && cols.some(c => c.name === 'additiveId');
    if (!hasCol) {
      await db.execAsync('ALTER TABLE cat_food_additives ADD COLUMN additiveId INTEGER');
      await db.execAsync('CREATE INDEX IF NOT EXISTS idx_additives_additiveId ON cat_food_additives(additiveId)');
      console.log('✅ 动态补充 additiveId 列及索引');
    }
  } catch (e) {
    console.warn('⚠️ 检查/补充 additiveId 列失败:', e);
  }
}

// 新增：保存/查询添加剂主数据（与后端对齐）
export async function upsertAdditiveMaster(row: { id?: number; name: string; en_name?: string; type?: string; applicable_range?: string; raw?: any }): Promise<number | null> {
  try {
    const db = await getDatabase();
    const now = Date.now();

    // 如果有后端 id，则直接作为主键写入；否则使用 name 作为唯一键去重
    const existing = await db.getFirstAsync<{ id: number }>('SELECT id FROM additives_master WHERE name = ? LIMIT 1', [row.name]);
    if (existing) {
      await db.runAsync(
        'UPDATE additives_master SET en_name = ?, type = ?, applicable_range = ?, raw_json = ?, updatedAt = ? WHERE id = ?',
        [row.en_name || null, row.type || null, row.applicable_range || null, JSON.stringify(row.raw ?? null), now, existing.id]
      );
      return existing.id;
    }

    const result = await db.runAsync(
      'INSERT INTO additives_master (id, name, en_name, type, applicable_range, raw_json, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [row.id ?? null, row.name, row.en_name || null, row.type || null, row.applicable_range || null, JSON.stringify(row.raw ?? null), now, now]
    );

    // 若未提供 id，则 SQLite 会分配 ROWID 作为 id
    const insertedId = (row.id ?? result.lastInsertRowId) as number;
    return insertedId;
  } catch (error) {
    console.error('❌ upsertAdditiveMaster 失败:', error);
    return null;
  }
}

export async function getAdditiveMasterByName(name: string): Promise<{ id: number; name: string; en_name?: string; type?: string; applicable_range?: string; raw_json?: string } | null> {
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ id: number; name: string; en_name?: string; type?: string; applicable_range?: string; raw_json?: string }>(
      'SELECT id, name, en_name, type, applicable_range, raw_json FROM additives_master WHERE name = ? LIMIT 1',
      [name]
    );
    return row || null;
  } catch (error) {
    console.error('❌ 查询 additives_master 失败:', error);
    return null;
  }
}

// ==================== 添加剂操作 ====================

/**
 * 添加单个添加剂
 */
export async function addAdditive(additive: Additive & { additiveId?: number }): Promise<boolean> {
  try {
    const db = await getDatabase();
    const now = Date.now();
    
    await db.runAsync(
      `INSERT INTO cat_food_additives 
       (foodId, additiveId, name, category, description, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        additive.foodId,
        additive.additiveId ?? null,
        additive.name,
        additive.category || null,
        additive.description || null,
        now,
      ]
    );
    
    console.log('✅ 添加添加剂成功:', additive.name);
    return true;
  } catch (error) {
    console.error('❌ 添加添加剂失败:', error);
    return false;
  }
}

/**
 * 批量添加添加剂
 */
export async function addAdditivesBatch(additives: (Additive & { additiveId?: number })[]): Promise<number> {
  let successCount = 0;
  
  for (const additive of additives) {
    if (await addAdditive(additive)) {
      successCount++;
    }
  }
  
  return successCount;
}

/**
 * 获取猫粮的所有添加剂
 */
export async function getAdditivesByFoodId(foodId: string): Promise<Additive[]> {
  try {
    // 确保历史数据库具备 additiveId 列
    await ensureAdditiveIdColumnExists();

    const db = await getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT a.*, m.id AS master_id, m.name AS master_name, m.en_name AS master_en_name, m.type AS master_type, m.applicable_range AS master_applicable_range
       FROM cat_food_additives a
       LEFT JOIN additives_master m ON a.additiveId = m.id
       WHERE a.foodId = ?
       ORDER BY a.id`,
      [foodId]
    );

    // 将 master 信息映射回现有 Additive 类型字段中（不改变类型定义）
    return (rows || []).map((r: any) => ({
      id: r.id,
      foodId: r.foodId,
      name: r.name || r.master_name, // 名称以链接表为准
      category: r.master_type || r.category || undefined, // 用后端 type 作为类别
      description: r.master_applicable_range || r.description || undefined, // 用适用范围作为描述
      createdAt: r.createdAt,
    }));
  } catch (error) {
    console.error('❌ 查询添加剂失败:', error);
    return [];
  }
}

/**
 * 删除添加剂
 */
export async function deleteAdditive(id: number): Promise<boolean> {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM cat_food_additives WHERE id = ?', [id]);
    console.log('✅ 删除添加剂成功');
    return true;
  } catch (error) {
    console.error('❌ 删除添加剂失败:', error);
    return false;
  }
}

/**
 * 删除猫粮的所有添加剂
 */
export async function deleteAdditivesByFoodId(foodId: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM cat_food_additives WHERE foodId = ?', [foodId]);
    console.log('✅ 删除猫粮所有添加剂成功');
    return true;
  } catch (error) {
    console.error('❌ 删除猫粮所有添加剂失败:', error);
    return false;
  }
}

// ==================== 营养成分操作 ====================

/**
 * 添加单个营养成分
 */
export async function addNutrition(nutrition: Nutrition): Promise<boolean> {
  try {
    const db = await getDatabase();
    const now = Date.now();
    
    await db.runAsync(
      `INSERT INTO cat_food_nutrition 
       (foodId, name, value, unit, percentage, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nutrition.foodId,
        nutrition.name,
        nutrition.value,
        nutrition.unit || null,
        nutrition.percentage || null,
        now,
      ]
    );
    
    console.log('✅ 添加营养成分成功:', nutrition.name);
    return true;
  } catch (error) {
    console.error('❌ 添加营养成分失败:', error);
    return false;
  }
}

/**
 * 批量添加营养成分
 */
export async function addNutritionBatch(nutritions: Nutrition[]): Promise<number> {
  let successCount = 0;
  
  for (const nutrition of nutritions) {
    if (await addNutrition(nutrition)) {
      successCount++;
    }
  }
  
  return successCount;
}

/**
 * 获取猫粮的所有营养成分
 */
export async function getNutritionByFoodId(foodId: string): Promise<Nutrition[]> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Nutrition>(
      'SELECT * FROM cat_food_nutrition WHERE foodId = ? ORDER BY id',
      [foodId]
    );
    
    return rows || [];
  } catch (error) {
    console.error('❌ 查询营养成分失败:', error);
    return [];
  }
}

/**
 * 删除营养成分
 */
export async function deleteNutrition(id: number): Promise<boolean> {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM cat_food_nutrition WHERE id = ?', [id]);
    console.log('✅ 删除营养成分成功');
    return true;
  } catch (error) {
    console.error('❌ 删除营养成分失败:', error);
    return false;
  }
}

/**
 * 删除猫粮的所有营养成分
 */
export async function deleteNutritionByFoodId(foodId: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM cat_food_nutrition WHERE foodId = ?', [foodId]);
    console.log('✅ 删除猫粮所有营养成分成功');
    return true;
  } catch (error) {
    console.error('❌ 删除猫粮所有营养成分失败:', error);
    return false;
  }
}

// ==================== 高赞评论操作 ====================

/**
 * 添加单个评论
 */
export async function addComment(comment: TopComment): Promise<boolean> {
  try {
    const db = await getDatabase();
    const now = Date.now();
    
    await db.runAsync(
      `INSERT INTO cat_food_comments 
       (foodId, userName, userAvatar, content, likes, rating, commentTime, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        comment.foodId,
        comment.userName,
        comment.userAvatar || null,
        comment.content,
        comment.likes,
        comment.rating || null,
        comment.commentTime,
        now,
      ]
    );
    
    console.log('✅ 添加评论成功');
    return true;
  } catch (error) {
    console.error('❌ 添加评论失败:', error);
    return false;
  }
}

/**
 * 批量添加评论
 */
export async function addCommentsBatch(comments: TopComment[]): Promise<number> {
  let successCount = 0;
  
  for (const comment of comments) {
    if (await addComment(comment)) {
      successCount++;
    }
  }
  
  return successCount;
}

/**
 * 获取猫粮的高赞评论（最多3条）
 */
export async function getTopCommentsByFoodId(foodId: string, limit: number = 3): Promise<TopComment[]> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TopComment>(
      'SELECT * FROM cat_food_comments WHERE foodId = ? ORDER BY likes DESC LIMIT ?',
      [foodId, limit]
    );
    
    return rows || [];
  } catch (error) {
    console.error('❌ 查询评论失败:', error);
    return [];
  }
}

/**
 * 删除评论
 */
export async function deleteComment(id: number): Promise<boolean> {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM cat_food_comments WHERE id = ?', [id]);
    console.log('✅ 删除评论成功');
    return true;
  } catch (error) {
    console.error('❌ 删除评论失败:', error);
    return false;
  }
}

/**
 * 删除猫粮的所有评论
 */
export async function deleteCommentsByFoodId(foodId: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM cat_food_comments WHERE foodId = ?', [foodId]);
    console.log('✅ 删除猫粮所有评论成功');
    return true;
  } catch (error) {
    console.error('❌ 删除猫粮所有评论失败:', error);
    return false;
  }
}

// ==================== 综合查询 ====================

/**
 * 获取猫粮详情（包含收藏项+扩展信息）
 */
export async function getFoodDetail(foodId: string): Promise<CatFoodDetailItem | null> {
  try {
    // 获取基础收藏信息
    const baseItem = await getCollectById(foodId);
    if (!baseItem) {
      return null;
    }
    
    // 获取添加剂（已联表 master 返回富信息）
    const additives = await getAdditivesByFoodId(foodId);
    
    // 获取营养成分
    const nutrition = await getNutritionByFoodId(foodId);
    
    // 获取高赞评论
    const topComments = await getTopCommentsByFoodId(foodId, 3);
    
    // 组合成详情对象
    const detailItem: CatFoodDetailItem = {
      ...baseItem,
      additives,
      nutrition,
      topComments,
    };
    
    return detailItem;
  } catch (error) {
    console.error('❌ 查询猫粮详情失败:', error);
    return null;
  }
}
