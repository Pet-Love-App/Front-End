/**
 * 帖子收藏列表项 - 展示收藏的帖子信息
 */
import { Image } from 'react-native';
import { Card, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import type { Post } from '@/src/lib/supabase';
import { errorScale, neutralScale, primaryScale } from '@/src/design-system/tokens';

interface PostCollectItemProps {
  post: Post;
  onDelete?: () => void;
  onPress?: () => void;
}

// 格式化日期为相对时间
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 月前`;
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

// 分类标签颜色
const CATEGORY_COLORS: Record<string, string> = {
  help: '#FF6B6B',
  share: '#4ECDC4',
  science: '#45B7D1',
  warning: '#FFA726',
};

const CATEGORY_LABELS: Record<string, string> = {
  help: '求助',
  share: '分享',
  science: '科普',
  warning: '避雷',
};

export default function PostCollectItem({ post, onDelete, onPress }: PostCollectItemProps) {
  // 获取第一张图片作为封面
  const coverImage = post.media?.find((m) => m.mediaType === 'image')?.fileUrl;

  return (
    <Card
      size="$4"
      bordered
      borderColor={neutralScale.neutral3}
      backgroundColor="white"
      pressStyle={{ scale: 0.98, opacity: 0.95 }}
      animation="quick"
      onPress={onPress}
    >
      <Card.Header padding="$4">
        <XStack gap="$3" alignItems="flex-start">
          {/* 帖子封面图 */}
          <YStack
            borderRadius="$3"
            overflow="hidden"
            borderWidth={1}
            borderColor={neutralScale.neutral3}
          >
            {coverImage ? (
              <Image
                source={{ uri: coverImage }}
                style={{ width: 80, height: 80, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : (
              <YStack
                width={80}
                height={80}
                backgroundColor={neutralScale.neutral2}
                alignItems="center"
                justifyContent="center"
              >
                <IconSymbol name="doc.text" size={32} color={neutralScale.neutral7} />
              </YStack>
            )}
          </YStack>

          {/* 帖子信息 */}
          <YStack flex={1} gap="$2">
            {/* 分类标签 */}
            {post.category && (
              <XStack>
                <YStack
                  backgroundColor={CATEGORY_COLORS[post.category] + '20'}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                >
                  <Text fontSize={11} fontWeight="600" color={CATEGORY_COLORS[post.category]}>
                    {CATEGORY_LABELS[post.category] || post.category}
                  </Text>
                </YStack>
              </XStack>
            )}

            {/* 帖子内容预览 */}
            <Text
              fontSize={15}
              fontWeight="500"
              color="$foreground"
              numberOfLines={2}
              lineHeight={22}
            >
              {post.content || '无内容'}
            </Text>

            {/* 作者和时间 */}
            <XStack alignItems="center" gap="$2">
              {post.author?.avatar ? (
                <Image
                  source={{ uri: post.author.avatar }}
                  style={{ width: 18, height: 18, borderRadius: 9 }}
                />
              ) : (
                <YStack
                  width={18}
                  height={18}
                  borderRadius={9}
                  backgroundColor={neutralScale.neutral3}
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconSymbol name="person.fill" size={10} color={neutralScale.neutral6} />
                </YStack>
              )}
              <Text fontSize={12} color={neutralScale.neutral8}>
                {post.author?.username || '匿名用户'}
              </Text>
              <Text fontSize={12} color={neutralScale.neutral6}>
                ·
              </Text>
              <Text fontSize={12} color={neutralScale.neutral6}>
                {formatDate(post.createdAt)}
              </Text>
            </XStack>

            {/* 互动数据 */}
            <XStack alignItems="center" gap="$4">
              <XStack alignItems="center" gap="$1">
                <IconSymbol name="heart.fill" size={14} color={primaryScale.primary9} />
                <Text fontSize={12} color={neutralScale.neutral7}>
                  {post.favoritesCount || 0}
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$1">
                <IconSymbol name="bubble.left" size={14} color={neutralScale.neutral7} />
                <Text fontSize={12} color={neutralScale.neutral7}>
                  {post.commentsCount || 0}
                </Text>
              </XStack>
            </XStack>
          </YStack>

          {/* 删除按钮 */}
          <Button
            size="$2"
            circular
            backgroundColor="transparent"
            pressStyle={{ backgroundColor: errorScale.error2 }}
            onPress={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <IconSymbol name="trash" size={18} color={errorScale.error9} />
          </Button>
        </XStack>
      </Card.Header>
    </Card>
  );
}
