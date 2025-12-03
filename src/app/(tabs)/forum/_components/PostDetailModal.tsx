import Tag from '@/src/components/ui/Tag'; // 导入 Tag 组件
import type { Comment } from '@/src/services/api/comment';
import type { Post } from '@/src/services/api/forum';
import { forumService } from '@/src/services/api/forum';
import { useUserStore } from '@/src/store/userStore';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, ScrollView } from 'react-native';
import { Button, Card, Separator, Text, TextArea, XStack, YStack } from 'tamagui';
import { ForumColors } from './ForumHeader'; // colors only

interface Props {
  visible: boolean;
  post: Post | null;
  onClose: () => void;
  headerOffset?: number; // height of fixed header
  onEditPost?: (post: Post) => void;
  onPostDeleted?: () => void;
}

export function PostDetailModal({ visible, post, onClose, headerOffset = 0, onEditPost, onPostDeleted }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [replyTarget, setReplyTarget] = useState<Comment | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const currentUser = useUserStore((s) => s.user);
  const windowHeight = Dimensions.get('window').height;
  const contentMaxHeight = Math.max(200, Math.floor(windowHeight * 0.3));

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
    } finally { setLoading(false); }
  }, [post]);

  useEffect(() => {
    if (visible) load(); else { setComments([]); setContent(''); setReplyTarget(null); setEditingCommentId(null); setEditingContent(''); }
  }, [visible, load]);

  const submit = async () => {
    if (!post || !content.trim()) return;
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
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, likes: res.likes || 0, isLiked: res.action === 'liked' } : c));
  };

  const canEditPost = currentUser && post && currentUser.id === post.author.id;

  const deletePost = async () => {
    if (!post) return;
    Alert.alert('确认删除', '确定删除该帖子吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        try {
          await forumService.deletePost(post.id);
          onPostDeleted?.();
        } catch (e) {
          Alert.alert('错误', '删除失败');
        }
      }}
    ]);
  };

  const isMyComment = (c: Comment) => !!currentUser && c.author?.id === currentUser.id;

  const startEditComment = (c: Comment) => {
    setEditingCommentId(c.id);
    setEditingContent(c.content);
  };

  const saveEditComment = async () => {
    if (!editingCommentId) return;
    const text = editingContent.trim();
    if (!text) return;
    try {
      await forumService.updateComment(editingCommentId, text);
      setComments(prev => prev.map(c => c.id === editingCommentId ? { ...c, content: text } : c));
      setEditingCommentId(null);
      setEditingContent('');
    } catch (e) {
      Alert.alert('错误', '更新失败');
    }
  };

  const deleteComment = async (commentId: number) => {
    Alert.alert('确认删除', '确定删除该评论吗？', [
      { text: '取消', style: 'cancel' },
      { text: '删除', style: 'destructive', onPress: async () => {
        try {
          await forumService.deleteComment(commentId);
          setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (e) {
          Alert.alert('错误', '删除失败');
        }
      }}
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
        <Text fontSize="$6" fontWeight="700" color={ForumColors.clay}>帖子详情</Text>
        <XStack gap="$2" alignItems="center">
          {canEditPost ? (
            <>
              <Button size="$3" onPress={() => post && onEditPost?.(post)} backgroundColor={ForumColors.peach} color="#3c2e20">编辑</Button>
              <Button size="$3" onPress={deletePost} backgroundColor="#ffebe9" color="#ae2e24">删除</Button>
            </>
          ) : null}
          <Button size="$3" chromeless onPress={onClose} color={ForumColors.clay}>关闭</Button>
        </XStack>
      </XStack>

      {/* 详情内容滚动区域（限制最大高度） */}
      {post ? (
        <ScrollView style={{ maxHeight: contentMaxHeight }} contentContainerStyle={{ paddingBottom: 8 }}>
          <Card padding="$3" backgroundColor={ForumColors.peach} borderColor={ForumColors.clay + '55'} borderWidth={1}>
            <YStack gap="$2">
              <Text fontWeight="700" color={ForumColors.clay}>{post.author.username}</Text>
              <Text color="#3c2e20">{post.content}</Text>
              {!!post.media?.length && (
                <XStack gap="$2" flexWrap="wrap">
                  {post.media.map(m => (
                    m.media_type === 'image' ? (
                      <Card key={m.id} width={110} height={110} overflow="hidden" borderColor={ForumColors.clay + '55'} borderWidth={1}>
                        <Image source={{ uri: m.file }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      </Card>
                    ) : (
                      <Card key={m.id} padding="$2" borderColor={ForumColors.clay + '55'} borderWidth={1}>
                        <Text color="#3c2e20">[视频]</Text>
                      </Card>
                    )
                  ))}
                </XStack>
              )}
              {post.tags && post.tags.length > 0 && (
                <XStack gap="$2" alignItems="center" flexWrap="wrap" marginTop="$2">
                  {post.tags.map((tag, index) => (
                    <Tag key={`${post.id}-${tag}`} name={tag} index={index} />
                  ))}
                </XStack>
              )}
            </YStack>
          </Card>
        </ScrollView>
      ) : null}

      <Text fontSize="$6" fontWeight="700" color={ForumColors.clay}>评论（按赞）</Text>

      {/* 评论列表占据剩余空间 */}
      <YStack flex={1}>
        <FlatList
          data={comments}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <YStack paddingVertical="$3" gap="$2">
              <XStack alignItems="center" justifyContent="space-between">
                <Text fontWeight="700" color={ForumColors.clay}>{item.author.username}</Text>
                <Text color={ForumColors.clay + '80'}>{new Date(item.createdAt).toLocaleString()}</Text>
              </XStack>
              {editingCommentId === item.id ? (
                <YStack gap="$2">
                  <TextArea value={editingContent} onChangeText={setEditingContent} backgroundColor="#fff" borderColor={ForumColors.clay + '55'} borderWidth={1} color="#3c2e20" />
                  <XStack gap="$2">
                    <Button size="$2" onPress={saveEditComment} backgroundColor={ForumColors.clay} color="#fff">保存</Button>
                    <Button size="$2" chromeless onPress={() => { setEditingCommentId(null); setEditingContent(''); }}>取消</Button>
                  </XStack>
                </YStack>
              ) : (
                <Text color="#3c2e20">{item.content}</Text>
              )}
              <XStack gap="$3" alignItems="center">
                <Button size="$2" onPress={() => toggleLike(item.id)} backgroundColor={item.isLiked ? ForumColors.clay : ForumColors.peach} color={item.isLiked ? '#fff' : '#3c2e20'}>
                  {item.isLiked ? `已赞 ${item.likes || 0}` : `点赞 ${item.likes || 0}`}
                </Button>
                <Button size="$2" chromeless onPress={() => setReplyTarget(item)} color={ForumColors.clay}>回复</Button>
                {isMyComment(item) ? (
                  <>
                    <Button size="$2" chromeless onPress={() => startEditComment(item)} color={ForumColors.clay}>编辑</Button>
                    <Button size="$2" chromeless onPress={() => deleteComment(item.id)} color={ForumColors.clay}>删除</Button>
                  </>
                ) : null}
              </XStack>
              <Separator backgroundColor={ForumColors.clay + '33'} />
            </YStack>
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
        />
      </YStack>

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
  );
}
