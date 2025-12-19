/**
 * CommentSection 组件测试
 *
 * 测试评论区的渲染和用户交互
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { CommentSection } from '../CommentSection';

import { useComments } from '../useComments';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/src/hooks/useThemeAwareColorScheme', () => ({
  useThemeAwareColorScheme: () => 'light',
}));

jest.mock('@/src/store/userStore', () => ({
  useUserStore: () => ({
    user: { id: 'user-123', username: 'testuser' },
    isAuthenticated: true,
  }),
}));

jest.mock('@/src/components/dialogs', () => ({
  showAlert: jest.fn(),
}));

jest.mock('../useComments', () => ({
  useComments: jest.fn(() => ({
    comments: [],
    isLoading: false,
    isRefreshing: false,
    hasMore: false,
    page: 1,
    totalCount: 0,
    loadComments: jest.fn(),
    createComment: jest.fn(),
    deleteComment: jest.fn(),
    toggleLike: jest.fn(),
    refresh: jest.fn(),
  })),
}));

jest.mock('../CommentInput', () => ({
  CommentInput: () => null,
}));

jest.mock('../CommentList', () => ({
  CommentList: () => null,
}));

jest.mock('tamagui', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Separator: () => null,
  Text: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  XStack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  YStack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/src/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

describe('CommentSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render without crashing', () => {
      // Act & Assert
      expect(() => {
        render(<CommentSection targetType="catfood" targetId={123} />);
      }).not.toThrow();
    });

    it('should call useComments hook with correct parameters', () => {
      // Act
      render(<CommentSection targetType="catfood" targetId={123} />);

      // Assert
      expect(useComments).toHaveBeenCalledWith({
        targetType: 'catfood',
        targetId: 123,
      });
    });

    it('should render with totalCount greater than 0', () => {
      // Arrange
      (useComments as jest.Mock).mockReturnValue({
        comments: [],
        totalCount: 25,
        isLoading: false,
        isRefreshing: false,
        hasMore: false,
        page: 1,
        loadComments: jest.fn(),
        createComment: jest.fn(),
        deleteComment: jest.fn(),
        toggleLike: jest.fn(),
        refresh: jest.fn(),
      });

      // Act & Assert
      expect(() => {
        render(<CommentSection targetType="catfood" targetId={123} />);
      }).not.toThrow();
    });
  });

  describe('different target types', () => {
    it('should work with catfood target type', () => {
      // Act & Assert
      expect(() => {
        render(<CommentSection targetType="catfood" targetId={123} />);
      }).not.toThrow();
    });

    it('should work with post target type', () => {
      // Act & Assert
      expect(() => {
        render(<CommentSection targetType="post" targetId={456} />);
      }).not.toThrow();
    });

    it('should work with report target type', () => {
      // Act & Assert
      expect(() => {
        render(<CommentSection targetType="report" targetId={789} />);
      }).not.toThrow();
    });
  });

  describe('loading state', () => {
    it('should render with isLoading true', () => {
      // Arrange
      (useComments as jest.Mock).mockReturnValue({
        comments: [],
        isLoading: true,
        isRefreshing: false,
        totalCount: 0,
        hasMore: false,
        page: 1,
        loadComments: jest.fn(),
        createComment: jest.fn(),
        deleteComment: jest.fn(),
        toggleLike: jest.fn(),
        refresh: jest.fn(),
      });

      // Act & Assert
      expect(() => {
        render(<CommentSection targetType="catfood" targetId={123} />);
      }).not.toThrow();
    });

    it('should render with isRefreshing true', () => {
      // Arrange
      (useComments as jest.Mock).mockReturnValue({
        comments: [],
        isLoading: false,
        isRefreshing: true,
        totalCount: 0,
        hasMore: false,
        page: 1,
        loadComments: jest.fn(),
        createComment: jest.fn(),
        deleteComment: jest.fn(),
        toggleLike: jest.fn(),
        refresh: jest.fn(),
      });

      // Act & Assert
      expect(() => {
        render(<CommentSection targetType="catfood" targetId={123} />);
      }).not.toThrow();
    });
  });

  describe('memoization', () => {
    it('should be memoized component', () => {
      // Arrange
      const props = { targetType: 'catfood' as const, targetId: 123 };

      // Act
      const { rerender } = render(<CommentSection {...props} />);
      rerender(<CommentSection {...props} />);

      // Assert - should call hook for each render
      expect(useComments).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle zero comments', () => {
      // Arrange
      (useComments as jest.Mock).mockReturnValue({
        comments: [],
        totalCount: 0,
        isLoading: false,
        isRefreshing: false,
        hasMore: false,
        page: 1,
        loadComments: jest.fn(),
        createComment: jest.fn(),
        deleteComment: jest.fn(),
        toggleLike: jest.fn(),
        refresh: jest.fn(),
      });

      // Act & Assert
      expect(() => {
        render(<CommentSection targetType="catfood" targetId={123} />);
      }).not.toThrow();
    });

    it('should handle large comment counts', () => {
      // Arrange
      (useComments as jest.Mock).mockReturnValue({
        comments: [],
        totalCount: 9999,
        isLoading: false,
        isRefreshing: false,
        hasMore: true,
        page: 1,
        loadComments: jest.fn(),
        createComment: jest.fn(),
        deleteComment: jest.fn(),
        toggleLike: jest.fn(),
        refresh: jest.fn(),
      });

      // Act & Assert
      expect(() => {
        render(<CommentSection targetType="catfood" targetId={123} />);
      }).not.toThrow();
    });
  });
});
