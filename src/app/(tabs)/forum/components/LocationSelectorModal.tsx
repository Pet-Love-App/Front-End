/**
 * LocationSelectorModal - 位置选择模态框
 *
 * 功能：
 * - 获取当前GPS位置
 * - 搜索真实地理地址
 * - 显示附近位置
 * - 反向地理编码
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { X, Search, MapPin, Navigation, Loader } from '@tamagui/lucide-icons';
import { BlurView } from 'expo-blur';
import * as ExpoLocation from 'expo-location';

interface Location {
  id: string;
  name: string;
  address?: string;
  distance?: string;
  lat?: number;
  lon?: number;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
    neighbourhood?: string;
    village?: string;
    town?: string;
    district?: string;
  };
}

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (location: Location) => void;
  initialLocation?: Location;
}

const BRAND_COLOR = '#1DA1F2';

// 计算两点之间的距离（米）
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // 地球半径（米）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 格式化距离显示
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

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
  const [isSearching, setIsSearching] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [nearbyLocations, setNearbyLocations] = useState<Location[]>([]);
  const [searchResults, setSearchResults] = useState<Location[]>([]);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 通过 Nominatim API 获取地址
  const fetchAddressFromNominatim = async (
    latitude: number,
    longitude: number
  ): Promise<Location> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=zh-CN`,
        {
          headers: {
            'User-Agent': 'PetLoveApp/1.0',
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      const data: NominatimResult = await response.json();

      if (data && data.address) {
        const addr = data.address;
        const locationName =
          addr?.road || addr?.suburb || addr?.neighbourhood || data.name || '当前位置';
        const fullAddress = [
          addr?.city || addr?.town || addr?.county,
          addr?.district || addr?.suburb,
          addr?.road,
          addr?.neighbourhood,
        ]
          .filter(Boolean)
          .join(' ');

        return {
          id: 'current',
          name: locationName,
          address: fullAddress || data.display_name,
          lat: latitude,
          lon: longitude,
        };
      }
    } catch (error) {
      console.log('Nominatim geocoding failed:', error);
    }

    // 最终回退：使用坐标
    return {
      id: 'current',
      name: '当前位置',
      address: `纬度 ${latitude.toFixed(4)}, 经度 ${longitude.toFixed(4)}`,
      lat: latitude,
      lon: longitude,
    };
  };

  // 获取当前位置
  const getCurrentLocation = useCallback(async () => {
    setIsLocating(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('权限被拒绝', '需要位置权限来获取当前位置，请在设置中开启');
        setIsLocating(false);
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCurrentCoords({ lat: latitude, lon: longitude });

      // 首先尝试使用 expo-location 的原生反向地理编码（更快更可靠）
      let current: Location;
      try {
        const nativeAddresses = await ExpoLocation.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (nativeAddresses && nativeAddresses.length > 0) {
          const addr = nativeAddresses[0];
          const locationName =
            addr.street || addr.district || addr.subregion || addr.city || '当前位置';
          const fullAddress = [addr.city, addr.district, addr.subregion, addr.street, addr.name]
            .filter(Boolean)
            .join(' ');

          current = {
            id: 'current',
            name: locationName,
            address: fullAddress || `${addr.city || ''} ${addr.region || ''}`.trim(),
            lat: latitude,
            lon: longitude,
          };
        } else {
          // 如果原生反向地理编码没有返回结果，尝试 Nominatim API
          current = await fetchAddressFromNominatim(latitude, longitude);
        }
      } catch (nativeError) {
        console.log('Native geocoding failed, trying Nominatim:', nativeError);
        // 如果原生反向地理编码失败，尝试 Nominatim API
        current = await fetchAddressFromNominatim(latitude, longitude);
      }
      setCurrentLocation(current);
      setSelectedLocation(current);

      // 获取附近位置（不阻塞主流程）
      fetchNearbyLocations(latitude, longitude).catch(() => {});
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('定位失败', '无法获取当前位置，请检查网络连接或手动搜索位置');
    } finally {
      setIsLocating(false);
    }
  }, []);

  // 获取附近位置
  const fetchNearbyLocations = async (lat: number, lon: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 减少到5秒

    try {
      // 搜索附近的 POI（兴趣点）
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=*&format=json&addressdetails=1&limit=15&bounded=1&viewbox=${lon - 0.02},${lat + 0.02},${lon + 0.02},${lat - 0.02}&accept-language=zh-CN`,
        {
          headers: {
            'User-Agent': 'PetLoveApp/1.0',
          },
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      const data: NominatimResult[] = await response.json();

      if (data && data.length > 0) {
        const locations: Location[] = data
          .filter((item) => item.name || item.address?.road)
          .map((item) => {
            const addr = item.address;
            const distance = calculateDistance(
              lat,
              lon,
              parseFloat(item.lat),
              parseFloat(item.lon)
            );
            return {
              id: item.place_id.toString(),
              name: item.name || addr?.road || addr?.suburb || '未知地点',
              address: [addr?.city || addr?.town, addr?.district || addr?.suburb, addr?.road]
                .filter(Boolean)
                .join(' '),
              distance: formatDistance(distance),
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            };
          })
          .sort((a, b) => {
            const distA = parseFloat(a.distance?.replace(/[^0-9.]/g, '') || '0');
            const distB = parseFloat(b.distance?.replace(/[^0-9.]/g, '') || '0');
            return distA - distB;
          });

        setNearbyLocations(locations);
      }
    } catch (error) {
      // 静默处理错误，不影响主流程
      if (error instanceof Error && error.name !== 'AbortError') {
        console.log('Failed to fetch nearby locations:', error.message);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // 搜索地址
  const searchLocations = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=20&accept-language=zh-CN`,
          {
            headers: {
              'User-Agent': 'PetLoveApp/1.0',
            },
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);
        const data: NominatimResult[] = await response.json();

        if (data && data.length > 0) {
          const locations: Location[] = data.map((item) => {
            const addr = item.address;
            const distance = currentCoords
              ? formatDistance(
                  calculateDistance(
                    currentCoords.lat,
                    currentCoords.lon,
                    parseFloat(item.lat),
                    parseFloat(item.lon)
                  )
                )
              : undefined;

            return {
              id: item.place_id.toString(),
              name: item.name || addr?.road || addr?.suburb || item.display_name.split(',')[0],
              address: item.display_name,
              distance,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            };
          });

          setSearchResults(locations);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Failed to search locations:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [currentCoords]
  );

  // 搜索防抖
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(searchQuery);
      }, 500);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchLocations]);

  // 打开时自动获取位置
  useEffect(() => {
    if (visible && !currentLocation) {
      getCurrentLocation();
    }
  }, [visible, currentLocation, getCurrentLocation]);

  const handleLocationSelect = useCallback((location: Location) => {
    setSelectedLocation(location);
    Keyboard.dismiss();
  }, []);

  const handleConfirm = useCallback(() => {
    if (selectedLocation) {
      onConfirm(selectedLocation);
      onClose();
    }
  }, [selectedLocation, onConfirm, onClose]);

  const displayLocations = searchQuery.trim() ? searchResults : nearbyLocations;

  const renderLocationItem = useCallback(
    ({ item }: { item: Location }) => {
      const isSelected = selectedLocation?.id === item.id;

      return (
        <TouchableOpacity
          style={[styles.locationItem, isSelected && styles.locationItemSelected]}
          onPress={() => handleLocationSelect(item)}
          activeOpacity={0.7}
        >
          <View style={styles.locationLeft}>
            <View style={styles.iconContainer}>
              <MapPin size={20} color={isSelected ? BRAND_COLOR : '#6B7280'} strokeWidth={2} />
            </View>
            <View style={styles.locationInfo}>
              <Text
                style={[styles.locationName, isSelected && styles.locationNameSelected]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              {item.address && (
                <Text style={styles.locationAddress} numberOfLines={2}>
                  {item.address}
                </Text>
              )}
            </View>
          </View>

          {item.distance && <Text style={styles.distance}>{item.distance}</Text>}
        </TouchableOpacity>
      );
    },
    [selectedLocation, handleLocationSelect]
  );

  const renderCurrentLocation = () => {
    if (!currentLocation) return null;

    const isSelected = selectedLocation?.id === currentLocation.id;

    return (
      <TouchableOpacity
        style={[styles.currentLocationItem, isSelected && styles.locationItemSelected]}
        onPress={() => handleLocationSelect(currentLocation)}
        activeOpacity={0.7}
      >
        <View style={styles.locationLeft}>
          <View style={[styles.iconContainer, styles.currentIcon]}>
            <Navigation size={18} color="#FFFFFF" strokeWidth={2} />
          </View>
          <View style={styles.locationInfo}>
            <Text style={[styles.locationName, isSelected && styles.locationNameSelected]}>
              {currentLocation.name}
            </Text>
            <Text style={styles.locationAddress} numberOfLines={1}>
              {currentLocation.address}
            </Text>
          </View>
        </View>
        <Text style={styles.currentTag}>当前</Text>
      </TouchableOpacity>
    );
  };

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
              placeholder="搜索地址、街道、城市..."
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
            />
            {isSearching && <ActivityIndicator size="small" color={BRAND_COLOR} />}
          </View>

          {/* 定位按钮 */}
          <TouchableOpacity
            style={styles.locateButton}
            onPress={getCurrentLocation}
            disabled={isLocating}
            activeOpacity={0.7}
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={BRAND_COLOR} />
            ) : (
              <Navigation size={20} color={BRAND_COLOR} strokeWidth={2} />
            )}
            <Text style={styles.locateButtonText}>{isLocating ? '定位中...' : '重新定位'}</Text>
          </TouchableOpacity>

          <View style={styles.content}>
            {/* 当前位置 */}
            {currentLocation && !searchQuery && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>当前位置</Text>
                {renderCurrentLocation()}
              </View>
            )}

            {/* 搜索结果或附近位置 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {searchQuery ? '搜索结果' : '附近位置'}
                {isSearching && ' (搜索中...)'}
              </Text>
            </View>

            {displayLocations.length > 0 ? (
              <FlatList
                data={displayLocations}
                renderItem={renderLocationItem}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              />
            ) : (
              <View style={styles.emptyState}>
                {isLocating || isSearching ? (
                  <ActivityIndicator size="large" color={BRAND_COLOR} />
                ) : (
                  <>
                    <MapPin size={48} color="#D1D5DB" strokeWidth={1.5} />
                    <Text style={styles.emptyText}>
                      {searchQuery ? '未找到相关位置' : '正在获取附近位置...'}
                    </Text>
                    <Text style={styles.emptyHint}>
                      {searchQuery ? '请尝试其他关键词' : '请确保已开启定位权限'}
                    </Text>
                  </>
                )}
              </View>
            )}
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
    height: '80%',
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
    marginRight: 10,
  },
  locateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#E8F5FE',
    borderRadius: 10,
  },
  locateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND_COLOR,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  currentIcon: {
    backgroundColor: '#22C55E',
    borderRadius: 8,
    padding: 6,
    marginRight: 12,
  },
  currentTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    paddingHorizontal: 14,
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
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  distance: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
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
