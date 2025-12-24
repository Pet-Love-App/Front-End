import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAIReport } from '../useAIReport';
import { supabaseAIReportService } from '@/src/lib/supabase/services/aiReport';

// Mock dependencies
jest.mock('@/src/lib/supabase/services/aiReport', () => ({
  supabaseAIReportService: {
    getReport: jest.fn(),
  },
}));

const mockReport = {
  id: 1,
  catfood_id: 123,
  tags: ['tag1', 'tag2'],
  safety: 'Safety analysis content',
  nutrient: 'Nutrient analysis content',
  additives: ['additive1'],
  ingredients: ['ingredient1'],
  created_at: '2023-01-01',
  updated_at: '2023-01-02',
  percentage: true,
  percent_data: {
    protein: 10,
    fat: 5,
  },
};

describe('useAIReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAIReport(null));

    expect(result.current.report).toBeNull();
    expect(result.current.hasReport).toBeFalsy();
    expect(result.current.isLoading).toBeFalsy();
    expect(result.current.error).toBeNull();
  });

  it('should not load report if catfoodId is null', async () => {
    const { result } = renderHook(() => useAIReport(null));

    expect(supabaseAIReportService.getReport).not.toHaveBeenCalled();
    expect(result.current.report).toBeNull();
  });

  it('should load report successfully when it exists', async () => {
    (supabaseAIReportService.getReport as jest.Mock).mockResolvedValue(mockReport);

    const { result } = renderHook(() => useAIReport(123));

    // Initial loading state might be captured if we check immediately, but waitFor handles async
    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(supabaseAIReportService.getReport).toHaveBeenCalledWith(123);
    expect(result.current.hasReport).toBeTruthy();
    expect(result.current.report).toEqual(mockReport);
    expect(result.current.error).toBeNull();
  });

  it('should handle case when report does not exist', async () => {
    (supabaseAIReportService.getReport as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useAIReport(123));

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(supabaseAIReportService.getReport).toHaveBeenCalledWith(123);
    expect(result.current.hasReport).toBeFalsy();
    expect(result.current.report).toBeNull();
  });

  it('should handle error during checkReportExists', async () => {
    (supabaseAIReportService.getReport as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAIReport(123));

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.hasReport).toBeFalsy();
    expect(result.current.report).toBeNull();
  });

  it('should refetch report when refetch is called', async () => {
    (supabaseAIReportService.getReport as jest.Mock).mockResolvedValue(mockReport);

    const { result } = renderHook(() => useAIReport(123));

    await waitFor(() => {
      expect(result.current.report).toEqual(mockReport);
    });

    // Clear mocks to verify second call
    jest.clearAllMocks();
    (supabaseAIReportService.getReport as jest.Mock).mockResolvedValue(mockReport);

    await act(async () => {
      await result.current.refetch();
    });

    expect(supabaseAIReportService.getReport).toHaveBeenCalledWith(123);
  });
});
