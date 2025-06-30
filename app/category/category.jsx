import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import React, { useEffect, useState } from 'react';
import { GetRecipeByCategory, searchRecipe } from '../../services/recipeService';
import RecipeSearch from '@/components/Search/RecipeSearch';
import { CameraIcon, MagnifyingGlassIcon, XMarkIcon } from 'react-native-heroicons/outline';

export default function category() {
    const { id, name_category } = useLocalSearchParams();
    const [recipes, setRecipes] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [message, setMessage] = useState('');
    useEffect(() => {
        FetchRecipe(id);
    }, []);

    const FetchRecipe = async (id) => {
        try {
            const data = await GetRecipeByCategory(id);
            if (data.status === 200) {
                setRecipes(data.data);
                setMessage(data.message);
                console.log(data.data);
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage('Failed to fetch recipes.');
        }
    };

    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            setMessage('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }
        try {
            const data = await searchRecipe(searchKeyword, id);
            if (data.status === 200) {
                setRecipes(data.data);
                setMessage(data.message);
            } else {
                setRecipes([]);
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Lỗi khi tìm kiếm:', error);
            setMessage('Tìm kiếm thất bại.');
        }
    };

    const handleClear = () => {
        setSearchKeyword('');
        FetchRecipe(id); // Fetch all recipes again
    };

    return (
        <ScrollView style={{ backgroundColor: '#000000' }}>
            <View style={{ flex: 1 }}>
                {/* Search bar */}
                {/*
                <View style={styles.searchBarContainer}>
                    <View style={styles.searchContainer}>
                        <TouchableOpacity onPress={handleSearch} style={styles.iconWrapper}>
                            <MagnifyingGlassIcon size={hp(2.5)} strokeWidth={3} color={'gray'} />
                        </TouchableOpacity>

                        <TextInput
                            placeholder="Tìm"
                            placeholderTextColor={'white'}
                            value={searchKeyword}
                            onChangeText={(text) => setSearchKeyword(text)}
                            style={styles.searchInput}
                            onSubmitEditing={handleSearch}
                            numberOfLines={1}
                        />

                        {searchKeyword ? (
                            <TouchableOpacity onPress={handleClear} style={styles.iconWrapper}>
                                <XMarkIcon size={hp(2.5)} strokeWidth={3} color={'gray'} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={styles.iconWrapper}>
                                <CameraIcon size={hp(2.5)} strokeWidth={3} color={'gray'} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                */}
                {/* View card */}
                <View style={styles.cardcontainer}>
                    <View style={styles.headerWrapper}>
                        <Text style={styles.heading}>
                            Danh sách công thức
                        </Text>
                    </View>
                    <RecipeSearch recipes={recipes} />
                </View>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    searchBarContainer: {
        paddingHorizontal: wp(4),
        paddingTop: hp(1),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: hp(6), // Fixed height
        borderRadius: hp(3), // Half of height for pill shape
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: wp(3),
    },
    searchInput: {
        flex: 1,
        fontSize: hp(1.8),
        color: 'white',
        paddingHorizontal: wp(2),
        paddingVertical: 0, // Remove vertical padding to maintain height
        margin: 0, // Remove any default margins
        height: '100%', // Take full height of parent
    },
    iconWrapper: {
        padding: wp(1),
    },
    cardcontainer: {
        marginTop: hp(1.5),
        marginHorizontal: wp(4),
    },
    headerWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 5,
        marginBottom: 10,
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFF',
    },
});