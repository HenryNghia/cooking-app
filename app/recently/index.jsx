import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from "react"; // Gom import React
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getRecipeByTime } from '../../services/recipeService';
import { router, useFocusEffect } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
// Sử dụng hàm `check` đã định nghĩa trong service, bỏ `checkFavorite` nếu nó không dùng hoặc gây nhầm lẫn
import { addFavorite, check } from '../../services/favoriteService';

// Đổi tên component thành viết hoa chữ cái đầu (convention)
export default function RecentlyIndex() { // Hoặc một tên ý nghĩa hơn như RecipeListScreen
    const [recipes, setRecipes] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        FetchRecipe();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            FetchRecipe();
        }
        , [])
    );
    
    const FetchRecipe = async () => {
        setLoading(true); // Đặt loading ở đầu hàm
        setMessage('Đang tải công thức...'); // Thông báo ban đầu

        try {
            // 1. Lấy danh sách công thức
            const recipeResponse = await getRecipeByTime();

            if (recipeResponse.status === 200 && recipeResponse.data && recipeResponse.data.length > 0) {
                const fetchedRecipes = recipeResponse.data;
                let favoriteRecipeIds = new Set(); // Dùng Set để kiểm tra 'has' nhanh hơn

                // 2. Gọi API `check` MỘT LẦN DUY NHẤT để lấy tất cả ID yêu thích của user
                try {
                    // Hàm `check()` từ favoriteService sẽ gọi API 'favorite/check-data-favorite'
                    const favoriteApiResponse = await check();

                    if (favoriteApiResponse.status === 200 && favoriteApiResponse.data) {
                        // Backend trả về data là mảng các object: [{recipe_id: X}, {recipe_id: Y}]
                        favoriteApiResponse.data.forEach(fav => favoriteRecipeIds.add(fav.recipe_id));
                    } else if (favoriteApiResponse.status === 201) {
                        // // Người dùng không có mục yêu thích nào, favoriteRecipeIds sẽ rỗng (đúng)
                        // console.log('User has no favorites or list is empty.');
                    } else if (favoriteApiResponse.status === 401) {
                        // Người dùng chưa đăng nhập. Các công thức sẽ hiển thị không có trạng thái yêu thích.
                        console.warn('User not authenticated. Cannot check favorite statuses.');
                        // Bạn có thể muốn hiển thị thông báo hoặc disable nút favorite ở đây.
                    }
                    // Các lỗi khác từ API check (ví dụ server error) sẽ được bắt ở catch(favError)
                } catch (favError) {
                    console.error('Failed to fetch favorite statuses:', favError);
                }

                // 3. Kết hợp trạng thái yêu thích vào danh sách công thức
                const recipesWithFavStatus = fetchedRecipes.map(recipe => ({
                    ...recipe,
                    isFavorite: favoriteRecipeIds.has(recipe.id) // Kiểm tra id của recipe có trong Set không
                }));

                setRecipes(recipesWithFavStatus);
                setMessage(''); // Xóa message loading khi có dữ liệu
            } else if (recipeResponse.status === 200 && (!recipeResponse.data || recipeResponse.data.length === 0)) {
                setMessage('Không tìm thấy công thức nào.');
                setRecipes([]);
            }
            else {
                // Xử lý các trường hợp lỗi khác từ getRecipeByTime
                setMessage(recipeResponse.message || 'Không tìm thấy công thức.');
                setRecipes([]);
            }
        } catch (error) {
            // Lỗi này thường là từ getRecipeByTime() hoặc lỗi mạng chung, hoặc lỗi trong logic xử lý
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

    // Cân nhắc đổi tên thành handleToggleFavorite và thêm logic xóa nếu cần
    const handleFavorite = async (recipeId, currentIsFavorite) => {
        // Để làm toggle, bạn cần 1 API removeFavorite
        // và backend API addFavorite có thể xử lý nếu đã tồn tại (ví dụ không thêm nữa, hoặc trả lỗi)
        // Ví dụ đơn giản chỉ thêm:
        if (currentIsFavorite) {
            Alert.alert('Thông báo', 'Công thức này đã có trong danh sách yêu thích của bạn.');
            // Hoặc gọi API xóa yêu thích nếu bạn có
            return;
        }

        try {
            console.log("Attempting to add recipe to favorites:", recipeId);
            const response = await addFavorite({ recipe_id: recipeId }); // addFavorite cần trả về {status, message, data?}

            if (response && response.status === 200) { // Giả sử status 200 là thành công
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

    return (
        <ScrollView style={styles.scrollViewContainer} contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
                 <View style={styles.header}>
                    <Text style={styles.heading}>Công thức mới nhất</Text> 
                 </View>
                <View style={styles.listContent}>
                    {loading ? (
                         <View style={styles.messageContainer}>
                            <ActivityIndicator size="large" color="#FFA500" />
                            <Text style={styles.messageText}>
                                {message}
                            </Text>
                         </View>
                    ) : (
                        recipes && recipes.length > 0 ? (
                            recipes.map((item) => (
                                <TouchableOpacity
                                    onPress={() => router.push({
                                        pathname: '/recipe-detail/[id]', // Đảm bảo route này tồn tại và đúng
                                        params: { id: item.id }
                                    })}
                                    key={item.id.toString()} // key nên là string
                                    style={styles.cardWrapper}
                                >
                                    <View style={styles.container_card}>
                                        <TouchableOpacity
                                            style={styles.heartIcon}
                                            onPress={(e) => {
                                                e.stopPropagation(); // Ngăn sự kiện lan ra card cha
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
                                                {item.name} {/* Giả sử item.name là tên đầu bếp */}
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hp(2),
        paddingHorizontal: wp(1),
    },
    heading: {
        fontSize: hp(2.5),
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    seeMore: { // Style này có vẻ không được sử dụng trong JSX hiện tại
        color: '#FFA500',
        fontSize: hp(1.8),
        fontWeight: '500',
    },
    listContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between', // Đảm bảo các item cách đều
    },
    cardWrapper: {
        width: '48%', // Để 2 item trên 1 hàng, có khoảng cách ở giữa
        marginBottom: hp('2%'),
    },
    container_card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 15,
        overflow: 'hidden',
        position: 'relative',
        elevation: 4, // Cho Android
        shadowColor: '#000', // Cho iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    messageContainer: {
        // flex: 1, // Xóa flex 1 để nó không chiếm toàn bộ không gian khi có ít item
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
        marginTop: hp(1), // Thêm khoảng cách với ActivityIndicator
    },
    heartIcon: {
        position: 'absolute',
        top: hp(1.5),
        right: wp(2.5),
        zIndex: 1,
        padding: wp(1), // Có thể tăng padding cho dễ bấm
        borderRadius: 20,
        backgroundColor: 'tranpsparent', 
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: hp('15%'), // Điều chỉnh chiều cao ảnh nếu cần
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
});