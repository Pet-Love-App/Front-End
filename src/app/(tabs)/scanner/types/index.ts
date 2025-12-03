/**
 * Scanner 模块类型定义
 *
 * 企业最佳实践：
 * - 集中管理类型定义
 * - 清晰的类型命名
 * - 便于复用和维护
 */

/**
 * 扫描流程状态
 * 使用联合类型确保类型安全
 */
export type ScanFlowState =
  | 'initial' // 初始状态
  | 'searching-catfood' // 搜索猫粮
  | 'selected-catfood' // 已选择猫粮
  | 'taking-photo' // 拍照中
  | 'photo-preview' // 照片预览
  | 'processing-ocr' // OCR处理中
  | 'ocr-result' // OCR结果
  | 'barcode-result' // 条形码结果
  | 'ai-report-detail'; // AI报告详情
