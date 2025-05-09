import { StyleSheet, Text, View, ScrollView, Alert, TouchableOpacity, Image, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getAllCategories } from '../../services/categoryService';
import { useRouter } from 'expo-router';

export default function category() {

    const [activeCategory, setActiveCategory] = useState('beef'); // ✅ Đặt trước
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');
    const router = useRouter();
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {

        try {
            const res = await getAllCategories();
            if (res.status == 200) {
                setCategories(res.data);
                setMessage(res.message);
            } else {
                setMessage(res.message);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    return (
        <View style={styles.wrapper}>
            <View style={styles.header}>
                <Text style={styles.heading}>Danh mục</Text>
                <TouchableOpacity onPress={() => alert('Navigate to See More!')}>
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
                            onPress={() => router.push(
                                {
                                    pathname: '/category/category',
                                    params: { 
                                        id: cat.id,
                                        name_category: cat.name_category,
                                    }
                                }
                            )}
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
    heading: {
        fontSize: 20, // Slightly larger heading
        fontWeight: 'bold',
        color: '#FFFFFF', // White heading text
    },

    seeMore: {
        color: '#FFA500', // Orange "See More"
        fontSize: 14,
        fontWeight: '500',
    },
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
        padding: 4,
        borderRadius: hp(2),
    },
    image: {
        width: hp(8),
        height: hp(8),
        alignItems: 'center',
        borderRadius: 999,
        objectFit: 'cover'

    },
    active: {
        backgroundColor: 'rgba(251, 191, 36, 1)',
    },
    inactive: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    text: {
        // fontSize: hp(1.9),
        color: '#FFF',
        textAlign: 'center',
        textTransform: 'capitalize',
        fontWeight: 700,
        minWidth: 80,
        fontFamily: 'Francisco', // Tên font family
        fontSize: 16,
    },
})