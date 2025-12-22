/**
 * 创建帖子页面 - 优雅的社交媒体风格设计
 *
 * 设计特点：
 * - 浅色模式，品牌色 #FEBE98（温暖的桃色）
 * - 大面积媒体预览区（占屏幕 1/3）
 * - 底部工具栏带精致图标和标签
 * - 衬线字体标题 + 无衬线正文
 */

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  FlatList,
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInRight,
  FadeOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Camera,
  ImagePlus,
  X,
  ChevronLeft,
  AtSign,
  Hash,
  MapPin,
  Smile,
  Play,
} from '@tamagui/lucide-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { supabaseForumService, type Post, type PostCategory } from '@/src/lib/supabase';
import { showAlert } from '@/src/components/dialogs';
import { useThemeColors, useIsDarkMode } from '@/src/hooks/useThemeColors';

import { POST_CATEGORIES, MESSAGES, UI_CONFIG } from './constants';
import { usePostEditor } from './hooks/usePostEditor';
import { createErrorHandler } from './utils';
import { MentionFriendsModal } from './components/MentionFriendsModal';
import { TopicSelectorModal } from './components/TopicSelectorModal';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { VideoPreview } from './components/VideoPreview';

// 启用 Android LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MEDIA_PREVIEW_HEIGHT = SCREEN_HEIGHT / 3;

// 品牌色 - 温暖的桃色
const BRAND_COLOR = '#FEBE98';
const BRAND_LIGHT = '#FFF8F5';

// 动画组件
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function CreatePostScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const params = useLocalSearchParams<{ editPostId?: string }>();
  const contentInputRef = useRef<TextInput>(null);
  const mediaScrollRef = useRef<FlatList>(null);
  const errorHandler = useMemo(() => createErrorHandler('CreatePost'), []);

  // 动态样式
  const dynamicStyles = useMemo(() => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: colors.background,
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
      },
      headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        letterSpacing: 0.3,
      },
      mediaSection: {
        height: MEDIA_PREVIEW_HEIGHT,
        backgroundColor: colors.backgroundSubtle,
      },
      mediaPlaceholderGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      },
      mediaPlaceholderIcon: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: (isDark ? '#3D2A1F' : colors.primaryLight) as any,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      },
      mediaPlaceholderTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 6,
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
      },
      mediaPlaceholderSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        letterSpacing: 0.2,
      },
      categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: colors.backgroundMuted,
        borderWidth: 1.5,
        borderColor: colors.border,
      },
      categoryChipActive: {
        backgroundColor: (isDark ? '#3D2A1F' : colors.primaryLight) as any,
        borderColor: colors.primary,
      },
      categoryText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textSecondary,
      },
      categoryTextActive: {
        color: colors.primary,
        fontWeight: '600',
      },
      contentInput: {
        fontSize: 16,
        color: colors.text,
        lineHeight: 24,
        minHeight: 120,
        textAlignVertical: 'top',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
      },
      charCount: {
        fontSize: 12,
        color: colors.textTertiary,
      },
      tagsInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.backgroundMuted,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: colors.border,
      },
      tagsInput: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
        marginLeft: 10,
      },
      attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: (isDark ? '#3D2A1F' : colors.primaryLight) as any,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        alignSelf: 'flex-start',
      },
      attachmentText: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.primary,
        marginLeft: 6,
        marginRight: 8,
        flex: 1,
      },
      bottomToolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: colors.border,
        backgroundColor: colors.cardBackground,
      },
      toolButtonLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        marginTop: 4,
        fontWeight: '500',
      },
      toolButtonLabelActive: {
        color: colors.primary,
        fontWeight: '600',
      },
      mediaCount: {
        backgroundColor: (isDark ? '#3D2A1F' : colors.primaryLight) as any,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
      },
      mediaCountText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primary,
      },
    });
  }, [colors, isDark]);

  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // 模态框状态
  const [showMentionModal, setShowMentionModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // 选中的数据
  const [mentionedFriends, setMentionedFriends] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // 键盘状态
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // 动画值
  const submitButtonScale = useSharedValue(1);
  const headerOpacity = useSharedValue(1);

  // 监听键盘显示/隐藏
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(showEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsKeyboardVisible(true);
    });

    const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const editor = usePostEditor({
    onSuccess: () => {
      showAlert({
        title: '发布成功',
        message: editingPost ? MESSAGES.SUCCESS.POST_UPDATED : MESSAGES.SUCCESS.POST_CREATED,
        type: 'success',
        buttons: [{ text: '好的', onPress: () => router.back() }],
      });
    },
    onError: (error) => {
      errorHandler.handle(error, { title: '发布失败' });
    },
  });

  // 加载要编辑的帖子
  useEffect(() => {
    if (params.editPostId) {
      const loadPost = async () => {
        try {
          setIsLoadingPost(true);
          const postId = parseInt(params.editPostId!, 10);
          const { data, error } = await supabaseForumService.getPostDetail(postId);
          if (error) throw error;
          if (data) {
            setEditingPost(data);
            editor.loadFromPost(data);
          }
        } catch (err) {
          console.error('[CreatePost] 加载帖子失败:', err);
          errorHandler.handle(err, { title: '加载失败' });
        } finally {
          setIsLoadingPost(false);
        }
      };
      loadPost();
    }
  }, [params.editPostId]);

  const handlePickImages = useCallback(async () => {
    try {
      const files = await editor.pickMedia();
      if (files.length === 0) return;
      editor.addFiles(files);
    } catch (err) {
      errorHandler.handle(err, { title: '选择媒体失败' });
    }
  }, [editor, errorHandler]);

  const handleTakePhoto = useCallback(async () => {
    try {
      const files = await editor.takePhoto();
      if (files.length === 0) return;
      editor.addFiles(files);
    } catch (err) {
      errorHandler.handle(err, { title: '拍照失败' });
    }
  }, [editor, errorHandler]);

  const handleSubmit = useCallback(async () => {
    // 按钮动画
    submitButtonScale.value = withSpring(0.95, {}, () => {
      submitButtonScale.value = withSpring(1);
    });

    try {
      await editor.submit(editingPost);
    } catch {
      // 错误已在 Hook 中处理
    }
  }, [editor, editingPost, submitButtonScale]);

  const handleCategorySelect = useCallback(
    (category: PostCategory) => {
      editor.setCategory(editor.category === category ? undefined : category);
    },
    [editor]
  );

  const handleMediaScroll = useCallback((event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentMediaIndex(index);
  }, []);

  const canSubmit = useMemo(() => {
    return (
      !editor.submitting &&
      !isLoadingPost &&
      (editor.content.trim().length > 0 || editor.pickedFiles.length > 0)
    );
  }, [editor.submitting, editor.content, editor.pickedFiles, isLoadingPost]);

  // 动画样式
  const submitButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: submitButtonScale.value }],
  }));

  // 渲染媒体项
  const renderMediaItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const isVideo = item.type?.startsWith('video');
      return (
        <Animated.View
          entering={FadeInRight.delay(index * 50).springify()}
          style={styles.mediaSlide}
        >
          {isVideo ? (
            <VideoPreview
              videoUri={item.uri}
              width={SCREEN_WIDTH}
              height={MEDIA_PREVIEW_HEIGHT}
              showPlayButton={true}
            />
          ) : (
            <Image source={{ uri: item.uri }} style={styles.mediaImage} resizeMode="cover" />
          )}
          <TouchableOpacity
            style={styles.removeMediaButton}
            onPress={() => editor.removeFile(index)}
            activeOpacity={0.8}
          >
            <X size={16} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [editor]
  );

  // 渲染媒体指示器
  const renderMediaIndicator = () => {
    if (editor.pickedFiles.length <= 1) return null;
    return (
      <View style={styles.indicatorContainer}>
        {editor.pickedFiles.map((_, index) => (
          <View
            key={index}
            style={[styles.indicator, index === currentMediaIndex && styles.indicatorActive]}
          />
        ))}
      </View>
    );
  };

  return (
    <View testID="create-post-screen" style={[dynamicStyles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 顶部导航栏 */}
        <View style={dynamicStyles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={28} color={colors.text as any} strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Animated.Text style={dynamicStyles.headerTitle}>
              {editingPost ? '编辑' : '创建新帖'}
            </Animated.Text>
          </View>

          <AnimatedPressable
            style={[
              styles.submitButton,
              !canSubmit && styles.submitButtonDisabled,
              { backgroundColor: canSubmit ? colors.primary : colors.border },
              submitButtonStyle,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Animated.Text
              style={[
                styles.submitButtonText,
                !canSubmit && styles.submitButtonTextDisabled,
                { color: canSubmit ? 'white' : colors.textTertiary },
              ]}
            >
              {editor.submitting ? '发布中...' : '发布'}
            </Animated.Text>
          </AnimatedPressable>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.flex1}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
            {/* 媒体预览区 - 占屏幕 1/3 */}
            <View style={dynamicStyles.mediaSection}>
              {editor.pickedFiles.length > 0 ? (
                <>
                  <FlatList
                    ref={mediaScrollRef}
                    data={editor.pickedFiles}
                    renderItem={renderMediaItem}
                    keyExtractor={(_, index) => index.toString()}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleMediaScroll}
                    scrollEventThrottle={16}
                  />
                  {renderMediaIndicator()}
                </>
              ) : (
                <TouchableOpacity
                  style={styles.mediaPlaceholder}
                  onPress={handlePickImages}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={isDark ? ['#1A1A1A', '#0A0A0A'] : ['#F8FAFC', '#EEF2F7']}
                    style={dynamicStyles.mediaPlaceholderGradient}
                  >
                    <View style={dynamicStyles.mediaPlaceholderIcon}>
                      <ImagePlus size={48} color={colors.primary as any} strokeWidth={1.5} />
                    </View>
                    <Text style={dynamicStyles.mediaPlaceholderTitle}>添加照片或视频</Text>
                    <Text style={dynamicStyles.mediaPlaceholderSubtitle}>
                      分享精彩瞬间，让内容更生动
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {/* 内容输入区 */}
            <View style={styles.contentSection}>
              {/* 分类选择 */}
              <View style={styles.categorySection}>
                <Text style={dynamicStyles.mediaPlaceholderSubtitle}>选择分类</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoryList}
                >
                  {POST_CATEGORIES.map((cat) => {
                    const isActive = editor.category === cat.key;
                    return (
                      <TouchableOpacity
                        key={cat.key}
                        style={[
                          dynamicStyles.categoryChip,
                          isActive && dynamicStyles.categoryChipActive,
                        ]}
                        onPress={() => handleCategorySelect(cat.key)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            dynamicStyles.categoryText,
                            isActive && dynamicStyles.categoryTextActive,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* 正文输入 */}
              <View style={styles.textInputSection}>
                <TextInput
                  ref={contentInputRef}
                  style={dynamicStyles.contentInput}
                  value={editor.content}
                  onChangeText={editor.setContent}
                  placeholder="分享你的想法..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  textAlignVertical="top"
                  maxLength={2000}
                />
                <View style={styles.charCountContainer}>
                  <Text style={dynamicStyles.charCount}>{editor.content.length}/2000</Text>
                </View>
              </View>

              {/* 标签输入 */}
              <View style={styles.tagsSection}>
                <View style={dynamicStyles.tagsInputContainer}>
                  <Hash size={18} color={colors.textTertiary as any} strokeWidth={2} />
                  <TextInput
                    style={dynamicStyles.tagsInput}
                    value={editor.tagsText}
                    onChangeText={editor.setTagsText}
                    placeholder="添加话题标签，用空格分隔"
                    placeholderTextColor={colors.textTertiary}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>
              </View>

              {/* 显示已选择的内容 */}
              {(mentionedFriends.length > 0 || selectedTopics.length > 0 || selectedLocation) && (
                <View style={styles.attachmentsSection}>
                  {mentionedFriends.length > 0 && (
                    <View style={dynamicStyles.attachmentItem}>
                      <AtSign size={16} color={colors.primary as any} strokeWidth={2} />
                      <Text style={dynamicStyles.attachmentText}>
                        {mentionedFriends.length} 位好友
                      </Text>
                      <TouchableOpacity
                        onPress={() => setMentionedFriends([])}
                        style={styles.attachmentRemove}
                      >
                        <X size={14} color={colors.textTertiary as any} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedTopics.length > 0 && (
                    <View style={dynamicStyles.attachmentItem}>
                      <Hash size={16} color={colors.primary as any} strokeWidth={2} />
                      <Text style={dynamicStyles.attachmentText}>
                        {selectedTopics.length} 个话题
                      </Text>
                      <TouchableOpacity
                        onPress={() => setSelectedTopics([])}
                        style={styles.attachmentRemove}
                      >
                        <X size={14} color={colors.textTertiary as any} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedLocation && (
                    <View style={dynamicStyles.attachmentItem}>
                      <MapPin size={16} color={colors.primary as any} strokeWidth={2} />
                      <Text style={dynamicStyles.attachmentText} numberOfLines={1}>
                        {selectedLocation.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setSelectedLocation(null)}
                        style={styles.attachmentRemove}
                      >
                        <X size={14} color={colors.textTertiary as any} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* 底部工具栏 - 键盘弹出时隐藏 */}
        {!isKeyboardVisible && (
          <View style={[dynamicStyles.bottomToolbar, { paddingBottom: insets.bottom + 8 }]}>
            <View style={styles.toolbarLeft}>
              <TouchableOpacity
                style={styles.toolButton}
                onPress={handlePickImages}
                activeOpacity={0.7}
              >
                <ImagePlus size={22} color={colors.text as any} strokeWidth={1.8} />
                <Text style={dynamicStyles.toolButtonLabel}>图片</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolButton}
                onPress={handleTakePhoto}
                activeOpacity={0.7}
              >
                <Camera size={22} color={colors.text as any} strokeWidth={1.8} />
                <Text style={dynamicStyles.toolButtonLabel}>拍摄</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolButton}
                onPress={() => setShowMentionModal(true)}
                activeOpacity={0.7}
              >
                <View>
                  <AtSign
                    size={22}
                    color={(mentionedFriends.length > 0 ? colors.primary : colors.text) as any}
                    strokeWidth={1.8}
                  />
                  {mentionedFriends.length > 0 && (
                    <View style={styles.badgeIcon}>
                      <Text style={styles.badgeIconText}>{mentionedFriends.length}</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    dynamicStyles.toolButtonLabel,
                    mentionedFriends.length > 0 && dynamicStyles.toolButtonLabelActive,
                  ]}
                >
                  @好友
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolButton}
                onPress={() => setShowTopicModal(true)}
                activeOpacity={0.7}
              >
                <Hash size={22} color={colors.text as any} strokeWidth={1.8} />
                <Text style={dynamicStyles.toolButtonLabel}>话题</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolButton}
                onPress={() => setShowLocationModal(true)}
                activeOpacity={0.7}
              >
                <MapPin
                  size={22}
                  color={(selectedLocation ? colors.primary : colors.text) as any}
                  strokeWidth={1.8}
                />
                <Text
                  style={[
                    dynamicStyles.toolButtonLabel,
                    selectedLocation && dynamicStyles.toolButtonLabelActive,
                  ]}
                >
                  位置
                </Text>
              </TouchableOpacity>
            </View>

            {editor.pickedFiles.length > 0 && (
              <View style={dynamicStyles.mediaCount}>
                <Text style={dynamicStyles.mediaCountText}>{editor.pickedFiles.length}/9</Text>
              </View>
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      {/* @好友模态框 */}
      <MentionFriendsModal
        visible={showMentionModal}
        onClose={() => setShowMentionModal(false)}
        onConfirm={setMentionedFriends}
        initialSelected={mentionedFriends}
      />

      {/* 话题选择模态框 */}
      <TopicSelectorModal
        visible={showTopicModal}
        onClose={() => setShowTopicModal(false)}
        onConfirm={setSelectedTopics}
        initialSelected={selectedTopics}
      />

      {/* 位置选择模态框 */}
      <LocationSelectorModal
        visible={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onConfirm={setSelectedLocation}
        initialLocation={selectedLocation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  mediaPlaceholder: {
    flex: 1,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  mediaSlide: {
    width: SCREEN_WIDTH,
    height: MEDIA_PREVIEW_HEIGHT,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentSection: {
    flex: 1,
    padding: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryList: {
    gap: 10,
  },
  textInputSection: {
    marginBottom: 20,
  },
  charCountContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  tagsSection: {
    marginBottom: 20,
  },
  attachmentsSection: {
    marginTop: 16,
    gap: 8,
  },
  attachmentRemove: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarLeft: {
    flexDirection: 'row',
    gap: 4,
  },
  toolButton: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeIcon: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeIconText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
