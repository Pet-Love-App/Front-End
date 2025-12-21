import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useReportCollectData } from '../useReportCollectData';

import { aiReportService } from '@/src/services/api';

jest.mock('@/src/components/dialogs', () => ({
  showAlert: jest.fn((opts: any) => {
    // if confirm button exists, call it immediately to simulate user confirming
    const btn = opts?.buttons?.find((b: any) => b.style === 'destructive');
    if (btn && typeof btn.onPress === 'function') {
      btn.onPress();
    }
  }),
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('@/src/services/api', () => ({
  aiReportService: {
    getFavoriteReports: jest.fn(),
    deleteFavoriteReport: jest.fn(),
    getReport: jest.fn(),
  },
}));

describe('useReportCollectData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads favorite reports on mount and exposes handlers', async () => {
    const mockReports = [{ id: 1, report: { id: 10, catfood_name: 'NutriMix' } }];
    (aiReportService.getFavoriteReports as jest.Mock).mockResolvedValue(mockReports);

    const { result } = renderHook(() => useReportCollectData());

    // initially loading
    expect(result.current.isLoadingReports).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingReports).toBe(false);
      expect(result.current.favoriteReports).toHaveLength(1);
    });

    // test handlePress fetches full report
    const fullReport = { id: 10, catfood_name: 'NutriMix', content: 'full' } as any;
    (aiReportService.getReport as jest.Mock).mockResolvedValue(fullReport);

    await act(async () => {
      await result.current.handlePress(10);
    });

    expect(result.current.isReportModalVisible).toBe(true);
    expect(result.current.selectedReport).toEqual(fullReport);

    // test handleDelete triggers delete path via showAlert (mock calls destructive)
    (aiReportService.deleteFavoriteReport as jest.Mock).mockResolvedValue({});
    act(() => {
      result.current.handleDelete(1 as any);
    });

    expect(aiReportService.deleteFavoriteReport).toHaveBeenCalledWith(1);
  });

  it('handles fetch error', async () => {
    (aiReportService.getFavoriteReports as jest.Mock).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useReportCollectData());
    await waitFor(() => {
      expect(result.current.isLoadingReports).toBe(false);
      expect(result.current.reportError).toBe('获取报告收藏列表失败');
    });
  });

  it('handles handlePress error', async () => {
    (aiReportService.getFavoriteReports as jest.Mock).mockResolvedValue([]);
    (aiReportService.getReport as jest.Mock).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useReportCollectData());

    await act(async () => {
      await result.current.handlePress(10);
    });

    expect(result.current.isReportModalVisible).toBe(false);
  });
});
