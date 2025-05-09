import { View, Text, FlatList } from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Ingredient({ recipe }) {
    if (!recipe) return null;
    return (
        <View style={{
            marginTop: 15,
        }}>
            <View style={{
                marginTop: 10,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <Text
                    style={{
                        fontSize: 20,
                        fontFamily: 'outfit-bold',
                        color: 'orange',
                    }}>Nguyên liệu</Text>
                <Text
                    style={{
                        fontSize: 17,
                        fontFamily: 'outfit',
                        color: 'orange',
                    }}>{recipe.ingredients.length} Items</Text>
            </View>
            <FlatList
                data={recipe.ingredients}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <View style={{
                        paddingLeft: 5,
                        paddingTop: 5,
                        display: 'flex',
                        flexDirection: 'row',
                        marginTop: 15,
                        alignItems: 'center'
                    }}>
                        <Ionicons name="ellipse-sharp" size={8} color="orange" style={{
                            marginRight: 10
                        }} />
                        <Text style={{
                            fontSize: 17,
                            fontFamily: 'outfit',
                            textTransform: 'capitalize',
                            color: '#FFF',
                        }}>{item}</Text>
                    </View>
                )}
            />
        </View>
    )
}