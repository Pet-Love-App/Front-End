import { LottieAnimation } from '@/src/components/lottie-animation';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

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
  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('点击设置用户名');
  const [editingName, setEditingName] = useState<boolean>(false);
  const [details, setDetails] = useState<string>('点击编辑用户详细资料');
  const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);
  const [tempDetails, setTempDetails] = useState<string>('');

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

  return (
    <View style={styles.container}>
      <View style={styles.headerDecor}>
        <View style={styles.topRightAnim} pointerEvents="none">
          <BlackCatAnimation />
        </View>
      </View>

      <View style={styles.avatarSection}>
        <TouchableOpacity onPress={onPressAvatar} style={styles.avatarButton} activeOpacity={0.8}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.emptyAvatar}>
              <Text style={styles.emptyAvatarText}>+</Text>
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
              style={styles.usernameInput}
              placeholder="输入用户名"
              autoFocus
            />
          ) : (
            <Text style={styles.usernameText}>{username}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={openDetailsModal} style={styles.detailsButton}>
          <Text numberOfLines={3} style={styles.detailsText}>
            {details}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={detailsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>编辑用户详细资料</Text>
            <TextInput
              value={tempDetails}
              onChangeText={setTempDetails}
              style={styles.modalInput}
              multiline
              placeholder="在这里输入用户详细信息"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setDetailsModalVisible(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>取消</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#fff',
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
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  emptyAvatar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAvatarText: {
    fontSize: 48,
    color: '#bbb',
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
    color: '#222',
    marginBottom: 12,
  },
  usernameInput: {
    fontSize: 20,
    width: 240,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 4,
    marginBottom: 12,
  },
  detailsButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  detailsText: {
    color: '#444',
  },

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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 8,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
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
    color: '#444',
  },
  saveButtonText: {
    color: '#fff',
  },
});
