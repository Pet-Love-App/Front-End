// src/components/Comments/CommentItem.tsx
import { View, Text, StyleSheet } from 'react-native';
import { XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { CommentAuthor } from '@/src/types/comment';
import { BADGE_CONFIGS } from '@/src/constants/badges';
import { neutralScale } from '@/src/design-system/tokens';

// 定义Props类型
interface CommentItemProps {
  author: CommentAuthor;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  isOwner?: boolean;
}

export default function CommentItem({
  author,
  content,
  createdAt,
  likes,
  isLiked,
  isOwner = false,
}: CommentItemProps) {
  // 修复徽章展示逻辑
  const renderBadges = () => {
    if (!author.badges || author.badges.length === 0) return null;

    return author.badges.slice(0, 2).map((badgeCode: string, idx: number) => {
      const badge = BADGE_CONFIGS[badgeCode];
      if (!badge) return null;

      return (
        <YStack
          key={idx}
          width={16}
          height={16}
          borderRadius={8}
          backgroundColor={`${badge.color}20`}
          alignItems="center"
          justifyContent="center"
          marginLeft={2}
        >
          <IconSymbol name={badge.icon as any} size={10} color={badge.color} />
        </YStack>
      );
    });
  };

  // 信用等级文本转换
  const getReputationLevelText = (level?: string) => {
    switch (level) {
      case 'novice':
        return '新手猫奴';
      case 'intermediate':
        return '进阶猫友';
      case 'advanced':
        return '资深铲屎官';
      case 'expert':
        return '猫粮专家';
      default:
        return '';
    }
  };

  return (
    <View style={styles.commentContainer}>
      {/* 作者信息 */}
      <XStack alignItems="center" marginBottom={4}>
        <Text style={styles.authorName}>{author.username || '匿名用户'}</Text>

        {isOwner && <Text style={styles.ownerTag}>我</Text>}

        {renderBadges()}

        {author.reputationLevel && (
          <Text style={styles.reputationLevel}>
            {getReputationLevelText(author.reputationLevel)}
          </Text>
        )}
      </XStack>

      {/* 评论内容 */}
      <Text style={styles.content}>{content}</Text>

      {/* 底部信息 */}
      <XStack justifyContent="space-between" style={styles.footer}>
        <Text style={styles.time}>{createdAt}</Text>
        <XStack alignItems="center">
          <IconSymbol
            name={isLiked ? 'heart.fill' : 'heart'}
            size={12}
            color={isLiked ? '#ef4444' : neutralScale.neutral6}
          />
          <Text style={styles.likes}>{likes}</Text>
        </XStack>
      </XStack>
    </View>
  );
}

const styles = StyleSheet.create({
  commentContainer: {
    padding: 12,
    marginVertical: 4,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: neutralScale.neutral12,
  },
  ownerTag: {
    fontSize: 10,
    color: '#3b82f6',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  reputationLevel: {
    fontSize: 10,
    color: neutralScale.neutral6,
    marginLeft: 4,
  },
  content: {
    fontSize: 14,
    color: neutralScale.neutral11,
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    fontSize: 12,
    color: neutralScale.neutral8,
  },
  time: {
    fontSize: 12,
    color: neutralScale.neutral8,
  },
  likes: {
    fontSize: 12,
    color: neutralScale.neutral8,
    marginLeft: 4,
  },
});
