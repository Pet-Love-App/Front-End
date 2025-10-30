import { CollectCard } from '@/src/components/collect-card';
import { LottieAnimation } from '@/src/components/lottie-animation';
import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { useCollectDatabase } from '@/src/database/useCollectDatabase';
import { CatFoodCollectItem } from '@/src/types/collect';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, Image, ScrollView, StyleSheet, View } from 'react-native';

//顶部的搜索栏，支持输入文字
export default function CollectScreen() {
    const [searchText, setSearchText] = useState('');
    const {collects, loadCollects, deleteCollect, addCollect} = useCollectDatabase();
    const router = useRouter();
    
    // 初始加载数据
    useEffect(() => {
        loadCollects();
    }, []);
    
    // 添加测试数据的函数
    const addTestData = async () => {
        const testData: CatFoodCollectItem[] = [
            {
                id: Date.now().toString() + '_1',
                tag1: '成猫粮',
                tag2: '高蛋白',
                name: '皇家猫粮 K36',
                description: '专为成年猫设计的营养配方，含有高品质蛋白质和必需营养素',
                collectCount: 12345,
                collectTime: Date.now(),
                brand: '皇家',
                price: 298,
                rating: 4.8,
            },
            {
                id: Date.now().toString() + '_2',
                tag1: '幼猫粮',
                tag2: '易消化',
                name: '渴望幼猫粮',
                description: '富含新鲜肉类，为快速成长的幼猫提供充足能量',
                collectCount: 8976,
                collectTime: Date.now(),
                brand: '渴望',
                price: 458,
                rating: 4.9,
            },
        ];

        for (const item of testData) {
            await addCollect(item);
        }
        
        Alert.alert('✅ 成功', '已添加2条测试数据');
        await loadCollects(); // 重新加载列表
    };


    return (
        <ThemedView style={styles.container}>
            <View style={styles.searchBar}>
                <Image source={require('@/assets/appIcon.png')} style={styles.searchIcon} />
                <ThemedText style={styles.searchInput} onPress={() => Alert.alert('搜索', '点击了搜索栏')}>
                    {searchText || '搜索历史报告...'}
                </ThemedText>
            </View>
            
            {/* 测试按钮 */}
            <View style={styles.testButtonContainer}>
                <Button title="➕ 添加2条测试数据" onPress={addTestData} />
            </View>
            
            {/* 显示数据列表或空状态 */}
            {collects.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <BottomAnimation />
                    <ThemedText style={styles.emptyText}>
                        还没有收藏数据{'\n'}点击上方按钮添加测试数据
                    </ThemedText>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {collects.map((item) => (
                        <CollectCard
                            key={item.id}
                            tag1={item.tag1}
                            tag2={item.tag2}
                            name={item.name}
                            description={item.description}
                            collectCount={item.collectCount}
                            onPress={() => {
                                router.push({
                                    pathname: '/report/[id]',
                                    params: {
                                        id: item.id,
                                        data: JSON.stringify(item)
                                    }
                                });
                            }}
                            onLongPress={() => {
                                Alert.alert(
                                    '删除',
                                    `确定要删除 ${item.name} 吗？`,
                                    [
                                        { text: '取消', style: 'cancel' },
                                        { 
                                            text: '删除', 
                                            style: 'destructive',
                                            onPress: async () => {
                                                await deleteCollect(item.id);
                                                Alert.alert('✅', '已删除');
                                            }
                                        },
                                    ]
                                );
                            }}
                        />
                    ))}
                </ScrollView>
            )}
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
    testButtonContainer: {
        marginBottom: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
        opacity: 0.6,
    },
});