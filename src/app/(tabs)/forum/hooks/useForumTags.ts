/**
 * 论坛标签管理Hook
 * 负责加载和管理论坛标签的状态
 */

import { forumService } from '@/src/services/api/forum';
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
      const response = await forumService.getTags();
      const list = Array.isArray(response) ? response : (response as any)?.results || [];
      const normalizedTags = list
        .filter((t: any) => t && (t.name || typeof t === 'string'))
        .map((t: any) => {
          if (typeof t === 'string') {
            return { id: t as any, name: t };
          }
          return {
            id: t.id,
            name: t.name,
          };
        });
      setTags(normalizedTags);
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
