/**
 * useCollectDatabase Hook
 * 
 * 封装数据库操作的 React Hook，方便在组件中使用
 */

import { CatFoodCollectItem } from '@/src/types/collect';
import { useCallback, useEffect, useState } from 'react';
import * as CollectService from './collectService';
import { getDatabase } from './database';

export function useCollectDatabase() {
  const [collects, setCollects] = useState<CatFoodCollectItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  /**
   * 初始化数据库
   */
  useEffect(() => {
    async function init() {
      try {
        await getDatabase();
        setInitialized(true);
        console.log('✅ 数据库 Hook 已初始化');
      } catch (error) {
        console.error('❌ 数据库 Hook 初始化失败:', error);
      }
    }
    init();
  }, []);

  /**
   * 加载所有收藏
   */
  const loadCollects = useCallback(async (
    orderBy: 'time' | 'name' | 'collect' = 'time',
    order: 'ASC' | 'DESC' = 'DESC'
  ) => {
    setLoading(true);
    try {
      const data = await CollectService.getAllCollects(orderBy, order);
      setCollects(data);
      return data;
    } catch (error) {
      console.error('加载收藏失败:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 添加收藏
   */
  const addCollect = useCallback(async (item: CatFoodCollectItem) => {
    const success = await CollectService.addCollect(item);
    if (success) {
      // 重新加载列表
      await loadCollects();
    }
    return success;
  }, [loadCollects]);

  /**
   * 删除收藏
   */
  const deleteCollect = useCallback(async (id: string) => {
    const success = await CollectService.deleteCollect(id);
    if (success) {
      // 从状态中移除
      setCollects(prev => prev.filter(item => item.id !== id));
    }
    return success;
  }, []);

  /**
   * 更新收藏
   */
  const updateCollect = useCallback(async (
    id: string,
    updates: Partial<Omit<CatFoodCollectItem, 'id'>>
  ) => {
    const success = await CollectService.updateCollect(id, updates);
    if (success) {
      // 更新状态
      setCollects(prev =>
        prev.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      );
    }
    return success;
  }, []);

  /**
   * 搜索收藏
   */
  const searchCollects = useCallback(async (keyword: string) => {
    setLoading(true);
    try {
      const data = await CollectService.searchCollects(keyword);
      return data;
    } catch (error) {
      console.error('搜索失败:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 根据标签查询
   */
  const getCollectsByTags = useCallback(async (tags: string[]) => {
    setLoading(true);
    try {
      const data = await CollectService.getCollectsByTags(tags);
      return data;
    } catch (error) {
      console.error('按标签查询失败:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 获取统计信息
   */
  const getStatistics = useCallback(async () => {
    return await CollectService.getCollectStatistics();
  }, []);

  /**
   * 检查是否已收藏
   */
  const isCollected = useCallback(async (id: string) => {
    return await CollectService.isCollectExists(id);
  }, []);

  return {
    // 状态
    collects,
    loading,
    initialized,
    
    // 操作方法
    loadCollects,
    addCollect,
    deleteCollect,
    updateCollect,
    searchCollects,
    getCollectsByTags,
    getStatistics,
    isCollected,
  };
}
