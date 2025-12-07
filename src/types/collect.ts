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
    imageUrl?: string;
    score?: number;
    barcode?: string;
    crudeProtein?: number;
    crudeFat?: number;
    carbohydrates?: number;
    crudeFiber?: number;
    crudeAsh?: number;
    others?: number;
    percentData?: {
      protein?: number;
      fat?: number;
      carbohydrates?: number;
      fiber?: number;
      ash?: number;
      others?: number;
    };
    [key: string]: any;
  };
  createdAt: string;
  favoriteId?: string;
  favoritedAt?: string;
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
