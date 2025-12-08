/**
 * 帖子详情弹窗 - 查看帖子内容和评论
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, ScrollView } from 'react-native';
import { Button, Card, Separator, Text, TextArea, XStack, YStack } from 'tamagui';
import { ForumColors } from '@/src/app/(tabs)/forum/constants';
import { OptimizedImage } from '@/src/components/ui/OptimizedImage';
import Tag from '@/src/components/ui/Tag';
import {
  supabaseCommentService,
  supabaseForumService,
  type Comment,
  type Post,
  type PostMedia,
} from '@/src/lib/supabase';
import { useUserStore } from '@/src/store/userStore';
import { neutralScale } from '@/src/design-system/tokens';

interface PostDetailModalProps {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  headerOffset?: number;
  onEditPost?: (post: Post) => void;
  onPostDeleted?: () => void;
}

export function PostDetailModal({
  visible,
  post,
  onClose,
  headerOffset = 0,
  onEditPost,
  onPostDeleted,
}: PostDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const currentUser = useUserStore((s) => s.user);
  const windowHeight = Dimensions.get('window').height;
  const contentMaxHeight = Math.max(200, Math.floor(windowHeight * 0.3));

  // 加载评论
  const load = useCallback(async () => {
    if (!post) return;
    try {
      const { data, error } = await supabaseCommentService.getComments({
        targetType: 'post',
        targetId: post.id,
      });
      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('加载评论失败', err);
    }
  }, [post]);

  useEffect(() => {
    if (visible) {
      load();
    } else {
      setComments([]);
      setContent('');
      setReplyTarget(null);
      setEditingCommentId(null);
      setEditingContent('');
    }
  }, [visible, load]);

  // 提交评论
  const submit = async () => {
    if (!post || !content.trim()) return;
    try {
      const { error } = await supabaseCommentService.createComment({
        targetType: 'post',
        targetId: post.id,
        content: content.trim(),
        parentId: replyTarget?.id || undefined,
      });
      if (error) throw error;
      setContent('');
      setReplyTarget(null);
      await load();
    } catch {
      Alert.alert('错误', '发送失败');
    }
  };

  // 切换点赞
  const toggleLike = async (commentId: number) => {
    try {
      const { data: res, error } = await supabaseCommentService.toggleCommentLike(commentId);
      if (error) throw error;
      if (!res) return;
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likes: res.likes || 0, isLiked: res.liked } : c
        )
      );
    } catch {
      Alert.alert('错误', '操作失败');
    }
  };

  const canEditPost = currentUser && post && currentUser.id === post.author.id;

  // 删除帖子
  const deletePost = async () => {
    if (!post) return;
    Alert.alert('确认删除', '确定删除该帖子吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabaseForumService.deletePost(post.id);
            if (error) throw error;
            onPostDeleted?.();
          } catch {
            Alert.alert('错误', '删除失败');
          }
        },
      },
    ]);
  };

  const isMyComment = (c: Comment) => !!currentUser && c.author?.id === currentUser.id;

  // 编辑评论
  const startEditComment = (c: Comment) => {
    setEditingCommentId(c.id);
    setEditingContent(c.content);
  };

  const saveEditComment = async () => {
    if (!editingCommentId) return;
    const text = editingContent.trim();
    if (!text) return;
    try {
      const { error } = await supabaseCommentService.updateComment(editingCommentId, text);
      if (error) throw error;
      setComments((prev) =>
        prev.map((c) => (c.id === editingCommentId ? { ...c, content: text } : c))
      );
      setEditingCommentId(null);
      setEditingContent('');
    } catch {
      Alert.alert('错误', '更新失败');
    }
  };

  // 删除评论
  const deleteComment = async (commentId: number) => {
    Alert.alert('确认删除', '确定删除该评论吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabaseCommentService.deleteComment(commentId);
            if (error) throw error;
            setComments((prev) => prev.filter((c) => c.id !== commentId));
          } catch {
            Alert.alert('错误', '删除失败');
          }
        },
      },
    ]);
  };

  if (!visible) return null;

  return (
    <YStack
      position="absolute"
      top={headerOffset}
      left={0}
      right={0}
      bottom={0}
      backgroundColor={ForumColors.sand}
      zIndex={300}
      borderTopWidth={1}
      borderColor={ForumColors.clay + '55'}
      padding="$4"
      gap="$3"
    >
      {/* 顶部标题与操作 */}
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$6" fontWeight="700" color={ForumColors.clay}>
          帖子详情
        </Text>
        <XStack gap="$2" alignItems="center">
          {canEditPost && (
            <>
              <Button
                size="$3"
                onPress={() => post && onEditPost?.(post)}
                backgroundColor={ForumColors.peach}
                color={ForumColors.text}
              >
                编辑
              </Button>
              <Button
                size="$3"
                onPress={deletePost}
                backgroundColor={ForumColors.lightRed}
                color={ForumColors.red}
              >
                删除
              </Button>
            </>
          )}
          <Button size="$3" chromeless onPress={onClose} color={ForumColors.clay}>
            关闭
          </Button>
        </XStack>
      </XStack>

      {/* 详情内容滚动区域 */}
      {post && (
        <ScrollView
          style={{ maxHeight: contentMaxHeight }}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          <Card
            padding="$3"
            backgroundColor="#FFF5ED"
            borderColor={neutralScale.neutral3}
            borderWidth={1}
            borderRadius="$4"
          >
            <YStack gap="$2">
              <Text fontWeight="700" color={ForumColors.clay}>
                {post.author.username}
              </Text>
              <Text color={ForumColors.text}>{post.content}</Text>
              {!!post.media?.length && (
                <XStack gap="$2" flexWrap="wrap">
                  {post.media.map((m: PostMedia) =>
                    m.mediaType === 'image' ? (
                      <Card
                        key={m.id}
                        width={110}
                        height={110}
                        overflow="hidden"
                        borderColor={ForumColors.clay + '55'}
                        borderWidth={1}
                      >
                        <OptimizedImage
                          source={m.fileUrl}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                        />
                      </Card>
                    ) : (
                      <Card
                        key={m.id}
                        padding="$2"
                        borderColor={ForumColors.clay + '55'}
                        borderWidth={1}
                      >
                        <Text color={ForumColors.text}>[视频]</Text>
                      </Card>
                    )
                  )}
                </XStack>
              )}
              {post.tags && post.tags.length > 0 && (
                <XStack gap="$2" alignItems="center" flexWrap="wrap" marginTop="$2">
                  {post.tags.map((tag: string, index: number) => (
                    <Tag key={`${post.id}-${tag}`} name={tag} index={index} />
                  ))}
                </XStack>
              )}
            </YStack>
          </Card>
        </ScrollView>
      )}

      <Text fontSize="$6" fontWeight="700" color={ForumColors.clay}>
        评论（按赞）
      </Text>

      {/* 评论列表 */}
      <YStack flex={1}>
        <FlatList
          data={comments}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <YStack
              paddingVertical="$3"
              paddingHorizontal="$3"
              marginVertical="$2"
              gap="$2"
              backgroundColor="white"
              borderWidth={1}
              borderColor={neutralScale.neutral3}
              borderRadius="$3"
            >
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontWeight="700" color={ForumColors.clay}>
                  {item.author.username}
                </Text>
                <Text color={ForumColors.clay + '80'}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </XStack>
              {editingCommentId === item.id ? (
                <YStack gap="$2">
                  <TextArea
                    value={editingContent}
                    onChangeText={setEditingContent}
                    backgroundColor={neutralScale.neutral1}
                    borderColor={ForumColors.clay + '55'}
                    borderWidth={1}
                    color="$foreground"
                  />
                  <XStack gap="$2">
                    <Button
                      size="$2"
                      onPress={saveEditComment}
                      backgroundColor={ForumColors.clay}
                      color="white"
                    >
                      保存
                    </Button>
                    <Button
                      size="$2"
                      chromeless
                      onPress={() => {
                        setEditingCommentId(null);
                        setEditingContent('');
                      }}
                    >
                      取消
                    </Button>
                  </XStack>
                </YStack>
              ) : (
                <Text color={ForumColors.text}>{item.content}</Text>
              )}
              <XStack gap="$3" alignItems="center">
                <Button
                  size="$2"
                  onPress={() => toggleLike(item.id)}
                  backgroundColor={item.isLiked ? ForumColors.clay : ForumColors.peach}
                  color={item.isLiked ? 'white' : ForumColors.text}
                >
                  {item.isLiked ? `已赞 ${item.likes || 0}` : `点赞 ${item.likes || 0}`}
                </Button>
                <Button
                  size="$2"
                  chromeless
                  onPress={() => setReplyTarget(item)}
                  color={ForumColors.clay}
                >
                  回复
                </Button>
                {isMyComment(item) && (
                  <>
                    <Button
                      size="$2"
                      chromeless
                      onPress={() => startEditComment(item)}
                      color={ForumColors.clay}
                    >
                      编辑
                    </Button>
                    <Button
                      size="$2"
                      chromeless
                      onPress={() => deleteComment(item.id)}
                      color={ForumColors.clay}
                    >
                      删除
                    </Button>
                  </>
                )}
              </XStack>
              <Separator backgroundColor={ForumColors.clay + '33'} />
            </YStack>
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </YStack>

      <Separator backgroundColor={ForumColors.clay + '55'} />

      {replyTarget && (
        <XStack
          alignItems="center"
          justifyContent="space-between"
          backgroundColor={ForumColors.peach}
          padding="$2"
          borderRadius="$3"
        >
          <Text color={ForumColors.clay}>正在回复 @{replyTarget.author.username}</Text>
          <Button
            size="$2"
            chromeless
            onPress={() => setReplyTarget(null)}
            color={ForumColors.clay}
          >
            取消
          </Button>
        </XStack>
      )}

      <XStack gap="$2">
        <TextArea
          flex={1}
          value={content}
          onChangeText={setContent}
          placeholder="写下你的评论..."
          backgroundColor={neutralScale.neutral1}
          borderColor={ForumColors.clay + '55'}
          borderWidth={1}
          color="$foreground"
        />
        <Button
          size="$3"
          onPress={submit}
          backgroundColor={ForumColors.clay}
          color="white"
          pressStyle={{ opacity: 0.85 }}
        >
          发送
        </Button>
      </XStack>
    </YStack>
  );
}
