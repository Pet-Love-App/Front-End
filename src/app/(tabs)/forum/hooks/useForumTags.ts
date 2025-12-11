/**
 * 论坛标签管理Hook
 * 负责加载和管理论坛标签的状态
 * 从 Supabase posts 表动态获取所有唯一标签
 */

import { useCallback, useEffect, useState } from 'react';

import { supabaseForumService } from '@/src/lib/supabase';

export interface ForumTag {
  id: number;
  name: string;
  count?: number; // 使用次数（热门标签时返回）
}

// 预定义的分类标签（作为默认/备用）
const DEFAULT_TAGS: ForumTag[] = [
  { id: 1, name: '求助' },
  { id: 2, name: '分享' },
  { id: 3, name: '科普' },
  { id: 4, name: '避雷' },
  { id: 5, name: '日常' },
  { id: 6, name: '健康' },
];

export interface UseForumTagsOptions {
  /** 是否按热门排序（按使用次数） */
  popular?: boolean;
  /** 最大返回数量 */
  limit?: number;
}

export function useForumTags(options: UseForumTagsOptions = {}) {
  const { popular = false, limit = 20 } = options;

  const [tags, setTags] = useState<ForumTag[]>(DEFAULT_TAGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (popular) {
        // 获取热门标签（按使用频率排序）
        const { data, error: fetchError } = await supabaseForumService.getPopularTags(limit);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (data && data.length > 0) {
          const formattedTags: ForumTag[] = data.map((item, index) => ({
            id: index + 1,
            name: item.tag,
            count: item.count,
          }));
          setTags(formattedTags);
        } else {
          // 如果没有数据，使用默认标签
          setTags(DEFAULT_TAGS);
        }
      } else {
        // 获取所有唯一标签
        const { data, error: fetchError } = await supabaseForumService.getAllTags();

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (data && data.length > 0) {
          const formattedTags: ForumTag[] = data.slice(0, limit).map((name, index) => ({
            id: index + 1,
            name,
          }));
          setTags(formattedTags);
        } else {
          // 如果没有数据，使用默认标签
          setTags(DEFAULT_TAGS);
        }
      }
    } catch (err) {
      console.error('[useForumTags] 加载标签失败:', err);
      setError(err instanceof Error ? err : new Error('加载标签失败'));
      // 出错时使用默认标签
      setTags(DEFAULT_TAGS);
    } finally {
      setLoading(false);
    }
  }, [popular, limit]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return {
    tags,
    loading,
    error,
    reload: loadTags,
    /** 默认标签列表 */
    defaultTags: DEFAULT_TAGS,
  };
}
