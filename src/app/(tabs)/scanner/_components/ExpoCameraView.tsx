// import { IconSymbol } from '@/src/components/ui/IconSymbol';
// import type { ExpoBarcodeResult } from '@/src/types/camera';
// import { ScanType } from '@/src/types/camera';
// import { CameraType, CameraView } from 'expo-camera';
// import React from 'react';
// import { StyleSheet, TouchableOpacity } from 'react-native';
// import { Text, YStack } from 'tamagui';

// interface ExpoCameraViewProps {
//   // 修改点：允许 CameraView | null，解决 RefObject 类型不匹配报错
//   cameraRef: React.RefObject<CameraView | null>;
//   facing: 'front' | 'back';
//   scanType: ScanType;
//   onClose: () => void;
//   onToggleCamera: () => void;
//   onToggleScanType: () => void;
//   onCameraReady: () => void;
//   onBarCodeScanned: (result: ExpoBarcodeResult) => void;
//   onTakePhoto: () => void;
// }

// export function ExpoCameraView({
//   cameraRef,
//   facing,
//   scanType,
//   onClose,
//   onToggleCamera,
//   onToggleScanType,
//   onCameraReady,
//   onBarCodeScanned,
//   onTakePhoto,
// }: ExpoCameraViewProps) {

//   return (
//     <YStack flex={1} backgroundColor="black">
//       {/* 相机预览区域 */}
//       <YStack flex={1} position="relative">
//         <CameraView
//           ref={cameraRef}
//           style={StyleSheet.absoluteFill}
//           facing={facing as CameraType}
//           onCameraReady={onCameraReady}
//           // 仅在 Barcode 模式下启用扫描器设置
//           barcodeScannerSettings={{
//             barcodeTypes: [
//               'qr',
//               'ean13',
//               'ean8',
//               'code128',
//               'code39',
//               'upc_e',
//               'upc_a'
//             ],
//           }}
//           // 仅在 Barcode 模式下绑定回调
//           onBarcodeScanned={scanType === ScanType.BARCODE ? onBarCodeScanned : undefined}
//         />

//         {/* 顶部工具栏 (浮动在相机之上) */}
//         <YStack
//           position="absolute"
//           top={0}
//           left={0}
//           right={0}
//           paddingHorizontal={16}
//           paddingTop={50} // 避开刘海屏
//           paddingBottom={12}
//           flexDirection="row"
//           justifyContent="space-between"
//           alignItems="center"
//           zIndex={10}
//         >
//           <TouchableOpacity onPress={onClose} style={styles.iconButton}>
//             <IconSymbol name="xmark" size={24} color="white" />
//           </TouchableOpacity>

//           <Text fontSize={16} fontWeight="600" color="white" style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }}>
//             {scanType === ScanType.BARCODE ? '扫描条形码' : '拍照识别成分'}
//           </Text>

//           <TouchableOpacity onPress={onToggleCamera} style={styles.iconButton}>
//             <IconSymbol name="camera.rotate" size={24} color="white" />
//           </TouchableOpacity>
//         </YStack>

//         {/* 中间扫描框 UI */}
//         <YStack
//             position="absolute"
//             top={0}
//             left={0}
//             right={0}
//             bottom={0}
//             justifyContent="center"
//             alignItems="center"
//             pointerEvents="none" // 让点击穿透
//         >
//             {scanType === ScanType.BARCODE ? (
//                 // 条码扫描框
//                 <YStack
//                     width={260}
//                     height={260}
//                     borderWidth={2}
//                     borderColor="#00FFFF"
//                     borderRadius={12}
//                     justifyContent="center"
//                     alignItems="center"
//                     backgroundColor="rgba(0,0,0,0.1)"
//                 >
//                     <YStack
//                         width="90%"
//                         height={2}
//                         backgroundColor="#00FFFF"
//                         opacity={0.8}
//                     />
//                     <Text color="white" fontSize={12} position="absolute" bottom={-30}>
//                         将条码对准框内
//                     </Text>
//                 </YStack>
//             ) : (
//                 // OCR 拍照框 (通常是矩形或者无框，这里做一个宽矩形示意)
//                 <YStack
//                     width="90%"
//                     height={400}
//                     borderWidth={1}
//                     borderColor="rgba(255,255,255,0.5)"
//                     borderRadius={20}
//                     borderStyle="dashed"
//                 >
//                      <Text color="white" fontSize={12} position="absolute" bottom={-30} alignSelf="center">
//                         确保配料表文字清晰可见
//                     </Text>
//                 </YStack>
//             )}
//         </YStack>

//         {/* 底部操作栏 */}
//         <YStack
//           position="absolute"
//           bottom={0}
//           left={0}
//           right={0}
//           paddingHorizontal={30}
//           paddingBottom={50}
//           flexDirection="row"
//           justifyContent="space-between"
//           alignItems="center"
//           zIndex={10}
//         >
//           {/* 切换模式按钮 */}
//           <TouchableOpacity
//             onPress={onToggleScanType}
//             style={styles.modeButton}
//           >
//             <IconSymbol
//                 name={scanType === ScanType.BARCODE ? "doc.text.viewfinder" : "barcode.viewfinder"}
//                 size={20}
//                 color="white"
//             />
//             <Text color="white" fontSize={13} marginLeft={6} fontWeight="600">
//               {scanType === ScanType.BARCODE ? '去拍照' : '去扫码'}
//             </Text>
//           </TouchableOpacity>

//           {/* 拍照按钮 (仅 OCR 模式显示，Barcode 模式自动触发) */}
//           {scanType === ScanType.OCR && (
//             <TouchableOpacity
//               onPress={onTakePhoto}
//               style={styles.captureButton}
//               testID="capture-button"
//             >
//               <YStack width={64} height={64} borderRadius={32} backgroundColor="white" />
//             </TouchableOpacity>
//           )}

//           {/* 占位，保持布局平衡 */}
//           {scanType === ScanType.BARCODE && <YStack width={40} />}
//         </YStack>
//       </YStack>
//     </YStack>
//   );
// }

// const styles = StyleSheet.create({
//   iconButton: {
//     padding: 8,
//     backgroundColor: 'rgba(0,0,0,0.3)',
//     borderRadius: 20,
//   },
//   modeButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 24,
//   },
//   captureButton: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     borderWidth: 4,
//     borderColor: 'rgba(255,255,255,0.5)',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'transparent',
//   }
// });


import { IconSymbol } from '@/src/components/ui/IconSymbol';
import type { ExpoBarcodeResult } from '@/src/types/camera';
import { ScanType } from '@/src/types/camera';
import { CameraType, CameraView } from 'expo-camera';
import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, YStack } from 'tamagui';

// 支持的条码类型（与组件配置一致）
export const SUPPORTED_BARCODE_TYPES = [
  'qr',
  'ean13',
  'ean8',
  'code128',
  'code39',
  'upc_e',
  'upc_a'
] as const;

// 防抖间隔（毫秒）
const SCAN_DEBOUNCE_TIME = 1000;

// EAN13格式校验（13位纯数字）
const isValidEAN13 = (data: string): boolean => {
  return /^\d{13}$/.test(data);
};

// 通用条码数据校验
const isValidBarcodeData = (
  data: string | null | undefined,
  type: string
): boolean => {
  // 非空校验
  if (!data || data.trim() === '') return false;

  // 类型校验（仅支持配置的条码类型）
  if (!SUPPORTED_BARCODE_TYPES.includes(type as (typeof SUPPORTED_BARCODE_TYPES)[number])) {
    return false;
  }

  // EAN13特殊格式校验
  if (type === 'ean13' && !isValidEAN13(data)) {
    return false;
  }

  return true;
};

interface ExpoCameraViewProps {
  cameraRef: React.RefObject<CameraView | null>;
  facing: 'front' | 'back';
  scanType: ScanType;
  onClose: () => void;
  onToggleCamera: () => void;
  onToggleScanType: () => void;
  onCameraReady: () => void;
  onBarCodeScanned: (result: ExpoBarcodeResult) => void;
  onTakePhoto: () => void;
  // 可选配置：防抖时间（默认1秒）
  debounceTime?: number;
}

export function ExpoCameraView({
  cameraRef,
  facing,
  scanType,
  onClose,
  onToggleCamera,
  onToggleScanType,
  onCameraReady,
  onBarCodeScanned,
  onTakePhoto,
  debounceTime = SCAN_DEBOUNCE_TIME,
}: ExpoCameraViewProps) {
  // 相机就绪状态
  const [isCameraReady, setIsCameraReady] = useState(false);

  // 防抖相关：上次扫描的条码数据、上次扫描时间
  const lastScannedData = useRef<string | null>(null);
  const lastScanTime = useRef<number>(0);

  // 相机就绪回调（新增状态管理）
  const handleCameraReady = useCallback(() => {
    setIsCameraReady(true);
    onCameraReady();
  }, [onCameraReady]);

  // 条码扫描处理（新增防抖+数据校验）
  const handleBarCodeScanned = useCallback(
    (result: ExpoBarcodeResult) => {
      // 仅在Barcode模式 + 相机就绪时处理
      if (scanType !== ScanType.BARCODE || !isCameraReady) return;

      const { data, type } = result;
      const currentTime = Date.now();

      // 1. 数据有效性校验
      if (!isValidBarcodeData(data, type)) return;

      // 2. 防抖逻辑（相同条码1秒内不重复触发）
      if (
        lastScannedData.current === data &&
        currentTime - lastScanTime.current < debounceTime
      ) {
        return;
      }

      // 3. 触发回调并更新防抖状态
      lastScannedData.current = data;
      lastScanTime.current = currentTime;
      onBarCodeScanned(result);
    },
    [scanType, isCameraReady, onBarCodeScanned, debounceTime]
  );

  return (
    <YStack flex={1} backgroundColor="black">
      {/* 相机预览区域 */}
      <YStack flex={1} position="relative">
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing as CameraType}
          onCameraReady={handleCameraReady}
          // 仅在 Barcode 模式下启用扫描器设置
          barcodeScannerSettings={{
            barcodeTypes: [...SUPPORTED_BARCODE_TYPES],
          }}
          // 仅在 Barcode 模式下绑定回调
          onBarcodeScanned={scanType === ScanType.BARCODE ? handleBarCodeScanned : undefined}
        />

        {/* 顶部工具栏 (浮动在相机之上) */}
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          paddingHorizontal={16}
          paddingTop={50} // 避开刘海屏
          paddingBottom={12}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          zIndex={10}
        >
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <IconSymbol name="xmark" size={24} color="white" />
          </TouchableOpacity>

          <Text fontSize={16} fontWeight="600" color="white" style={{ textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 }}>
            {scanType === ScanType.BARCODE ? '扫描条形码' : '拍照识别成分'}
          </Text>

          <TouchableOpacity onPress={onToggleCamera} style={styles.iconButton}>
            <IconSymbol name="camera.rotate" size={24} color="white" />
          </TouchableOpacity>
        </YStack>

        {/* 中间扫描框 UI */}
        <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            justifyContent="center"
            alignItems="center"
            pointerEvents="none" // 让点击穿透
        >
            {scanType === ScanType.BARCODE ? (
                // 条码扫描框
                <YStack
                    width={260}
                    height={260}
                    borderWidth={2}
                    borderColor="#00FFFF"
                    borderRadius={12}
                    justifyContent="center"
                    alignItems="center"
                    backgroundColor="rgba(0,0,0,0.1)"
                >
                    <YStack
                        width="90%"
                        height={2}
                        backgroundColor="#00FFFF"
                        opacity={0.8}
                    />
                    <Text color="white" fontSize={12} position="absolute" bottom={-30}>
                        将条码对准框内
                    </Text>
                </YStack>
            ) : (
                // OCR 拍照框 (通常是矩形或者无框，这里做一个宽矩形示意)
                <YStack
                    width="90%"
                    height={400}
                    borderWidth={1}
                    borderColor="rgba(255,255,255,0.5)"
                    borderRadius={20}
                    borderStyle="dashed"
                >
                     <Text color="white" fontSize={12} position="absolute" bottom={-30} alignSelf="center">
                        确保配料表文字清晰可见
                    </Text>
                </YStack>
            )}
        </YStack>

        {/* 底部操作栏 */}
        <YStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          paddingHorizontal={30}
          paddingBottom={50}
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          zIndex={10}
        >
          {/* 切换模式按钮 */}
          <TouchableOpacity
            onPress={onToggleScanType}
            style={styles.modeButton}
          >
            <IconSymbol
                name={scanType === ScanType.BARCODE ? "doc.text.viewfinder" : "barcode.viewfinder"}
                size={20}
                color="white"
            />
            <Text color="white" fontSize={13} marginLeft={6} fontWeight="600">
              {scanType === ScanType.BARCODE ? '去拍照' : '去扫码'}
            </Text>
          </TouchableOpacity>

          {/* 拍照按钮 (仅 OCR 模式显示，Barcode 模式自动触发) */}
          {scanType === ScanType.OCR && (
            <TouchableOpacity
              onPress={onTakePhoto}
              style={styles.captureButton}
              testID="capture-button"
            >
              <YStack width={64} height={64} borderRadius={32} backgroundColor="white" />
            </TouchableOpacity>
          )}

          {/* 占位，保持布局平衡 */}
          {scanType === ScanType.BARCODE && <YStack width={40} />}
        </YStack>
      </YStack>
    </YStack>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  }
});
