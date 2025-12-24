import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { DetailScreen } from '../DetailScreen';
import { View, Text } from 'react-native';
import { useUserStore } from '@/src/store/userStore';
import * as Hooks from '@/src/hooks';
import * as DetailHooks from '../../hooks';
import * as Dialogs from '@/src/components/dialogs';

// Mock external dependencies
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  router: {
    push: jest.fn(),
  },
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  })),
}));
jest.mock('tamagui', () => {
  const { View, Text } = require('react-native');
  return {
    ScrollView: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    YStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    View: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    styled: (Component: any) => Component, // Mock styled function
    Button: ({ children, ...props }: any) => <View {...props}>{children}</View>, // Mock Button
    Spinner: () => <View testID="spinner" />, // Mock Spinner
    Card: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    XStack: ({ children, ...props }: any) => <View {...props}>{children}</View>,
  };
});
jest.mock('@/src/hooks', () => ({
  useLazyLoad: jest.fn(),
}));
jest.mock('../../hooks', () => ({
  useCatFoodDetail: jest.fn(),
  useAdditiveModal: jest.fn(),
  useAIReport: jest.fn(),
  useStreamingReport: jest.fn(),
}));
jest.mock('@/src/store/userStore', () => ({
  useUserStore: jest.fn(),
}));

// Mock child components to isolate screen logic
jest.mock('@/src/components/Comments', () => {
  const { View } = require('react-native');
  return {
    CommentSection: () => <View testID="comment-section" />,
  };
});
jest.mock('@/src/components/lazy', () => {
  const { View } = require('react-native');
  return {
    SkeletonAIReport: () => <View testID="skeleton-ai-report" />,
  };
});
jest.mock('../../components', () => {
  const { View } = require('react-native');
  return {
    ActionBar: () => <View testID="action-bar" />,
    AdditiveDetailModal: ({ visible, onClose }: any) =>
      visible ? <View testID="additive-modal" onTouchEnd={onClose} /> : null,
    AdditiveSection: ({ onAdditivePress }: any) => (
      <View
        testID="additive-section"
        onTouchEnd={() => onAdditivePress({ name: 'Test Additive' })}
      />
    ),
    AdminUpdatePrompt: () => <View testID="admin-update-prompt" />,
    AIReportSection: ({ onGeneratePress }: any) => (
      <View testID="ai-report-section" onTouchEnd={onGeneratePress} />
    ),
    BasicInfoSection: () => <View testID="basic-info-section" />,
    EmptyState: () => <View testID="empty-state" />,
    LoadingState: () => <View testID="loading-state" />,
    NutrientAnalysisSection: () => <View testID="nutrient-analysis-section" />,
    NutritionChartSection: () => <View testID="nutrition-chart-section" />,
    NutritionInputPrompt: ({ onGenerate }: any) => (
      <View testID="nutrition-input-prompt" onTouchEnd={onGenerate} />
    ),
    NutritionListSection: () => <View testID="nutrition-list-section" />,
    RatingSection: () => <View testID="rating-section" />,
    ReportHeader: () => <View testID="report-header" />,
    SafetyAnalysisSection: () => <View testID="safety-analysis-section" />,
  };
});

// Mock toast
jest.spyOn(Dialogs.toast, 'error');

describe('DetailScreen (src/app/detail/screens/DetailScreen.tsx)', () => {
  // Setup default mocks
  const mockUseUserStore = useUserStore as unknown as jest.Mock;
  const mockUseLazyLoad = Hooks.useLazyLoad as jest.Mock;

  // Detail hooks mocks
  const mockUseCatFoodDetail = DetailHooks.useCatFoodDetail as jest.Mock;
  const mockUseAdditiveModal = DetailHooks.useAdditiveModal as jest.Mock;
  const mockUseAIReport = DetailHooks.useAIReport as jest.Mock;
  const mockUseStreamingReport = DetailHooks.useStreamingReport as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUseUserStore.mockImplementation((selector: any) => {
      const state = { user: { isAdmin: false } };
      return selector ? selector(state) : state;
    });

    mockUseLazyLoad.mockReturnValue({
      isReady: true,
      isLoading: false,
      startLoading: jest.fn(),
      reset: jest.fn(),
    });

    mockUseCatFoodDetail.mockReturnValue({
      catfoodId: '123',
      catFood: {
        id: '123',
        name: 'Test Food',
        ingredient: [{ name: 'Chicken' }],
        additive: [{ name: 'Taurine' }],
      },
      isLoading: false,
    } as any);

    mockUseAdditiveModal.mockReturnValue({
      selectedAdditive: null,
      modalVisible: false,
      handleAdditivePress: jest.fn(),
      handleCloseModal: jest.fn(),
    });

    mockUseAIReport.mockReturnValue({
      report: null,
      hasReport: false,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    mockUseStreamingReport.mockReturnValue({
      state: { isStreaming: false, content: '', error: null, isComplete: false, progress: 0 },
      startStreaming: jest.fn(),
      stopStreaming: jest.fn(),
      reset: jest.fn(),
    });
  });

  it('renders loading state when cat food is loading', () => {
    mockUseCatFoodDetail.mockReturnValue({
      catfoodId: '123',
      catFood: null,
      isLoading: true,
    } as any);

    render(<DetailScreen />);
    expect(screen.getByTestId('loading-state')).toBeTruthy();
  });

  it('renders empty state when cat food is not found', () => {
    mockUseCatFoodDetail.mockReturnValue({
      catfoodId: '123',
      catFood: null,
      isLoading: false,
    } as any);

    render(<DetailScreen />);
    expect(screen.getByTestId('empty-state')).toBeTruthy();
  });

  it('renders main content when cat food is loaded', () => {
    render(<DetailScreen />);

    expect(screen.getByTestId('report-header')).toBeTruthy();
    expect(screen.getByTestId('basic-info-section')).toBeTruthy();
    expect(screen.getByTestId('rating-section')).toBeTruthy();
    expect(screen.getByTestId('nutrition-list-section')).toBeTruthy();
    expect(screen.getByTestId('additive-section')).toBeTruthy();
    expect(screen.getByTestId('action-bar')).toBeTruthy();
  });

  it('renders AI report sections when report exists', () => {
    mockUseAIReport.mockReturnValue({
      report: { id: 'report-1', ingredients_text: 'Chicken, Taurine' },
      hasReport: true,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    render(<DetailScreen />);

    // When report exists, AIReportSection is shown
    expect(screen.getByTestId('ai-report-section')).toBeTruthy();

    // When report exists, other sections like NutritionChartSection are NOT shown based on the code logic:
    // {!hasReport && ( ... )} wraps SafetyAnalysisSection, NutrientAnalysisSection, AdditiveSection, NutritionChartSection, NutritionListSection
    // So we should expect them NOT to be there if hasReport is true
    expect(screen.queryByTestId('nutrition-chart-section')).toBeNull();
    expect(screen.queryByTestId('nutrient-analysis-section')).toBeNull();
    expect(screen.queryByTestId('safety-analysis-section')).toBeNull();
  });

  it('renders nutrition input prompt when no report exists and no data', () => {
    mockUseAIReport.mockReturnValue({
      report: null,
      hasReport: false,
      isLoading: false,
      refetch: jest.fn(),
    } as any);

    // Ensure catFood has no data to trigger NutritionInputPrompt
    mockUseCatFoodDetail.mockReturnValue({
      catfoodId: '123',
      catFood: {
        id: '123',
        name: 'Test Food',
        ingredient: [],
        additive: [],
        percentage: null,
        safety: null,
        nutrient: null,
      },
      isLoading: false,
    } as any);

    render(<DetailScreen />);

    expect(screen.getByTestId('nutrition-input-prompt')).toBeTruthy();
  });

  it('handles additive press', () => {
    const handleAdditivePress = jest.fn();
    mockUseAdditiveModal.mockReturnValue({
      selectedAdditive: null,
      modalVisible: false,
      handleAdditivePress,
      handleCloseModal: jest.fn(),
    });

    render(<DetailScreen />);

    fireEvent(screen.getByTestId('additive-section'), 'touchEnd'); // Use touchEnd as defined in mock
    expect(handleAdditivePress).toHaveBeenCalledWith({ name: 'Test Additive' });
  });

  it('shows admin update prompt for admin users', () => {
    // Mock useUserStore to return a user object with isAdmin: true
    mockUseUserStore.mockImplementation((selector: any) => {
      const mockState = {
        user: { isAdmin: true },
      };

      if (selector) {
        return selector(mockState);
      }
      return mockState;
    });

    // Reset mock to ensure no previous state leaks
    mockUseCatFoodDetail.mockReset();
    mockUseCatFoodDetail.mockReturnValue({
      catfoodId: '123',
      catFood: {
        id: '123',
        name: 'Test Food',
        ingredient: [{ name: 'Chicken' }],
        additive: [{ name: 'Taurine' }],
        percentage: true,
        percentData: {},
      },
      isLoading: false,
    });

    render(<DetailScreen />);

    expect(screen.getByTestId('admin-update-prompt')).toBeTruthy();
  });

  it('handles generate report action', async () => {
    const startStreaming = jest.fn();
    mockUseStreamingReport.mockReturnValue({
      state: { isStreaming: false, content: '', error: null, isComplete: false, progress: 0 },
      startStreaming,
      stopStreaming: jest.fn(),
      reset: jest.fn(),
    });

    mockUseAIReport.mockReturnValue({
      report: null,
      hasReport: false,
      isLoading: false,
      refetch: jest.fn(),
    });

    // Reset mock to ensure no previous state leaks
    mockUseCatFoodDetail.mockReset();
    mockUseCatFoodDetail.mockReturnValue({
      catfoodId: '123',
      catFood: {
        id: '123',
        name: 'Test Food',
        ingredient: [{ name: 'Chicken' }], // Needs ingredients to generate report
        additive: [],
        percentage: null,
        safety: null,
        nutrient: null,
      },
      isLoading: false,
    });

    render(<DetailScreen />);

    fireEvent(screen.getByTestId('ai-report-section'), 'touchEnd');

    await waitFor(() => {
      expect(startStreaming).toHaveBeenCalled();
    });
  });
});
