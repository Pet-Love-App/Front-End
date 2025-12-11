// 基础组件
export { AppHeader } from './AppHeader';
export { BreedSelector } from './BreedSelector';
export { CatFoodCard } from './CatFoodCard';
export { ExternalLink } from './ExternalLink';
export { HapticTab } from './HapticTab';
export { LottieAnimation } from './LottieAnimation';
export { PageHeader } from './PageHeader';
export { default as SearchBox } from './searchBox';
export { ThemedText } from './ThemedText';
export { ThemedView } from './ThemedView';

// UI 组件
export { IconSymbol } from './ui/IconSymbol';
export { AvatarImage, OptimizedImage, ProductImage } from './ui/OptimizedImage';
export { default as Tag } from './ui/Tag';

// 懒加载组件
export {
  createLazyComponent,
  LazyComponent,
  LazyImage,
  preloadImage,
  preloadImages,
  Skeleton,
  SkeletonAIReport,
  SkeletonCard,
  SkeletonDetail,
  SkeletonList,
  SkeletonText,
  withLazyLoad,
} from './lazy';

// 评论组件
export { CommentInput, CommentItem, CommentList, CommentSection, useComments } from './Comments';
