import CollectListItem from '@/src/app/(tabs)/collect/components/collectItem';
import ReportCollectItem from '@/src/app/(tabs)/collect/components/ReportCollectItem';
import { AIReportModal } from '@/src/app/detail/components/AIReportModal';
import { PageHeader } from '@/src/components/PageHeader';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Input, ScrollView, Spinner, Text, XStack, YStack } from 'tamagui';
import { useCollectData, useCollectFilter, useReportCollectData } from '../hooks';

/**
 * Collect 主屏幕组件
 * 显示用户收藏的猫粮和报告
 */
export function CollectScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];

  // 使用自定义 hooks
  const { isLoading, error, refreshing, handleRefresh, handleDelete, handlePress } =
    useCollectData();

  // 报告收藏数据
  const {
    favoriteReports,
    isLoadingReports,
    reportError,
    refreshing: refreshingReports,
    handleRefresh: handleRefreshReports,
    handleDelete: handleDeleteReport,
    handlePress: handlePressReport,
    selectedReport,
    isReportModalVisible,
    closeReportModal,
  } = useReportCollectData();

  const {
    currentTab,
    setCurrentTab,
    searchText,
    setSearchText,
    filteredFavorites,
    favoritesCount,
  } = useCollectFilter();

  // 渲染空状态
  const renderEmptyState = (message: string, icon: string) => (
    <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$10" gap="$4">
      <IconSymbol name={icon as any} size={80} color={colors.icon + '40'} />
      <Text fontSize={16} color={colors.icon} textAlign="center">
        {message}
      </Text>
    </YStack>
  );

  // 渲染猫粮收藏列表
  const renderCatFoodList = () => {
    if (isLoading && !refreshing) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$10">
          <Spinner size="large" color={colors.tint} />
          <Text fontSize={16} color={colors.icon} marginTop="$4">
            加载中...
          </Text>
        </YStack>
      );
    }

    if (error && !isLoading) {
      return renderEmptyState(`❌ ${error}\n下拉刷新重试`, 'exclamationmark.triangle');
    }

    if (filteredFavorites.length === 0) {
      return renderEmptyState(
        searchText.trim() ? '未找到匹配的收藏' : '还没有收藏任何猫粮哦~\n快去发现喜欢的猫粮吧！',
        'heart.slash'
      );
    }

    return (
      <YStack gap="$3" paddingBottom="$4">
        {filteredFavorites.map((favorite) => (
          <YStack
            key={favorite.id}
            pressStyle={{ scale: 0.98, opacity: 0.9 }}
            animation="quick"
            onPress={() => handlePress(favorite.catfood.id)}
          >
            <CollectListItem favorite={favorite} onDelete={() => handleDelete(favorite.id)} />
          </YStack>
        ))}
      </YStack>
    );
  };

  // 渲染报告收藏列表
  const renderReportList = () => {
    if (isLoadingReports && !refreshingReports) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" paddingVertical="$10">
          <Spinner size="large" color={colors.tint} />
          <Text fontSize={16} color={colors.icon} marginTop="$4">
            加载中...
          </Text>
        </YStack>
      );
    }

    if (reportError && !isLoadingReports) {
      return renderEmptyState(`❌ ${reportError}\n下拉刷新重试`, 'exclamationmark.triangle');
    }

    // 过滤报告收藏
    const filteredReports = favoriteReports.filter((fav) => {
      if (!searchText.trim()) return true;
      const search = searchText.toLowerCase();
      return (
        fav.report.catfood_name.toLowerCase().includes(search) ||
        fav.report.safety?.toLowerCase().includes(search) ||
        fav.report.tags?.some((tag) => tag.toLowerCase().includes(search))
      );
    });

    if (filteredReports.length === 0) {
      return renderEmptyState(
        searchText.trim()
          ? '未找到匹配的报告收藏'
          : '还没有收藏任何报告哦~\n快去收藏感兴趣的AI报告吧！',
        'doc.text.fill'
      );
    }

    return (
      <YStack gap="$3" paddingBottom="$4">
        {filteredReports.map((favoriteReport) => (
          <YStack
            key={favoriteReport.id}
            pressStyle={{ scale: 0.98, opacity: 0.9 }}
            animation="quick"
          >
            <ReportCollectItem
              favoriteReport={favoriteReport}
              onDelete={() => handleDeleteReport(favoriteReport.id)}
              onPress={() => handlePressReport(favoriteReport.report)}
            />
          </YStack>
        ))}
      </YStack>
    );
  };

  return (
    <YStack flex={1} backgroundColor="$gray1">
      {/* 整合的顶部区域 */}
      <YStack backgroundColor="white" borderBottomWidth={1} borderBottomColor="$gray3">
        {/* 标题栏 */}
        <PageHeader
          title="我的收藏"
          icon={{
            name: 'heart.fill',
            size: 24,
            color: colors.tint,
            backgroundColor: colors.tint + '15',
            borderColor: colors.tint + '30',
          }}
          insets={insets}
          showBorder={false}
          rightElement={
            <XStack
              backgroundColor={colors.tint + '15'}
              paddingHorizontal="$2.5"
              paddingVertical="$1.5"
              borderRadius="$10"
            >
              <Text fontSize={13} fontWeight="600" color={colors.tint}>
                {currentTab === 'catfood' ? favoritesCount : favoriteReports.length}
              </Text>
            </XStack>
          }
        />

        {/* 搜索框 */}
        <YStack paddingHorizontal="$4" paddingBottom="$3">
          <Input
            placeholder="搜索收藏的内容..."
            placeholderTextColor={colors.icon}
            value={searchText}
            onChangeText={setSearchText}
            size="$3"
            backgroundColor={colors.icon + '10'}
            borderColor="transparent"
            color={colors.text}
            focusStyle={{
              borderColor: colors.tint,
              backgroundColor: colors.background,
            }}
          />
        </YStack>

        {/* Tab 按钮 */}
        <XStack
          paddingHorizontal="$4"
          gap="$2"
          borderBottomWidth={1}
          borderBottomColor={colors.icon + '15'}
        >
          <YStack
            flex={1}
            paddingVertical="$2.5"
            alignItems="center"
            borderBottomWidth={2}
            borderBottomColor={currentTab === 'catfood' ? colors.tint : 'transparent'}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => setCurrentTab('catfood')}
          >
            <XStack gap="$2" alignItems="center">
              <IconSymbol
                name="pawprint.fill"
                size={18}
                color={currentTab === 'catfood' ? colors.tint : colors.icon}
              />
              <Text
                fontSize={15}
                fontWeight={currentTab === 'catfood' ? '600' : '400'}
                color={currentTab === 'catfood' ? colors.tint : colors.icon}
              >
                猫粮收藏
              </Text>
            </XStack>
          </YStack>

          <YStack
            flex={1}
            paddingVertical="$2.5"
            alignItems="center"
            borderBottomWidth={2}
            borderBottomColor={currentTab === 'report' ? colors.tint : 'transparent'}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => setCurrentTab('report')}
          >
            <XStack gap="$2" alignItems="center">
              <IconSymbol
                name="doc.text.fill"
                size={18}
                color={currentTab === 'report' ? colors.tint : colors.icon}
              />
              <Text
                fontSize={15}
                fontWeight={currentTab === 'report' ? '600' : '400'}
                color={currentTab === 'report' ? colors.tint : colors.icon}
              >
                报告收藏
              </Text>
            </XStack>
          </YStack>
        </XStack>
      </YStack>

      {/* Tab 内容区域 */}
      <YStack flex={1} backgroundColor="$gray1">
        {currentTab === 'catfood' ? (
          <ScrollView
            flex={1}
            padding="$4"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.tint}
              />
            }
          >
            {renderCatFoodList()}
          </ScrollView>
        ) : (
          <ScrollView
            flex={1}
            padding="$4"
            refreshControl={
              <RefreshControl
                refreshing={refreshingReports}
                onRefresh={handleRefreshReports}
                tintColor={colors.tint}
              />
            }
          >
            {renderReportList()}
          </ScrollView>
        )}
      </YStack>

      {/* AI 报告详情模态框 */}
      <AIReportModal
        visible={isReportModalVisible}
        report={selectedReport}
        onClose={closeReportModal}
      />
    </YStack>
  );
}
