import type { CameraFacing, CameraOptions, CameraPhoto, CameraState } from '@/src/types/camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useRef, useState } from 'react';

/**
* 相机功能的自定义 Hook
* 
* 使用示例：
* const { state, cameraRef, takePicture, toggleFacing, requestPermission } = useCamera();
*/
export function useCamera() {
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraFacing>('back');
    const [isReady, setIsReady] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    
    const state: CameraState = {
        hasPermission: permission?.granted ?? null,
        isReady,
        facing,
    };
    
    const takePicture = useCallback(async (
        options: CameraOptions = {}
    ): Promise<CameraPhoto | null> => {
        if (!cameraRef.current) {
            console.warn('相机未准备好');
            return null;
        }
        
        if (!permission?.granted) {
            console.warn('没有相机权限');
            return null;
        }
        
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: options.quality ?? 0.8,
                base64: options.base64 ?? false,
                skipProcessing: options.skipProcessing ?? false,
            });
            
            return photo as CameraPhoto;
        } catch (error) {
            console.error('拍照失败:', error);
            return null;
        }
    }, [permission]);
    
    const toggleFacing = useCallback(() => {
        setFacing(current => current === 'back' ? 'front' : 'back');
    }, []);
    
    const onCameraReady = useCallback(() => {
        setIsReady(true);
    }, []);
    
    return {
        state,
        cameraRef,
        takePicture,
        toggleFacing,
        requestPermission,
        onCameraReady,
    };
}