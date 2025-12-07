/**
 * 论坛标签管理Hook
 * 负责加载和管理论坛标签的状态
 */

// 注意：标签功能暂未迁移到 Supabase，使用模拟数据
// import { supabaseForumService } from '@/src/lib/supabase';
import { useCallback, useEffect, useState } from 'react';

export interface ForumTag {
  id: number;
  name: string;
}

export function useForumTags() {
  const [tags, setTags] = useState<ForumTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadTags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 从 Supabase 的 posts 表中提取所有唯一标签
      // 注意：这是基于 posts.tags 数组字段的实现
      // 如果未来需要更复杂的标签管理，可以创建独立的 tags 表

      // 暂时使用预定义的分类标签（基于 PostCategory）
      const mockTags: ForumTag[] = [
        { id: 1, name: '求助' },
        { id: 2, name: '分享' },
        { id: 3, name: '科普' },
        { id: 4, name: '警示' },
      ];
      setTags(mockTags);

      // TODO: 如果需要从数据库动态加载标签，可以使用以下查询：
      // const { data } = await supabase.rpc('get_all_post_tags');
      // 需要先在 Supabase 中创建对应的 RPC 函数
    } catch (err) {
      setError(err instanceof Error ? err : new Error('加载标签失败'));
      setTags([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return {
    tags,
    loading,
    error,
    reload: loadTags,
  };
}
