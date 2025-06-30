import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Keyboard, Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MagnifyingGlassIcon, ArrowLeftIcon, ClockIcon, XMarkIcon, BellIcon, CameraIcon } from 'react-native-heroicons/outline';
import { Avatar } from 'react-native-elements';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { SearchContext } from '../../context/SearchContext';
import { searchRecipeALL, getAllRecipes } from '../../services/recipeService';
import RecipeSearch from '../../components/Search/RecipeSearch';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

interface Recipe {
    id: string;
    title: string;
    // Thêm các thuộc tính khác của recipe tại đây
}

export default function SearchScreen() {
    const router = useRouter();
    const {
        isSearchFocused,
        setIsSearchFocused,
        sharedSearchKeyword,
        setSharedSearchKeyword,
        searchHistory,
        setSearchHistory,
        addToSearchHistory
    } = useContext(SearchContext);

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [message, setMessage] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);

    const [isTfReady, setIsTfReady] = useState(false);
    const [model, setModel] = useState<any>(null);
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const labels = ['gà rán', 'sườn nướng'];

    useEffect(() => {
        const loadModel = async () => {
            await tf.ready();
            console.log('✅ TensorFlow sẵn sàng');
            setIsTfReady(true);
            const modelJson = require('../../assets/ml/model.json');
            const modelWeights = require('../../assets/ml/weights.bin');
            const loadedModel = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
            setModel(loadedModel);
            console.log('model đã được tải thành công');
        };
        loadModel();
    }, []);

    useEffect(() => {
        if (!isSearchFocused && !isSearching) {
            setSharedSearchKeyword('');
            fetchRecipes();
        }
    }, [isSearchFocused]);

    useEffect(() => {
        if (!isSearchFocused && isSearching) {
            setIsSearching(false);
        }
    }, [isSearchFocused]);

    
    const fetchRecipes = async () => {
        try {
            const data = await getAllRecipes();
            if (data.status === 200) {
                setRecipes(data.data);
                setMessage(data.message);
            } else {
                setMessage(data.message);
                setRecipes([]);
            }
        } catch (error) {
            setRecipes([]);
        }
    };

     const handleSearch = async () => {
        const finalKeyword = sharedSearchKeyword.trim();
        try {
            setIsSearching(true);
            const data = await searchRecipeALL(finalKeyword);
            if (data.status === 200) {
                setRecipes(data.data);
                setMessage(data.message);
                addToSearchHistory(finalKeyword);
            } else {
                setRecipes([]);
                setMessage(data.message);
            }
            setIsSearchFocused(false);
            Keyboard.dismiss();
        } catch (error) {
            setRecipes([]);
            setMessage('Search failed.');
            setIsSearchFocused(false);
        }
    };


    const handleRemoveHistoryItem = (itemToRemove: string) => {
        const updatedHistory: string[] = searchHistory.filter((item: string) => item !== itemToRemove);
        setSearchHistory(updatedHistory);
    };


    const handleHistoryItemPress = async (item: string) => {
        setSharedSearchKeyword(item);
    };

    const handleClear = () => {
        setSharedSearchKeyword('');
    };


    const handleSearchImage = async () => {
        try {
            // 1. Chọn ảnh
            const res = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                base64: false,
            });

            if (res.canceled) return;

            const uri = res.assets[0].uri;

            // 2. Đọc ảnh từ đường dẫn `uri` và chuyển nó thành chuỗi base64.
            const file = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Tạo một mảng byte từ `ArrayBuffer`, để đưa vào giải mã ảnh.
            const buffer = tf.util.encodeString(file, 'base64').buffer as ArrayBuffer;
            const raw = new Uint8Array(buffer);
            // chuyển ảnh JPEG thành tensor có shape [height, width, channels]
            const imageTensor = decodeJpeg(raw);

            // 3. Resize + chuẩn hóa
            const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
            const normalized = resized.div(tf.scalar(255)).expandDims(0);

            // 4. Dự đoán
            const prediction = model.predict(normalized) as tf.Tensor;
            const predictionData = await prediction.data();
            const maxIndex = predictionData.indexOf(Math.max(...predictionData));
            const predictedLabel = labels[maxIndex];

            console.log('Kết quả dự đoán:', predictedLabel + ' (' + predictionData[maxIndex] * 100 + '%)');

            const data = await searchRecipeALL(predictedLabel);
            if (data.status === 200) {
                setRecipes(data.data);
                setMessage(data.message);
                addToSearchHistory(predictedLabel);
            } else {
                setRecipes([]);
                setMessage(data.message);
            }
            setIsSearchFocused(false);
            Keyboard.dismiss();
        } catch (error) {
            console.error('❌ Lỗi nhận diện hình ảnh:', error);
        }
    };
   
    const renderFocusedSearchUI = () => (
        <View style={styles.focusedContainer}>
            <View style={styles.focusedHeader}>
                <TouchableOpacity onPress={() => {
                    setIsSearchFocused(false);
                    Keyboard.dismiss();
                }}>
                    <ArrowLeftIcon size={hp(3)} color="white" />
                </TouchableOpacity>
                <View style={styles.focusedSearchInputContainer}>
                    <TouchableOpacity onPress={handleSearch}>
                        <MagnifyingGlassIcon size={hp(2.5)} color="grey" style={{ marginLeft: wp(2) }} />
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Gõ vào tên công thức hoặc nguyên liệu"
                        placeholderTextColor={'grey'}
                        value={sharedSearchKeyword}
                        onChangeText={(text) => setSharedSearchKeyword(text)}
                        style={styles.focusedSearchInput}
                        onSubmitEditing={handleSearch}
                        autoFocus={true}
                        numberOfLines={1}
                    />
                    {sharedSearchKeyword ? (
                        <TouchableOpacity onPress={handleClear} style={styles.iconWrapper}>
                            <XMarkIcon size={hp(2.5)} strokeWidth={3} color={'gray'} />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            <ScrollView style={styles.historyScroll}>
                {searchHistory.map((item: string, index: number) => (
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
        <ScrollView>
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
                <View style={styles.searchContainer}>
                    <TouchableOpacity
                        style={styles.searchIconContainer}
                        onPress={() => setIsSearchFocused(true)}
                        activeOpacity={1}
                    >
                        <MagnifyingGlassIcon size={hp(2.5)} strokeWidth={3} color={'#FFF'} style={{ marginRight: wp(2) }} />
                        <Text style={sharedSearchKeyword ? styles.searchInputText : styles.searchPlaceholder}>
                            {sharedSearchKeyword || "Tìm kiếm công thức..."}
                        </Text>
                        <View style={styles.cameraIconContainer}>
                            <TouchableOpacity style={{ paddingLeft: wp(3) }} onPress={handleSearchImage}>
                                <CameraIcon size={hp(2.5)} strokeWidth={3} color={'#FFF'} />
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>
                <View>
                    <View style={styles.headerWrapper}>
                        <Text style={styles.heading}>
                            {sharedSearchKeyword ? `✨ Công thức cho "${sharedSearchKeyword}"` : (recipes.length > 0 ? '✨ Công thức nổi bật' : '')}
                        </Text>
                    </View>
                    <RecipeSearch recipes={recipes} searchKeyword={sharedSearchKeyword} message={message} />
                </View>

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
        paddingTop: hp(5.6),
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
        marginHorizontal: wp(4),
        marginTop: hp(2),
        marginBottom: hp(1),
        height: 'auto'
    },
    searchContainer: {
        marginTop: hp(2),
        flexDirection: 'row',
        alignItems: 'center',
        height: hp(6), // Fixed height
        borderRadius: hp(3), // Half of height for pill shape
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        backgroundColor: '#333',
        marginHorizontal: wp(2),
        paddingHorizontal: wp(4),
        marginBottom: hp(4),
    },
    searchIconContainer: {
        paddingLeft: wp(1),
        paddingRight: wp(1),
        flexDirection: 'row',
    },
    searchPlaceholder: {
        flex: 1,
        fontSize: hp(1.8),
        color: 'grey',
        zIndex: 1,
    },
    searchInputText: {
        flex: 1,
        fontSize: hp(1.8),
        color: 'white',
        marginLeft: wp(1),
    },
    cameraIconContainer: {
        paddingLeft: wp(1),
        paddingRight: wp(1),
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
    cardcontainer: {
        flex: 1,
        marginTop: hp(1),
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