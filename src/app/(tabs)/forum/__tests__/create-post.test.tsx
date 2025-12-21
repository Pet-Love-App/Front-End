import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { usePostEditor } from '../hooks/usePostEditor';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabaseForumService } from '@/src/lib/supabase';

if (typeof navigator === 'undefined') {
  global.navigator = {
    userAgent: 'node.js',
  } as any;
}

// Tamagui web expects a DOM-like API
if (typeof (global as any).addEventListener === 'undefined') {
  (global as any).addEventListener = jest.fn();
}
// Tamagui select expects window.matchMedia
if (typeof (global as any).window === 'undefined') {
  (global as any).window = {} as any;
}
if (typeof (global as any).window.matchMedia === 'undefined') {
  (global as any).window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
}
const CreatePostScreen = require('../create-post').default;

// Mock dependencies
jest.mock('../hooks/usePostEditor', () => ({
  usePostEditor: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(),
}));

jest.mock('@/src/lib/supabase', () => ({
  supabaseForumService: {
    createPost: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
    getPosts: jest.fn(),
    getPostDetail: jest.fn(),
  },
}));

jest.mock('@/src/components/dialogs', () => ({
  showAlert: jest.fn(),
}));

// Mock Lucide icons
jest.mock('@tamagui/lucide-icons', () => ({
  Camera: 'Camera',
  ImagePlus: 'ImagePlus',
  X: 'X',
  ChevronLeft: 'ChevronLeft',
  AtSign: 'AtSign',
  Hash: 'Hash',
  MapPin: 'MapPin',
  Smile: 'Smile',
  Play: 'Play',
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

describe('CreatePostScreen', () => {
  const mockEditor = {
    content: '',
    category: undefined,
    tagsText: '',
    pickedFiles: [],
    submitting: false,
    setContent: jest.fn(),
    setCategory: jest.fn(),
    setTagsText: jest.fn(),
    addFiles: jest.fn(),
    removeFile: jest.fn(),
    reset: jest.fn(),
    loadFromPost: jest.fn(),
    pickMedia: jest.fn(),
    takePhoto: jest.fn(),
    submit: jest.fn(),
    parsedTags: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePostEditor as jest.Mock).mockReturnValue(mockEditor);
    (useLocalSearchParams as jest.Mock).mockReturnValue({});
    (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 0, bottom: 0 });
  });

  it('应该渲染发布页面', () => {
    const { getByText, getByPlaceholderText } = render(<CreatePostScreen />);

    // 文案与实际页面保持一致
    expect(getByText('创建新帖')).toBeTruthy();
    expect(getByPlaceholderText('分享你的想法...')).toBeTruthy();
  });

  it('点击返回应该调用 router.back', () => {
    const { UNSAFE_getByType } = render(<CreatePostScreen />);
    const backButton = UNSAFE_getByType('ChevronLeft' as any);

    fireEvent.press(backButton);
    expect(router.back).toHaveBeenCalled();
  });

  it('输入内容应该调用 setContent', () => {
    const { getByPlaceholderText } = render(<CreatePostScreen />);
    const input = getByPlaceholderText('分享你的想法...');

    fireEvent.changeText(input, '测试内容');
    expect(mockEditor.setContent).toHaveBeenCalledWith('测试内容');
  });

  it('点击发布应该调用 submit', async () => {
    // 使发布按钮可用
    (usePostEditor as jest.Mock).mockReturnValue({ ...mockEditor, content: '有内容' });
    const { getByText } = render(<CreatePostScreen />);
    const publishButton = getByText('发布');

    fireEvent.press(publishButton);
    expect(mockEditor.submit).toHaveBeenCalled();
  });

  it('如果是编辑模式，应该加载帖子数据', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ editPostId: '123' });
    const mockPost = { id: 123, content: '旧内容' };
    (supabaseForumService.getPostDetail as jest.Mock).mockResolvedValue({
      data: mockPost,
      error: null,
    });
    const loadSpy = jest.fn();
    (usePostEditor as jest.Mock).mockReturnValue({ ...mockEditor, loadFromPost: loadSpy });
    render(<CreatePostScreen />);

    await waitFor(() => {
      expect(loadSpy).toHaveBeenCalled();
    });
  });
});
