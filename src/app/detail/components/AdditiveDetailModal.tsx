import { Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Separator, Text, XStack, YStack } from 'tamagui';
import { Button } from '@/src/design-system/components';

import type { Additive } from '@/src/lib/supabase';

interface BaikeInfo {
  title: string;
  extract: string;
}

interface AdditiveDetailModalProps {
  visible: boolean;
  additive: Additive | null;
  baikeInfo?: BaikeInfo | null;
  onClose: () => void;
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <XStack gap="$2" marginBottom="$3" flexWrap="wrap">
      <Text fontSize="$3" fontWeight="600" color="$gray11" minWidth={70} flexShrink={0}>
        {label}
      </Text>
      <Text fontSize="$3" color="$color" flex={1} lineHeight="$1" flexShrink={1}>
        {value}
      </Text>
    </XStack>
  );
}

export function AdditiveDetailModal({
  visible,
  additive,
  baikeInfo,
  onClose,
}: AdditiveDetailModalProps) {
  if (!additive && !baikeInfo) return null;

  const displayName = additive?.name || baikeInfo?.title || '详细信息';

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{ width: '100%', maxWidth: 450, maxHeight: '80%' }}
        >
          <Card padding="$5" backgroundColor="$background" borderRadius="$5" bordered>
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack gap="$4">
                {/* 标题 */}
                <Text
                  fontSize="$7"
                  fontWeight="bold"
                  textAlign="center"
                  color="$orange10"
                  marginBottom="$2"
                >
                  {displayName}
                </Text>

                {/* 数据库信息 */}
                {additive && (
                  <YStack gap="$3">
                    <Text fontSize="$5" fontWeight="600" color="$blue10">
                      📊 数据库信息
                    </Text>
                    {additive.enName && <DetailRow label="英文名：" value={additive.enName} />}
                    <DetailRow label="类别：" value={additive.type || '未分类'} />
                    <DetailRow label="适用范围：" value={additive.applicableRange || '暂无说明'} />
                  </YStack>
                )}

                {/* 分隔线 */}
                {additive && baikeInfo && (
                  <Separator marginVertical="$2" borderColor="$borderColor" />
                )}

                {/* 百度百科信息 */}
                {baikeInfo && (
                  <YStack gap="$3">
                    <Text fontSize="$5" fontWeight="600" color="$green10">
                      📖 百度百科
                    </Text>
                    <Text fontSize="$3" color="$color" lineHeight="$4">
                      {baikeInfo.extract}
                    </Text>
                  </YStack>
                )}

                {/* 关闭按钮 */}
                <Button
                  size="md"
                  variant="primary"
                  backgroundColor="$orange10"
                  marginTop="$2"
                  onPress={onClose}
                  pressStyle={{
                    backgroundColor: '$orange9',
                    scale: 0.98,
                  }}
                >
                  关闭
                </Button>
              </YStack>
            </ScrollView>
          </Card>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
