import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { useEffect, useState } from "react";
import { getRecipeByTime } from '../../services/recipeService';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
export default function index() {
    const [recipes, setRecipes] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        FetchRecipe();
    }, []);

    const FetchRecipe = async () => {
        try {
            const data = await getRecipeByTime();
            if (data.status == 200) {
                setRecipes(data.data);
            } else {
                setMessage(data.message || 'No recipes found.');
                setRecipes([]);
            }
        } catch (error) {
            console.error('Failed to fetch recipes:', error);
            setMessage('Failed to fetch recipes.');
            setRecipes([]);
        }
    };

    // Star rendering function
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const decimalPart = rating % 1;

        for (let i = 1; i <= fullStars; i++) {
            stars.push(<Icon key={`full-${i}`} name="star" size={16} color="#FFA500" style={styles.star} />);
        }
        if (decimalPart > 0) {
            if (decimalPart <= 0.2) {
                stars.push(<Icon key="empty-after" name="star-o" size={16} color="#FFA500" style={styles.star} />);
            } else if (decimalPart <= 0.7) {
                stars.push(<Icon key="half" name="star-half-full" size={16} color="#FFA500" style={styles.star} />);
            } else {
                stars.push(<Icon key="almost-full" name="star" size={16} color="#FFA500" style={styles.star} />);
            }
        }
        const totalStarsInArray = stars.length;
        for (let i = totalStarsInArray; i < 5; i++) {
            stars.push(<Icon key={`empty-${i}`} name="star-o" size={16} color="#FFA500" style={styles.star} />);
        }
        return stars;
    };

    return (
        <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.heading}>Danh sách</Text>
                </View>
                <View style={styles.listContent}>
                    {recipes.length > 0 ? (
                        recipes.map((item) => (
                            <TouchableOpacity
                                onPress={() => router.push({
                                    pathname: '/recipe-detail/[id]',
                                    params: { id: item.id }
                                })}
                                key={item.id}
                                style={styles.cardWrapper}
                            >
                                <View style={styles.container_card}>
                                    <TouchableOpacity
                                        style={styles.heartIcon}
                                        onPress={(e) => {
                                            e.stopPropagation(); // Ngăn sự kiện nổi bọt lên TouchableOpacity cha
                                            handleFavorite(item.id);
                                        }}
                                    >
                                        <Icon
                                            // name={favoriteList.includes(item.id) ? "heart" : "heart-o"}
                                            name={"heart-o"}
                                            size={22}
                                            color="#FFA500"
                                        />
                                    </TouchableOpacity>

                                    <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

                                    <View style={styles.contentContainer}>
                                        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                                        <View style={styles.ratingContainer}>
                                            {renderStars(item.rating)}
                                        </View>
                                        <Text style={styles.chef} numberOfLines={1}>{item.name}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.messageText}>{message || 'Đang tải công thức...'}</Text>
                    )}
                </View>
                {/* Hiển thị message lỗi chung nếu có và không có recipes */}
                {recipes.length === 0 && message && message !== 'Đang tải công thức...' && (
                    <Text style={[styles.messageText, { marginTop: 10 }]}>{message}</Text>
                )}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    scrollViewContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollViewContent: {
        paddingBottom: hp(2),
    },
    container: {
        paddingHorizontal: wp(3),
        paddingTop: hp(2),
        backgroundColor: '#000000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(2),
        paddingHorizontal: wp(1),
    },
    heading: {
        fontSize: hp(2.5),
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    seeMore: {
        color: '#FFA500',
        fontSize: hp(1.8),
        fontWeight: '500',
    },
    listContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: '48%',
        marginBottom: hp('2%'),
    },
    container_card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        overflow: 'hidden',
        position: 'relative',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    heartIcon: {
        position: 'absolute',
        top: hp(1.5),
        right: wp(2.5),
        zIndex: 1,
        padding: wp(1),
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: hp('15%'),
    },
    contentContainer: {
        padding: wp(2.5),
    },
    title: {
        color: '#FFFFFF',
        fontSize: hp(1.9),
        fontWeight: 'bold',
        marginBottom: hp(0.5),
        textTransform: 'capitalize',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(0.8),
    },
    star: {
        marginRight: wp(0.8),
    },
    chef: {
        color: '#B0B0B0',
        fontSize: hp(1.6),
        fontStyle: 'italic',
    },
    messageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        width: '100%',
    },
    messageText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: hp(2),
    },
});