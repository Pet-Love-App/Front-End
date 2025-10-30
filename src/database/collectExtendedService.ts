/**
 * 猫粮收藏扩展数据库操作接口
 * 
 * 提供添加剂、营养成分、评论的 CRUD 操作
 */

import { Additive, CatFoodDetailItem, Nutrition, TopComment } from '@/src/types/collect';
import { getCollectById } from './collectService';
import { getDatabase } from './database';

// ==================== 添加剂操作 ====================

/**
 * 添加单个添加剂
 */
export async function addAdditive(additive: Additive): Promise<boolean> {
  try {
    const db = await getDatabase();
    const now = Date.now();
    
    await db.runAsync(
      `INSERT INTO cat_food_additives 
       (foodId, name, category, description, createdAt)
       VALUES (?, ?, ?, ?, ?)`,
      [
        additive.foodId,
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
export async function addAdditivesBatch(additives: Additive[]): Promise<number> {
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
    const db = await getDatabase();
    const rows = await db.getAllAsync<Additive>(
      'SELECT * FROM cat_food_additives WHERE foodId = ? ORDER BY id',
      [foodId]
    );
    
    return rows || [];
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
    
    // 获取添加剂
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

/**
 * 删除猫粮及其所有关联数据
 */
export async function deleteFoodWithDetails(foodId: string): Promise<boolean> {
  try {
    // 删除添加剂
    await deleteAdditivesByFoodId(foodId);
    
    // 删除营养成分
    await deleteNutritionByFoodId(foodId);
    
    // 删除评论
    await deleteCommentsByFoodId(foodId);
    
    // 删除收藏主记录（需要导入 deleteCollect）
    const { deleteCollect } = require('./collectService');
    await deleteCollect(foodId);
    
    console.log('✅ 删除猫粮及其所有关联数据成功');
    return true;
  } catch (error) {
    console.error('❌ 删除猫粮及其所有关联数据失败:', error);
    return false;
  }
}
