import { useState } from 'react';

/**
 * 图片预览 Hook
 * 负责图片预览的状态管理
 */
export function useImagePreview() {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');

  // 处理图片点击
  const handleImagePress = (imageUrl: string) => {
    setPreviewImageUrl(imageUrl);
    setPreviewVisible(true);
  };

  // 关闭图片预览
  const closePreview = () => {
    setPreviewVisible(false);
    setPreviewImageUrl('');
  };

  return {
    previewVisible,
    previewImageUrl,
    handleImagePress,
    closePreview,
  };
}
