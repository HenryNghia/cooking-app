import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import React from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useEffect, useState } from "react";
import { getRecipeByRating } from '../../services/recipeService';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { addFavorite } from '../../services/favoriteService';

const RecipeComponent = () => {
    const [recipes, setRecipes] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Set loading message initially
        setMessage('Đang tải công thức...');
        FetchRecipe();
    }, []);

    const FetchRecipe = async () => {
        try {
            const data = await getRecipeByRating();
            if (data.status === 200 && data.data) {
                setRecipes(data.data);
                // Clear message on success or set success message
                setMessage(data.message || ''); // Clear message or set success message
            } else {
                // Set error message if data is empty or status is not 200
                setMessage(data.message || 'Không tìm thấy công thức.');
                setRecipes([]);
            }
        } catch (error) {
            console.error('Failed to fetch recipes:', error);
            setMessage('Lỗi khi tải công thức.');
            setRecipes([]);
        }
    };

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

    const handleFavorite = async (id) => {
        try {
            const response = await addFavorite(id);
            if (response && response.status === 200) {
                // Handle success, maybe update message or UI state
                console.log('Thêm thành công:', response.message);
                // You might want to show a temporary success message to the user here
                // Example: Alert.alert('Yêu thích', response.message || 'Đã thêm vào yêu thích!');
            } else {
                // Handle failure
                console.log('Thêm thất bại:', response.message);
                // Example: Alert.alert('Lỗi', response.message || 'Không thể thêm vào yêu thích.');
            }
        } catch (error) {
            console.error('Lỗi khi thêm:', error);
            // Example: Alert.alert('Lỗi', 'Lỗi khi kết nối để thêm yêu thích.');
        }
    };


    return (
        <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
                <View style={styles.listContent}>
                    {recipes && recipes.length > 0 ? (
                        recipes.slice(0, 4).map((item) => (
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
                                            e.stopPropagation(); // Prevent card press
                                            handleFavorite(item.id);
                                        }}
                                    >
                                        <Icon
                                            name={"heart-o"} // Consider using state to toggle between heart and heart-o
                                            size={22}
                                            color="#FFA500"
                                        />
                                    </TouchableOpacity>

                                    <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

                                    <View style={styles.contentContainer}>
                                        <Text style={styles.title} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <View style={styles.ratingContainer}>
                                            {renderStars(item.rating)}
                                        </View>
                                        <Text style={styles.chef} numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        // Render message if no recipes are loaded
                        <View style={styles.messageContainer}>
                            <Text style={styles.messageText}>
                                {message || 'Không có công thức nào được tìm thấy.'} {/* Fallback message */}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

export default RecipeComponent;

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
    headerrecipe: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(2),
        paddingHorizontal: wp(1),
    },
    headingrecipe: {
        fontSize: hp(2.5),
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    seeMorerecipe: {
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