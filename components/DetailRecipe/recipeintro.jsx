import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import color from '../../constants/color'
import Ionicons from '@expo/vector-icons/Ionicons';
export default function recipeintro({recipe}) {
    if (!recipe) return null;

    return (
        <View>
            <Image source={{ uri: recipe.image }}
                style={{ height: 250, width: '100%', objectFit: 'cover', borderRadius: 20, }}
            />
            <View style={{
                justifyContent: 'space-between',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
            }}>
                <Text
                    style={{
                        fontSize: 25,
                        fontFamily: 'outfit',
                        marginTop: 7,
                        padding: 10,
                        textTransform: 'capitalize',
                        color: '#FFF',
                    }}
                >{recipe.title}</Text>
                < TouchableOpacity
                    style={{
                        paddingTop: 10,
                    }}>
                    <Ionicons name="bookmark-outline" size={24} onPress={() => alert('Navigate to See More!')} color="#FFF" style={{
                        padding: 10,
                    }}></Ionicons>
                </TouchableOpacity>
            </View>


            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
            }}>
                <Image source={{ uri: recipe.avatar }} style={{
                    width: 20,
                    height: 20,
                    padding: 20,
                    borderRadius: 999,
                    backgroundColor: 'black',
                    marginRight: 10
                }} />
                <Text
                    style={{
                        fontSize: 17,
                        fontFamily: 'outfit',
                        marginTop: 7,
                        color: '#FFF',
                    }}>{recipe.name}</Text>
            </View>

            <Text
                style={{
                    fontSize: 20,
                    fontFamily: 'outfit-bold',
                    marginTop: 10,
                    color: 'orange',
                }}>Mô tả</Text>

            {recipe.description.map((item, index) => (
                <View key={index}>
                    <Text
                        style={{
                            fontSize: 17,
                            fontFamily: 'outfit',
                            marginTop: 3,
                            color: color.greytext,
                        }}>{item}</Text>
                </View>
            ))}

            <View style={{
                marginTop: 15,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-around'
            }}>
                {/* độ khó công thức */}
                <View style={styles.featureContainer}>
                    <Ionicons name="leaf" size={18} color="green" />
                    <View>
                        <Text style={{  color: '#FFF',}}>Mức độ</Text>
                        <Text style={{
                            fontFamily: 'outfit',
                            fontSize: 18,
                            color: 'green',
                            textTransform: 'capitalize'
                        }}>{recipe.name_level}</Text>
                    </View>
                </View>

                {/* thời gian thực hiện */}
                <View style={styles.featureContainer}>
                    <Ionicons name="timer" size={24} color="green" />
                    <View>
                        <Text style={{  color: '#FFF',}}>Thời gian</Text>
                        <Text style={{
                            fontFamily: 'outfit',
                            fontSize: 18,
                            color: 'green',
                            textTransform: 'capitalize'
                        }}>{recipe.timecook}</Text>
                    </View>
                </View>

                {/* danh mục thuộc về món ăn  */}
                <View style={styles.featureContainer}>
                    <Ionicons name="bonfire" size={24} color="orange" />
                    <View>
                        <Text style={{  color: '#FFF',}}>Danh mục</Text>
                        <Text style={{
                            fontFamily: 'outfit',
                            fontSize: 18,
                            color: 'green',
                            textTransform: 'capitalize'
                        }}>{recipe.name_category}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    featureContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        padding: 10,
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
    }
})