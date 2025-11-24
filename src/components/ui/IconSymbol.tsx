import Ionicons from '@expo/vector-icons/Ionicons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof Ionicons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // 底部tabs
  'doc.text.fill': 'document-text-outline',
  'bubble.left.and.bubble.right.fill': 'chatbubbles-outline',
  'viewfinder.circle.fill': 'scan-outline',
  'cart.fill': 'cart-outline',
  'person.fill': 'person-outline',
  // 相机
  'camera.fill': 'camera',
  xmark: 'close',
  'arrow.triangle.2.circlepath.camera': 'camera-reverse',
  'photo.fill.on.rectangle.fill': 'image-outline',
  'camera.rotate': 'camera-reverse',
  // 宠物相关
  'pawprint.fill': 'paw',
  // 编辑
  pencil: 'pencil',
  // 搜索
  magnifyingglass: 'search',
  // 列表
  'list.bullet': 'list',
  // 建筑/品牌
  'building.2.fill': 'business',
  'building.2': 'business-outline',
  // 刷新/重试
  'arrow.counterclockwise': 'refresh',
  'arrow.clockwise': 'reload',
  // 状态图标
  'checkmark.circle.fill': 'checkmark-circle',
  'checkmark.shield.fill': 'shield-checkmark',
  'checkmark.seal.fill': 'ribbon',
  'xmark.circle.fill': 'close-circle',
  'questionmark.circle.fill': 'help-circle',
  'exclamationmark.circle': 'alert-circle-outline',
  'exclamationmark.triangle': 'warning-outline',
  // 图片
  photo: 'image-outline',
  'photo.badge.plus': 'add-circle-outline',
  // 星星/爱心
  'star.fill': 'star',
  'heart.fill': 'heart',
  'heart.slash': 'heart-dislike',
  'trophy.fill': 'trophy',
  // 托盘
  'tray.fill': 'file-tray-full',
  // 图表
  'chart.line.uptrend.xyaxis': 'trending-up',
  'chart.bar.fill': 'bar-chart',
  'chart.pie.fill': 'pie-chart',
  'chart.bar.xaxis': 'stats-chart',
  'list.bullet.rectangle': 'list-outline',
  'chart.bar.doc.horizontal.fill': 'document-text',
  // 信息
  'info.circle.fill': 'information-circle',
  // 时钟
  clock: 'time-outline',
  // 条形码
  'barcode.viewfinder': 'barcode-outline',
  // Scanner相关
  'camera.metering.center.weighted': 'camera',
  // 文档
  'doc.on.doc': 'copy-outline',
  'doc.text.viewfinder': 'document-text',
  'doc.text.magnifyingglass': 'document-text-outline',
  // 灯泡
  'lightbulb.fill': 'bulb',
  // 箭头
  'chevron.right': 'chevron-forward',
  'arrow.left': 'arrow-back',
  // 闪光
  sparkles: 'sparkles',
  // 锁
  'lock.fill': 'lock-closed',
  'key.fill': 'key',
  // 评论
  'bubble.left': 'chatbubble-outline',
  // 发送
  'paperplane.fill': 'send',
  // 垃圾桶
  trash: 'trash-outline',
  // 添加
  'plus.circle.fill': 'add-circle',
  // 退出
  'rectangle.portrait.and.arrow.right': 'exit-outline',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <Ionicons color={color} size={size} name={MAPPING[name]} style={style} />;
}
