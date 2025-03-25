import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import { useEffect, useState } from "react";
import { getRecipeData } from '../services/recipeService';


const recipe = () => {
    const [recipes, setRecipes] = useState([]);
    const [message, setMessage] = useState(''); // State để lưu trữ message


    useEffect(() => {
        GetRecipe();
    }, []);

    const GetRecipe = async () => {
        try {
            const data = await getRecipeData();
            console.log(data.data)
            if (data.status == 200) {
                setRecipes(data.data); // Lấy mảng data từ phản hồi
                setMessage(data.message); // State để lưu trữ message
                // console.log(recipes);
                // console.log(message);
            } else {
                setMessage(data.message); // State để lưu trữ message
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>10 Recommendations</Text>
                <TouchableOpacity>
                    <Text style={styles.seeMore}>See More &gt;</Text>
                </TouchableOpacity>
            </View>
            {/* card recipes */}
            <View style={styles.listContent}>
                {recipes.slice(0, 10).map((item, index) => {
                    return (
                        <TouchableOpacity
                            key={index}
                            style={styles.container_card}>
                            <Image source={{ uri: item.image }} style={styles.image} />
                            <View style={styles.contentContainer}>
                                <Text style={styles.title}>{item.title}</Text>
                                <View style={styles.group}>
                                    <Text style={styles.chef}>{item.user_name}</Text>
                                    <Text style={styles.link}>Xem</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}

export default recipe

const styles = StyleSheet.create({
    // test css
    container: {
   
        padding: 10,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',

    },
    heading: { fontSize: 16, fontWeight: 'bold' },
    seeMore: { color: '#888' },

    listContent: {
        gap: 12,
        marginTop: 15,
        display: 'flex',
        flexWrap:'wrap',
        flexDirection: 'row'
    },
    container_card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        margin: 6,
        width: '45%', // 2 cột
        height: 235,
        overflow: 'hidden'
    },

    image: {
        width: '100%',
        height: 130,
        overflow: 'hidden'
    },
    contentContainer: {
        paddingBottom: 5,
        paddingTop: 0,
        paddingRight: 10,
        paddingLeft: 10,
    },
    title:
    {
        padding: 6,
        color: 'black',
        fontSize: hp(2, 7),
        fontFamily: 'sans-serif',
        textTransform: 'capitalize',
    },
    group: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },

    chef: {
        paddingHorizontal: 8,
        color: '#555',
        fontSize: 16,
    },

    link: {
        paddingHorizontal: 8,
        paddingBottom: 8,
        color: 'red',
        fontSize: 16
    }


}) 