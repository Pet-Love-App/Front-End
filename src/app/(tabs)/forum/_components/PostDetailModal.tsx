import type { Comment } from '@/src/services/api/comment';
import type { Post } from '@/src/services/api/forum';
import { forumService } from '@/src/services/api/forum';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Separator, Text, TextArea, XStack, YStack } from 'tamagui';
import { ForumColors, ForumHeader } from './ForumHeader';

interface Props {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
}

export function PostDetailModal({ visible, post, onClose }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    if (!post) return;
    try {
      setLoading(true);
      const res = (await forumService.getCommentsForTarget({
        targetType: 'post',
        targetId: post.id,
        orderBy: 'likes',
        includeReplies: true,
      })) as unknown as Comment[] | { results: Comment[] };

      const list = Array.isArray(res) ? res : (res as any).results || [];
      setComments(list);
    } finally {
      setLoading(false);
    }
  }, [post]);

  useEffect(() => {
    if (visible) {
      load();
    } else {
      setComments([]);
      setContent('');
      setReplyTarget(null);
    }
  }, [visible, load]);

  const submit = async () => {
    if (!post) return;
    if (!content.trim()) return;
    await forumService.createComment({
      targetType: 'post',
      targetId: post.id,
      content: content.trim(),
      parentId: replyTarget?.id || undefined,
    });
    setContent('');
    setReplyTarget(null);
    await load();
  };

  const toggleLike = async (commentId: number) => {
    const res = await forumService.toggleCommentLike(commentId);
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: res.likes || 0, isLiked: res.action === 'liked' } : c))
    );
  };

  const renderItem = ({ item }: { item: Comment }) => (
    <YStack paddingVertical="$3" gap="$2">
      <XStack alignItems="center" justifyContent="space-between">
        <Text fontWeight="700" color={ForumColors.clay}>{item.author.username}</Text>
        <Text color={ForumColors.clay + '80'}>{new Date(item.createdAt).toLocaleString()}</Text>
      </XStack>
      <Text color="#3c2e20">{item.content}</Text>
      <XStack gap="$3">
        <Button size="$2" onPress={() => toggleLike(item.id)} backgroundColor={item.isLiked ? ForumColors.clay : ForumColors.peach} color={item.isLiked ? '#fff' : '#3c2e20'}>
          {item.isLiked ? `已赞 ${item.likes || 0}` : `点赞 ${item.likes || 0}`}
        </Button>
        <Button size="$2" chromeless onPress={() => setReplyTarget(item)} color={ForumColors.clay}>
          回复
        </Button>
      </XStack>
      <Separator backgroundColor={ForumColors.clay + '33'} />
    </YStack>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <YStack flex={1} backgroundColor={ForumColors.sand}>
        <ForumHeader title="帖子详情" onClose={onClose} />
        <YStack flex={1} padding="$4" gap="$3">
          {post ? (
            <Card padding="$3" backgroundColor={ForumColors.peach} borderColor={ForumColors.clay + '55'} borderWidth={1}>
              <YStack gap="$2">
                <Text fontWeight="700" color={ForumColors.clay}>{post.author.username}</Text>
                <Text color="#3c2e20">{post.content}</Text>
              </YStack>
            </Card>
          ) : null}

          <Text fontSize="$6" fontWeight="700" color={ForumColors.clay}>评论（按赞）</Text>
          <FlatList
            data={comments}
            keyExtractor={(i) => String(i.id)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 100 }}
          />

          <Separator backgroundColor={ForumColors.clay + '55'} />

          {replyTarget ? (
            <XStack alignItems="center" justifyContent="space-between" backgroundColor={ForumColors.peach} padding="$2" borderRadius="$3">
              <Text color={ForumColors.clay}>正在回复 @{replyTarget.author.username}</Text>
              <Button size="$2" chromeless onPress={() => setReplyTarget(null)} color={ForumColors.clay}>取消</Button>
            </XStack>
          ) : null}

          <XStack gap="$2">
            <TextArea
              flex={1}
              value={content}
              onChangeText={setContent}
              placeholder="写下你的评论..."
              backgroundColor="#fff"
              borderColor={ForumColors.clay + '55'}
              borderWidth={1}
              color="#3c2e20"
            />
            <Button size="$3" onPress={submit} backgroundColor={ForumColors.clay} color="#fff" pressStyle={{ opacity: 0.85 }}>
              发送
            </Button>
          </XStack>
        </YStack>
      </YStack>
    </Modal>
  );
}
