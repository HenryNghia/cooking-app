import { ScrollView, Text, View, Image, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { BellIcon, CameraIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import Category from '../../components/Category/categories';
import Recipe from '../../components/HomeRecipe/recipesCard';
import { Avatar } from 'react-native-elements';
import '../global.css'
import { useRouter } from "expo-router";
import { SearchContext } from '../../context/SearchContext';
import { useContext } from 'react';
import RecipeUser from '../../components/HomeRecipe/RecipeUserCard';
export default function Home() {

    const router = useRouter();
    const { setIsSearchFocused, setSharedSearchKeyword } = useContext(SearchContext);

    // Function to handle focus on search input
    const handleSearchFocus = () => {
        setIsSearchFocused(true);
        router.push('/search');
    }
    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
                style={styles.scrollView}
            >
                {/* avatar and bell icon */}
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
                    <TouchableOpacity onPress={() => alert('Navigate to See More!')}>
                        <BellIcon size={hp(4)} color="gray" />
                    </TouchableOpacity>
                </View>

                {/* greetings and punchline */}
                <View style={styles.greetingContainer}>
                    <Text style={styles.greetingText1}>Make your own food,</Text>
                    <Text style={styles.greetingText2}>
                        stay at <Text style={styles.highlightText}>Home</Text>
                    </Text>
                </View>

                {/* search bar */}
                <TouchableOpacity style={styles.searchContainer} onPress={handleSearchFocus} activeOpacity={1}>
                    <View style={styles.searchIconContainer}>
                        <TouchableOpacity>
                            <MagnifyingGlassIcon size={hp(2.5)} strokeWidth={3} color={'gray'} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.searchPlaceholder}>Tìm kiếm công thức...</Text>
                    <View style={styles.cameraIconContainer}>
                        <TouchableOpacity>
                            <CameraIcon size={hp(2.5)} strokeWidth={3} color={'gray'} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>

                {/* categories */}
                <View style={styles.categoryContainer}>
                    <Category />
                </View>

                {/* recipes nổi bật rating > 4*/}
                <View style={styles.categoryContainer}>
                    <View style={styles.headerrecipe}>
                        <Text style={styles.headingrecipe}>Gợi ý</Text>
                        <TouchableOpacity onPress={() => router.push('../recommend')}>
                            <Text style={styles.seeMorerecipe}>Xem thêm {'>'}</Text>
                        </TouchableOpacity>
                    </View>
                    <Recipe />
                </View>

                <View style={styles.categoryContainer}>
                    <View style={styles.headerrecipe}>
                        <Text style={styles.headingrecipe}>Mới đăng gần đầy</Text>
                        <TouchableOpacity onPress={() => router.push('../recently')}>
                            <Text style={styles.seeMorerecipe}>Xem thêm {'>'}</Text>
                        </TouchableOpacity>
                    </View>
                    <RecipeUser />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollView: {
        paddingTop: hp(5.6), // equivalent to pt-14 in tailwind
    },
    scrollViewContent: {
        paddingBottom: 50,
    },
    headerContainer: {
        marginHorizontal: wp(4),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(0.5),
        borderRadius: hp(50), // rounded-full equivalent
    },
    avatarImage: {
        height: hp(9),
        width: hp(9),
        resizeMode: 'cover',
    },
    greetingContainer: {
        marginHorizontal: wp(4),
        marginBottom: hp(0.5),
        gap: hp(0.5), // space-y-2 equivalent
    },
    greetingText1: {
        fontWeight: '600',
        color: 'white',
        fontSize: hp(3.8),
    },
    greetingText2: {
        fontWeight: '600',
        color: 'white',
        fontSize: hp(3.8),
    },
    highlightText: {
        color: '#f59e0b', // amber-400
    },
    searchContainer: {
        marginTop: hp(2),
        flexDirection: 'row',
        alignItems: 'center',
        height: hp(6), // Fixed height
        borderRadius: hp(3), // Half of height for pill shape
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        backgroundColor: 'black',
        marginHorizontal: wp(4),
        paddingHorizontal: wp(3),
    },
    searchPlaceholder: {
        flex: 1,
        fontSize: hp(1.8),
        color: 'grey',
    },
    searchIconContainer: {
        paddingLeft: wp(1),
        paddingRight: wp(1),
    },
    cameraIconContainer: {
        paddingLeft: wp(1),
        paddingRight: wp(1),
    },
    clearIconContainer: {
        paddingRight: wp(2),
        paddingLeft: wp(1),
    },
    categoryContainer: {
        marginTop: hp(1.5), // mt-6 equivalent
    },

    headerrecipe: {
        marginHorizontal: wp(4),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(2),
        paddingHorizontal: wp(1),
    },
    headingrecipe: {
        fontSize: hp(2.5),
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    seeMorerecipe: {
        color: '#FFA500',
        fontSize: hp(1.8),
        fontWeight: '500',
    },
});