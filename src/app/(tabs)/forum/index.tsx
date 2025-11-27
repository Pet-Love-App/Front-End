import type { Post } from '@/src/services/api/forum';
import { forumService } from '@/src/services/api/forum';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, Text, TextArea, XStack, YStack } from 'tamagui';
import { FavoritesTab } from './_components/FavoritesTab';
import { ForumColors } from './_components/ForumHeader'; // colors only
import { MessagesTab } from './_components/MessagesTab';
import { PostDetailModal } from './_components/PostDetailModal';
import { SquareTab } from './_components/SquareTab';

export default function ForumScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'square' | 'favorites' | 'messages'>('square');
  const [isPostPanelOpen, setIsPostPanelOpen] = useState(false);
  const [content, setContent] = useState('');
  const [pickedFiles, setPickedFiles] = useState<{ uri: string; name: string; type: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const squareReloadRef = useRef<(() => void) | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [activePost, setActivePost] = useState<Post | null>(null);

  const pickImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (res.canceled) return;
    const files = res.assets.map((a, idx) => ({
      uri: a.uri,
      name: (a.fileName || `media_${Date.now()}_${idx}`) + (a.type === 'video' ? '.mp4' : '.jpg'),
      type: a.mimeType || (a.type === 'video' ? 'video/mp4' : 'image/jpeg'),
    }));
    setPickedFiles((prev) => [...prev, ...files]);
  };

  const submitPost = async () => {
    if (!content.trim() && pickedFiles.length === 0) {
      Alert.alert('提示', '请输入内容或选择媒体');
      return;
    }
    try {
      setSubmitting(true);
      await forumService.createPost({ content }, pickedFiles);
      Alert.alert('成功', '发布成功');
      setContent('');
      setPickedFiles([]);
      setIsPostPanelOpen(false);
      setTab('square');
      setTimeout(() => squareReloadRef.current?.(), 0);
    } catch (e: any) {
      Alert.alert('失败', e?.message || '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <YStack flex={1} backgroundColor={ForumColors.sand}>
      {/* Fixed single header */}
      <YStack
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        paddingTop={insets.top}
        backgroundColor={ForumColors.sand}
        borderBottomWidth={1}
        borderColor={ForumColors.clay + '55'}
        zIndex={100}
      >
        <XStack height={1} backgroundColor={ForumColors.borderTop} />
        <YStack padding="$3" gap="$3">
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$7" fontWeight="700" color={ForumColors.clay}>论坛</Text>
            <Button size="$3" onPress={() => setIsPostPanelOpen(true)} backgroundColor={ForumColors.clay} color="#fff" pressStyle={{ opacity: 0.85 }}>
              发帖
            </Button>
          </XStack>
          <XStack gap="$3" justifyContent="space-around" backgroundColor={ForumColors.peach} borderRadius="$4" padding="$2">
            <Button size="$3" onPress={() => setTab('square')} backgroundColor={tab === 'square' ? ForumColors.clay : ForumColors.sand} color={tab === 'square' ? '#fff' : '#603e1f'} flex={1}>
              广场
            </Button>
            <Button size="$3" onPress={() => setTab('favorites')} backgroundColor={tab === 'favorites' ? ForumColors.clay : ForumColors.sand} color={tab === 'favorites' ? '#fff' : '#603e1f'} flex={1}>
              我的收藏
            </Button>
            <Button size="$3" onPress={() => setTab('messages')} backgroundColor={tab === 'messages' ? ForumColors.clay : ForumColors.sand} color={tab === 'messages' ? '#fff' : '#603e1f'} flex={1}>
              消息
            </Button>
          </XStack>
        </YStack>
      </YStack>

      {/* Content area below header */}
      <YStack flex={1} padding="$3" gap="$3">
        {tab === 'square' && <SquareTab externalReloadRef={squareReloadRef} onOpenPost={(p) => setActivePost(p)} />}
        {tab === 'favorites' && <FavoritesTab onOpenPost={(p) => setActivePost(p)} />}
        {tab === 'messages' && <MessagesTab onCreatePost={() => setIsPostPanelOpen(true)} />}
      </YStack>

      {/* Post creation overlay (no extra header) */}
      {isPostPanelOpen && (
        <YStack
          position="absolute"
          top={headerHeight}
          left={0}
          right={0}
          bottom={0}
          backgroundColor={ForumColors.sand}
          padding="$4"
          gap="$3"
          zIndex={200}
          borderTopWidth={1}
          borderColor={ForumColors.clay + '55'}
        >
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$2">
            <Text fontSize="$6" fontWeight="700" color={ForumColors.clay}>发布帖子</Text>
            <XStack gap="$2">
              <Button size="$3" onPress={submitPost} backgroundColor={ForumColors.clay} color="#fff" pressStyle={{ opacity: 0.85 }}>
                {submitting ? '发布中...' : '发布'}
              </Button>
              <Button size="$3" chromeless onPress={() => { setIsPostPanelOpen(false); }} color={ForumColors.clay}>
                关闭
              </Button>
            </XStack>
          </XStack>
          <TextArea
            value={content}
            onChangeText={setContent}
            placeholder="说点什么..."
            height={160}
            backgroundColor="#fff"
            borderColor={ForumColors.clay + '55'}
            borderWidth={1}
            color="#3c2e20"
          />
          <XStack gap="$2" flexWrap="wrap">
            {pickedFiles.map((f, idx) => (
              <Card key={idx} width={90} height={90} backgroundColor={ForumColors.peach} borderColor={ForumColors.clay + '55'} borderWidth={1} overflow="hidden">
                <Image source={{ uri: f.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </Card>
            ))}
          </XStack>
          <XStack gap="$3">
            <Button size="$3" onPress={pickImages} backgroundColor={ForumColors.peach} color="#3c2e20" pressStyle={{ opacity: 0.85 }}>
              选择图片/视频
            </Button>
            <Button size="$3" onPress={() => { setContent(''); setPickedFiles([]); }} backgroundColor={ForumColors.sand} borderWidth={1} borderColor={ForumColors.clay + '55'} color="#603e1f" pressStyle={{ opacity: 0.85 }}>
              重置
            </Button>
          </XStack>
        </YStack>
      )}

      <PostDetailModal visible={!!activePost} post={activePost} onClose={() => setActivePost(null)} headerOffset={headerHeight} />
    </YStack>
  );
}
