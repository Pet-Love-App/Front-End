import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { StyleSheet, TouchableOpacity } from 'react-native';

/**
 * 📝 第一部分：定义 Props
 */
interface CameraPermissionProps {
  /**
   * 请求权限按钮点击事件
   * 用户点击"授予权限"按钮时调用
   */
  onRequestPermission: () => void;
}

/**
 * 🔐 第二部分：权限请求组件
 * 
 * 用途：当用户没有授权相机权限时显示
 * 
 * 设计理念：
 * - 友好的提示文字
 * - 清晰的图标
 * - 明显的按钮
 * 
 * 📖 使用示例：
 * <CameraPermission 
 *   onRequestPermission={() => requestPermission()} 
 * />
 */
export function CameraPermission({ onRequestPermission }: CameraPermissionProps) {
  
  // 获取当前主题（深色/浅色）
  const colorScheme = useColorScheme();
  
  // 获取主题色（蓝色/白色）
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  console.log('🔐 显示权限请求界面');

  return (
    // ===== 最外层容器（自动适配主题） =====
    <ThemedView style={styles.container}>
      
      {/* ===== 相机图标 ===== */}
      <IconSymbol 
        name="camera.fill"   // 相机图标
        size={80}            // 大尺寸
        color={tintColor}    // 主题色
      />

      {/* ===== 标题 ===== */}
      <ThemedText type="title" style={styles.title}>
        需要相机权限
      </ThemedText>

      {/* ===== 说明文字 ===== */}
      <ThemedText style={styles.description}>
        为了拍摄宠物照片，我们需要访问您的相机
      </ThemedText>

      {/* ===== 授权按钮 ===== */}
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: tintColor }]} 
        onPress={onRequestPermission}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.buttonText}>
          授予权限
        </ThemedText>
      </TouchableOpacity>
      
    </ThemedView>
  );
}

/**
 * 🎨 第三部分：样式
 */
const styles = StyleSheet.create({
  /**
   * 容器：垂直居中布局
   */
  container: {
    flex: 1,
    justifyContent: 'center',  // 垂直居中
    alignItems: 'center',      // 水平居中
    padding: 20,
  },
  
  /**
   * 标题：顶部间距
   */
  title: {
    marginTop: 20,
    marginBottom: 10,
  },
  
  /**
   * 说明文字：居中对齐，半透明
   */
  description: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,  // 70% 不透明度
  },
  
  /**
   * 按钮：圆角，内边距
   */
  button: {
    paddingHorizontal: 30,  // 左右内边距
    paddingVertical: 15,    // 上下内边距
    borderRadius: 10,       // 圆角
  },
  
  /**
   * 按钮文字：白色，粗体
   */
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});