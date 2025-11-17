import { Modal, TouchableOpacity } from 'react-native';
import { Button, Card, Text, XStack, YStack } from 'tamagui';

interface Additive {
  name: string;
  type?: string;
  en_name?: string;
  applicable_range?: string;
}

interface AdditiveDetailModalProps {
  visible: boolean;
  additive: Additive | null;
  onClose: () => void;
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <XStack space="$2" marginBottom="$3">
      <Text fontSize="$3" fontWeight="600" color="$gray11" width={80}>
        {label}
      </Text>
      <Text fontSize="$3" color="$color" flex={1} lineHeight="$1">
        {value}
      </Text>
    </XStack>
  );
}

export function AdditiveDetailModal({ visible, additive, onClose }: AdditiveDetailModalProps) {
  if (!additive) return null;

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
        }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={{ width: '85%', maxWidth: 400 }}>
          <Card elevate padding="$6" backgroundColor="$background" borderRadius="$5">
            <YStack space="$4">
              {/* 标题 */}
              <Text
                fontSize="$7"
                fontWeight="bold"
                textAlign="center"
                color="$orange10"
                marginBottom="$2"
              >
                {additive.name}
              </Text>

              {/* 详细信息 */}
              {additive.en_name && <DetailRow label="英文名：" value={additive.en_name} />}
              <DetailRow label="类别：" value={additive.type || '未分类'} />
              <DetailRow label="适用范围：" value={additive.applicable_range || '暂无说明'} />

              {/* 关闭按钮 */}
              <Button
                size="$4"
                backgroundColor="$orange10"
                color="white"
                fontWeight="600"
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
          </Card>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
