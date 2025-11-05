/**
 * 相机相关的类型定义
 */

// 拍照选项
export interface CameraOptions {
    quality?: number;        // 图片质量 0-1，默认 0.8
    base64?: boolean;        // 是否返回 base64 编码，默认 false
    skipProcessing?: boolean; // 是否跳过处理，默认 false
  }
  
  // 拍照结果
  export interface CameraPhoto {
    uri: string;             // 图片本地路径
    width: number;           // 图片宽度
    height: number;          // 图片高度
    base64?: string;         // base64 编码（如果启用）
  }
  
  // 相机类型
  export type CameraFacing = 'front' | 'back';
  
  // 相机状态
  export interface CameraState {
    hasPermission: boolean | null;  // 权限状态：true=已授权, false=拒绝, null=未请求
    isReady: boolean;                // 相机是否准备好
    facing: CameraFacing;            // 当前使用的摄像头
  }