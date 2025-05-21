import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { router } from 'expo-router';
import { addFavorite, deleteFavorite, checkFavorite } from '../../services/favoriteService';

export default function RecipeSearch({ recipes, searchKeyword, message }) {

    const [internalRecipes, setInternalRecipes] = useState([]);
    const [checkingFavorites, setCheckingFavorites] = useState(true);

    useEffect(() => {
        processRecipes();
    }, [recipes]);
    const processRecipes = async () => {
        setCheckingFavorites(true);
        if (!recipes || recipes.length === 0) {
            setInternalRecipes([]);
            setCheckingFavorites(false);
            return;
        }

        try {
            const favoriteCheckPromises = recipes.map(recipe =>
                checkFavorite({ recipe_id: recipe.id })
                    .catch(error => {
                        console.error(`Failed to check favorite status for recipe ${recipe.id}:`, error);
                        return { recipeId: recipe.id, status: 500 };
                    })
            );

            const checkResults = await Promise.all(favoriteCheckPromises);

            const recipesWithFavStatus = recipes.map((recipe, index) => {
                const checkResult = checkResults[index];
                return {
                    ...recipe,
                    isFavorite: checkResult?.status === 200
                };
            });

            setInternalRecipes(recipesWithFavStatus);

        } catch (error) {
            console.error('Error processing recipes with favorite status:', error);
            setInternalRecipes(recipes.map(recipe => ({ ...recipe, isFavorite: false }))); // Default to not favorite on error
        } finally {
            setCheckingFavorites(false);
        }
    };
    const renderStars = (rating) => {
        const stars = [];
        const roundedRating = Math.round(rating * 2) / 2;
        const fullRoundedStars = Math.floor(roundedRating);
        const hasHalfStar = roundedRating % 1 !== 0;

        for (let i = 0; i < fullRoundedStars; i++) {
            stars.push(<Icon key={`full-${i}`} name="star" size={16} color="#FFA500" style={styles.star} />);
        }
        if (hasHalfStar) {
            stars.push(<Icon key="half" name="star-half-full" size={16} color="#FFA500" style={styles.star} />);
        }
        const remainingStars = 5 - stars.length;
        for (let i = 0; i < remainingStars; i++) {
            stars.push(<Icon key={`empty-${i}`} name="star-o" size={16} color="#FFA500" style={styles.star} />);
        }
        return stars;
    };

    const handleFavorite = async (recipeId) => {
        const recipeToToggleIndex = internalRecipes.findIndex(r => r.id === recipeId);
        if (recipeToToggleIndex === -1) return;

        const recipeToToggle = internalRecipes[recipeToToggleIndex];
        const currentFavoriteStatus = recipeToToggle.isFavorite;

        const updatedRecipes = [...internalRecipes];
        updatedRecipes[recipeToToggleIndex] = {
            ...recipeToToggle,
            isFavorite: !currentFavoriteStatus
        };
        setInternalRecipes(updatedRecipes);


        try {
            let response;
            if (currentFavoriteStatus) {
                console.log("Attempting to delete favorite:", recipeId);
                response = await deleteFavorite(recipeId);
            } else {
                console.log("Attempting to add favorite:", { recipe_id: recipeId });
                const data = { recipe_id: recipeId };
                response = await addFavorite(data);
            }

            if (response && response.status === 200) {
                console.log('Thao tác yêu thích thành công:', response.message);
                Alert.alert('Thành công', response.message || (currentFavoriteStatus ? 'Đã xóa khỏi yêu thích!' : 'Đã thêm vào yêu thích!'));
            } else {
                console.error('Thao tác yêu thích thất bại:', response?.message);
                Alert.alert('Thất bại', response?.message || 'Có lỗi xảy ra!');
                const revertedRecipes = [...internalRecipes]; // Use the state *before* optimistic update for reverting
                revertedRecipes[recipeToToggleIndex] = {
                    ...recipeToToggle,
                    isFavorite: currentFavoriteStatus
                };
                setInternalRecipes(revertedRecipes);
            }
        } catch (error) {
            console.error('Lỗi khi thực hiện thao tác yêu thích:', error);
            Alert.alert('Lỗi', 'Lỗi kết nối hoặc server.');
            const revertedRecipes = [...internalRecipes]; // Use the state *before* optimistic update for reverting
            revertedRecipes[recipeToToggleIndex] = {
                ...recipeToToggle,
                isFavorite: currentFavoriteStatus
            };
            setInternalRecipes(revertedRecipes);
        }
    };


    return (
        <View style={styles.recipeSearchContainer}>
            <View style={styles.rowContainer}>
                {checkingFavorites ? (
                    <View style={styles.messageContainer}>
                        <ActivityIndicator size="large" color="#FFA500" />
                        <Text style={styles.messageText}>
                            Đang load dữ liệu...
                        </Text>
                    </View>
                ) : (
                    internalRecipes && internalRecipes.length > 0 ? (
                        internalRecipes.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => router.push({
                                    pathname: '/recipe-detail/[id]',
                                    params: { id: item.id },
                                })}
                                style={styles.cardWrapper}
                            >
                                <View style={styles.cardContentContainer}>
                                    <TouchableOpacity
                                        style={styles.heartIcon}
                                        onPress={(e) => {
                                            e.stopPropagation(); // Prevent card press
                                            handleFavorite(item.id);
                                        }}
                                    >
                                        <Icon name={item.isFavorite ? "bookmark" : "bookmark-o"} size={22} color="#FFF" />
                                    </TouchableOpacity>
                                    <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                                    <View style={styles.textContainer}>
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
                        message && (
                            <View style={styles.messageContainer}>
                                <Text style={styles.messageText}>
                                    {message}
                                </Text>
                            </View>
                        )
                    )
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    recipeSearchContainer: {
        backgroundColor: '#000',
        paddingBottom: hp(2),
        paddingHorizontal: wp(3), // Added horizontal padding for consistency
    },

    messageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        width: '100%',
        height: hp(20), // Give it some height
    },
    messageText: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: hp(2), // Adjusted font size
    },

    rowContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: '48%',
        marginVertical: hp(1),
        borderRadius: 15,
        backgroundColor: '#1E1E1E',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    cardContentContainer: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: hp('15%'),
    },
    textContainer: {
        padding: 10,
    },
    title: {
        color: '#FFF',
        fontSize: hp(1.9), // Adjusted font size
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'capitalize', // Added capitalize
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    star: {
        marginRight: 2,
    },
    chef: {
        color: '#B0B0B0',
        fontSize: hp(1.6),
        fontStyle: 'italic',
    },
    heartIcon: {
        position: 'absolute',
        top: hp(1.5), // Adjusted position
        right: wp(2.5), // Adjusted position
        zIndex: 2,
        backgroundColor: 'transparent',
        padding: wp(1.5), // Adjusted padding
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});