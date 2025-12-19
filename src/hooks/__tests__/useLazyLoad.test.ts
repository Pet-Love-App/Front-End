/**
 * useLazyLoad Hook 测试
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useLazyLoad } from '../useLazyLoad';

describe('useLazyLoad', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with isReady false', () => {
      const { result } = renderHook(() => useLazyLoad({ delay: 100 }));

      expect(result.current.isReady).toBe(false);
    });
  });

  describe('delay behavior', () => {
    it('should set isReady to true after delay', async () => {
      const { result } = renderHook(() => useLazyLoad({ delay: 100 }));

      expect(result.current.isReady).toBe(false);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
    });

    it('should respect custom delay', async () => {
      const { result } = renderHook(() => useLazyLoad({ delay: 500 }));

      act(() => {
        jest.advanceTimersByTime(400);
      });

      expect(result.current.isReady).toBe(false);

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
    });

    it('should use default delay when not provided', async () => {
      const { result } = renderHook(() => useLazyLoad({}));

      act(() => {
        jest.advanceTimersByTime(300); // Default delay
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
    });
  });

  describe('cleanup', () => {
    it('should cleanup timeout on unmount', () => {
      const { unmount } = renderHook(() => useLazyLoad({ delay: 100 }));

      unmount();

      expect(() => {
        jest.advanceTimersByTime(100);
      }).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle zero delay', async () => {
      const { result } = renderHook(() => useLazyLoad({ delay: 0 }));

      act(() => {
        jest.advanceTimersByTime(0);
      });

      await waitFor(() => {
        expect(result.current.isReady).toBe(true);
      });
    });

    it('should handle very large delay', () => {
      const { result } = renderHook(() => useLazyLoad({ delay: 10000 }));

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.isReady).toBe(false);
    });
  });
});
