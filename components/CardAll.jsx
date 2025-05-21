import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Modal, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { deleteRecipe } from '../services/recipeService';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import { addFavorite, checkFavorite, deleteFavorite } from '../services/favoriteService';

const CardAll = ({
    recipes,
    message,
    loading,
    setRecipes,
}) => {

    const [openMenuRecipeId, setOpenMenuRecipeId] = useState(null);

    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

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
            } else {
                console.error('Thao tác yêu thích thất bại:', response?.message);
                Alert.alert('Thất bại', response?.message || 'Có lỗi xảy ra!');
                setRecipes(prevRecipes =>
                    prevRecipes.map(recipe =>
                        recipe.id === recipeId ? { ...recipe, isFavorite: currentFavoriteStatus } : recipe
                    )
                )
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

    const handleOpenMenu = (recipeId, event) => {
        const { pageX, pageY } = event.nativeEvent;
        setMenuPosition({ x: pageX, y: pageY - 100 });
        setOpenMenuRecipeId(recipeId);
    };

    const handleCloseMenu = () => {
        setOpenMenuRecipeId(null);
    };

    // xóa dữ liệu 
    const handleDeleteRecipe = async (recipeId) => {
        handleCloseMenu();
        Alert.alert(
            "Xác nhận xóa",
            "Bạn có chắc chắn muốn xóa công thức này?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Xóa",
                    onPress: async () => {
                        try {
                            const response = await deleteRecipe(recipeId)
                            if (response && response.status === 200) {
                                console.log('Xóa thành công:', response.message);
                                Alert.alert("Thành công", response.message || "Công thức đã được xóa!");
                                setRecipes(prevRecipes => prevRecipes.filter(r => r.id !== recipeId));
                            } else {
                                console.error('Xóa thất bại:', response.message);
                                Alert.alert("Thất bại", response.message || "Không thể xóa công thức.");
                            }
                        } catch (error) {
                            console.error('Lỗi khi xóa công thức:', error);
                            Alert.alert("Lỗi", "Không thể kết nối để xóa công thức.");
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const handleUpdateRecipe = (recipeId) => {
        handleCloseMenu();
        // Sửa đường dẫn navigate đến màn hình cập nhật đúng
        router.push({
            pathname: '/update-recipe/[id]',
            params: { id: recipeId }
        })
    };


    return (
        <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
                {loading ? (
                    <View style={styles.messageContainer}>
                        <ActivityIndicator size="large" color="#FFA500" />
                        <Text style={styles.messageText}>
                            {message}
                        </Text>
                    </View>
                ) : (
                    recipes && recipes.length > 0 ? (
                        recipes.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => router.push({
                                    pathname: '/recipe-detail/[id]',
                                    params: { id: item.id }
                                })}
                                style={styles.horizontalCardWrapper}
                            >
                                <View style={styles.horizontalCardContent}>
                                    <Image source={{ uri: item.image }} style={styles.horizontalCardImage} resizeMode="cover" />
                                    <View style={styles.horizontalCardTextContainer}>
                                        <Text style={styles.horizontalCardTitle} numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        <View style={styles.horizontalCardRatingContainer}>
                                            {renderStars(item.rating)}
                                        </View>
                                        <Text style={styles.horizontalCardChef} numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                    </View>
                                    <View style={styles.horizontalCardIcons}>
                                        <TouchableOpacity
                                            style={styles.horizontalCardIcon}
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
                                        <TouchableOpacity
                                            style={styles.horizontalCardIcon}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                handleOpenMenu(item.id, e);
                                            }}
                                        >
                                            <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
                                        </TouchableOpacity>
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

            {/* Context Menu Modal */}
            <Modal
                visible={openMenuRecipeId !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={handleCloseMenu}
            >
                <Pressable style={styles.modalOverlay} onPress={handleCloseMenu}>
                    {openMenuRecipeId && (
                        <View
                            style={[
                                styles.contextMenu,
                                { top: menuPosition.y, left: menuPosition.x - 150 }
                            ]}
                        >
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => handleUpdateRecipe(openMenuRecipeId)}
                            >
                                <Text style={styles.menuItemText}>Cập nhật</Text>
                            </TouchableOpacity>
                            <View style={styles.menuDivider} />
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => handleDeleteRecipe(openMenuRecipeId)}
                            >
                                <Text style={[styles.menuItemText, { color: 'red' }]}>Xóa</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Pressable>
            </Modal>

        </ScrollView>
    )
}

export default CardAll

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
    listContent: {
        flexDirection: 'column',
    },
    horizontalCardWrapper: {
        marginBottom: hp('2%'),
        borderRadius: 15,
        backgroundColor: '#1E1E1E',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    horizontalCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: wp(2.5),
    },
    horizontalCardImage: {
        width: wp('25%'),
        height: hp('10%'),
        borderRadius: 10,
        marginRight: wp(3),
    },
    horizontalCardTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    horizontalCardTitle: {
        color: '#FFFFFF',
        fontSize: hp(1.9),
        fontWeight: 'bold',
        marginBottom: hp(0.5),
        textTransform: 'capitalize',
    },
    horizontalCardRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(0.8),
    },
    horizontalCardChef: {
        color: '#B0B0B0',
        fontSize: hp(1.6),
        fontStyle: 'italic',
    },
    horizontalCardIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: wp(2),
    },
    horizontalCardIcon: {
        padding: wp(1.5),
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

    star: {
        marginRight: wp(0.8),
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    contextMenu: {
        position: 'absolute',
        backgroundColor: '#333',
        borderRadius: 8,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        minWidth: 150,
        paddingVertical: 5,
    },
    menuItem: {
        padding: 15,
    },
    menuItemText: {
        fontSize: 16,
        color: '#FFF',
    },
    menuDivider: {
        height: 1,
        backgroundColor: '#555',
        marginVertical: 5,
    },
});