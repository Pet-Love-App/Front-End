/**
 * 收藏功能 Hook
 */

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { aiReportService } from '@/src/services/api';
import { logger } from '@/src/utils/logger';

interface UseFavoriteOptions {
  /** 猫粮 ID（用于收藏） */
  catfoodId?: number;
  /** 初始收藏状态 */
  initialFavorited?: boolean;
}

interface UseFavoriteReturn {
  /** 是否已收藏 */
  isFavorited: boolean;
  /** 是否正在切换 */
  isToggling: boolean;
  /** 切换收藏状态 */
  toggle: () => Promise<void>;
  /** 手动设置收藏状态 */
  setFavorited: (value: boolean) => void;
}

/**
 * 收藏功能 Hook
 */
export function useFavorite({
  catfoodId,
  initialFavorited = false,
}: UseFavoriteOptions): UseFavoriteReturn {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isToggling, setIsToggling] = useState(false);

  // 切换收藏
  const toggle = useCallback(async () => {
    if (!catfoodId || isToggling) return;

    setIsToggling(true);
    try {
      const result = await aiReportService.toggleFavoriteReport(catfoodId);
      setIsFavorited(result.favorited);
      Alert.alert('✅ 成功', result.favorited ? '已收藏此报告' : '已取消收藏');
    } catch (error) {
      logger.error('切换收藏失败', error as Error);
      Alert.alert('❌ 失败', '操作失败，请重试');
    } finally {
      setIsToggling(false);
    }
  }, [catfoodId, isToggling]);

  return {
    isFavorited,
    isToggling,
    toggle,
    setFavorited: setIsFavorited,
  };
}
