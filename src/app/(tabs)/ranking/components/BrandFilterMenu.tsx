import { Pressable, ScrollView } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { IconSymbol } from '@/src/components/ui/IconSymbol';

interface BrandFilterMenuProps {
  visible: boolean;
  brandList: string[];
  brandCounts: Record<string, number>;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  onClose: () => void;
}

/**
 * 品牌筛选菜单组件
 * 显示所有可用品牌及其猫粮数量
 */
export function BrandFilterMenu({
  visible,
  brandList,
  brandCounts,
  selectedBrand,
  onSelectBrand,
  onClose,
}: BrandFilterMenuProps) {
  if (!visible) return null;

  return (
    <YStack
      paddingHorizontal="$4"
      paddingVertical="$4"
      backgroundColor="#FFFBEB"
      borderBottomWidth={2}
      borderBottomColor="#FEF3C7"
    >
      <XStack alignItems="center" justifyContent="space-between" marginBottom="$3.5">
        <XStack alignItems="center" gap="$2.5">
          <YStack
            width={40}
            height={40}
            borderRadius="$10"
            backgroundColor="#FBBF24"
            alignItems="center"
            justifyContent="center"
          >
            <IconSymbol name="building.2.fill" size={20} color="white" />
          </YStack>
          <YStack>
            <Text fontSize={18} fontWeight="800" color="#78350F" letterSpacing={0.3}>
              选择品牌
            </Text>
            <Text fontSize={12} color="#92400E" fontWeight="600">
              共 {brandList.length - 1} 个品牌
            </Text>
          </YStack>
        </XStack>
        <Pressable onPress={onClose}>
          <XStack
            paddingHorizontal="$3"
            paddingVertical="$2"
            backgroundColor="white"
            borderRadius="$8"
            alignItems="center"
            gap="$2"
            borderWidth={1.5}
            borderColor="#FDE68A"
          >
            <IconSymbol name="xmark" size={14} color="#D97706" />
            <Text fontSize={13} color="#D97706" fontWeight="700">
              收起
            </Text>
          </XStack>
        </Pressable>
      </XStack>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
      >
        {brandList.map((brand) => (
          <Pressable key={brand} onPress={() => onSelectBrand(brand)}>
            <YStack
              paddingHorizontal="$4"
              paddingVertical="$3"
              borderRadius="$10"
              backgroundColor={selectedBrand === brand ? '#F97316' : 'white'}
              borderWidth={2}
              borderColor={selectedBrand === brand ? '#EA580C' : '#FED7AA'}
              minWidth={90}
              alignItems="center"
              gap="$1.5"
            >
              <Text
                fontSize={15}
                color={selectedBrand === brand ? 'white' : '#78350F'}
                fontWeight="800"
                numberOfLines={1}
                letterSpacing={0.3}
              >
                {brand === 'all' ? '全部' : brand}
              </Text>
              <YStack
                paddingHorizontal="$2"
                paddingVertical="$0.5"
                backgroundColor={selectedBrand === brand ? 'rgba(255,255,255,0.2)' : '#FEF3C7'}
                borderRadius="$6"
              >
                <Text
                  fontSize={12}
                  color={selectedBrand === brand ? 'white' : '#92400E'}
                  fontWeight="700"
                >
                  {brandCounts[brand] || 0} 个
                </Text>
              </YStack>
            </YStack>
          </Pressable>
        ))}
      </ScrollView>
    </YStack>
  );
}
