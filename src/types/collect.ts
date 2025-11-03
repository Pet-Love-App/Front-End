/**
 * 收藏相关的类型定义
 */

/**
 * 猫粮收藏项
 */
export interface CatFoodCollectItem {
  /** 唯一标识 */
  id: string;
  /** 标签1 - 如：成猫粮、幼猫粮、全阶段等 */
  tag1: string;
  /** 标签2 - 如：高蛋白、易消化、无谷配方等 */
  tag2: string;
  /** 猫粮名称 */
  name: string;
  /** 猫粮简介描述 */
  description: string;
  /** 收藏人数 */
  collectCount: number;
  /** 收藏时间（时间戳） */
  collectTime?: number;
  /** 猫粮图片URL（可选） */
  imageUrl?: string;
  /** 品牌名称（可选） */
  brand?: string;
  /** 价格（可选） */
  price?: number;
  /** 评分（可选，0-5） */
  rating?: number;
}

/**
 * 收藏列表响应
 */
export interface CollectListResponse {
  /** 收藏列表 */
  list: CatFoodCollectItem[];
  /** 总数 */
  total: number;
  /** 当前页 */
  page: number;
  /** 每页数量 */
  pageSize: number;
}

/**
 * 收藏操作结果
 */
export interface CollectActionResult {
  /** 是否成功 */
  success: boolean;
  /** 提示消息 */
  message: string;
  /** 收藏项（取消收藏时为空） */
  item?: CatFoodCollectItem;
}

/**
 * 收藏搜索参数
 */
export interface CollectSearchParams {
  /** 搜索关键词 */
  keyword?: string;
  /** 标签筛选 */
  tags?: string[];
  /** 排序方式：time-时间，collect-收藏数 */
  sortBy?: 'time' | 'collect' | 'name';
  /** 排序顺序 */
  order?: 'asc' | 'desc';
}

/**
 * 收藏统计信息
 */
export interface CollectStatistics {
  /** 总收藏数 */
  totalCount: number;
  /** 最近收藏（最近7天） */
  recentCount: number;
  /** 最受欢迎的标签 */
  popularTags: Array<{
    tag: string;
    count: number;
  }>;
}

/**
 * 添加剂信息
 */
export interface Additive {
  /** 自增主键 */
  id?: number;
  /** 关联的猫粮ID */
  foodId: string;
  /** 关联的添加剂主数据ID（additives_master.id） */
  additiveId?: number;
  /** 添加剂名称 */
  name: string;
  /** 添加剂类别（如：防腐剂、色素、增稠剂等） */
  category?: string;
  /** 添加剂描述/说明 */
  description?: string;
  /** 创建时间 */
  createdAt?: number;
}

/**
 * 营养成分信息
 */
export interface Nutrition {
  /** 自增主键 */
  id?: number;
  /** 关联的猫粮ID */
  foodId: string;
  /** 营养成分名称（如：蛋白质、脂肪、粗纤维等） */
  name: string;
  /** 营养成分值 */
  value: number;
  /** 单位（如：g、mg、%等） */
  unit?: string;
  /** 百分比（如：38.5 表示 38.5%） */
  percentage?: number;
  /** 创建时间 */
  createdAt?: number;
}

/**
 * 高赞评论信息
 */
export interface TopComment {
  /** 自增主键 */
  id?: number;
  /** 关联的猫粮ID */
  foodId: string;
  /** 用户名 */
  userName: string;
  /** 用户头像URL */
  userAvatar?: string;
  /** 评论内容 */
  content: string;
  /** 点赞数 */
  likes: number;
  /** 评分（0-5） */
  rating?: number;
  /** 评论时间戳 */
  commentTime: number;
  /** 创建时间 */
  createdAt?: number;
}

/**
 * 猫粮详情项（包含收藏项+扩展信息）
 */
export interface CatFoodDetailItem extends CatFoodCollectItem {
  /** 添加剂列表 */
  additives?: Additive[];
  /** 营养成分列表 */
  nutrition?: Nutrition[];
  /** 高赞评论列表（最多3条） */
  topComments?: TopComment[];
}
