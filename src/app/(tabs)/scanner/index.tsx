import { CameraPermission } from '@/src/components/camera-permission';
import { CameraViewComponent } from '@/src/components/camera-view';
import { LottieAnimation } from '@/src/components/lottie-animation';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useCamera } from '@/src/hooks/use-camera';
import type { CameraPhoto } from '@/src/types/camera';
import { useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';


export default function ScannerScreen() {
    const {
        state,
        cameraRef,
        takePicture,
        toggleFacing,
        requestPermission,
        onCameraReady,
    } = useCamera();
    
    const [photo, setPhoto] = useState<CameraPhoto | null>(null);
    const [showCamera, setShowCamera] = useState(false);

    const handleCapture = async () => {
        const result = await takePicture({ 
            quality: 0.8  
        });
        
        if (result) {
            setPhoto(result);        
            setShowCamera(false);      
        } else {
            Alert.alert(
                '拍照失败', 
                '请重试',
                [{ text: '确定' }]
            );
        }
    };
    
    const openCamera = () => {
        if (state.hasPermission) {
            setShowCamera(true);
        } else {
            requestPermission();
        }
    };
    
    const closeCamera = () => {
        setShowCamera(false);
    };
    
    
    const retakePhoto = () => {
        setPhoto(null);       
        setShowCamera(true);   
    };
    
    
    const identifyPet = () => {
        // TODO: 接入 AI 识别 API
        Alert.alert(
            '识别功能', 
            '即将接入 AI 识别，敬请期待！',
            [{ text: '好的' }]
        );
    };
    
    
    if (showCamera) {
        if (!state.hasPermission) {    
            return (
                <CameraPermission 
                onRequestPermission={requestPermission} 
                />
            );
        }
        
        return (
            <CameraViewComponent
            cameraRef={cameraRef}             
            facing={state.facing}             
            onCapture={handleCapture}         
            onToggleFacing={toggleFacing}      
            onClose={closeCamera}              
            onCameraReady={onCameraReady}     
            />
        );
    }
    
    return (
        <ThemedView style={styles.container}>
            <ThemedText type="title" style={styles.title}>
            猫粮成分智能分析
            </ThemedText>
            <ThemedText style={styles.description}>
            拍照即可获得专业的添加剂成分分析报告
            </ThemedText>

            <LottieAnimation 
            source={require('@/assets/animations/cat_thinking_animation.json')}
            width={100}
            height={100}
            />
            <ThemedText style={styles.query}>
            你买的猫粮到底安不安全？
            </ThemedText>

            {photo && (
                <View style={styles.photoContainer}>
                <Image 
                source={{ uri: photo.uri }} 
                style={styles.photo} 
                resizeMode="cover"  // 裁剪填充
                />
                
                {/* 照片信息 */}
                <ThemedText style={styles.photoInfo}>
                尺寸: {photo.width} × {photo.height}
                </ThemedText>
                </View>
            )}
            
            {/* ===== 拍照按钮 ===== */}
            <TouchableOpacity 
            style={styles.button} 
            onPress={photo ? retakePhoto : openCamera}
            activeOpacity={0.8}
            >
            <ThemedText style={styles.buttonText}>
            {photo ? '🔄 重新拍照' : '📷 开始拍照'}
            </ThemedText>
            </TouchableOpacity>
            
            {/* ===== 识别按钮（只有拍照后才显示） ===== */}
            {photo && (
                <TouchableOpacity 
                style={[styles.button, styles.identifyButton]} 
                onPress={identifyPet}
                activeOpacity={0.8}
                >
                <ThemedText style={styles.buttonText}>
                🤖 识别品种
                </ThemedText>
                </TouchableOpacity>
            )}
            
            {/* ===== 提示文字（没有照片时显示） ===== */}
            {!photo && (
                <ThemedText style={styles.hint}>
                💡 提示：拍摄清晰的宠物正面照效果最佳
                </ThemedText>
            )}
        
        </ThemedView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        
    },

    title: {
        marginBottom: 10,
        position: 'absolute',
        top: "7%",
        fontFamily: 'MaoKen'
    },

    query: {

    },
    
    /**
    * 说明文字：居中对齐，半透明，底部间距
    */
    description: {
        textAlign: 'center',
        marginBottom: 30,
        opacity: 0.7,
        paddingHorizontal: 20,
    },
    
    /**
    * 照片容器：圆角，阴影
    */
    photoContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    
    /**
    * 照片：正方形，圆角
    */
    photo: {
        width: 300,
        height: 300,
        borderRadius: 15,
        marginBottom: 10,
    },
    
    /**
    * 照片信息：小字体，半透明
    */
    photoInfo: {
        fontSize: 12,
        opacity: 0.6,
    },
    
    /**
    * 按钮：蓝色背景，圆角，固定宽度
    */
    button: {
        backgroundColor: '#0a7ea4',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 10,
        marginBottom: 15,
        minWidth: 200,
        alignItems: 'center',
        
        // 阴影效果（iOS）
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        
        // 阴影效果（Android）
        elevation: 5,
    },
    
    /**
    * 识别按钮：绿色背景
    */
    identifyButton: {
        backgroundColor: '#34C759',
    },
    
    /**
    * 按钮文字：白色，粗体
    */
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    
    /**
    * 提示文字：小字体，居中，半透明
    */
    hint: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.5,
        marginTop: 20,
        paddingHorizontal: 30,
    },
});