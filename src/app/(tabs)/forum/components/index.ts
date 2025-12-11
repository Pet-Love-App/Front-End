/**
 * 论坛组件统一导出
 */

// ========== Post Detail Components ==========
export {
  PostDetailScreen,
  PostDetailHeader,
  PostContent,
  PostMediaGallery,
  PostActions,
  CommentSection,
  CommentItem,
  CommentInput,
  usePostDetail,
  type PostDetailScreenProps,
} from './post-detail';

// ========== Community Components ==========
export {
  CommunityScreen,
  PostCard,
  CategoryTabs,
  GlassSearchBar,
  CreatePostFAB,
  MasonryFeed,
  PostEditorModal,
  DEFAULT_CATEGORIES,
  type PostCardData,
  type PostCardProps,
  type CategoryItem,
  type CategoryTabsProps,
  type GlassSearchBarProps,
  type CreatePostFABProps,
  type MasonryFeedProps,
  type PostEditorModalProps,
} from './community';
