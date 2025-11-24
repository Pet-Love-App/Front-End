import { forumService } from '@/src/services/api/forum';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Separator, Text, TextArea, XStack, YStack } from 'tamagui';
import { FavoritesTab } from './_components/FavoritesTab';
import { MessagesTab } from './_components/MessagesTab';
import { SquareTab } from './_components/SquareTab';

export default function ForumScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<'square' | 'favorites' | 'messages'>('square');
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [content, setContent] = useState('');
  const [pickedFiles, setPickedFiles] = useState<{ uri: string; name: string; type: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const squareReloadRef = useRef<(() => void) | null>(null);

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
      const res = await forumService.createPost({ content }, pickedFiles);
      console.log('createPost result:', res);
      Alert.alert('成功', '发布成功');
      setContent('');
      setPickedFiles([]);
      setPostModalVisible(false);
      // 切换到广场并刷新
      setTab('square');
      setTimeout(() => squareReloadRef.current?.(), 0);
    } catch (e: any) {
      console.error('createPost failed', e);
      Alert.alert('失败', e?.message || '发布失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <YStack flex={1} paddingTop={insets.top} backgroundColor="$background">
      {/* 顶部栏保持不变 */}
      <YStack paddingHorizontal="$4" paddingVertical="$3" gap="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <Text fontSize="$8" fontWeight="800">论坛</Text>
          <Button size="$3" onPress={() => setPostModalVisible(true)}>发帖</Button>
        </XStack>

        {/* 三个“路由”作为本地切换 */}
        <XStack gap="$3">
          <Button size="$3" theme={tab === 'square' ? 'active' : undefined} onPress={() => setTab('square')}>
            广场
          </Button>
          <Button size="$3" theme={tab === 'favorites' ? 'active' : undefined} onPress={() => setTab('favorites')}>
            我的收藏
          </Button>
          <Button size="$3" theme={tab === 'messages' ? 'active' : undefined} onPress={() => setTab('messages')}>
            消息
          </Button>
        </XStack>
      </YStack>

      <Separator />

      {/* 下方区域直接切换对应内容 */}
      <YStack flex={1}>
        {tab === 'square' && <SquareTab externalReloadRef={squareReloadRef} />}
        {tab === 'favorites' && <FavoritesTab />}
        {tab === 'messages' && <MessagesTab />}
      </YStack>

      {/* 发帖弹窗 */}
      <Modal visible={postModalVisible} animationType="slide" onRequestClose={() => setPostModalVisible(false)}>
        <YStack flex={1} paddingTop={insets.top} padding="$4" gap="$3" backgroundColor="$background">
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$7" fontWeight="700">发布帖子</Text>
            <Button size="$3" chromeless onPress={() => setPostModalVisible(false)}>关闭</Button>
          </XStack>

          <TextArea
            value={content}
            onChangeText={setContent}
            placeholder="说点什么..."
            height={160}
          />

          <XStack gap="$2" flexWrap="wrap">
            {pickedFiles.map((f, idx) => (
              <YStack key={idx} borderWidth={1} borderColor="$gray6" padding="$2" borderRadius="$2">
                <Text fontSize="$2" maxWidth={180} numberOfLines={1}>{f.name}</Text>
                <Button size="$2" onPress={() => setPickedFiles((prev) => prev.filter((_, i) => i !== idx))}>移除</Button>
              </YStack>
            ))}
          </XStack>

          <XStack gap="$3">
            <Button size="$3" onPress={pickImages}>选择图片/视频</Button>
            <Button size="$3" themeInverse onPress={submitPost}>
              {submitting ? '发布中...' : '发布'}
            </Button>
          </XStack>
        </YStack>
      </Modal>
    </YStack>
  );
}
