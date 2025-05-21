import { StyleSheet, View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import color from '../../constants/color';
import Ionicons from '@expo/vector-icons/Ionicons';
import { addFavorite, deleteFavorite, checkFavorite } from '../../services/favoriteService';

export default function Recipeintro({ recipe }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoadingFavorite, setIsLoadingFavorite] = useState(true);

    const formatText = (value) => {
        if (value === null || typeof value === 'undefined') {
            return '';
        }
        return String(value);
    };

    const checkInitialStatus = useCallback(async () => {
        if (!recipe?.id) {
            setIsLoadingFavorite(false);
            return;
        }
        setIsLoadingFavorite(true);
        try {
            const response = await checkFavorite({ recipe_id: recipe.id });
            setIsFavorite(response.status === 200);
        } catch (error) {
            console.error('Error checking favorite status:', error);
            setIsFavorite(false);
        } finally {
            setIsLoadingFavorite(false);
        }
    }, [recipe?.id]);

    useEffect(() => {
        checkInitialStatus();
    }, [checkInitialStatus]);

    const handleToggleFavorite = useCallback(async () => {
        if (!recipe?.id || isLoadingFavorite) {
            return;
        }

        const currentFavoriteStatus = isFavorite;
        setIsFavorite(!currentFavoriteStatus);

        try {
            let response;
            if (currentFavoriteStatus) {
                response = await deleteFavorite(recipe.id);
            } else {
                const data = { recipe_id: recipe.id };
                response = await addFavorite(data);
            }

            if (response && response.status === 200) {
                Alert.alert('Thành công', formatText(response.message) || (currentFavoriteStatus ? 'Đã xóa khỏi yêu thích!' : 'Đã thêm vào yêu thích!'));
            } else {
                Alert.alert('Thất bại', formatText(response?.message) || 'Có lỗi xảy ra!');
                setIsFavorite(currentFavoriteStatus);
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Lỗi kết nối hoặc server.');
            setIsFavorite(currentFavoriteStatus);
        }
    }, [isFavorite, recipe?.id, isLoadingFavorite]);

    // 👇 Gom các điều kiện render về một chỗ
    if (!recipe || !recipe.id) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Không có dữ liệu công thức.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {isLoadingFavorite ? (
                <Text style={styles.loadingText}>Đang tải thông tin yêu thích...</Text>
            ) : (
                <>
                    <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                    <View style={styles.header}>
                        <Text style={styles.title}>{formatText(recipe.title)}</Text>
                        <TouchableOpacity
                            style={styles.bookmarkIconContainer}
                            onPress={handleToggleFavorite}
                            disabled={isLoadingFavorite}
                        >
                            <Ionicons
                                name={isFavorite ? "bookmark" : "bookmark-outline"}
                                size={28}
                                color="#FFF"
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.chefContainer}>
                        <Image source={{ uri: recipe.avatar }} style={styles.chefAvatar} />
                        <Text style={styles.chefName}>{formatText(recipe.name)}</Text>
                    </View>

                    <Text style={styles.descriptionHeading}>Mô tả</Text>

                    {Array.isArray(recipe.description) && recipe.description.length > 0 ? (
                        recipe.description.map((item, index) => (
                            <View key={index}>
                                <Text style={styles.descriptionText}>{formatText(item)}</Text>
                            </View>
                        ))
                    ) : !Array.isArray(recipe.description) && recipe.description ? (
                        <Text style={styles.descriptionText}>{formatText(recipe.description)}</Text>
                    ) : (
                        <Text style={styles.descriptionText}>Không có mô tả.</Text>
                    )}

                    <View style={styles.featuresRow}>
                        <View style={styles.featureContainer}>
                            <Ionicons name="leaf-outline" size={20} color="green" style={styles.featureIcon} />
                            <View style={styles.featureTextContainer}>
                                <Text style={styles.featureLabel}>Mức độ</Text>
                                <Text style={styles.featureValue}>{formatText(recipe.name_level)}</Text>
                            </View>
                        </View>

                        <View style={styles.featureContainer}>
                            <Ionicons name="timer-outline" size={20} color="green" style={styles.featureIcon} />
                            <View style={styles.featureTextContainer}>
                                <Text style={styles.featureLabel}>Thời gian</Text>
                                <Text style={styles.featureValue}>{formatText(recipe.timecook)} phút</Text>
                            </View>
                        </View>

                        <View style={styles.featureContainer}>
                            <Ionicons name="bonfire-outline" size={20} color="orange" style={styles.featureIcon} />
                            <View style={styles.featureTextContainer}>
                                <Text style={styles.featureLabel}>Danh mục</Text>
                                <Text style={styles.featureValueNameCategory}>{formatText(recipe.name_category)}</Text>
                            </View>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: 0,
    },
    loadingText: {
        color: '#FFF',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        fontFamily: 'outfit',
    },
    recipeImage: {
        height: 250,
        width: '100%',
        resizeMode: 'cover',
        borderRadius: 20,
        marginBottom: 10,
    },
    header: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontFamily: 'outfit-bold',
        textTransform: 'capitalize',
        color: '#FFF',
        flex: 1,
        marginRight: 10,
        lineHeight: 30,
    },
    bookmarkIconContainer: {
        padding: 8,
        borderRadius: 50,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    chefContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    chefAvatar: {
        width: 35,
        height: 35,
        borderRadius: 20,
        backgroundColor: color.greytext,
        marginRight: 10,
        resizeMode: 'cover',
    },
    chefName: {
        fontSize: 16,
        fontFamily: 'outfit',
        color: '#FFF',
    },
    descriptionHeading: {
        fontSize: 20,
        fontFamily: 'outfit-bold',
        marginBottom: 8,
        color: 'orange',
    },
    descriptionText: {
        fontSize: 16,
        fontFamily: 'outfit',
        color: color.greytext,
        lineHeight: 24,
        marginBottom: 5,
    },
    featuresRow: {
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    featureContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        flex: 1,
        marginHorizontal: 4,
    },
    featureIcon: {
        marginRight: 8,
    },
    featureTextContainer: {
        flexDirection: 'column',
    },
    featureLabel: {
        color: '#AEAEB2',
        fontSize: 12,
        fontFamily: 'outfit',
        marginBottom: 2,
    },
    featureValue: {
        fontFamily: 'outfit-medium',
        fontSize: 14,
        color: '#E5E5EA',
        textTransform: 'capitalize',
    },
    featureValueNameCategory: {
        fontFamily: 'outfit-medium',
        fontSize: 14,
        color: 'orange',
        textTransform: 'capitalize',
    }
});