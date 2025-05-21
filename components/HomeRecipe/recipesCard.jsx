import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getRecipeByRating } from '../../services/recipeService';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { addFavorite, checkFavorite, deleteFavorite } from '../../services/favoriteService';

const RecipeComponent = () => {
    const [recipes, setRecipes] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMessage('Đang tải công thức...');
        setLoading(true);
        FetchRecipe();
    }, []);
   
    const FetchRecipe = async () => {
        try {
            const recipeResponse = await getRecipeByRating();

            if (recipeResponse.status === 200 && recipeResponse.data) {
                const fetchedRecipes = recipeResponse.data;

                const favoriteCheckPromises = fetchedRecipes.map(recipe =>
                    checkFavorite({ recipe_id: recipe.id })
                        .catch(error => {
                            console.error(`Failed to check favorite status for recipe ${recipe.id}:`, error);
                            return { recipeId: recipe.id, status: 500 };
                        })
                );

                const checkResults = await Promise.all(favoriteCheckPromises);

                const recipesWithFavStatus = fetchedRecipes.map((recipe, index) => {
                    const checkResult = checkResults[index];
                    return {
                        ...recipe,
                        isFavorite: checkResult?.status === 200
                    };
                });

                setRecipes(recipesWithFavStatus);
                setMessage('');
            } else {
                setMessage(recipeResponse.message || 'Không tìm thấy công thức.');
                setRecipes([]);
            }
        } catch (error) {
            console.error('Failed to fetch recipes or check favorites:', error);
            setMessage('Lỗi khi tải công thức hoặc kiểm tra trạng thái yêu thích.');
            setRecipes([]);
        } finally {
            setLoading(false);
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
        const recipeToToggle = recipes.find(r => r.id === recipeId);
        if (!recipeToToggle) return;

        const currentFavoriteStatus = recipeToToggle.isFavorite;

        setRecipes(prevRecipes =>
            prevRecipes.map(recipe =>
                recipe.id === recipeId ? { ...recipe, isFavorite: !currentFavoriteStatus } : recipe
            )
        );

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
                setRecipes(prevRecipes =>
                    prevRecipes.map(recipe =>
                        recipe.id === recipeId ? { ...recipe, isFavorite: currentFavoriteStatus } : recipe
                    )
                );
            }
        } catch (error) {
            console.error('Lỗi khi thực hiện thao tác yêu thích:', error);
            Alert.alert('Lỗi', 'Lỗi kết nối hoặc server.');
            setRecipes(prevRecipes =>
                prevRecipes.map(recipe =>
                    recipe.id === recipeId ? { ...recipe, isFavorite: currentFavoriteStatus } : recipe
                )
            );
        }
    };


    return (
        <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
                <View style={styles.listContent}>
                    {loading ? (
                        <View style={styles.messageContainer}>
                            <ActivityIndicator size="large" color="#FFA500" />
                            <Text style={styles.messageText}>
                                {message}
                            </Text>
                        </View>
                    ) : (
                        recipes && recipes.length > 0 ? (
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
                                                e.stopPropagation();
                                                handleFavorite(item.id);
                                            }}
                                        >
                                            <Icon
                                                name={item.isFavorite ? "bookmark" : "bookmark-o"}
                                                size={22}
                                                color="#FFF"
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
                            <View style={styles.messageContainer}>
                                <Text style={styles.messageText}>
                                    {message || 'Không có công thức nào được tìm thấy.'}
                                </Text>
                            </View>
                        )
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
    messageContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        width: '100%',
        height: hp(20),
    },
    messageText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: hp(2),
    },
    heartIcon: {
        position: 'absolute',
        top: hp(1.5),
        right: wp(2.5),
        zIndex: 1,
        padding: wp(1),
        borderRadius: 20,
        backgroundColor: 'transparent',
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
});
