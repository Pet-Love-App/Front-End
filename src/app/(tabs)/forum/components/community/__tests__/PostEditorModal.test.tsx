import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { usePostEditor } from '../../../hooks/usePostEditor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showAlert } from '@/src/components/dialogs';

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
const { PostEditorModal } = require('../PostEditorModal');
// Mock reanimated to avoid runtime errors
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
// Lightweight tamagui mock to simplify rendering
jest.mock('tamagui', () => {
  const React = require('react');
  const { View, Text, TextInput, ScrollView } = require('react-native');
  const mk = (Comp: any) => (p: any) => React.createElement(Comp, p, p.children);
  return {
    styled: (Comp: any) => mk(Comp),
    XStack: mk(View),
    YStack: mk(View),
    Text: mk(Text),
    TextArea: mk(TextInput),
    Stack: mk(View),
    ScrollView: mk(ScrollView),
    useTheme: () => ({}),
  };
});

// Mock dependencies
jest.mock('../../../hooks/usePostEditor', () => ({
  usePostEditor: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(),
}));

jest.mock('@/src/components/dialogs', () => ({
  showAlert: jest.fn(),
}));

jest.mock('../../VideoPreview', () => ({
  VideoPreview: 'VideoPreview',
}));

// No provider needed with lightweight tamagui mock

describe('PostEditorModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
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
    submit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePostEditor as jest.Mock).mockReturnValue(mockEditor);
    (useSafeAreaInsets as jest.Mock).mockReturnValue({ top: 0, bottom: 0 });
  });

  const renderComponent = (props = {}) => {
    return render(
      <PostEditorModal visible={true} onClose={mockOnClose} onSuccess={mockOnSuccess} {...props} />
    );
  };

  it('应该在可见时渲染', () => {
    const { getByText } = renderComponent();
    expect(getByText('发布新帖')).toBeTruthy();
  });

  it('应该在编辑模式下渲染正确标题', () => {
    const { getByText } = renderComponent({ editingPost: { id: '1' } as any });
    expect(getByText('编辑帖子')).toBeTruthy();
  });

  it('输入内容应该调用 setContent', () => {
    const { getByPlaceholderText } = renderComponent();
    const input = getByPlaceholderText('分享你的想法...');

    fireEvent.changeText(input, '新内容');
    expect(mockEditor.setContent).toHaveBeenCalledWith('新内容');
  });

  it('点击分类应该调用 setCategory', () => {
    const { getByText } = renderComponent();
    // 使用存在的分类标签 "分享"，对应 key 为 'share'
    fireEvent.press(getByText('分享'));
    expect(mockEditor.setCategory).toHaveBeenCalledWith('share');
  });

  it('点击发布应该调用 submit', async () => {
    // 设置有内容，使发布按钮可用
    (usePostEditor as jest.Mock).mockReturnValue({
      ...mockEditor,
      content: '有内容',
    });

    const { getByText } = renderComponent();
    fireEvent.press(getByText('发布'));

    expect(mockEditor.submit).toHaveBeenCalled();
  });

  it('点击取消应该调用 onClose', () => {
    const { getByText } = renderComponent();
    fireEvent.press(getByText('取消'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('当 visible 变为 true 且有 editingPost 时应该调用 loadFromPost', () => {
    const editingPost = { id: '1' } as any;
    renderComponent({ editingPost });

    expect(mockEditor.loadFromPost).toHaveBeenCalledWith(editingPost);
  });
});
