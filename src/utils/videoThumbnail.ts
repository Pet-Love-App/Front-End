/**
 * 视频缩略图生成工具
 *
 * 使用 expo-video-thumbnails 生成视频第一帧作为预览
 */

/**
 * 生成视频缩略图
 * @param videoUri 视频 URI
 * @returns 缩略图 URI 或 null
 */
export async function generateVideoThumbnail(videoUri: string): Promise<string | null> {
  try {
    // 动态导入 expo-video-thumbnails，如果未安装则返回 null
    // Use require instead of import() for better testability with Jest
    let VideoThumbnails;
    try {
      VideoThumbnails = require('expo-video-thumbnails');
    } catch (e) {
      VideoThumbnails = null;
    }

    if (!VideoThumbnails) {
      console.warn('expo-video-thumbnails 未安装，无法生成缩略图');
      return null;
    }

    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 0, // 获取第一帧
      quality: 0.7,
    });
    return uri;
  } catch (error) {
    console.error('生成视频缩略图失败:', error);
    return null;
  }
}

/**
 * 批量生成视频缩略图
 * @param videoUris 视频 URI 数组
 * @returns 缩略图 URI 映射表
 */
export async function generateVideoThumbnails(videoUris: string[]): Promise<Map<string, string>> {
  const thumbnailMap = new Map<string, string>();

  await Promise.allSettled(
    videoUris.map(async (uri) => {
      const thumbnail = await generateVideoThumbnail(uri);
      if (thumbnail) {
        thumbnailMap.set(uri, thumbnail);
      }
    })
  );

  return thumbnailMap;
}
