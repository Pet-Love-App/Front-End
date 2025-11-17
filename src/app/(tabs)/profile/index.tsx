import { LottieAnimation } from '@/src/components/LottieAnimation';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { petInputSchema, type Pet, type PetInput } from '@/src/schemas/pet.schema';
import { petService } from '@/src/services/api';
import { useThemeStore, type ThemeMode } from '@/src/store/themeStore';
import { useUserStore } from '@/src/store/userStore';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function PawAnimation() {
  return (
    <LottieAnimation
      source={require('@/assets/animations/paws_animation.json')}
      width={150}
      height={150}
    />
  );
}

export function BlackCatAnimation() {
  return (
    <LottieAnimation
      source={require('@/assets/animations/animated_black_cat.json')}
      width={150}
      height={150}
    />
  );
}

export default function ProfileIndex() {
  // 从全局 Store 获取用户与动作
  const {
    user,
    isLoading,
    fetchCurrentUser,
    uploadAvatar,
    deleteAvatar,
    isAuthenticated,
    _hasHydrated,
    logout,
  } = useUserStore();

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const { themeMode, setThemeMode } = useThemeStore();
  const [editingName, setEditingName] = useState<boolean>(false);
  const [details, setDetails] = useState<string>('点击编辑用户详细资料');
  const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);
  const [tempDetails, setTempDetails] = useState<string>('');
  const [themeModalVisible, setThemeModalVisible] = useState<boolean>(false);

  // 添加宠物相关状态
  const [petModalVisible, setPetModalVisible] = useState(false);
  const [petForm, setPetForm] = useState<PetInput>({ name: '', species: 'cat' });
  const [submittingPet, setSubmittingPet] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarCacheBuster, setAvatarCacheBuster] = useState(0);
  // 新增：创建宠物时选择的图片、本次查看的宠物
  const [petPhotoUri, setPetPhotoUri] = useState<string | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // screen dimensions used to compute percentage-based positions
  const { width: screenW, height: screenH } = useWindowDimensions();

  // Helpers: pass percent values in 0..1 (e.g. 0.5 = 50%)
  const percentToSquareStyle = (pctX: number, pctY: number, sizeRatio = 0.25) => {
    const size = Math.round(Math.min(screenW, screenH) * sizeRatio);
    const left = Math.round(screenW * pctX - size / 2);
    const top = Math.round(screenH * pctY - size / 2);
    return {
      position: 'absolute' as const,
      left,
      top,
      width: size,
      height: size,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      zIndex: 2,
    } as any;
  };

  const percentToBoxStyle = (pctX: number, pctY: number, boxWidthPct = 0.6, boxHeight = 56) => {
    const boxW = Math.round(screenW * boxWidthPct);
    const left = Math.round(screenW * pctX - boxW / 2);
    const top = Math.round(screenH * pctY - boxHeight / 2);
    return {
      position: 'absolute' as const,
      left,
      top,
      width: boxW,
      height: boxHeight,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      zIndex: 2,
    } as any;
  };

  // 初次进入加载当前用户
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) return; // 未登录不请求
    if (!user) {
      fetchCurrentUser().catch((e) => {
        console.warn('获取用户信息失败', e);
      });
    }
  }, [user, fetchCurrentUser, isAuthenticated, _hasHydrated]);

  const avatarUrl = user?.avatar ?? null;
  const username = user?.username ?? '未登录';
  const avatarSrc = React.useMemo(
    () => (avatarUrl ? `${avatarUrl}?v=${avatarCacheBuster}` : null),
    [avatarUrl, avatarCacheBuster]
  );

  const saveUsername = () => {
    setEditingName(false);
    // TODO: Implement username update API call if needed
  };

  async function pickFromCamera() {
    try {
      const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPerm.status !== 'granted') {
        Alert.alert('需要权限', '请允许相机权限或从相册选择图片');
        return pickFromLibrary();
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if ('canceled' in result) {
        if (!result.canceled && result.assets && result.assets.length > 0) {
          await doUploadAvatar(result.assets[0].uri);
        }
      } else {
        // @ts-ignore 兼容旧版本
        if (!result.cancelled && (result as any).uri) {
          // @ts-ignore
          await doUploadAvatar((result as any).uri);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }

  async function pickFromLibrary() {
    try {
      const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (libPerm.status !== 'granted') {
        Alert.alert('需要权限', '请允许访问相册以选择图片');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if ('canceled' in result) {
        if (!result.canceled && result.assets && result.assets.length > 0) {
          await doUploadAvatar(result.assets[0].uri);
        }
      } else {
        // @ts-ignore 兼容旧版本
        if (!result.cancelled && (result as any).uri) {
          // @ts-ignore
          await doUploadAvatar((result as any).uri);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }

  const doUploadAvatar = async (uri: string) => {
    try {
      setUploadingAvatar(true);
      await uploadAvatar(uri);
      // 移除多余的 fetch，避免重复日志；由 store 内部负责刷新用户信息
      setAvatarCacheBuster((v) => v + 1); // 强制刷新 Image 缓存
      Alert.alert('成功', '头像已更新');
    } catch (e: any) {
      Alert.alert('上传失败', e?.message ?? '请稍后再试');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onPressAvatar = () => {
    const actions: any[] = [
      { text: '取消', style: 'cancel' },
      { text: '从相册选择', onPress: () => pickFromLibrary() },
      { text: '拍照', onPress: () => pickFromCamera() },
    ];
    if (avatarUrl) {
      actions.push({
        text: '删除头像',
        style: 'destructive',
        onPress: async () => {
          try {
            setUploadingAvatar(true);
            await deleteAvatar();
            // 移除多余的 fetch，store 会刷新；并刷新 Image 缓存
            setAvatarCacheBuster((v) => v + 1);
          } catch (e: any) {
            Alert.alert('删除失败', e?.message ?? '请稍后再试');
          } finally {
            setUploadingAvatar(false);
          }
        },
      });
    }

    Alert.alert('选择头像', '请选择图片来源', actions);
  };

  const openDetailsModal = () => {
    setTempDetails(details);
    setDetailsModalVisible(true);
  };

  const saveDetails = () => {
    setDetails(tempDetails.trim().length ? tempDetails : '未填写详细资料');
    setDetailsModalVisible(false);
  };

  const handleLogout = () => {
    Alert.alert('确认登出', '确定要退出登录吗？', [
      {
        text: '取消',
        style: 'cancel',
      },
      {
        text: '确定',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/login');
          } catch (error) {
            console.error('登出失败:', error);
            Alert.alert('错误', '登出失败，请重试');
          }
        },
      },
    ]);
  };

  // 选择宠物图片（相册）
  const pickPetImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('需要权限', '请允许访问相册以选择宠物图片');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if ('canceled' in result) {
        if (!result.canceled && result.assets && result.assets.length > 0) {
          setPetPhotoUri(result.assets[0].uri);
        }
      } else {
        // @ts-ignore 兼容旧版本
        if (!result.cancelled && (result as any).uri) {
          // @ts-ignore
          setPetPhotoUri((result as any).uri);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // 提交新增宠物
  const submitPet = async () => {
    try {
      setSubmittingPet(true);
      const payload = petInputSchema.parse(petForm);
      // 先创建宠物
      let created = await petService.createPet(payload);

      // 若选择了图片，单独上传照片
      if (petPhotoUri) {
        try {
          created = await petService.uploadPetPhoto(created.id, petPhotoUri);
        } catch (e) {
          console.warn('宠物照片上传失败', e);
        }
      }

      await fetchCurrentUser();
      setPetModalVisible(false);
      // 重置表单
      setPetForm({ name: '', species: 'cat' });
      setPetPhotoUri(null);
      Alert.alert('成功', '已创建宠物');

      // 打开宠物详情小弹窗
      setSelectedPet(created);
    } catch (e: any) {
      Alert.alert('创建失败', e?.message ?? '请检查表单后重试');
    } finally {
      setSubmittingPet(false);
    }
  };

  // 物种选项
  const speciesOptions = useMemo(
    () =>
      [
        { key: 'cat', label: '猫咪' },
        { key: 'dog', label: '狗狗' },
        { key: 'bird', label: '鸟类' },
        { key: 'other', label: '其他' },
      ] as const,
    []
  );

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return '浅色';
      case 'dark':
        return '深色';
      case 'system':
        return '跟随系统';
    }
  };

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    setThemeModalVisible(false);
  };

  // 未登录/会话过期：展示重新登录入口
  if (_hasHydrated && !isAuthenticated) {
    return (
      <View
        style={[styles.container, { justifyContent: 'center', backgroundColor: colors.background }]}
      >
        <View style={{ alignItems: 'center', paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
            会话已过期
          </Text>
          <Text style={{ color: colors.icon, textAlign: 'center', marginBottom: 16 }}>
            您的登录状态已失效，请重新登录以继续查看个人资料与宠物信息。
          </Text>
          <TouchableOpacity style={styles.addPetBtn} onPress={() => router.replace('/login')}>
            <Text style={styles.addPetBtnText}>前往登录</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
    >
      <View style={styles.headerDecor}>
        <View style={styles.topRightAnim} pointerEvents="none">
          <BlackCatAnimation />
        </View>

        <View style={styles.topLeftAnim} pointerEvents="none">
          <PawAnimation />
        </View>
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity
          onPress={onPressAvatar}
          style={[
            styles.avatarButton,
            { borderColor: colors.icon, backgroundColor: colors.background },
          ]}
          activeOpacity={0.8}
        >
          {uploadingAvatar || isLoading ? (
            <View style={styles.emptyAvatar}>
              <ActivityIndicator />
            </View>
          ) : avatarSrc ? (
            <Image source={{ uri: avatarSrc }} style={styles.avatarImage} />
          ) : (
            <View style={styles.emptyAvatar}>
              <Text style={[styles.emptyAvatarText, { color: colors.icon }]}>+</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Username box */}
      <View style={styles.infoSection}>
        <View style={{ width: '100%' }}>
          {editingName ? (
            <TextInput
              value={username}
              onChangeText={(text) => {
                // Username is read-only from store, but allow editing for future implementation
              }}
              onBlur={saveUsername}
              onSubmitEditing={saveUsername}
              style={[styles.usernameInput, { color: colors.text, borderBottomColor: colors.icon }]}
              placeholder="输入用户名"
              placeholderTextColor={colors.icon}
              autoFocus
              editable={false}
            />
          ) : (
            <TouchableOpacity onPress={() => setEditingName(true)}>
              <Text style={[styles.usernameText, { color: colors.text }]}>{username}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Details button */}
      <View style={styles.infoSection}>
        <TouchableOpacity
          onPress={openDetailsModal}
          style={[
            styles.detailsButton,
            { backgroundColor: colors.background, borderColor: colors.icon },
          ]}
        >
          <Text numberOfLines={3} style={[styles.detailsText, { color: colors.text }]}>
            {details}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pets list area */}
      <View style={styles.petsSection}>
        <View style={styles.petPanel}>
          <View style={styles.petHeader}>
            <Text style={[styles.petTitle, { color: colors.text }]}>我的宠物</Text>
            <TouchableOpacity style={styles.addPetBtn} onPress={() => setPetModalVisible(true)}>
              <Text style={styles.addPetBtnText}>＋ 添加宠物</Text>
            </TouchableOpacity>
          </View>
          <View style={{ minHeight: 200 }}>
            {isLoading && !user ? (
              <View style={styles.petEmpty}>
                <ActivityIndicator />
              </View>
            ) : (user?.pets?.length ?? 0) === 0 ? (
              <View style={styles.petEmpty}>
                <Text style={{ color: colors.icon }}>还没有宠物，点击上方"添加宠物"</Text>
              </View>
            ) : (
              <View style={styles.petList}>
                {user?.pets?.map((p: Pet) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.petCard, { borderColor: colors.icon }]}
                    activeOpacity={0.75}
                    onPress={() => setSelectedPet(p)}
                  >
                    {p.photo ? (
                      <Image
                        source={{ uri: p.photo.includes('?') ? p.photo : `${p.photo}` }}
                        style={styles.petPhoto}
                      />
                    ) : (
                      <View style={[styles.petPhoto, styles.petPhotoEmpty]}>
                        <Text style={{ color: colors.icon }}>无图</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.petName, { color: colors.text }]}>{p.name}</Text>
                      <Text style={[styles.petMeta, { color: colors.icon }]}>
                        {p.species_display ?? p.species}
                        {p.age != null ? ` · ${p.age}岁` : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ===== 设置区域 ===== */}
      <View style={styles.settingsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>外观设置</Text>

        {/* 主题切换按钮 */}
        <TouchableOpacity
          onPress={() => setThemeModalVisible(true)}
          style={[
            styles.settingItem,
            { backgroundColor: colors.background, borderColor: colors.icon },
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <IconSymbol name="moon.fill" size={24} color={colors.icon} />
            <Text style={[styles.settingLabel, { color: colors.text }]}>主题模式</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValue, { color: colors.icon }]}>
              {getThemeLabel(themeMode)}
            </Text>
            <IconSymbol name="chevron.right" size={20} color={colors.icon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 登出按钮 */}
      <View style={styles.logoutSection}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>退出登录</Text>
        </TouchableOpacity>
      </View>

      {/* ===== 编辑详细资料模态框 ===== */}
      <Modal visible={detailsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>编辑用户详细资料</Text>
            <TextInput
              value={tempDetails}
              onChangeText={setTempDetails}
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  borderColor: colors.icon,
                  backgroundColor: colors.background,
                },
              ]}
              multiline
              placeholder="在这里输入用户详细信息"
              placeholderTextColor={colors.icon}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setDetailsModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveDetails}
                style={[styles.modalButton, styles.saveButton]}
              >
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== 新增宠物 Modal ===== */}
      <Modal visible={petModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>添加宠物</Text>
            <TextInput
              placeholder="宠物名称"
              placeholderTextColor={colors.icon}
              value={petForm.name}
              onChangeText={(t) => setPetForm((s) => ({ ...s, name: t }))}
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  borderColor: colors.icon,
                  backgroundColor: colors.background,
                },
              ]}
            />

            {/* 选择宠物图片 + 预览 */}
            <TouchableOpacity style={styles.petPickBtn} onPress={pickPetImage}>
              <Text style={styles.petPickBtnText}>
                {petPhotoUri ? '更换图片' : '选择宠物图片（可选）'}
              </Text>
            </TouchableOpacity>
            {petPhotoUri ? (
              <Image source={{ uri: petPhotoUri }} style={styles.petImagePreview} />
            ) : null}

            <View style={styles.speciesRow}>
              {speciesOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setPetForm((s) => ({ ...s, species: opt.key }))}
                  style={[
                    styles.speciesChip,
                    petForm.species === opt.key && styles.speciesChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.speciesChipText,
                      petForm.species === opt.key && styles.speciesChipTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              placeholder="品种（可选）"
              placeholderTextColor={colors.icon}
              value={petForm.breed ?? ''}
              onChangeText={(t) => setPetForm((s) => ({ ...s, breed: t || undefined }))}
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  borderColor: colors.icon,
                  backgroundColor: colors.background,
                },
              ]}
            />

            <TextInput
              placeholder="年龄（数字，可选）"
              placeholderTextColor={colors.icon}
              keyboardType="number-pad"
              value={petForm.age != null ? String(petForm.age) : ''}
              onChangeText={(t) => setPetForm((s) => ({ ...s, age: t ? Number(t) : undefined }))}
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  borderColor: colors.icon,
                  backgroundColor: colors.background,
                },
              ]}
            />

            <TextInput
              placeholder="描述（可选）"
              placeholderTextColor={colors.icon}
              value={petForm.description ?? ''}
              onChangeText={(t) => setPetForm((s) => ({ ...s, description: t || undefined }))}
              style={[
                styles.modalInput,
                {
                  minHeight: 80,
                  color: colors.text,
                  borderColor: colors.icon,
                  backgroundColor: colors.background,
                },
              ]}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setPetModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitPet}
                style={[styles.modalButton, styles.saveButton]}
                disabled={submittingPet}
              >
                {submittingPet ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, styles.saveButtonText]}>保存</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== 主题切换模态框 ===== */}
      <Modal visible={themeModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>选择主题</Text>

            <View style={styles.themeOptions}>
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => handleThemeChange(mode)}
                  style={[
                    styles.themeOption,
                    themeMode === mode && styles.themeOptionSelected,
                    { borderColor: themeMode === mode ? colors.tint : colors.icon },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={styles.themeOptionContent}>
                    <IconSymbol
                      name={
                        mode === 'light'
                          ? 'sun.max.fill'
                          : mode === 'dark'
                            ? 'moon.fill'
                            : 'circle.lefthalf.filled'
                      }
                      size={28}
                      color={themeMode === mode ? colors.tint : colors.icon}
                    />
                    <Text
                      style={[
                        styles.themeOptionText,
                        { color: themeMode === mode ? colors.tint : colors.text },
                      ]}
                    >
                      {getThemeLabel(mode)}
                    </Text>
                  </View>
                  {themeMode === mode && (
                    <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setThemeModalVisible(false)}
                style={[styles.modalButton, styles.saveButton]}
              >
                <Text style={[styles.modalButtonText, styles.saveButtonText]}>完成</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== 宠物详情小弹窗（点击卡片或创建后显示） ===== */}
      <Modal visible={!!selectedPet} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            {selectedPet ? (
              <>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedPet.name}</Text>
                {selectedPet.photo ? (
                  <Image source={{ uri: selectedPet.photo }} style={styles.petImagePreview} />
                ) : null}
                <Text style={{ marginTop: 6, color: colors.text }}>
                  {selectedPet.species_display ?? selectedPet.species}
                  {selectedPet.age != null ? ` · ${selectedPet.age}岁` : ''}
                </Text>
                {selectedPet.breed ? (
                  <Text style={{ marginTop: 4, color: colors.icon }}>
                    品种：{selectedPet.breed}
                  </Text>
                ) : null}
                {selectedPet.description ? (
                  <Text style={{ marginTop: 4, color: colors.icon }}>
                    简介：{selectedPet.description}
                  </Text>
                ) : null}

                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setSelectedPet(null)} style={styles.modalButton}>
                    <Text style={[styles.modalButtonText, { color: colors.text }]}>关闭</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor 动态设置
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerDecor: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  topRightAnim: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    height: 150,
  },
  topLeftAnim: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 150,
    height: 150,
  },
  avatarSection: {
    width: 120,
    height: 120,
    marginTop: 20,
    marginBottom: 20,
  },
  avatarButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    // borderColor 和 backgroundColor 动态设置
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emptyAvatar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAvatarText: {
    fontSize: 48,
    // color 动态设置
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoSection: {
    width: '90%',
    marginTop: 20,
    alignItems: 'center',
  },
  usernameText: {
    fontSize: 20,
    fontWeight: '600',
    // color 动态设置
    marginBottom: 12,
    textAlign: 'center',
  },
  usernameInput: {
    fontSize: 20,
    width: '100%',
    textAlign: 'center',
    borderBottomWidth: 1,
    // color 和 borderBottomColor 动态设置
    padding: 4,
    marginBottom: 12,
  },
  detailsButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    // backgroundColor 和 borderColor 动态设置
  },
  detailsText: {
    // color 动态设置
  },

  // 宠物面板
  petsSection: {
    width: '90%',
    marginTop: 30,
  },
  petPanel: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  petTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addPetBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  addPetBtnText: {
    color: '#fff',
  },
  petEmpty: {
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petList: {
    gap: 10,
    paddingBottom: 8,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  petPhoto: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f2f2f2',
  },
  petPhotoEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
  },
  petMeta: {
    marginTop: 2,
  },
  // 设置区域
  settingsSection: {
    width: '90%',
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingLeft: 8,
    // color 动态设置
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    // backgroundColor 和 borderColor 动态设置
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    // color 动态设置
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    // color 动态设置
  },
  logoutSection: {
    width: '90%',
    marginTop: 30,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // 模态框
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 560,
    // backgroundColor 动态设置
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    // color 动态设置
  },
  modalInput: {
    minHeight: 44,
    borderWidth: 1,
    // color, borderColor, backgroundColor 动态设置
    borderRadius: 8,
    padding: 8,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    borderRadius: 6,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
  },
  modalButtonText: {
    // color 动态设置
  },
  saveButtonText: {
    color: '#fff',
  },
  // 新增：物种选择样式
  speciesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  speciesChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  speciesChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  speciesChipText: {
    color: '#444',
    fontSize: 14,
  },
  speciesChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  petPickBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
    marginBottom: 8,
  },
  petPickBtnText: {
    color: '#3b82f6',
  },
  petImagePreview: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
  },
  // 主题选项
  themeOptions: {
    gap: 12,
    marginBottom: 16,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    // borderColor 动态设置
  },
  themeOptionSelected: {
    // borderColor 动态设置
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '500',
    // color 动态设置
  },
});
