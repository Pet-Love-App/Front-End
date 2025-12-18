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

import { POST_CATEGORIES, MESSAGES, UI_CONFIG } from './constants';
import { usePostEditor } from './hooks/usePostEditor';
import { createErrorHandler } from './utils';
import { MentionFriendsModal } from './components/MentionFriendsModal';
import { TopicSelectorModal } from './components/TopicSelectorModal';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { VideoPreview } from './components/VideoPreview';

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
  const params = useLocalSearchParams<{ editPostId?: string }>();
  const contentInputRef = useRef<TextInput>(null);
  const mediaScrollRef = useRef<FlatList>(null);
  const errorHandler = useMemo(() => createErrorHandler('CreatePost'), []);

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

  // 动画值
  const submitButtonScale = useSharedValue(1);
  const headerOpacity = useSharedValue(1);

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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* 顶部导航栏 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ChevronLeft size={28} color="#262626" strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Animated.Text style={styles.headerTitle}>
              {editingPost ? '编辑' : '创建新帖'}
            </Animated.Text>
          </View>

          <AnimatedPressable
            style={[
              styles.submitButton,
              !canSubmit && styles.submitButtonDisabled,
              submitButtonStyle,
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Animated.Text
              style={[styles.submitButtonText, !canSubmit && styles.submitButtonTextDisabled]}
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
          >
            {/* 媒体预览区 - 占屏幕 1/3 */}
            <View style={styles.mediaSection}>
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
                    colors={['#F8FAFC', '#EEF2F7']}
                    style={styles.mediaPlaceholderGradient}
                  >
                    <View style={styles.mediaPlaceholderIcon}>
                      <ImagePlus size={48} color={BRAND_COLOR} strokeWidth={1.5} />
                    </View>
                    <Text style={styles.mediaPlaceholderTitle}>添加照片或视频</Text>
                    <Text style={styles.mediaPlaceholderSubtitle}>分享精彩瞬间，让内容更生动</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            {/* 内容输入区 */}
            <View style={styles.contentSection}>
              {/* 分类选择 */}
              <View style={styles.categorySection}>
                <Text style={styles.sectionLabel}>选择分类</Text>
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
                        style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                        onPress={() => handleCategorySelect(cat.key)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
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
                  style={styles.contentInput}
                  value={editor.content}
                  onChangeText={editor.setContent}
                  placeholder="分享你的想法..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                  maxLength={2000}
                />
                <View style={styles.charCountContainer}>
                  <Text style={styles.charCount}>{editor.content.length}/2000</Text>
                </View>
              </View>

              {/* 标签输入 */}
              <View style={styles.tagsSection}>
                <View style={styles.tagsInputContainer}>
                  <Hash size={18} color="#9CA3AF" strokeWidth={2} />
                  <TextInput
                    style={styles.tagsInput}
                    value={editor.tagsText}
                    onChangeText={editor.setTagsText}
                    placeholder="添加话题标签，用空格分隔"
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>
              </View>

              {/* 显示已选择的内容 */}
              {(mentionedFriends.length > 0 || selectedTopics.length > 0 || selectedLocation) && (
                <View style={styles.attachmentsSection}>
                  {mentionedFriends.length > 0 && (
                    <View style={styles.attachmentItem}>
                      <AtSign size={16} color={BRAND_COLOR} strokeWidth={2} />
                      <Text style={styles.attachmentText}>{mentionedFriends.length} 位好友</Text>
                      <TouchableOpacity
                        onPress={() => setMentionedFriends([])}
                        style={styles.attachmentRemove}
                      >
                        <X size={14} color="#9CA3AF" strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedTopics.length > 0 && (
                    <View style={styles.attachmentItem}>
                      <Hash size={16} color={BRAND_COLOR} strokeWidth={2} />
                      <Text style={styles.attachmentText}>{selectedTopics.length} 个话题</Text>
                      <TouchableOpacity
                        onPress={() => setSelectedTopics([])}
                        style={styles.attachmentRemove}
                      >
                        <X size={14} color="#9CA3AF" strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  )}

                  {selectedLocation && (
                    <View style={styles.attachmentItem}>
                      <MapPin size={16} color={BRAND_COLOR} strokeWidth={2} />
                      <Text style={styles.attachmentText} numberOfLines={1}>
                        {selectedLocation.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setSelectedLocation(null)}
                        style={styles.attachmentRemove}
                      >
                        <X size={14} color="#9CA3AF" strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* 底部工具栏 */}
        <View style={[styles.bottomToolbar, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.toolbarLeft}>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={handlePickImages}
              activeOpacity={0.7}
            >
              <ImagePlus size={22} color="#262626" strokeWidth={1.8} />
              <Text style={styles.toolButtonLabel}>图片</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={handleTakePhoto}
              activeOpacity={0.7}
            >
              <Camera size={22} color="#262626" strokeWidth={1.8} />
              <Text style={styles.toolButtonLabel}>拍摄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => setShowMentionModal(true)}
              activeOpacity={0.7}
            >
              <View>
                <AtSign
                  size={22}
                  color={mentionedFriends.length > 0 ? BRAND_COLOR : '#262626'}
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
                  styles.toolButtonLabel,
                  mentionedFriends.length > 0 && styles.toolButtonLabelActive,
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
              <Hash size={22} color="#262626" strokeWidth={1.8} />
              <Text style={styles.toolButtonLabel}>话题</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => setShowLocationModal(true)}
              activeOpacity={0.7}
            >
              <MapPin
                size={22}
                color={selectedLocation ? BRAND_COLOR : '#262626'}
                strokeWidth={1.8}
              />
              <Text
                style={[styles.toolButtonLabel, selectedLocation && styles.toolButtonLabelActive]}
              >
                位置
              </Text>
            </TouchableOpacity>
          </View>

          {editor.pickedFiles.length > 0 && (
            <View style={styles.mediaCount}>
              <Text style={styles.mediaCountText}>{editor.pickedFiles.length}/9</Text>
            </View>
          )}
        </View>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // 顶部导航栏
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#262626',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    letterSpacing: 0.3,
  },
  submitButton: {
    backgroundColor: BRAND_COLOR,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },

  // 媒体预览区
  mediaSection: {
    height: MEDIA_PREVIEW_HEIGHT,
    backgroundColor: '#F9FAFB',
  },
  mediaSlide: {
    width: SCREEN_WIDTH,
    height: MEDIA_PREVIEW_HEIGHT,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
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
  mediaPlaceholder: {
    flex: 1,
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
    backgroundColor: BRAND_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mediaPlaceholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  mediaPlaceholderSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    letterSpacing: 0.2,
  },

  // 内容区
  contentSection: {
    flex: 1,
    padding: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  categoryList: {
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: BRAND_LIGHT,
    borderColor: BRAND_COLOR,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: BRAND_COLOR,
    fontWeight: '600',
  },
  textInputSection: {
    marginBottom: 20,
  },
  contentInput: {
    fontSize: 16,
    color: '#262626',
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  charCountContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagsInput: {
    flex: 1,
    fontSize: 15,
    color: '#262626',
    marginLeft: 10,
  },
  attachmentsSection: {
    marginTop: 16,
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  attachmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: BRAND_COLOR,
    marginLeft: 6,
    marginRight: 8,
    flex: 1,
  },
  attachmentRemove: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 底部工具栏
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
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
  toolButtonLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  toolButtonLabelActive: {
    color: BRAND_COLOR,
    fontWeight: '600',
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
  mediaCount: {
    backgroundColor: BRAND_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mediaCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: BRAND_COLOR,
  },
});
