// Mock navigator for Tamagui
import React from 'react';
import { render } from '@testing-library/react-native';
import { RankingScreen } from '../RankingScreen';
import * as hooks from '../../hooks';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

Object.defineProperty(global, 'navigator', {
  value: {
    product: 'ReactNative',
  },
  writable: true,
});

// Mock window for Tamagui
Object.defineProperty(global, 'window', {
  value: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  writable: true,
});

// Mock tamagui to avoid environment issues
jest.mock('tamagui', () => ({
  YStack: 'YStack',
  XStack: 'XStack',
  Text: 'Text',
  Card: 'Card',
  View: 'View',
  ScrollView: 'ScrollView',
  Button: 'Button',
  Image: 'Image',
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock FlatList to avoid complex rendering and memory issues
jest.mock('react-native/Libraries/Lists/FlatList', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef(
      (
        {
          data,
          renderItem,
          ListHeaderComponent,
          ListFooterComponent,
          ListEmptyComponent,
          ...props
        },
        ref
      ) => {
        const Header =
          typeof ListHeaderComponent === 'function'
            ? ListHeaderComponent
            : () => ListHeaderComponent || null;
        const Footer =
          typeof ListFooterComponent === 'function'
            ? ListFooterComponent
            : () => ListFooterComponent || null;
        const Empty =
          typeof ListEmptyComponent === 'function'
            ? ListEmptyComponent
            : () => ListEmptyComponent || null;

        return (
          <View testID="flat-list" {...props}>
            <Header />
            {data &&
              data.map((item, index) => <View key={index}>{renderItem({ item, index })}</View>)}
            <Footer />
            {(!data || data.length === 0) && <Empty />}
          </View>
        );
      }
    ),
  };
});

// Mock global hooks
jest.mock('@/src/hooks', () => ({
  useLazyLoad: jest.fn(() => ({ isReady: true })),
}));

// Mock local hooks
jest.mock('../../hooks', () => ({
  useRankingData: jest.fn(),
  useRankingFilter: jest.fn(),
  useImagePreview: jest.fn(),
}));

// Mock components
jest.mock('@/src/components/AppHeader', () => ({
  AppHeader: 'AppHeader',
}));

jest.mock('@/src/components/CatFoodCard', () => ({
  CatFoodCard: 'CatFoodCard',
}));

jest.mock('@/src/components/lazy', () => ({
  Skeleton: 'Skeleton',
}));

// Mock local components with simple strings to avoid memory issues
jest.mock('../../components', () => ({
  TopRankingSwiper: 'TopRankingSwiper',
  SearchFilterSection: 'SearchFilterSection',
  EmptyState: 'EmptyState',
  ListFooter: 'ListFooter',
  ImagePreviewModal: 'ImagePreviewModal',
}));

describe('RankingScreen', () => {
  const mockRouter = { push: jest.fn() };
  const mockCatFoods = [
    { id: '1', name: 'CatFood 1', brand: 'Brand A', score: 4.5 },
    { id: '2', name: 'CatFood 2', brand: 'Brand B', score: 4.0 },
  ];

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    (hooks.useRankingData as jest.Mock).mockReturnValue({
      catfoods: mockCatFoods,
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      handleRefresh: jest.fn(),
      handleLoadMore: jest.fn(),
    });

    (hooks.useRankingFilter as jest.Mock).mockReturnValue({
      sortBy: 'score',
      setSortBy: jest.fn(),
      selectedBrand: 'all',
      brandMenuExpanded: false,
      searchQuery: '',
      brandList: ['all', 'Brand A', 'Brand B'],
      brandCounts: { all: 2, 'Brand A': 1, 'Brand B': 1 },
      filteredCatFoods: mockCatFoods,
      topCatFoods: [mockCatFoods[0]],
      listCatFoods: [mockCatFoods[1]],
      handleSearchChange: jest.fn(),
      handleClearSearch: jest.fn(),
      handleSelectBrand: jest.fn(),
      toggleBrandMenu: jest.fn(),
      resetFilters: jest.fn(),
    });

    (hooks.useImagePreview as jest.Mock).mockReturnValue({
      previewVisible: false,
      previewImageUrl: '',
      handleImagePress: jest.fn(),
      closePreview: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { toJSON } = render(<RankingScreen />);
    expect(toJSON()).toMatchSnapshot();
  });
});
