import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react';
import { getRecipeByUser, deleteRecipe } from '../../services/recipeService';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Recipe from '../../components/CardAll'
import { addFavorite, checkFavorite } from '../../services/favoriteService';
export default function index() {
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
            const recipeResponse = await getRecipeByUser();

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
    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
                style={styles.scrollView}>
                <View style={styles.header}>
                  <Recipe recipes={recipes} message={message} loading={loading} setRecipes={setRecipes}/>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollView: {
        paddingTop: hp(5.6), // equivalent to pt-14 in tailwind
    },
})