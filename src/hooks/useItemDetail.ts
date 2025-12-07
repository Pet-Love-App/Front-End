/**
 * 添加剂/成分详情查询 Hook
 * 统一处理数据库查询和百度百科查询
 */

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { supabaseAdditiveService, type Additive } from '@/src/lib/supabase';
import { searchService } from '@/src/services/api';
import { logger } from '@/src/utils/logger';

export interface BaikeInfo {
  title: string;
  extract: string;
}

interface ItemDetailState {
  item: Additive | null;
  baikeInfo: BaikeInfo | null;
  isLoading: boolean;
  loadingItemName: string | null;
  modalVisible: boolean;
}

interface UseItemDetailReturn extends ItemDetailState {
  /** 查询添加剂详情 */
  fetchAdditive: (name: string) => Promise<void>;
  /** 查询成分详情 */
  fetchIngredient: (name: string) => Promise<void>;
  /** 关闭弹窗并重置状态 */
  closeModal: () => void;
}

/**
 * 创建占位添加剂对象
 */
function createPlaceholderAdditive(name: string, type = '未分类', desc = '暂无数据'): Additive {
  return {
    id: 0,
    name,
    enName: '',
    type,
    applicableRange: desc,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 添加剂/成分详情查询 Hook
 */
export function useItemDetail(): UseItemDetailReturn {
  const [state, setState] = useState<ItemDetailState>({
    item: null,
    baikeInfo: null,
    isLoading: false,
    loadingItemName: null,
    modalVisible: false,
  });

  /**
   * 处理百度百科响应
   */
  const processBaikeResponse = useCallback(
    (
      response: PromiseSettledResult<Awaited<ReturnType<typeof searchService.searchBaike>>>,
      itemName: string
    ): BaikeInfo | null => {
      if (response.status !== 'fulfilled') {
        logger.warn('百度百科搜索失败', { reason: response.reason });
        return null;
      }

      const { ok, data } = response.value;
      if (ok && data?.extract) {
        return { title: data.title || itemName, extract: data.extract };
      }
      return null;
    },
    []
  );

  /**
   * 查询添加剂详情
   */
  const fetchAdditive = useCallback(
    async (name: string) => {
      setState((s) => ({
        ...s,
        isLoading: true,
        loadingItemName: name,
        item: null,
        baikeInfo: null,
        modalVisible: true,
      }));

      try {
        const [dbResult, baikeResult] = await Promise.allSettled([
          supabaseAdditiveService.searchAdditive(name),
          searchService.searchBaike({ ingredient: name }),
        ]);

        let item: Additive | null = null;
        let hasData = false;

        // 处理数据库结果
        if (dbResult.status === 'fulfilled' && dbResult.value.data) {
          const { matchType, additive, additives } = dbResult.value.data;

          if (matchType === 'exact' || matchType === 'fuzzy' || matchType === 'fuzzy_single') {
            item = additive || null;
          } else if (matchType === 'multiple' && additives?.length) {
            item = additives[0];
          } else if (matchType === 'not_found') {
            item = createPlaceholderAdditive(name);
          }

          if (item) hasData = true;
        }

        if (!item && dbResult.status === 'rejected') {
          logger.error('添加剂查询失败', dbResult.reason);
          item = createPlaceholderAdditive(name);
        }

        // 处理百度百科结果
        const baikeInfo = processBaikeResponse(baikeResult, name);
        if (baikeInfo) hasData = true;

        if (!hasData) {
          Alert.alert('提示', '未找到该添加剂的详细信息');
          setState((s) => ({ ...s, isLoading: false, loadingItemName: null, modalVisible: false }));
          return;
        }

        setState((s) => ({
          ...s,
          item,
          baikeInfo,
          isLoading: false,
          loadingItemName: null,
        }));
      } catch (error) {
        logger.error('获取添加剂详情失败', error as Error);
        Alert.alert('查询失败', '无法获取添加剂详情');
        setState((s) => ({ ...s, isLoading: false, loadingItemName: null, modalVisible: false }));
      }
    },
    [processBaikeResponse]
  );

  /**
   * 查询成分详情
   */
  const fetchIngredient = useCallback(
    async (name: string) => {
      setState((s) => ({
        ...s,
        isLoading: true,
        loadingItemName: name,
        item: null,
        baikeInfo: null,
        modalVisible: true,
      }));

      try {
        const [dbResult, baikeResult] = await Promise.allSettled([
          supabaseAdditiveService.searchIngredient(name),
          searchService.searchBaike({ ingredient: name }),
        ]);

        let item: Additive | null = null;
        let hasData = false;

        // 处理数据库结果
        if (dbResult.status === 'fulfilled' && dbResult.value.data?.ingredient) {
          const { name: iName, type, desc } = dbResult.value.data.ingredient;
          item = createPlaceholderAdditive(iName, type, desc);
          hasData = true;
        }

        // 处理百度百科结果
        const baikeInfo = processBaikeResponse(baikeResult, name);
        if (baikeInfo) hasData = true;

        if (!hasData) {
          Alert.alert('提示', '未找到该成分的详细信息');
          setState((s) => ({ ...s, isLoading: false, loadingItemName: null, modalVisible: false }));
          return;
        }

        setState((s) => ({
          ...s,
          item,
          baikeInfo,
          isLoading: false,
          loadingItemName: null,
        }));
      } catch (error) {
        logger.error('获取成分详情失败', error as Error);
        Alert.alert('查询失败', '无法获取成分详情');
        setState((s) => ({ ...s, isLoading: false, loadingItemName: null, modalVisible: false }));
      }
    },
    [processBaikeResponse]
  );

  /**
   * 关闭弹窗
   */
  const closeModal = useCallback(() => {
    setState({
      item: null,
      baikeInfo: null,
      isLoading: false,
      loadingItemName: null,
      modalVisible: false,
    });
  }, []);

  return {
    ...state,
    fetchAdditive,
    fetchIngredient,
    closeModal,
  };
}
