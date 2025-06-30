// File: createrecipe.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// ... (các import khác của bạn)
import Animated, { FadeInDown } from 'react-native-reanimated'; 
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// Import component con
import CoverPhotoInput from './CoverPhotoInput'; 
import IngredientItem from './IngredientItem';     
import CookingStepItem from './CookingStepItem';  

import { getAllCategories } from '../../services/categoryService';
import { getAllLevel } from '../../services/levelService';     
import { addRecipe } from '../../services/recipeService';     

import { ChevronDownIcon, ChevronUpIcon, PlusCircleIcon, CameraIcon as HeroCameraIcon } from 'react-native-heroicons/outline'; // Ví dụ, đổi tên CameraIcon để tránh trùng
import { TrashIcon } from 'react-native-heroicons/solid';
import { useRouter } from 'expo-router'; 

export default function CreateRecipeScreen() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');
    const [level, setLevel] = useState([]);
    const [coverPhoto, setCoverPhoto] = useState(null); // Sẽ lưu { uri, name, type }
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [cookingTime, setCookingTime] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [isDifficultyPickerVisible, setIsDifficultyPickerVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [ingredients, setIngredients] = useState([]);
    const [newIngredientName, setNewIngredientName] = useState('');
    const [newIngredientQty, setNewIngredientQty] = useState('');
    const [cookingSteps, setCookingSteps] = useState([]);
    const [newCookingSteps, setNewCookingSteps] = useState('');
    const scrollViewRef = useRef(null);

    useEffect(() => {
        fetchCategories();
        fetchLevel();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await getAllCategories();
            if (res.status === 200 && res.data) {
                setCategories(res.data);
            } else {
                setMessage(res.message || 'Không thể tải danh sách danh mục.');
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            setMessage('Lỗi khi tải danh sách danh mục.');
            setCategories([]);
        }
    };

    const fetchLevel = async () => {
        try {
            const res = await getAllLevel();
            if (res.status === 200 && res.data && res.data.length > 0) {
                setLevel(res.data);
                setSelectedDifficulty(res.data[0]);
            } else {
                setMessage(res.message || 'Không thể tải danh sách độ khó.');
                setLevel([]);
                setSelectedDifficulty(null);
            }
        } catch (error) {
            console.error('Error fetching levels:', error);
            setMessage('Lỗi khi tải danh sách độ khó.');
            setLevel([]);
            setSelectedDifficulty(null);
        }
    };

    // Hàm này nhận object { uri, name, type } từ CoverPhotoInput
    const handlePhotoSelected = (photoData) => {
        console.log("Photo data received in CreateRecipeScreen:", photoData);
        // Kiểm tra xem photoData có phải là object và có thuộc tính uri không
        if (photoData && typeof photoData === 'object' && photoData.hasOwnProperty('uri')) {
            setCoverPhoto(photoData);
        } else {
            console.error("Invalid photoData received in CreateRecipeScreen:", photoData);
            // Reset nếu dữ liệu không hợp lệ để tránh lỗi
            setCoverPhoto(null);
        }
    };


    const handleCategoryPress = (categoryId) => {
        setSelectedCategory(prev => (prev === categoryId ? null : categoryId));
    };

    const handleAddIngredient = () => {
        const trimmedName = newIngredientName.trim();
        const trimmedQty = newIngredientQty.trim();
        if (trimmedName && trimmedQty) {
            setIngredients(prev => [
                ...prev,
                { id: `${Date.now()}-${Math.random()}` + 'ing', name: trimmedName, qty: trimmedQty }
            ]);
            setNewIngredientName('');
            setNewIngredientQty('');
        } else {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập tên nguyên liệu và số lượng.");
        }
    };

    const handleRemoveIngredient = (idToRemove) => {
        setIngredients(prev => prev.filter(item => item.id !== idToRemove));
    };

    const handleAddStep = () => {
        const trimmedDescription = newCookingSteps.trim();
        if (trimmedDescription) {
            setCookingSteps(prev => [
                ...prev,
                { id: `${Date.now()}-${Math.random()}` + 'step', description: trimmedDescription }
            ]);
            setNewCookingSteps('');
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollToEnd({ animated: true });
            }
        } else {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập mô tả bước nấu.");
        }
    };

    const handleRemoveStep = (idToRemove) => {
        setCookingSteps(prev => prev.filter(item => item.id !== idToRemove));
    };

    const handleSelectDifficulty = (difficultyObject) => {
        setSelectedDifficulty(difficultyObject);
        setIsDifficultyPickerVisible(false);
    };

    const toggleDifficultyPicker = () => {
        if (level && level.length > 0) {
            setIsDifficultyPickerVisible(!isDifficultyPickerVisible);
        } else {
            Alert.alert("Thông báo", "Chưa có dữ liệu độ khó để chọn hoặc đang tải.");
        }
    };


    const handleCreateRecipe = async () => {
        if (!coverPhoto || !coverPhoto.uri || typeof coverPhoto.uri !== 'string') { // Thêm kiểm tra kiểu của uri
            Alert.alert("Thiếu ảnh bìa", "Vui lòng thêm ảnh bìa hợp lệ cho công thức.");
            return;
        }
        if (!title.trim()) {
            Alert.alert("Thiếu tiêu đề", "Vui lòng nhập tiêu đề công thức.");
            return;
        }
        if (!description.trim()) {
            Alert.alert("Thiếu mô tả", "Vui lòng nhập mô tả công thức.");
            return;
        }
        const timeNum = parseInt(cookingTime, 10);
        if (isNaN(timeNum) || timeNum <= 0) {
            Alert.alert("Thời gian nấu không hợp lệ", "Vui lòng nhập thời gian nấu hợp lệ (lớn hơn 0).");
            return;
        }
        if (!selectedCategory) {
            Alert.alert("Thiếu danh mục", "Vui lòng chọn danh mục.");
            return;
        }
        if (!selectedDifficulty) {
            Alert.alert("Thiếu độ khó", "Vui lòng chọn độ khó cho công thức.");
            return;
        }
        if (ingredients.length === 0) {
            Alert.alert("Thiếu nguyên liệu", "Vui lòng thêm ít nhất một nguyên liệu.");
            return;
        }
        if (cookingSteps.length === 0) {
            Alert.alert("Thiếu bước nấu", "Vui lòng thêm ít nhất một bước nấu.");
            return;
        }


        const ingredientsString = ingredients.map(item => `${item.qty} ${item.name}`).join(', ');
        const instructionsString = cookingSteps.map(step => step.description).join('\\');

        const formData = new FormData();
        formData.append('image', {
            uri: Platform.OS === 'ios' ? coverPhoto.uri.replace('file://', '') : coverPhoto.uri,
            name: coverPhoto.name,
            type: coverPhoto.type,
        });
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('ingredients', ingredientsString);
        formData.append('instructions', instructionsString);
        formData.append('id_category', selectedCategory);
        formData.append('id_level', selectedDifficulty.id);
        formData.append('timecook', `${timeNum}`);

        console.log("FormData entries prepared:");
        for (let pair of formData.entries()) {
            if (pair[0] === 'image') {
                console.log(`${pair[0]}, URI: ${pair[1].uri}, Name: ${pair[1].name}, Type: ${pair[1].type}`);
            } else {
                console.log(`${pair[0]}, ${pair[1]}`);
            }
        }

        try {
            const response = await addRecipe(formData); // Ensure addRecipe is correctly defined and imported
            if (response.status === true) {
                Alert.alert("Thành công", response.message || "Công thức đã được tạo!");
                resetForm();
                router.push('/recipe-user');
            } else {
                Alert.alert("Lỗi", response.message || "Đã xảy ra lỗi khi tạo công thức.");
            }
        } catch (error) {
            console.error('Lỗi khi tạo công thức:', error);
            let errorMessage = "Không thể kết nối đến máy chủ hoặc có lỗi xảy ra. Vui lòng thử lại.";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            Alert.alert("Lỗi", errorMessage);
        }
    };

    const resetForm = () => {
        setCoverPhoto(null);
        setTitle('');
        setDescription('');
        setCookingTime('');
        if (level && level.length > 0) {
            setSelectedDifficulty(level[0]);
        } else {
            setSelectedDifficulty(null);
        }
        setIsDifficultyPickerVisible(false);
        setSelectedCategory(null);
        setIngredients([]);
        setNewIngredientName('');
        setNewIngredientQty('');
        setCookingSteps([]);
        setNewCookingSteps('');
    };

    const difficultyHeaderStyle = {
        marginBottom: isDifficultyPickerVisible ? 0 : 15,
        borderBottomLeftRadius: isDifficultyPickerVisible ? 0 : 8,
        borderBottomRightRadius: isDifficultyPickerVisible ? 0 : 8,
    };

    // Biến để truyền vào prop uri của CoverPhotoInput một cách an toàn
    // Nó sẽ là string (nếu coverPhoto.uri tồn tại và là string) hoặc null.
    const uriForCoverPhotoInput = (coverPhoto && coverPhoto.uri && typeof coverPhoto.uri === 'string')
        ? coverPhoto.uri
        : null;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // 'height' có thể tốt hơn cho Android
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                    ref={scrollViewRef}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.screenTitle}>Chi Tiết Công Thức</Text>

                    <Text style={styles.sectionTitle}>Ảnh Bìa</Text>
                    {/* Đảm bảo truyền đúng giá trị string hoặc null cho prop uri */}
                    <CoverPhotoInput
                        uri={uriForCoverPhotoInput}
                        onPhotoSelected={handlePhotoSelected}
                    />

                    {/* Title Input */}
                    <Text style={styles.sectionTitle}>Tiêu đề</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Tiêu đề công thức"
                        placeholderTextColor="#999"
                        value={title}
                        onChangeText={setTitle}
                    />

                    {/* Description Input */}
                    <Text style={styles.sectionTitle}>Mô tả</Text>
                    <TextInput
                        style={styles.multilineInput}
                        placeholder="Mô tả công thức của bạn..."
                        placeholderTextColor="#999"
                        value={description}
                        onChangeText={setDescription}
                        multiline={true}
                        minHeight={100}
                    />

                    {/* Cooking Time and Servings */}
                    <View style={styles.rowContainer}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <Text style={styles.sectionTitle}>Thời gian nấu (phút)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="30"
                                placeholderTextColor="#999"
                                keyboardType="number-pad"
                                value={cookingTime}
                                onChangeText={setCookingTime}
                            />
                        </View>
                    </View>

                    {/* Difficulty Picker */}
                    <Text style={styles.sectionTitle}>Độ khó</Text>
                    <TouchableOpacity
                        style={[styles.difficultyHeader, difficultyHeaderStyle]}
                        onPress={toggleDifficultyPicker}
                        disabled={!level || level.length === 0}
                    >
                        <View style={styles.difficultyHeaderInner}>
                            <View style={styles.difficultyHeaderContent}>
                                <Text style={styles.difficultyHeaderText}>
                                    {selectedDifficulty
                                        ? selectedDifficulty.name_level
                                        : (level && level.length > 0 ? 'Chọn độ khó' : 'Đang tải độ khó...')}
                                </Text>
                            </View>
                            {isDifficultyPickerVisible ? (
                                <ChevronUpIcon size={24} color="#999" />
                            ) : (
                                <ChevronDownIcon size={24} color="#999" />
                            )}
                        </View>
                    </TouchableOpacity>

                    {isDifficultyPickerVisible && level && level.length > 0 && (
                        <View style={styles.difficultyOptionsContainer}>
                            {level.map((levelItem, index) => {
                                const isCurrentSelectionInList = selectedDifficulty && levelItem.id === selectedDifficulty.id;
                                const isLastItem = index === level.length - 1;
                                return (
                                    <TouchableOpacity
                                        key={levelItem.id}
                                        style={[
                                            styles.difficultyOptionItem,
                                            isCurrentSelectionInList && styles.selectedDifficultyInList,
                                            !isLastItem && styles.difficultyOptionItemBorder
                                        ]}
                                        onPress={() => handleSelectDifficulty(levelItem)}
                                    >
                                        <Text style={styles.difficultyOptionText}>{levelItem.name_level}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}


                    {/* Category Selector */}
                    <Text style={styles.sectionTitle}>Danh mục</Text>
                    {categories && categories.length > 0 ? (
                        <Animated.ScrollView
                            horizontal
                            entering={FadeInDown.duration(500).springify()}
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.horizontalList}
                            style={styles.categoryScrollView}
                        >
                            {categories.map(cat => {
                                const isSelected = selectedCategory === cat.id;
                                const activecategoryButtonStyle = isSelected ? styles.categoryactive : styles.categoryinactive;
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => handleCategoryPress(cat.id)}
                                        style={styles.categoryButton}
                                    >
                                        <View style={styles.categoryimageContainer}>
                                            <View style={[styles.categoryitem, activecategoryButtonStyle]}>
                                                <Image
                                                    source={{ uri: cat.image }}
                                                    style={styles.categoryimage}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                            <Text style={styles.categorytext}>{cat.name_category}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </Animated.ScrollView>
                    ) : (
                        <Text style={styles.infoText}>{message || 'Đang tải danh mục...'}</Text>
                    )}

                    {/* Ingredients */}
                    <Text style={styles.sectionTitle}>Nguyên liệu</Text>
                    <View style={styles.itemsList}>
                        {ingredients.map(item => (
                            <IngredientItem
                                key={item.id}
                                ingredient={item}
                                onRemove={() => handleRemoveIngredient(item.id)}
                            />
                        ))}
                    </View>

                    {/* Add New Ingredient */}
                    <View style={styles.addNewItemContainer}>
                        <Text style={styles.addNewItemTitle}>Thêm nguyên liệu mới</Text>
                        <View style={styles.rowContainer}>
                            <TextInput
                                style={[styles.input, { flex: 2, marginRight: 10 }]}
                                placeholder="Tên nguyên liệu"
                                placeholderTextColor="#999"
                                value={newIngredientName}
                                onChangeText={setNewIngredientName}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                placeholder="Số lượng"
                                placeholderTextColor="#999"
                                keyboardType="default"
                                value={newIngredientQty}
                                onChangeText={setNewIngredientQty}
                            />
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
                            <PlusCircleIcon size={24} color="white" />
                            <Text style={styles.addButtonText}>Thêm Nguyên liệu</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Cooking Steps */}
                    <Text style={styles.sectionTitle}>Các bước nấu</Text>
                    <View style={styles.itemsList}>
                        {cookingSteps.map((step, index) => (
                            <CookingStepItem
                                key={step.id}
                                step={step}
                                index={index}
                                onRemove={() => handleRemoveStep(step.id)}
                            />
                        ))}
                    </View>

                    {/* Add New Step */}
                    <View style={styles.addNewItemContainer}>
                        <Text style={styles.addNewItemTitle}>Thêm bước nấu mới</Text>
                        <TextInput
                            style={styles.multilineInput}
                            placeholder="Mô tả bước nấu..."
                            placeholderTextColor="#999"
                            value={newCookingSteps}
                            onChangeText={setNewCookingSteps}
                            multiline={true}
                            minHeight={100}
                        />
                        <TouchableOpacity style={[styles.addButton, styles.addStepButton]} onPress={handleAddStep}>
                            <PlusCircleIcon size={24} color="white" />
                            <Text style={styles.addButtonText}>Thêm Bước</Text>
                        </TouchableOpacity>
                    </View>


                    {/* Create Recipe Button */}
                    <TouchableOpacity style={styles.createButton} onPress={handleCreateRecipe}>
                        <Text style={styles.createButtonText}>Tạo Công Thức</Text>
                    </TouchableOpacity>

                    {/* Padding cuối ScrollView */}
                    <View style={{ height: 50 }} />
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1e1e1e',
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: wp(5), // Sử dụng wp cho padding ngang

    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingTop: hp(2),    // Sử dụng hp cho padding top
        paddingBottom: hp(10), // Sử dụng hp cho padding bottom

    },
    screenTitle: {
        fontSize: wp(6), // Responsive font size
        fontWeight: 'bold',
        marginBottom: hp(2.5), // Responsive margin
        color: '#eee',
    },
    sectionTitle: {
        fontSize: wp(4.5), // Responsive font size
        fontWeight: '600',
        marginTop: hp(2),    // Responsive margin
        marginBottom: hp(1), // Responsive margin
        color: '#eee',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hp(1.5),
    },
    input: {
        backgroundColor: '#3a3a3a',
        borderRadius: 8,
        paddingVertical: hp(1.5), // Responsive padding
        paddingHorizontal: wp(3.5), // Responsive padding
        fontSize: wp(4), // Responsive font size
        color: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        // Thêm marginBottom cho input đơn lẻ để có khoảng cách
        marginBottom: hp(1.5),
    },
    multilineInput: {
        backgroundColor: '#3a3a3a',
        borderRadius: 8,
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(3.5),
        fontSize: wp(4),
        color: '#eee',
        textAlignVertical: 'top',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        marginBottom: hp(1.5), // Đảm bảo có khoảng cách dưới
        // minHeight đã được set trong props, không cần ở đây
    },
    infoText: {
        fontSize: wp(3.5),
        color: '#999',
        textAlign: 'center',
        marginTop: hp(1),
        marginBottom: hp(1.5),
    },
    difficultyHeader: {
        backgroundColor: '#3a3a3a',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(3.5),
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        zIndex: 1,
        // marginBottom được quản lý bởi difficultyHeaderStyle
    },
    difficultyHeaderInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex: 1,
    },
    difficultyHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    difficultyHeaderText: {
        fontSize: wp(4),
        color: '#eee',
    },
    difficultyOptionsContainer: {
        backgroundColor: '#3a3a3a',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        // marginTop: 0, // Không cần nếu header không có border bottom khi mở
        paddingHorizontal: 0, // Để item tự padding
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
        zIndex: 0,
        marginBottom: hp(2), // Khoảng cách sau picker
        overflow: 'hidden',
    },
    difficultyOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(3.5), // Padding cho text bên trong
    },
    difficultyOptionItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#555',
    },
    selectedDifficultyInList: {
        backgroundColor: '#4a4a4a',
    },
    difficultyOptionText: {
        fontSize: wp(4),
        color: '#eee',
    },
    // difficultyIndicator: { // Không dùng
    //     width: 10,
    //     height: 10,
    //     borderRadius: 5,
    //     marginRight: 10,
    // },

    categoryScrollView: {
        marginBottom: hp(2),
    },
    horizontalList: {
        paddingHorizontal: wp(0.5), // Giảm padding để nhiều item hơn
        flexDirection: 'row',
    },
    categoryButton: {
        marginHorizontal: wp(1), // Responsive margin
        width: hp(10), // Giữ nguyên theo chiều cao màn hình
        alignItems: 'center',
        padding: wp(1), // Responsive padding
    },
    categoryimageContainer: {
        alignItems: 'center',
    },
    categoryitem: {
        padding: wp(1.5), // Responsive padding
        borderRadius: hp(5), // Nửa của hp(10) để tạo hình tròn hoàn hảo
    },
    categoryimage: {
        width: hp(8),   // Kích thước ảnh
        height: hp(8),  // Kích thước ảnh
        borderRadius: hp(4), // Nửa kích thước ảnh để tròn
        // resizeMode: 'cover' đã có trong props
    },
    categoryactive: {
        backgroundColor: 'rgba(251, 191, 36, 1)',
    },
    categoryinactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    categorytext: {
        color: '#eee',
        textAlign: 'center',
        textTransform: 'capitalize',
        fontWeight: 'normal',
        fontSize: wp(3), // Responsive font size
        marginTop: hp(0.5),
        // minWidth không cần thiết, để text tự điều chỉnh
    },
    itemsList: {
        marginBottom: hp(2),
    },
    addNewItemContainer: {
        marginBottom: hp(2.5), // Tăng khoảng cách dưới
    },
    addNewItemTitle: { // Giống sectionTitle
        fontSize: wp(4.5),
        fontWeight: '600',
        marginBottom: hp(1),
        color: '#eee',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#555',
        borderRadius: 8,
        paddingVertical: hp(1.8), // Responsive padding
        paddingHorizontal: wp(4.5),// Responsive padding
        justifyContent: 'center',
        marginTop: hp(1.2),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    addButtonText: {
        color: 'white',
        fontSize: wp(4), // Responsive font size
        fontWeight: 'bold',
        marginLeft: wp(1.5), // Responsive margin
    },
    addStepButton: {
        backgroundColor: '#FF7043',
    },
    createButton: {
        backgroundColor: '#FF7043',
        borderRadius: 8,
        paddingVertical: hp(2), // Responsive padding
        alignItems: 'center',
        marginTop: hp(3.5), // Khoảng cách trên nút tạo
        shadowColor: '#FF7043',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    createButtonText: {
        color: 'white',
        fontSize: wp(4.5), // Responsive font size
        fontWeight: 'bold',
    },
});