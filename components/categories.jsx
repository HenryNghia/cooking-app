import { StyleSheet, Text, View, ScrollView, Alert, TouchableOpacity, Image, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import Animated, { FadeInDown } from 'react-native-reanimated';
import {getCategoryData} from '../services/categoryService';

export default function category() {

    const [activeCategory, setActiveCategory] = useState('beef'); // ✅ Đặt trước
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        GetCategory();
    }, []);

    const GetCategory = async () => {
        try {
            const data = await getCategoryData();
            if (data.status == 200) {
                setCategories(data.data);
                setMessage(data.message);
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <View style={styles.wrapper}>
            <View style={styles.header}>
                <Text style={styles.heading}>Danh mục</Text>
                <TouchableOpacity>
                    <Text style={styles.seeMore}>See More &gt;</Text>
                </TouchableOpacity>
            </View>

            <Animated.View
                entering={FadeInDown.duration(500).springify()}
                style={styles.container}
            >
                {categories.map((cat, index) => {
                    const isSelected = cat.name_category === activeCategory;
                    const activeButtonStyle = isSelected ? styles.active : styles.inactive;
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setActiveCategory(cat.name_category)}
                            style={styles.button}
                        >
                            <View style={styles.categoryItem}>
                                <View style={[styles.item, activeButtonStyle]}>
                                    <Image
                                        source={{ uri: cat.image }}
                                        style={styles.image}
                                    />
                                </View>
                                <Text style={styles.text}>{cat.name_category}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </Animated.View>
        </View>
    );
}



const styles = StyleSheet.create({
    wrapper: {
        fontFamily: 'Francisco', // Tên font family
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    heading: { fontSize: 16, fontWeight: 'bold' },
    seeMore: { color: '#888' },
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    button: {
        marginHorizontal: 4,
        width: '20%', // Chia thành 3 cột
        padding: 7,
        alignItems: 'center',
    },
    categoryItem: {
        alignItems: 'center',
    },
    item: {
        padding: 8,
        borderRadius: hp(6),
    },
    image: {
        width: hp(6), // Sử dụng hàm hp()
        height: hp(6), // Sử dụng hàm hp()
        alignItems: 'center', // Thay thế "items-center"
        borderRadius: 999,

    },
    active: {
        backgroundColor: 'rgba(251, 191, 36, 1)',
    },
    inactive: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    text: {
        // fontSize: hp(1.9),
        color: 'black',
        textAlign: 'center',
        textTransform: 'capitalize',
        fontWeight: 700,
        minWidth: 80,
        fontFamily: 'Francisco', // Tên font family
        fontSize: 16,
    },
})