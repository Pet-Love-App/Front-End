import { forumService } from '@/src/services/api/forum';
import * as ImagePicker from 'expo-image-picker';
import React, { useRef, useState } from 'react';
import { Alert, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, TextArea, XStack, YStack } from 'tamagui';
import { FavoritesTab } from './_components/FavoritesTab';
import { ForumColors, ForumHeader } from './_components/ForumHeader';
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
    <YStack flex={1} backgroundColor={ForumColors.sand}>
      <ForumHeader
        title="论坛"
        right={<Button size="$3" onPress={() => setPostModalVisible(true)} backgroundColor={ForumColors.clay} color="#fff" pressStyle={{ opacity: 0.85 }}>发帖</Button>}
      />

      <XStack padding="$3" gap="$3" justifyContent="space-around" backgroundColor={ForumColors.peach} borderBottomWidth={1} borderColor={ForumColors.clay + '55'}>
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

      <YStack flex={1} padding="$3" gap="$3">
        {tab === 'square' && <SquareTab externalReloadRef={squareReloadRef} />}
        {tab === 'favorites' && <FavoritesTab onCreatePost={() => setPostModalVisible(true)} />}
        {tab === 'messages' && <MessagesTab />}
      </YStack>

      <Modal visible={postModalVisible} animationType="slide" onRequestClose={() => setPostModalVisible(false)}>
        <YStack flex={1} backgroundColor={ForumColors.sand}>
          <ForumHeader
            title="发布帖子"
            onClose={() => setPostModalVisible(false)}
            right={<Button size="$3" onPress={submitPost} backgroundColor={ForumColors.clay} color="#fff" pressStyle={{ opacity: 0.85 }}>{submitting ? '发布中...' : '发布'}</Button>}
          />
          <YStack flex={1} padding="$4" gap="$3">
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
              <Button size="$3" onPress={pickImages} backgroundColor={ForumColors.peach} color="#3c2e20" pressStyle={{ opacity: 0.85 }}>选择图片/视频</Button>
              <Button size="$3" onPress={() => { setContent(''); setPickedFiles([]); }} backgroundColor={ForumColors.sand} borderWidth={1} borderColor={ForumColors.clay + '55'} color="#603e1f" pressStyle={{ opacity: 0.85 }}>
                重置
              </Button>
            </XStack>
          </YStack>
        </YStack>
      </Modal>
    </YStack>
  );
}
