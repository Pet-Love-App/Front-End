/**
 * API 服务统一导出
 *
 * 注意：以下服务已迁移到 Supabase，请直接使用 Supabase 服务：
 * - 认证服务: import { supabaseAuthService } from '@/src/lib/supabase';
 * - 用户服务: import { supabaseProfileService } from '@/src/lib/supabase';
 * - 宠物服务: import { supabasePetService } from '@/src/lib/supabase';
 * - 评论服务: import { supabaseCommentService } from '@/src/lib/supabase';
 * - 猫粮服务: import { supabaseCatfoodService } from '@/src/lib/supabase';
 * - 点赞/收藏/评分: 已集成在 supabaseCatfoodService 中
 */

// ==================== 核心模块 ====================
export {
  apiClient,
  buildQueryString,
  devError,
  devLog,
  extractData,
  extractList,
  httpClient,
  normalizePaginatedResponse,
  safeParseSchema,
  toCamelCase,
  toSnakeCase,
  wrapError,
  wrapResponse,
  wrapSuccess,
} from './core';
export type {
  ApiErrorDetail,
  ApiResponse,
  DeleteResponse,
  ListResponse,
  PaginatedResponse,
  PaginationParams,
  RequestOptions,
  ToggleResponse,
} from './core';

// ==================== OCR 服务 ====================
export { ocrService, recognizeImage } from './ocr';
export type { OcrRecognizeResponse, OcrResult, OcrTextItem } from './ocr';

// ==================== AI 报告服务 ====================
export { aiReportService } from './ai_report';
export type {
  AIReportData,
  CheckReportExistsResponse,
  Favorite,
  FavoriteReport,
  GenerateReportRequest,
  GenerateReportResponse,
  IngredientInfoRequest,
  IngredientInfoResponse,
  SaveReportRequest,
  SaveReportResponse,
} from './ai_report';

// ==================== 搜索服务 ====================
export { searchService } from './search';
export type { BaikeSearchRequest, BaikeSearchResponse } from './search';
