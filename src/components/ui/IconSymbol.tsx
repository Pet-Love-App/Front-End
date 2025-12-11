import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import Ionicons from '@expo/vector-icons/Ionicons';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof Ionicons>['name']>;

/** 可用的图标名称类型 */
export type SymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 *
 * Android兼容性优化说明：
 * - 所有映射都使用Ionicons标准图标名称
 * - 确保在Android平台上能正常显示
 */
const MAPPING = {
  // ==================== 底部Tabs ====================
  'doc.text.fill': 'document-text',
  'bubble.left.and.bubble.right.fill': 'chatbubbles',
  'viewfinder.circle.fill': 'scan-circle',
  'cart.fill': 'cart',
  'person.fill': 'person',

  // ==================== 相机相关 ====================
  'camera.fill': 'camera',
  'camera.rotate': 'camera-reverse',
  'camera.metering.center.weighted': 'camera-outline',
  'arrow.triangle.2.circlepath.camera': 'camera-reverse-outline',

  // ==================== 基础操作图标 ====================
  xmark: 'close',
  'xmark.circle.fill': 'close-circle',
  'checkmark.circle.fill': 'checkmark-circle',
  'checkmark.shield.fill': 'shield-checkmark',
  'checkmark.seal.fill': 'medal',
  'plus.circle.fill': 'add-circle',

  // ==================== 文档相关 ====================
  'doc.text.viewfinder': 'reader',
  'doc.text.magnifyingglass': 'search',
  'doc.on.doc': 'copy',
  'photo.fill.on.rectangle.fill': 'images',
  photo: 'image',
  'photo.badge.plus': 'image-outline',

  // ==================== 图表相关 ====================
  'chart.bar.fill': 'bar-chart',
  'chart.pie.fill': 'pie-chart',
  'chart.bar.xaxis': 'stats-chart',
  'chart.line.uptrend.xyaxis': 'trending-up',
  'chart.bar.doc.horizontal.fill': 'stats-chart',
  'list.bullet.rectangle': 'list',

  // ==================== 状态和提示图标 ====================
  'exclamationmark.circle': 'alert-circle',
  'exclamationmark.triangle': 'warning',
  'questionmark.circle.fill': 'help-circle',
  'info.circle.fill': 'information-circle',
  'lightbulb.fill': 'bulb',
  sparkles: 'sparkles-outline',

  // ==================== 导航和箭头 ====================
  'chevron.right': 'chevron-forward',
  'arrow.left': 'arrow-back',
  'arrow.counterclockwise': 'refresh',
  'arrow.clockwise': 'reload',

  // ==================== 搜索和过滤 ====================
  magnifyingglass: 'search',
  'barcode.viewfinder': 'barcode',

  // ==================== 社交和互动 ====================
  'star.fill': 'star',
  'heart.fill': 'heart',
  'heart.slash': 'heart-dislike',
  'trophy.fill': 'trophy',

  // ==================== 宠物相关 ====================
  'pawprint.fill': 'paw',

  // ==================== 列表和组织 ====================
  'list.bullet': 'list',
  'tray.fill': 'file-tray-full',

  // ==================== 建筑/品牌 ====================
  'building.2.fill': 'business',
  'building.2': 'business-outline',

  // ==================== 编辑工具 ====================
  pencil: 'pencil',
  trash: 'trash',

  // ==================== 安全相关 ====================
  'lock.fill': 'lock-closed',
  'key.fill': 'key',

  // ==================== 通讯相关 ====================
  'bubble.left': 'chatbubble',
  'paperplane.fill': 'send',
  'bell.fill': 'notifications',
  'bell.badge.fill': 'notifications',
  bell: 'notifications-outline',

  // ==================== 系统操作 ====================
  'rectangle.portrait.and.arrow.right': 'exit',
  clock: 'time',
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
  name: SymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <Ionicons color={color} size={size} name={MAPPING[name]} style={style} />;
}
