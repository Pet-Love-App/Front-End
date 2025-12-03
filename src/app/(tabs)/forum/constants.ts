/**
 * 论坛模块常量配置
 * 统一管理颜色、尺寸、限制等常量
 */

import {
  FUNCTIONAL_COLORS,
  TAG_COLORS,
  ForumColors as UnifiedForumColors,
} from '@/src/constants/colors';
import type { PostCategory } from '@/src/services/api/forum/types';

// ===== 主题颜色 (使用统一颜色系统) =====
export const ForumColors = UnifiedForumColors;

// ===== 莫兰迪色系（用于标签，使用统一颜色系统） =====
export const MORANDI_COLORS = TAG_COLORS;

// ===== 媒体限制 =====
export const MEDIA_LIMITS = {
  /** 单文件最大尺寸（字节） */
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  /** 最多上传文件数 */
  MAX_FILES_COUNT: 9,
  /** 支持的图片类型 */
  IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'] as const,
  /** 支持的视频类型 */
  VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/x-msvideo'] as const,
} as const;

// ===== 帖子分类配置 (使用统一颜色系统) =====
export const POST_CATEGORIES: ReadonlyArray<{
  key: PostCategory;
  label: string;
  color?: string;
}> = [
  { key: 'help', label: '求助', color: FUNCTIONAL_COLORS.help },
  { key: 'share', label: '分享', color: FUNCTIONAL_COLORS.share },
  { key: 'science', label: '科普', color: FUNCTIONAL_COLORS.science },
  { key: 'warning', label: '避雷', color: FUNCTIONAL_COLORS.warning },
] as const;

// ===== UI 配置 =====
export const UI_CONFIG = {
  /** 媒体预览缩略图尺寸 */
  THUMBNAIL_SIZE: 90,
  /** 列表中显示的最多标签数 */
  MAX_TAGS_DISPLAY: 4,
  /** 列表中显示的最多媒体预览数 */
  MAX_MEDIA_PREVIEW: 3,
  /** 评论区最大高度比例 */
  COMMENT_MAX_HEIGHT_RATIO: 0.3,
} as const;

// ===== 提示文案 =====
export const MESSAGES = {
  SUCCESS: {
    POST_CREATED: '发布成功',
    POST_UPDATED: '更新成功',
    POST_DELETED: '删除成功',
    COMMENT_CREATED: '评论成功',
    COMMENT_UPDATED: '更新成功',
    COMMENT_DELETED: '删除成功',
  },
  ERROR: {
    POST_FAILED: '发布失败',
    UPDATE_FAILED: '更新失败',
    DELETE_FAILED: '删除失败',
    LOAD_FAILED: '加载失败',
    OPERATION_FAILED: '操作失败',
    NO_CONTENT: '请输入内容或选择媒体',
    FILE_TOO_LARGE: '文件大小超过限制',
    TOO_MANY_FILES: `最多可上传 ${MEDIA_LIMITS.MAX_FILES_COUNT} 个文件`,
    FILE_TYPE_INVALID: `仅支持图片/视频，单文件≤${MEDIA_LIMITS.MAX_FILE_SIZE / (1024 * 1024)}MB`,
  },
  CONFIRM: {
    DELETE_POST: '确定删除该帖子吗？',
    DELETE_COMMENT: '确定删除该评论吗？',
  },
} as const;
