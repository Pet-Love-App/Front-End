/**
 * LocationSelectorModal - 位置选择模态框
 *
 * 允许用户选择或输入位置信息
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { X, Search, MapPin, Navigation, Clock } from '@tamagui/lucide-icons';
import { BlurView } from 'expo-blur';

interface Location {
  id: string;
  name: string;
  address?: string;
  distance?: string;
}

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: Location) => void;
  initialLocation?: Location;
}

const BRAND_COLOR = '#1DA1F2';

export function LocationSelectorModal({
  visible,
  onClose,
  onConfirm,
  initialLocation,
}: LocationSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    initialLocation || null
  );
  const [isLocating, setIsLocating] = useState(false);

  // 模拟附近位置列表
  const nearbyLocations: Location[] = useMemo(
    () => [
      { id: '1', name: '宠物医院', address: '朝阳区建国路88号', distance: '100m' },
      { id: '2', name: '宠物公园', address: '朝阳区三里屯', distance: '500m' },
      { id: '3', name: '宠物店', address: '朝阳区国贸', distance: '800m' },
      { id: '4', name: '动物园', address: '西城区西直门外大街', distance: '2km' },
      { id: '5', name: '宠物咖啡馆', address: '海淀区中关村', distance: '3km' },
    ],
    []
  );

  // 模拟最近使用的位置
  const recentLocations: Location[] = useMemo(
    () => [
      { id: 'r1', name: '家', address: '朝阳区望京SOHO' },
      { id: 'r2', name: '公司', address: '朝阳区国贸大厦' },
    ],
    []
  );

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return nearbyLocations;
    return nearbyLocations.filter(
      (location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (location.address?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    );
  }, [nearbyLocations, searchQuery]);

  const handleGetCurrentLocation = useCallback(async () => {
    setIsLocating(true);
    // 模拟获取当前位置
    setTimeout(() => {
      const currentLocation: Location = {
        id: 'current',
        name: '当前位置',
        address: '北京市朝阳区建国路88号',
      };
      setSelectedLocation(currentLocation);
      setIsLocating(false);
    }, 1500);
  }, []);

  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location);
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedLocation) {
      onConfirm(selectedLocation);
      onClose();
    }
  }, [selectedLocation, onConfirm, onClose]);

  const renderLocationItem = useCallback(
    ({ item, isRecent = false }: { item: Location; isRecent?: boolean }) => {
      const isSelected = selectedLocation?.id === item.id;

      return (
        <TouchableOpacity
          style={[styles.locationItem, isSelected && styles.locationItemSelected]}
          onPress={() => handleLocationSelect(item)}
          activeOpacity={0.7}
        >
          <View style={styles.locationLeft}>
            {isRecent ? (
              <View style={styles.iconContainer}>
                <Clock size={20} color="#6B7280" strokeWidth={2} />
              </View>
            ) : (
              <View style={styles.iconContainer}>
                <MapPin size={20} color={isSelected ? BRAND_COLOR : '#6B7280'} strokeWidth={2} />
              </View>
            )}
            <View style={styles.locationInfo}>
              <Text style={[styles.locationName, isSelected && styles.locationNameSelected]}>
                {item.name}
              </Text>
              {item.address && <Text style={styles.locationAddress}>{item.address}</Text>}
            </View>
          </View>

          {item.distance && <Text style={styles.distance}>{item.distance}</Text>}
        </TouchableOpacity>
      );
    },
    [selectedLocation, handleLocationSelect]
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.backdrop}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>选择位置</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <X size={24} color="#262626" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="搜索位置"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleGetCurrentLocation}
            disabled={isLocating}
            activeOpacity={0.7}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={BRAND_COLOR} />
            ) : (
              <Navigation size={20} color={BRAND_COLOR} strokeWidth={2} />
            )}
            <Text style={styles.currentLocationText}>
              {isLocating ? '定位中...' : '使用当前位置'}
            </Text>
          </TouchableOpacity>

          <View style={styles.content}>
            {!searchQuery && recentLocations.length > 0 && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>最近使用</Text>
                </View>
                {recentLocations.map((location) => (
                  <View key={location.id}>
                    {renderLocationItem({ item: location, isRecent: true })}
                  </View>
                ))}
              </>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{searchQuery ? '搜索结果' : '附近位置'}</Text>
            </View>

            <FlatList
              data={filteredLocations}
              renderItem={({ item }) => renderLocationItem({ item })}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.confirmButton, !selectedLocation && styles.confirmButtonDisabled]}
              onPress={handleConfirm}
              disabled={!selectedLocation}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  !selectedLocation && styles.confirmButtonTextDisabled,
                ]}
              >
                确定
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#262626',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#262626',
    marginLeft: 10,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E8F5FE',
    borderRadius: 12,
  },
  currentLocationText: {
    fontSize: 15,
    fontWeight: '600',
    color: BRAND_COLOR,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  locationItemSelected: {
    backgroundColor: '#E8F5FE',
    borderColor: BRAND_COLOR,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#262626',
    marginBottom: 2,
  },
  locationNameSelected: {
    color: BRAND_COLOR,
    fontWeight: '600',
  },
  locationAddress: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  distance: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  confirmButton: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
