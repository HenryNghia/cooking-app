import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CategorySearh({
    categories,
    handleChangeCategory,
    activeCategory
}) {
    return (
        <Animated.ScrollView
            horizontal
            entering={FadeInDown.duration(500).springify()}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
        >
            {categories.map((item) => {
                const isSelected = item.id === activeCategory;
                const activeButtonStyle = isSelected ? styles.active : styles.inactive;
                return (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => handleChangeCategory(item.id)}
                        style={styles.button}
                    >
                        <View style={styles.categoryItem}>
                            <View style={[styles.item, activeButtonStyle]}>
                                <Image
                                    source={{ uri: item.image }}
                                    style={styles.image}
                                />
                            </View>
                            <Text style={styles.text}>{item.name_category}</Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </Animated.ScrollView>
    );
}

const styles = StyleSheet.create({
    horizontalList: {
        paddingHorizontal: 8,
        flexDirection: 'row', // Ensure items are laid out horizontally
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    button: {
        marginHorizontal: 4,
        width: hp(10),
        alignItems: 'center',
        padding: 7,
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
        color: '#FFF',
        textAlign: 'center',
        textTransform: 'capitalize',
        fontWeight: 700,
        minWidth: 80,
        fontFamily: 'Francisco', // Tên font family
        fontSize: 16,
    },
});