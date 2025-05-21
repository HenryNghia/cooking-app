import { View, Text, Image, FlatList, Alert, ActivityIndicator, StyleSheet,TouchableOpacity  } from 'react-native';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import RecipeIntro from '../../components/DetailRecipe/recipeintro';
import Ingredient from '@/components/DetailRecipe/Ingredient';
import RecipeSteps from '../../components/DetailRecipe/RecipeStep';
import { getRecipeById } from '../../services/recipeService';
import { addFavorite, deleteFavorite, checkFavorite } from '../../services/favoriteService';
import Ionicons from '@expo/vector-icons/Ionicons';
import color from '../../constants/color';

export default function Detail() {
    const { id } = useLocalSearchParams();
    const navigation = useNavigation();

    const [recipe, setRecipe] = useState(null);
    const [loadingRecipe, setLoadingRecipe] = useState(true);
    const [recipeError, setRecipeError] = useState(null);
	const [message, setMessage] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [checkingFavorite, setCheckingFavorite] = useState(true);

    useEffect(() => {
        if (!id) {
            setLoadingRecipe(false);
            setCheckingFavorite(false);
            return;
        }

        const fetchData = async () => {
            setLoadingRecipe(true);
            setCheckingFavorite(true);

            try {
                const recipeDataResponse = await getRecipeById(id);
                if (recipeDataResponse.status === 200 && recipeDataResponse.data) {
                    setRecipe(recipeDataResponse.data);
                    setRecipeError(null);

                    const favoriteResponse = await checkFavorite({ recipe_id: id });
                    setIsFavorite(favoriteResponse.status === 200);

                } else {
                    setRecipe(null);
                    setRecipeError(recipeDataResponse.message || 'Không tìm thấy công thức.');
                    setIsFavorite(false);
                }
            } catch (error) {
                console.error('Lỗi khi lấy chi tiết công thức hoặc kiểm tra yêu thích:', error);
                setRecipe(null);
                setRecipeError('Lỗi khi tải chi tiết công thức.');
                setIsFavorite(false);
            } finally {
                setLoadingRecipe(false);
                setCheckingFavorite(false);
            }
        };

        fetchData();

    }, [id]);

     const handleToggleFavorite = async () => {
        if (!id) return;

        const currentFavoriteStatus = isFavorite;

        setIsFavorite(!currentFavoriteStatus);

        try {
            let response;
            if (currentFavoriteStatus) {
                console.log("Attempting to delete favorite:", id);
                response = await deleteFavorite(id);
            } else {
                 console.log("Attempting to add favorite:", { recipe_id: id });
                const data = { recipe_id: id };
                response = await addFavorite(data);
            }

            if (response && response.status === 200) {
                 console.log('Thao tác yêu thích thành công:', response.message);
                 Alert.alert('Thành công', response.message || (currentFavoriteStatus ? 'Đã xóa khỏi yêu thích!' : 'Đã thêm vào yêu thích!'));
            } else {
                 console.error('Thao tác yêu thích thất bại:', response?.message);
                 Alert.alert('Thất bại', response?.message || 'Có lỗi xảy ra!');
                 setIsFavorite(currentFavoriteStatus);
            }
        } catch (error) {
            console.error('Lỗi khi thực hiện thao tác yêu thích:', error);
            Alert.alert('Lỗi', 'Lỗi kết nối hoặc server.');
            setIsFavorite(currentFavoriteStatus);
        }
    };

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                checkingFavorite ? (
                    <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 15 }} />
                ) : (
                     <TouchableOpacity onPress={handleToggleFavorite} style={styles.headerIcon}>
                         <Ionicons
                             name={isFavorite ? "bookmark" : "bookmark-outline"}
                             size={24}
                             color="#FFF"
                         />
                     </TouchableOpacity>
                )
            ),
        });
    }, [navigation, id, isFavorite, checkingFavorite, handleToggleFavorite]);


    if (loadingRecipe || checkingFavorite) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFA500" />
                <Text style={styles.loadingText}>{message || 'Đang tải chi tiết công thức...'}</Text>
            </View>
        );
    }

     if (recipeError) {
         return (
             <View style={styles.errorContainer}>
                 <Text style={styles.errorText}>{recipeError}</Text>
             </View>
         );
     }

     if (!recipe) {
          return (
             <View style={styles.errorContainer}>
                 <Text style={styles.errorText}>Không tìm thấy chi tiết công thức.</Text>
             </View>
         );
     }


    return (
        <FlatList
            data={[]}
            renderItem={() => null}
            ListHeaderComponent={
                <View style={styles.listHeaderContainer}>
                    <RecipeIntro recipe={recipe}/>
                    <Ingredient recipe={recipe} />
                    <RecipeSteps recipe={recipe}/>
                </View>
            }
             contentContainerStyle={styles.flatListContentContainer}
        />
    )
}

const styles = StyleSheet.create({
    listHeaderContainer: {
        paddingLeft: 20,
        paddingTop: 0,
        paddingRight: 20,
        marginBottom: 20,
    },
    flatListContentContainer: {
         backgroundColor: '#000',
         flexGrow: 1,
         paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    loadingText: {
         color: '#FFF',
         marginTop: 10,
         fontSize: 16,
    },
     errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
         padding: 20,
    },
    errorText: {
         color: 'red',
         textAlign: 'center',
         fontSize: 18,
    },
    headerIcon: {
        marginRight: 15,
        padding: 5,
    }
});