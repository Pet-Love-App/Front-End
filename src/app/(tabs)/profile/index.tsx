import { LottieAnimation } from '@/src/components/LottieAnimation';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Colors } from '@/src/constants/theme';
import { useThemeAwareColorScheme } from '@/src/hooks/useThemeAwareColorScheme';
import { useThemeStore, type ThemeMode } from '@/src/store/themeStore';
import { useUserStore } from '@/src/store/userStore';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useThemeAwareColorScheme();
  const colors = Colors[colorScheme];
  const { themeMode, setThemeMode } = useThemeStore();
  const { logout } = useUserStore();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('点击设置用户名');
  const [editingName, setEditingName] = useState<boolean>(false);
  const [details, setDetails] = useState<string>('点击编辑用户详细资料');
  const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);
  const [tempDetails, setTempDetails] = useState<string>('');
  const [themeModalVisible, setThemeModalVisible] = useState<boolean>(false);

  async function pickFromCamera() {
    try {
      const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraPerm.status !== 'granted') {
        Alert.alert('需要权限', '请允许相机权限或从相册选择图片');
        // fall back to library
        return pickFromLibrary();
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      // handle both new and old result shapes from expo-image-picker
      if ('canceled' in result) {
        if (!result.canceled && result.assets && result.assets.length > 0) {
          setAvatar(result.assets[0].uri);
        }
      } else {
        // older versions used 'cancelled' and 'uri'
        // @ts-ignore
        if (!result.cancelled && (result as any).uri) {
          // @ts-ignore
          setAvatar((result as any).uri);
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

      // handle both new and old result shapes from expo-image-picker
      if ('canceled' in result) {
        if (!result.canceled && result.assets && result.assets.length > 0) {
          setAvatar(result.assets[0].uri);
        }
      } else {
        // older versions used 'cancelled' and 'uri'
        // @ts-ignore
        if (!result.cancelled && (result as any).uri) {
          // @ts-ignore
          setAvatar((result as any).uri);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  }

  const onPressAvatar = () => {
    // simple flow: try camera first, if permission denied fallback to library
    pickFromCamera();
  };

  const onPressUsername = () => {
    setEditingName(true);
  };

  const saveUsername = () => {
    if (!username || username.trim().length === 0) {
      setUsername('未命名用户');
    }
    setEditingName(false);
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40 }]}
    >
      <View style={styles.headerDecor}>
        <View style={styles.topRightAnim} pointerEvents="none">
          <BlackCatAnimation />
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
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.emptyAvatar}>
              <Text style={[styles.emptyAvatarText, { color: colors.icon }]}>+</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.animBelow} pointerEvents="none">
          <PawAnimation />
        </View>
      </View>

      <View style={styles.infoSection}>
        <TouchableOpacity onPress={onPressUsername} activeOpacity={0.7}>
          {editingName ? (
            <TextInput
              value={username}
              onChangeText={setUsername}
              onBlur={saveUsername}
              onSubmitEditing={saveUsername}
              style={[styles.usernameInput, { color: colors.text, borderBottomColor: colors.icon }]}
              placeholder="输入用户名"
              placeholderTextColor={colors.icon}
              autoFocus
            />
          ) : (
            <Text style={[styles.usernameText, { color: colors.text }]}>{username}</Text>
          )}
        </TouchableOpacity>

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
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  topRightAnim: {
    width: 80,
    height: 80,
    opacity: 0.9,
  },
  avatarSection: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
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
  animBelow: {
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  usernameInput: {
    fontSize: 20,
    width: 240,
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
    minHeight: 100,
    borderWidth: 1,
    // color, borderColor, backgroundColor 动态设置
    borderRadius: 8,
    padding: 8,
    textAlignVertical: 'top',
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
