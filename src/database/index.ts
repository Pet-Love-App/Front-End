/**
 * 数据库模块统一导出
 * 
 * 从这个文件导入所有数据库相关的功能
 */

// Hook（推荐使用）
export { useCollectDatabase } from './useCollectDatabase';

// Service API（高级用法）
export * as CollectService from './collectService';

// 数据库配置（高级用法）
export {
  getDatabase,
  closeDatabase,
  clearCollectTable,
  deleteDatabase,
  getDatabaseStats,
} from './database';

// 类型定义
export type { CatFoodCollectItem } from '@/src/types/collect';
