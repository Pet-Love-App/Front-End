// Mock console methods
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeAll(() => {
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

describe('videoThumbnail', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('generateVideoThumbnail', () => {
    it('should return thumbnail uri when expo-video-thumbnails is available', async () => {
      jest.doMock(
        'expo-video-thumbnails',
        () => ({
          getThumbnailAsync: jest.fn().mockResolvedValue({ uri: 'thumbnail-uri' }),
        }),
        { virtual: true }
      );

      const { generateVideoThumbnail } = require('../videoThumbnail');
      const uri = await generateVideoThumbnail('video-uri');
      expect(uri).toBe('thumbnail-uri');
    });

    it('should return null and warn when expo-video-thumbnails is not installed', async () => {
      jest.doMock(
        'expo-video-thumbnails',
        () => {
          throw new Error('Cannot find module');
        },
        { virtual: true }
      );

      const { generateVideoThumbnail } = require('../videoThumbnail');
      const uri = await generateVideoThumbnail('video-uri');

      expect(uri).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('未安装'));
    });

    it('should return null and log error when getThumbnailAsync fails', async () => {
      jest.doMock(
        'expo-video-thumbnails',
        () => ({
          getThumbnailAsync: jest.fn().mockRejectedValue(new Error('Generation failed')),
        }),
        { virtual: true }
      );

      const { generateVideoThumbnail } = require('../videoThumbnail');
      const uri = await generateVideoThumbnail('video-uri');
      expect(uri).toBeNull();
      expect(console.error).toHaveBeenCalledWith('生成视频缩略图失败:', expect.any(Error));
    });
  });

  describe('generateVideoThumbnails', () => {
    it('should generate thumbnails for multiple videos', async () => {
      jest.doMock(
        'expo-video-thumbnails',
        () => ({
          getThumbnailAsync: jest.fn().mockImplementation(async (uri) => ({ uri: `thumb-${uri}` })),
        }),
        { virtual: true }
      );

      const { generateVideoThumbnails } = require('../videoThumbnail');
      const uris = ['video1', 'video2'];
      const thumbnailMap = await generateVideoThumbnails(uris);

      expect(thumbnailMap.size).toBe(2);
      expect(thumbnailMap.get('video1')).toBe('thumb-video1');
      expect(thumbnailMap.get('video2')).toBe('thumb-video2');
    });

    it('should handle partial failures', async () => {
      jest.doMock(
        'expo-video-thumbnails',
        () => ({
          getThumbnailAsync: jest.fn().mockImplementation(async (uri) => {
            if (uri === 'fail') throw new Error('fail');
            return { uri: `thumb-${uri}` };
          }),
        }),
        { virtual: true }
      );

      const { generateVideoThumbnails } = require('../videoThumbnail');
      const uris = ['success', 'fail'];
      const thumbnailMap = await generateVideoThumbnails(uris);

      expect(thumbnailMap.size).toBe(1);
      expect(thumbnailMap.get('success')).toBe('thumb-success');
      expect(thumbnailMap.get('fail')).toBeUndefined();
    });

    it('should handle empty input array', async () => {
      jest.doMock(
        'expo-video-thumbnails',
        () => ({
          getThumbnailAsync: jest.fn(),
        }),
        { virtual: true }
      );

      const { generateVideoThumbnails } = require('../videoThumbnail');
      const uris: string[] = [];
      const thumbnailMap = await generateVideoThumbnails(uris);

      expect(thumbnailMap.size).toBe(0);
    });
  });
});
