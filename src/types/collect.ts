/**
 * 收藏相关类型定义
 */

/**
 * 猫粮收藏
 */
export interface CatfoodFavorite {
  id: string;
  catfoodId: string;
  catfood: {
    id: string;
    name: string;
    brand: string;
    description?: string;
    imageUrl?: string;
    price?: number;
    likeCount?: number;
    [key: string]: any;
  };
  createdAt: string;
}

/**
 * AI 报告收藏
 */
export interface ReportFavorite {
  id: number;
  reportId: number;
  report: {
    id: number;
    catfoodName: string;
    createdAt: string;
    [key: string]: any;
  };
  createdAt: string;
}
