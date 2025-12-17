// src/app/(tabs)/profile/components/BadgeGridPreview.tsx
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { BADGE_CONFIGS } from '@/src/constants/badges';
import { neutralScale } from '@/src/design-system/tokens';

interface BadgeGridPreviewProps {
  badges: any[]; // 替换为实际的徽章类型
  onViewAll: () => void;
  onBadgePress: (badge: any) => void;
  maxDisplay: number; // 最多显示的徽章数量
}

export const BadgeGridPreview = ({
  badges,
  onViewAll,
  onBadgePress,
  maxDisplay = 3,
}: BadgeGridPreviewProps) => {
  const displayBadges = badges.slice(0, maxDisplay);
  const hasMore = badges.length > maxDisplay;

  return (
    <View style={{ width: '100%' }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: neutralScale.neutral12 }}>
          我的徽章
        </Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text style={{ fontSize: 14, color: '#8B5CF6', fontWeight: '500' }}>查看全部</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {displayBadges.map((badge, index) => {
          const config = BADGE_CONFIGS[badge.badge.code];
          if (!config) return null;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onBadgePress(badge)}
              style={{ alignItems: 'center' }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: badge.is_equipped ? `${config.color}30` : `${config.color}10`,
                  borderWidth: badge.is_equipped ? 2 : 1,
                  borderColor: config.color,
                }}
              >
                <IconSymbol name={config.icon as any} size={28} color={config.color} />
              </View>
              <Text style={{ fontSize: 12, marginTop: 4, color: neutralScale.neutral10 }}>
                {config.name}
              </Text>
            </TouchableOpacity>
          );
        })}

        {hasMore && (
          <TouchableOpacity
            onPress={onViewAll}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: neutralScale.neutral2,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: neutralScale.neutral6 }}>
              +{badges.length - maxDisplay}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
