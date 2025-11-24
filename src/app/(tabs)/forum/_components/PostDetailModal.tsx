import type { Comment } from '@/src/services/api/comment';
import type { Post } from '@/src/services/api/forum';
import { forumService } from '@/src/services/api/forum';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal } from 'react-native';
import { Button, Card, Separator, Text, TextArea, XStack, YStack } from 'tamagui';

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
        <Text fontWeight="700">{item.author.username}</Text>
        <Text color="$gray10">{new Date(item.createdAt).toLocaleString()}</Text>
      </XStack>
      <Text>{item.content}</Text>
      <XStack gap="$3">
        <Button size="$2" onPress={() => toggleLike(item.id)}>
          {item.isLiked ? `已赞 ${item.likes || 0}` : `点赞 ${item.likes || 0}`}
        </Button>
        <Button size="$2" chromeless onPress={() => setReplyTarget(item)}>回复</Button>
      </XStack>
      <Separator />
    </YStack>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <YStack flex={1} padding="$4" gap="$3" backgroundColor="$background">
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize="$7" fontWeight="700">帖子详情</Text>
          <Button size="$3" chromeless onPress={onClose}>关闭</Button>
        </XStack>

        {post ? (
          <Card padding="$3">
            <YStack gap="$2">
              <Text fontWeight="700">{post.author.username}</Text>
              <Text>{post.content}</Text>
            </YStack>
          </Card>
        ) : null}

        <Text fontSize="$6" fontWeight="700">评论（按赞）</Text>
        <FlatList
          data={comments}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
        />

        <Separator />

        {replyTarget ? (
          <XStack alignItems="center" justifyContent="space-between">
            <Text color="$gray10">正在回复 @{replyTarget.author.username}</Text>
            <Button size="$2" chromeless onPress={() => setReplyTarget(null)}>取消</Button>
          </XStack>
        ) : null}

        <XStack gap="$2">
          <TextArea flex={1} value={content} onChangeText={setContent} placeholder="写下你的评论..." />
          <Button size="$3" themeInverse onPress={submit}>发送</Button>
        </XStack>
      </YStack>
    </Modal>
  );
}
