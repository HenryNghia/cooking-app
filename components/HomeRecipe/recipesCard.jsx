import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from "react"; // Gom import React
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getRecipeByRating } from '../../services/recipeService'; // Giả sử hàm này lấy recipes cho user
import { useFocusEffect, useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
// Import hàm để check tất cả favorites MỘT LẦN
import { addFavorite, check } from '../../services/favoriteService'; // Đổi tên `checkFavorite` thành `checkAllFavorites` hoặc tên hàm đúng của bạn

export default function RecipeUser() {
    const [recipes, setRecipes] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Không cần setMessage ở đây nữa, FetchRecipe sẽ xử lý
        FetchRecipe();
    }, []); // Chỉ chạy một lần khi component mount

    useFocusEffect(
        React.useCallback(() => {
            FetchRecipe();
        }, [])
    );

    const FetchRecipe = async () => {
        setLoading(true);
        setMessage('Đang tải công thức của bạn...');

        try {
            // 1. Lấy danh sách công thức (ví dụ: getRecipeByTime hoặc một hàm riêng cho recipe của user)
            const recipeResponse = await getRecipeByRating(); // Hoặc getRecipesByUser() nếu có

            if (recipeResponse.status === 200 && recipeResponse.data && recipeResponse.data.length > 0) {
                const fetchedRecipes = recipeResponse.data;
                let favoriteRecipeIds = new Set();

                // 2. Gọi API checkAllFavorites MỘT LẦN DUY NHẤT
                try {
                    const favoriteApiResponse = await check(); // Sử dụng hàm mới

                    if (favoriteApiResponse.status === 200 && favoriteApiResponse.data) {
                        // Backend trả về data là mảng các object: [{recipe_id: X}, {recipe_id: Y}]
                        favoriteApiResponse.data.forEach(fav => favoriteRecipeIds.add(fav.recipe_id));
                    } else if (favoriteApiResponse.status === 201) {
                        // console.log('User has no favorites or list is empty.');
                    } else if (favoriteApiResponse.status === 401) {
                        console.warn('User not authenticated. Cannot check favorite statuses.');
                    }
                } catch (favError) {
                    console.error('Failed to fetch favorite statuses:', favError);
                    // Vẫn tiếp tục hiển thị recipes, isFavorite sẽ là false
                }

                // 3. Kết hợp trạng thái yêu thích
                const recipesWithFavStatus = fetchedRecipes.map(recipe => ({
                    ...recipe,
                    isFavorite: favoriteRecipeIds.has(recipe.id)
                }));

                setRecipes(recipesWithFavStatus);
                setMessage('');
            } else if (recipeResponse.status === 200 && (!recipeResponse.data || recipeResponse.data.length === 0)) {
                setMessage('Bạn chưa có công thức nào hoặc không tìm thấy công thức.');
                setRecipes([]);
            }
            else {
                setMessage(recipeResponse.message || 'Không tìm thấy công thức.');
                setRecipes([]);
            }
        } catch (error) {
            console.error('Failed to fetch recipes or process data:', error);
            setMessage('Lỗi khi tải công thức. Vui lòng thử lại.');
            setRecipes([]);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const roundedRating = Math.round(rating * 2) / 2;
        const fullRoundedStars = Math.floor(roundedRating);
        const hasHalfStar = roundedRating % 1 !== 0;

        for (let i = 0; i < fullRoundedStars; i++) {
            stars.push(<Icon key={`full-${i}`} name="star" size={16} color="#FFA500" style={styles.star} />);
        }
        if (hasHalfStar) {
            stars.push(<Icon key="half" name="star-half-full" size={16} color="#FFA500" style={styles.star} />);
        }
        const remainingStars = 5 - stars.length;
        for (let i = 0; i < remainingStars; i++) {
            stars.push(<Icon key={`empty-${i}`} name="star-o" size={16} color="#FFA500" style={styles.star} />);
        }
        return stars;
    };

    const handleFavorite = async (recipeId, currentIsFavorite) => {

        if (currentIsFavorite) {
            Alert.alert('Thông báo', 'Công thức này đã có trong danh sách yêu thích.');

            return;
        }

        try {
            console.log("Attempting to add recipe to favorites:", recipeId);
            const response = await addFavorite({ recipe_id: recipeId });

            if (response && response.status === 200) {
                console.log('Thêm thành công:', response.message);
                Alert.alert('Thành công', response.message || 'Đã thêm vào yêu thích!');
                setRecipes(prevRecipes =>
                    prevRecipes.map(recipe =>
                        recipe.id === recipeId ? { ...recipe, isFavorite: true } : recipe
                    )
                );
            } else {
                console.log('Thêm thất bại:', response?.message);
                Alert.alert('Thất bại', response?.message || 'Không thể thêm vào yêu thích.');
            }
        } catch (error) {
            console.error('Lỗi khi thêm:', error);
            Alert.alert('Lỗi', 'Lỗi khi kết nối để thêm yêu thích.');
        }
    };

    // JSX giữ nguyên cấu trúc hiển thị, nhưng FetchRecipe và handleFavorite đã được cập nhật
    return (
        // Trong JSX, recipes.slice(0, 4).map(...) sẽ chỉ hiển thị 4 item đầu tiên.
        // Nếu component này dùng để hiển thị TẤT CẢ recipes của user, bạn nên bỏ .slice(0,4)
        // hoặc có logic pagination/tải thêm.
        // Nếu nó chỉ là một phần nhỏ trên một màn hình khác, thì slice(0,4) có thể đúng.
        <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
                {/* Bạn có thể muốn thêm Header ở đây giống như component trước nếu cần */}
                {/* <View style={styles.headerrecipe}>
                    <Text style={styles.headingrecipe}>Công thức của bạn</Text>
                </View> */}
                <View style={styles.listContent}>
                    {loading ? (
                        <View style={styles.messageContainer}>
                            <ActivityIndicator size="large" color="#FFA500" />
                            <Text style={styles.messageText}>{message}</Text>
                        </View>
                    ) : (
                        recipes && recipes.length > 0 ? (
                            recipes.slice(0, 4).map((item) => ( // LƯU Ý: recipes.slice(0, 4)
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: '/recipe-detail/[id]',
                                        params: { id: item.id }
                                    })}
                                    key={item.id.toString()} // Key nên là string
                                    style={styles.cardWrapper}
                                >
                                    <View style={styles.container_card}>
                                        <TouchableOpacity
                                            style={styles.heartIcon}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                handleFavorite(item.id, item.isFavorite); // Truyền trạng thái hiện tại
                                            }}
                                        >
                                            <Icon
                                                name={item.isFavorite ? "bookmark" : "bookmark-o"}
                                                size={22}
                                                color="#FFF"
                                            />
                                        </TouchableOpacity>

                                        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />

                                        <View style={styles.contentContainer}>
                                            <Text style={styles.title} numberOfLines={1}>
                                                {item.title}
                                            </Text>
                                            <View style={styles.ratingContainer}>
                                                {renderStars(item.rating)}
                                            </View>
                                            <Text style={styles.chef} numberOfLines={1}>
                                                {item.name} {/* Giả sử item.name là tên người tạo/đầu bếp */}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={styles.messageContainer}>
                                <Text style={styles.messageText}>
                                    {message || 'Không có công thức nào được tìm thấy.'}
                                </Text>
                            </View>
                        )
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

// Styles giữ nguyên như bạn cung cấp
const styles = StyleSheet.create({
    scrollViewContainer: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollViewContent: {
        paddingBottom: hp(2),
    },
    container: {
        paddingHorizontal: wp(3),
        paddingTop: hp(2),
        backgroundColor: '#000000',
    },
    headerrecipe: {
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
    listContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: '48%',
        marginBottom: hp('2%'),
    },
    container_card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        overflow: 'hidden',
        position: 'relative',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    heartIcon: {
        position: 'absolute',
        top: hp(1.5),
        right: wp(2.5),
        zIndex: 1,
        padding: wp(1),
        borderRadius: 20,
        backgroundColor: 'transparent', 
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: hp('15%'),
    },
    contentContainer: {
        padding: wp(2.5),
    },
    title: {
        color: '#FFFFFF',
        fontSize: hp(1.9),
        fontWeight: 'bold',
        marginBottom: hp(0.5),
        textTransform: 'capitalize',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(0.8),
    },
    star: {
        marginRight: wp(0.8),
    },
    chef: {
        color: '#B0B0B0',
        fontSize: hp(1.6),
        fontStyle: 'italic',
    },
    messageContainer: {
        // flex: 1, // Xóa để không chiếm hết không gian nếu không có item
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        width: '100%', // Để message container chiếm toàn bộ chiều rộng
        minHeight: hp(20), // Đảm bảo có chiều cao tối thiểu
    },
    messageText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: hp(2),
        marginTop: hp(1),
    },
});