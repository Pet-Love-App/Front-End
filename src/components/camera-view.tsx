import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';

import { LottieAnimation } from '@/src/components/lottie-animation';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import type { CameraFacing } from '@/src/types/camera';


interface CameraViewComponentProps {
    cameraRef: React.RefObject<CameraView | null>;
    facing: CameraFacing;
    onCapture: () => void;
    onToggleFacing: () => void;
    onClose?: () => void;
    onCameraReady?: () => void;
    onPickFromLibrary?: () => void;
}

export function CameraViewComponent({
    cameraRef,
    facing,
    onCapture,
    onToggleFacing,
    onClose,
    onCameraReady,
    onPickFromLibrary,
}: CameraViewComponentProps) {
    return (
        <View style={styles.container}>
            <LottieAnimation
                source={require('@/assets/animations/orange_cat_peeping.json')}  // json文件路径
                width={200}
                height={200}
            />
            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                onCameraReady={onCameraReady}
            >
                <View style={styles.topBar}>
                    {onClose && (
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={onClose}
                            activeOpacity={0.7}
                        >
                            <IconSymbol
                                name="xmark"
                                size={28}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        // left button should open photo library when provided
                        onPress={onPickFromLibrary ?? onToggleFacing}
                        activeOpacity={0.7}
                    >
                        <IconSymbol
                        name="photo.fill.on.rectangle.fill"
                        size={32}
                        color="#fff"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={onCapture}
                        activeOpacity={0.8}
                    >
                        <View style={styles.captureButtonInner} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onToggleFacing}
                        activeOpacity={0.7}
                    >
                        <IconSymbol
                        name="arrow.triangle.2.circlepath.camera"
                        size={32}
                        color="#fff"
                        />
                    </TouchableOpacity>
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    camera: {
        flex: 0.7,
        backgroundColor: '#000',
        marginTop: "40%",
        width: "90%",
        height: "60%",
        marginLeft: "auto",
        marginRight: "auto",
        borderRadius: 50,
        borderWidth: 10,
        borderColor: '#FEBE98'
    },

    topBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: "7%",
    },

    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: "8%",
        paddingBottom: "7%",
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },

    iconButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 25,
    },

    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },

    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
});
