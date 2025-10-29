/**
 * 猫粮收藏数据库操作接口
 * 
 * 提供完整的 CRUD 操作：
 * - Create (添加收藏)
 * - Read (查询收藏)
 * - Update (更新收藏)
 * - Delete (删除收藏)
 */

import { CatFoodCollectItem } from '@/src/types/collect';
import { getDatabase } from './database';

/**
 * 数据库行接口（与表结构对应）
 */
interface CollectRow {
  id: string;
  tag1: string;
  tag2: string;
  name: string;
  description: string;
  collectCount: number;
  collectTime: number | null;
  imageUrl: string | null;
  brand: string | null;
  price: number | null;
  rating: number | null;
  createdAt: number;
  updatedAt: number;
}

/**
 * 将数据库行转换为应用数据类型
 */
function rowToCollectItem(row: CollectRow): CatFoodCollectItem {
  return {
    id: row.id,
    tag1: row.tag1,
    tag2: row.tag2,
    name: row.name,
    description: row.description,
    collectCount: row.collectCount,
    collectTime: row.collectTime || undefined,
    imageUrl: row.imageUrl || undefined,
    brand: row.brand || undefined,
    price: row.price || undefined,
    rating: row.rating || undefined,
  };
}

/**
 * 添加收藏
 * @param item 收藏项数据
 * @returns 添加成功返回 true
 */
export async function addCollect(item: CatFoodCollectItem): Promise<boolean> {
  try {
    const db = await getDatabase();
    const now = Date.now();
    
    await db.runAsync(
      `INSERT INTO cat_food_collect 
       (id, tag1, tag2, name, description, collectCount, collectTime, 
        imageUrl, brand, price, rating, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.tag1,
        item.tag2,
        item.name,
        item.description,
        item.collectCount,
        item.collectTime || now,
        item.imageUrl || null,
        item.brand || null,
        item.price || null,
        item.rating || null,
        now,
        now,
      ]
    );
    
    console.log('✅ 添加收藏成功:', item.name);
    return true;
  } catch (error) {
    console.error('❌ 添加收藏失败:', error);
    return false;
  }
}

/**
 * 批量添加收藏
 * @param items 收藏项数组
 * @returns 成功添加的数量
 */
export async function addCollectBatch(items: CatFoodCollectItem[]): Promise<number> {
  let successCount = 0;
  
  for (const item of items) {
    const success = await addCollect(item);
    if (success) successCount++;
  }
  
  console.log(`✅ 批量添加完成: ${successCount}/${items.length}`);
  return successCount;
}

/**
 * 删除收藏
 * @param id 收藏项 ID
 * @returns 删除成功返回 true
 */
export async function deleteCollect(id: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    
    const result = await db.runAsync(
      'DELETE FROM cat_food_collect WHERE id = ?',
      [id]
    );
    
    const success = result.changes > 0;
    
    if (success) {
      console.log('✅ 删除收藏成功:', id);
    } else {
      console.warn('⚠️ 未找到要删除的收藏:', id);
    }
    
    return success;
  } catch (error) {
    console.error('❌ 删除收藏失败:', error);
    return false;
  }
}

/**
 * 批量删除收藏
 * @param ids 收藏项 ID 数组
 * @returns 成功删除的数量
 */
export async function deleteCollectBatch(ids: string[]): Promise<number> {
  let successCount = 0;
  
  for (const id of ids) {
    const success = await deleteCollect(id);
    if (success) successCount++;
  }
  
  console.log(`✅ 批量删除完成: ${successCount}/${ids.length}`);
  return successCount;
}

/**
 * 更新收藏
 * @param id 收藏项 ID
 * @param updates 要更新的字段
 * @returns 更新成功返回 true
 */
export async function updateCollect(
  id: string,
  updates: Partial<Omit<CatFoodCollectItem, 'id'>>
): Promise<boolean> {
  try {
    const db = await getDatabase();
    const now = Date.now();
    
    // 构建更新语句
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.tag1 !== undefined) {
      fields.push('tag1 = ?');
      values.push(updates.tag1);
    }
    if (updates.tag2 !== undefined) {
      fields.push('tag2 = ?');
      values.push(updates.tag2);
    }
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.collectCount !== undefined) {
      fields.push('collectCount = ?');
      values.push(updates.collectCount);
    }
    if (updates.collectTime !== undefined) {
      fields.push('collectTime = ?');
      values.push(updates.collectTime);
    }
    if (updates.imageUrl !== undefined) {
      fields.push('imageUrl = ?');
      values.push(updates.imageUrl);
    }
    if (updates.brand !== undefined) {
      fields.push('brand = ?');
      values.push(updates.brand);
    }
    if (updates.price !== undefined) {
      fields.push('price = ?');
      values.push(updates.price);
    }
    if (updates.rating !== undefined) {
      fields.push('rating = ?');
      values.push(updates.rating);
    }
    
    // 添加更新时间
    fields.push('updatedAt = ?');
    values.push(now);
    
    // 添加 WHERE 条件
    values.push(id);
    
    if (fields.length === 1) {
      console.warn('⚠️ 没有要更新的字段');
      return false;
    }
    
    const sql = `UPDATE cat_food_collect SET ${fields.join(', ')} WHERE id = ?`;
    
    const result = await db.runAsync(sql, values);
    
    const success = result.changes > 0;
    
    if (success) {
      console.log('✅ 更新收藏成功:', id);
    } else {
      console.warn('⚠️ 未找到要更新的收藏:', id);
    }
    
    return success;
  } catch (error) {
    console.error('❌ 更新收藏失败:', error);
    return false;
  }
}

/**
 * 根据 ID 查询收藏
 * @param id 收藏项 ID
 * @returns 收藏项或 null
 */
export async function getCollectById(id: string): Promise<CatFoodCollectItem | null> {
  try {
    const db = await getDatabase();
    
    const row = await db.getFirstAsync<CollectRow>(
      'SELECT * FROM cat_food_collect WHERE id = ?',
      [id]
    );
    
    if (row) {
      return rowToCollectItem(row);
    }
    
    return null;
  } catch (error) {
    console.error('❌ 查询收藏失败:', error);
    return null;
  }
}

/**
 * 查询所有收藏
 * @param orderBy 排序方式：'time' | 'name' | 'collect'
 * @param order 排序顺序：'ASC' | 'DESC'
 * @returns 收藏列表
 */
export async function getAllCollects(
  orderBy: 'time' | 'name' | 'collect' = 'time',
  order: 'ASC' | 'DESC' = 'DESC'
): Promise<CatFoodCollectItem[]> {
  try {
    const db = await getDatabase();
    
    let orderByClause = 'collectTime';
    if (orderBy === 'name') orderByClause = 'name';
    if (orderBy === 'collect') orderByClause = 'collectCount';
    
    const rows = await db.getAllAsync<CollectRow>(
      `SELECT * FROM cat_food_collect ORDER BY ${orderByClause} ${order}`
    );
    
    return rows.map(rowToCollectItem);
  } catch (error) {
    console.error('❌ 查询所有收藏失败:', error);
    return [];
  }
}

/**
 * 搜索收藏
 * @param keyword 关键词
 * @returns 匹配的收藏列表
 */
export async function searchCollects(keyword: string): Promise<CatFoodCollectItem[]> {
  try {
    const db = await getDatabase();
    
    const searchPattern = `%${keyword}%`;
    
    const rows = await db.getAllAsync<CollectRow>(
      `SELECT * FROM cat_food_collect 
       WHERE name LIKE ? 
          OR description LIKE ? 
          OR brand LIKE ?
          OR tag1 LIKE ?
          OR tag2 LIKE ?
       ORDER BY collectTime DESC`,
      [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
    );
    
    return rows.map(rowToCollectItem);
  } catch (error) {
    console.error('❌ 搜索收藏失败:', error);
    return [];
  }
}

/**
 * 根据标签查询收藏
 * @param tags 标签数组
 * @returns 匹配的收藏列表
 */
export async function getCollectsByTags(tags: string[]): Promise<CatFoodCollectItem[]> {
  try {
    const db = await getDatabase();
    
    const placeholders = tags.map(() => '?').join(',');
    
    const rows = await db.getAllAsync<CollectRow>(
      `SELECT * FROM cat_food_collect 
       WHERE tag1 IN (${placeholders}) OR tag2 IN (${placeholders})
       ORDER BY collectTime DESC`,
      [...tags, ...tags]
    );
    
    return rows.map(rowToCollectItem);
  } catch (error) {
    console.error('❌ 按标签查询失败:', error);
    return [];
  }
}

/**
 * 获取收藏统计
 * @returns 统计信息
 */
export async function getCollectStatistics() {
  try {
    const db = await getDatabase();
    
    // 总数
    const totalResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM cat_food_collect'
    );
    const totalCount = totalResult?.count || 0;
    
    // 最近7天的收藏
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM cat_food_collect WHERE collectTime > ?',
      [sevenDaysAgo]
    );
    const recentCount = recentResult?.count || 0;
    
    // 热门标签
    const tag1Rows = await db.getAllAsync<{ tag: string; count: number }>(
      'SELECT tag1 as tag, COUNT(*) as count FROM cat_food_collect GROUP BY tag1'
    );
    const tag2Rows = await db.getAllAsync<{ tag: string; count: number }>(
      'SELECT tag2 as tag, COUNT(*) as count FROM cat_food_collect GROUP BY tag2'
    );
    
    const tagCounts = new Map<string, number>();
    [...tag1Rows, ...tag2Rows].forEach(row => {
      tagCounts.set(row.tag, (tagCounts.get(row.tag) || 0) + row.count);
    });
    
    const popularTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalCount,
      recentCount,
      popularTags,
    };
  } catch (error) {
    console.error('❌ 获取统计信息失败:', error);
    return {
      totalCount: 0,
      recentCount: 0,
      popularTags: [],
    };
  }
}

/**
 * 检查收藏是否存在
 * @param id 收藏项 ID
 * @returns 存在返回 true
 */
export async function isCollectExists(id: string): Promise<boolean> {
  try {
    const db = await getDatabase();
    
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM cat_food_collect WHERE id = ?',
      [id]
    );
    
    return (result?.count || 0) > 0;
  } catch (error) {
    console.error('❌ 检查收藏存在失败:', error);
    return false;
  }
}

/**
 * 获取收藏总数
 * @returns 收藏总数
 */
export async function getCollectCount(): Promise<number> {
  try {
    const db = await getDatabase();
    
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM cat_food_collect'
    );
    
    return result?.count || 0;
  } catch (error) {
    console.error('❌ 获取收藏总数失败:', error);
    return 0;
  }
}
