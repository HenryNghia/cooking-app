import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Keyboard } from 'react-native';
import React, { useEffect, useState } from 'react';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MagnifyingGlassIcon, ArrowLeftIcon, ClockIcon, XMarkIcon, BellIcon, CameraIcon } from 'react-native-heroicons/outline';
import RecipeSearch from './RecipeSearch'; // Assuming RecipeSearch.js is in the same directory
import { searchRecipeALL, getAllRecipes } from '../../services/recipeService';
import { Avatar } from 'react-native-elements';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [recipes, setRecipes] = useState([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!isSearchFocused && !isSearching) {
            FetchRecipe();
        }
    }, [isSearchFocused, isSearching]); // Added isSearching to dependency array for clarity, though original logic might rely on other effect.

    useEffect(() => {
        if (!isSearchFocused && isSearching) {
            // This effect seems to immediately set isSearching to false if search input loses focus
            // while a search was initiated. Consider if this is the desired behavior.
            // For now, keeping it as is.
            setIsSearching(false);
        }
    }, [isSearchFocused]);


    const FetchRecipe = async () => {
        try {
            const data = await getAllRecipes();
            if (data.status === 200) {
                setRecipes(data.data);
                setMessage(data.message || 'Recipes loaded.'); // Ensure message is set
            } else {
                setMessage(data.message || 'No recipes found.');
                setRecipes([]);
            }
        } catch (error) {
            setMessage('Failed to fetch recipes.');
            setRecipes([]);
        }
    };

    const addToSearchHistory = (keyword) => {
        if (!keyword || !keyword.trim()) return;
        const trimmedKeyword = keyword.trim();
        const updatedHistory = [
            trimmedKeyword,
            ...searchHistory.filter(item => item !== trimmedKeyword)
        ];
        const limitedHistory = updatedHistory.slice(0, 5);
        setSearchHistory(limitedHistory);
    };

    const handleRemoveHistoryItem = (itemToRemove) => {
        const updatedHistory = searchHistory.filter(item => item !== itemToRemove);
        setSearchHistory(updatedHistory);
    };

    const handleSearch = async (keywordToSearch) => { // Allow passing keyword directly
        const finalKeyword = (typeof keywordToSearch === 'string' ? keywordToSearch : searchKeyword).trim();
        if (!finalKeyword) {
            // Optionally, fetch all recipes or show a specific message if search is empty
            // FetchRecipe(); // Or set a message like "Please enter a keyword"
            // For now, if search is empty, it might show "Search failed" or previous recipes based on service.
            // Let's ensure recipes are cleared if keyword is empty.
            setRecipes([]);
            setMessage('Please enter a search term.');
            setIsSearching(false);
            return;
        }
        try {
            setIsSearching(true);
            const data = await searchRecipeALL(finalKeyword);
            if (data.status === 200) {
                setRecipes(data.data);
                setMessage(data.message || `Results for "${finalKeyword}"`);
                addToSearchHistory(finalKeyword);
            } else {
                setRecipes([]);
                setMessage(data.message || `No results found for "${finalKeyword}".`);
            }
            setIsSearchFocused(false);
            setIsSearching(false); // Set isSearching to false after search completes
        } catch (error) {
            console.error('Search error:', error);
            setRecipes([]);
            setMessage('Search failed.');
            setIsSearchFocused(false);
            setIsSearching(false); // Also set false on error
        }
    };


    const handleHistoryItemPress = (item) => {
        setSearchKeyword(item);
        handleSearch(item); // Pass item directly to handleSearch
    };

    const handleClear = () => {
        setSearchKeyword('');
        // Optionally, clear results or fetch all recipes
        // FetchRecipe();
        // setRecipes([]);
        // setMessage('');
    };

    const renderFocusedSearchUI = () => (
        <View style={styles.focusedContainer}>
            <View style={styles.focusedHeader}>
                <TouchableOpacity onPress={() => {
                    setIsSearchFocused(false);
                    Keyboard.dismiss();
                    if (!searchKeyword && recipes.length === 0) { // If coming back from empty search, fetch all
                        FetchRecipe();
                    }
                }}>
                    <ArrowLeftIcon size={hp(3)} color="white" />
                </TouchableOpacity>
                <View style={styles.focusedSearchInputContainer}>
                    <TouchableOpacity onPress={() => handleSearch()}>
                        <MagnifyingGlassIcon size={hp(2.5)} color="grey" style={{ marginLeft: wp(2) }} />
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Gõ vào tên công thức hoặc nguyên liệu"
                        placeholderTextColor={'grey'}
                        value={searchKeyword}
                        onChangeText={(text) => setSearchKeyword(text)}
                        style={styles.focusedSearchInput}
                        onSubmitEditing={() => handleSearch()}
                        autoFocus={true}
                        numberOfLines={1}
                    />
                    {searchKeyword ? (
                        <TouchableOpacity onPress={handleClear} style={styles.iconWrapper}>
                            <XMarkIcon size={hp(2.5)} strokeWidth={3} color={'gray'} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            <ScrollView style={styles.historyScroll}>
                {searchHistory.map((item, index) => (
                    <View key={index} style={styles.historyItemContainer}>
                        <TouchableOpacity
                            style={styles.historyItemTouchable}
                            onPress={() => handleHistoryItemPress(item)}
                        >
                            <ClockIcon size={hp(2.5)} color="grey" />
                            <Text style={styles.historyText}>{item}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleRemoveHistoryItem(item)}>
                            <XMarkIcon size={hp(2.5)} color="grey" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </View>
    );

    const renderDefaultUI = () => (
        <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => router.push('/profile')}>
                    <Avatar
                        rounded
                        size={hp(6)}
                        source={require('../../assets/images/profile.png')}
                    />
                </TouchableOpacity>
                <Image
                    source={require('../../assets/images/logomain.png')}
                    style={styles.avatarImage}
                />
                <TouchableOpacity onPress={() => alert('Notifications!')}>
                    <BellIcon size={hp(4)} color="gray" />
                </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
                <TouchableOpacity
                    style={styles.searchContainer}
                    onPress={() => setIsSearchFocused(true)}
                    activeOpacity={1}
                >
                    <MagnifyingGlassIcon size={hp(2.5)} strokeWidth={3} color={'gray'} style={{ marginRight: wp(2) }} />
                    <Text style={searchKeyword && !isSearchFocused ? styles.searchInputText : styles.searchPlaceholder}>
                        {searchKeyword && !isSearchFocused ? searchKeyword : "Tìm kiếm công thức..."}
                    </Text>
                    <TouchableOpacity style={{ marginLeft: 'auto', padding: hp(0.5) }} onPress={() => alert('Camera Search!')}>
                        <CameraIcon size={hp(2.5)} strokeWidth={3} color={'gray'} />
                    </TouchableOpacity>
                </TouchableOpacity>
            </View>
            {/* Ensure message is displayed if needed when recipes are empty */}
            {recipes.length === 0 && message && !isSearching ? (
                 <Text style={styles.messageText}>{message}</Text>
            ) : null}
            <View style={styles.cardcontainer}>
                {/* MODIFICATION: Pass the message prop */}
                <RecipeSearch recipes={recipes} searchKeyword={searchKeyword} message={message} />
            </View>
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            {isSearchFocused ? renderFocusedSearchUI() : renderDefaultUI()}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    headerContainer: {
        marginHorizontal: wp(4),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(1),
    },
    avatarImage: {
        height: hp(9),
        width: hp(9),
        resizeMode: 'cover',
    },
    searchWrapper: {
        marginTop: hp(2),
        marginBottom: hp(1),
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#333',
        borderRadius: hp(5),
        paddingVertical: hp(1.2),
        paddingHorizontal: wp(4),
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    searchPlaceholder: {
        flex: 1,
        fontSize: hp(1.8),
        color: 'grey',
        marginLeft: wp(1),
    },
    searchInputText: { // Used when searchKeyword exists and not focused
        flex: 1,
        fontSize: hp(1.8),
        color: 'white',
        marginLeft: wp(1),
    },
    cardcontainer: {
        marginTop: hp(1),
    },
    messageText: { // General message text style
        color: 'grey',
        textAlign: 'center',
        marginHorizontal: wp(4),
        marginTop: hp(2), // Increased margin for better visibility
        fontSize: hp(1.8), // Increased font size
    },
    focusedContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    focusedHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    focusedSearchInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        borderRadius: hp(5),
        marginHorizontal: wp(2),
        paddingVertical: hp(0.5),
    },
    focusedSearchInput: {
        flex: 1,
        fontSize: hp(1.8),
        color: 'white',
        paddingHorizontal: wp(2),
        paddingVertical: hp(0.8),
    },
    historyScroll: {
        flex: 1,
        paddingHorizontal: wp(5),
        marginTop: hp(2),
    },
    historyItemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: hp(1.5),
    },
    historyItemTouchable: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: wp(3),
    },
    historyText: {
        color: 'white',
        fontSize: hp(1.9),
        marginLeft: wp(4),
    },
    iconWrapper: {
        padding: wp(1),
        marginRight: wp(2),
    },
});