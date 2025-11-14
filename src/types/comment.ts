/**
 * 评论系统类型定义
 */

/**
 * 评论作者信息（只包含显示所需的基本信息）
 */
export interface CommentAuthor {
  /** 用户 ID - 唯一标识符 */
  id: number;
  /** 用户名 */
  username: string;
  /** 头像 URL */
  avatar?: string | null;
}

/**
 * 评论类型
 */
export interface Comment {
  /** 评论 ID */
  id: number;
  /** 评论内容 */
  content: string;
  /** 评论作者信息 */
  author: CommentAuthor;
  /** 创建时间 */
  createdAt: string;
  /** 点赞数 */
  likes?: number;
  /** 当前用户是否点赞 */
  isLiked?: boolean;
}

/**
 * 创建评论的请求参数
 */
export interface CreateCommentParams {
  /** 评论内容 */
  content: string;
  /** 关联的对象 ID（如帖子 ID、猫粮 ID 等） */
  targetId: number;
  /** 关联的对象类型 */
  targetType: 'post' | 'catfood' | 'report';
}

/**
 * 更新评论的请求参数
 */
export interface UpdateCommentParams {
  /** 评论 ID */
  id: number;
  /** 新的评论内容 */
  content: string;
}
