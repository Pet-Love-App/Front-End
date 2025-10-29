import { CollectCard } from '@/src/components/collect-card';
import { LottieAnimation } from '@/src/components/lottie-animation';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';

//顶部的搜索栏，支持输入文字
export default function CollectScreen() {
    const [searchText, setSearchText] = useState('');
    return (
        <ThemedView style={styles.container}>
            <View style={styles.searchBar}>
                <Image source={require('@/assets/appIcon.png')} style={styles.searchIcon} />
                <ThemedText style={styles.searchInput} onPress={() => Alert.alert('搜索', '点击了搜索栏')}>
                    {searchText || '搜索历史报告...'}
                    
                </ThemedText>
            </View>
            {/* 这里从本地搜索结果列表 */}
            <CollectCard 
                tag1="成猫粮"
                tag2="高蛋白"
                name="皇家猫粮 K36"
                description="专为成年猫设计的营养配方，含有高品质蛋白质和必需营养素"
                collectCount={12345}
                onPress={() => Alert.alert('提示', '点击了卡片')}
                onLongPress={() => Alert.alert('提示', '长按了卡片')}
            />
            <BottomAnimation />
        </ThemedView>
    );
}


//底部显示一个动画
export function BottomAnimation() {
    return (
        <LottieAnimation
            source={require('@/assets/animations/cat_mark_loading.json')}
            width={150}
            height={150}
        />
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    searchBar: {
        top: "7%",
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
    },
    searchIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#888',
    },
});