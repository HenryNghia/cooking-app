import { View, Text, Image, FlatList } from 'react-native'
import RecipeIntro from '../../components/DetailRecipe/recipeintro'
import Ingredient from '@/components/DetailRecipe/Ingredient'
import RecipeSteps from '../../components/DetailRecipe/RecipeStep'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router';
import { getRecipeById } from '../../services/recipeService';
export default function Detail() {

	const { id } = useLocalSearchParams();
	
	const [recipe, setRecipe] = useState();

	useEffect(() => {
		if (id) {
			fetchRecipeById(id || recipe_id);
			console.log(recipe)
		}
	}, [id]);

	const fetchRecipeById = async (id) => {
		try {
			const data = await getRecipeById(id);
			if (data.status == 200) {
				setRecipe(data.data);
				console.log(data.data);
			}
		} catch (error) {
			console.error('Lỗi khi lấy danh mục theo ID:', error);
		}
	};


	return (
		<FlatList
			data={[]}
			renderItem={() => null}
			ListHeaderComponent={
				<View style={{
					paddingLeft: 20,
					paddingTop: 0,
					paddingRight: 20,
					backgroundColor: '#000',
					height: '100%',
					marginBottom: 20,
				}}>
					<RecipeIntro recipe={recipe}/>
					<Ingredient recipe={recipe} />
					<RecipeSteps recipe={recipe}/>
				</View>
			}
		/>
	)
}