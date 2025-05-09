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
import { CameraIcon, PlusCircleIcon } from 'react-native-heroicons/outline';
import { TrashIcon } from 'react-native-heroicons/solid';
import { getAllCategories } from '../../services/categoryService';
import { getAllLevel } from '../../services/levelService';
import { addRecipe } from '../../services/recipeService';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Import component con
import CoverPhotoInput from './CoverPhotoInput';
import IngredientItem from './IngredientItem';
import CookingStepItem from './CookingStepItem';

// Icon mũi tên lên/xuống
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';

export default function CreateRecipeScreen() {
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState('');
    const [level, setLevel] = useState([]);

    const [coverPhotoUri, setCoverPhotoUri] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [cookingTime, setCookingTime] = useState('');
    // const [servings, setServings] = useState('');

    const [selectedDifficulty, setSelectedDifficulty] = useState(null); // State cho độ khó
    const [isDifficultyPickerVisible, setIsDifficultyPickerVisible] = useState(false); // State điều khiển hiển thị

    const [selectedCategory, setSelectedCategory] = useState(null);


    const [ingredients, setIngredients] = useState([]);
    const [newIngredientName, setNewIngredientName] = useState('');
    const [newIngredientQty, setNewIngredientQty] = useState('');

    const [cookingSteps, setCookingSteps] = useState([]);
    const [newCookingSteps, setNewCookingSteps] = useState(''); // State cho input thêm bước nấu mới


    const scrollViewRef = useRef(null);

    useEffect(() => {
        fetchCategories();
        fetchLevel();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await getAllCategories();
            if (res.status === 200 && res.data) { // Kiểm tra thêm res.data tồn tại
                setCategories(res.data);
                setMessage(res.message);
            } else {
                 // Xử lý trường hợp status không phải 200 hoặc data rỗng/null
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
            if (res.status === 200 && res.data && res.data.length > 0) { // Kiểm tra data tồn tại và không rỗng
                setLevel(res.data);
                setSelectedDifficulty(res.data[0]); // Tự động chọn phần tử đầu tiên
            } else {
                 // Xử lý trường hợp status không phải 200, data rỗng/null hoặc data rỗng
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


    const handlePhotoSelected = (uri) => {
        setCoverPhotoUri(uri);
    };

    const handleCategoryPress = (categoryId) => {
        if (selectedCategory === categoryId) {
            setSelectedCategory(null);
        } else {
            setSelectedCategory(categoryId);
        }
    };

    const handleAddIngredient = () => {
        const trimmedName = newIngredientName.trim();
        const trimmedQty = newIngredientQty.trim();
        if (trimmedName && trimmedQty) {
            setIngredients(prev => [
                ...prev,
                 // Sử dụng Date.now() kết hợp với random number để giảm thiểu khả năng trùng ID
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
        const trimmedDescription = newCookingSteps.trim(); // Sử dụng state đúng cho input
        if (trimmedDescription) {
            setCookingSteps(prev => [
                ...prev,
                 // Sử dụng Date.now() kết hợp với random number để giảm thiểu khả năng trùng ID
                 { id: `${Date.now()}-${Math.random()}` + 'step', description: trimmedDescription }
            ]);
            setNewCookingSteps(''); // Xóa nội dung input sau khi thêm
            if (scrollViewRef.current) {
                 // Cuộn xuống cuối sau khi thêm bước
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
        setSelectedDifficulty(difficultyObject); // Cập nhật độ khó đã chọn
        setIsDifficultyPickerVisible(false); // Ẩn danh sách lựa chọn
    };

    const toggleDifficultyPicker = () => {
          // Chỉ cho phép mở/đóng picker nếu có dữ liệu level
        if (level && level.length > 0) {
             setIsDifficultyPickerVisible(!isDifficultyPickerVisible);
           } else {
             // Hiển thị thông báo nếu không có dữ liệu level để chọn
             Alert.alert("Thông báo", "Chưa có dữ liệu độ khó để chọn hoặc đang tải.");
           }
    };

    const handleCreateRecipe = async () => {
        // --- Validations (kiểm tra dữ liệu đầu vào) ---
        if (!coverPhotoUri) {
            Alert.alert("Thiếu ảnh bìa", "Vui lòng thêm ảnh bìa cho công thức.");
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

        // if (servings.trim() && (isNaN(parseInt(servings, 10)) || parseInt(servings, 10) <= 0)) {
        //      Alert.alert("Khẩu phần không hợp lệ", "Vui lòng nhập số khẩu phần hợp lệ (lớn hơn 0).");
        //      return;
        // }

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

        // --- Chuẩn bị dữ liệu để gửi ---

        // Chuyển đổi mảng nguyên liệu thành chuỗi: "số lượng tên, số lượng tên, ..."
        const ingredientsString = ingredients.map(item => `${item.qty} ${item.name}`).join(', ');

        // Chuyển đổi mảng các bước nấu thành chuỗi: "mô tả\mô tả\..."
        // Sử dụng '\\' để biểu diễn ký tự '\' trong chuỗi JavaScript
        const instructionsString = cookingSteps.map(step => step.description).join('\\');


        // Xây dựng object dữ liệu để gửi đi, đảm bảo key và format dữ liệu khớp với back-end
        const recipeData = {
            image: coverPhotoUri, // Back-end mong đợi key 'image'
            title: title.trim(),
            description: description.trim(),
            ingredients: ingredientsString, // Đã chuyển thành chuỗi
            instructions: instructionsString, // Đã chuyển thành chuỗi, dùng key 'instructions'
            id_category: selectedCategory, // Back-end mong đợi key 'id_category' (chỉ gửi ID)
            id_level: selectedDifficulty.id, // Back-end mong đợi key 'id_level' (chỉ gửi ID)
            time_cook: `${timeNum} phút`, // Nối số với chuỗi " phút"
            // servings: servings.trim() ? parseInt(servings.trim(), 10) : null, // Gửi servings nếu có, dạng số
        };

        console.log("Creating Recipe Data:", recipeData); // Log dữ liệu trước khi gửi

        // --- Gửi dữ liệu đến API back-end ---
        try {
            const response = await addRecipe(recipeData);

            console.log('API Response:', response);

            if (response.status === 200) {
                Alert.alert("Thành công", response.message || "Công thức đã được tạo!");
                resetForm(); // Đặt lại form sau khi thành công
            } else {
                // Xử lý các mã trạng thái khác 200
                // Backend có thể trả về message lỗi cụ thể
                Alert.alert("Lỗi", response.message || "Đã xảy ra lỗi khi tạo công thức.");
            }

        } catch (error) {
            console.error('Lỗi khi tạo công thức:', error);
            // Xử lý lỗi mạng hoặc lỗi từ server không trả về format mong muốn
            Alert.alert("Lỗi", "Không thể kết nối đến máy chủ hoặc có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    // Hàm đặt lại form
    const resetForm = () => {
        setCoverPhotoUri(null);
        setTitle('');
        setDescription('');
        setCookingTime('');
        // setServings('');
        // Đảm bảo level không rỗng trước khi cố gắng chọn level[0]
        if (level && level.length > 0) {
             setSelectedDifficulty(level[0]);
        } else {
             setSelectedDifficulty(null); // Nếu không có level, đặt là null
        }
        setIsDifficultyPickerVisible(false);
        setSelectedCategory(null);
        setIngredients([]);
        setNewIngredientName('');
        setNewIngredientQty('');
        setCookingSteps([]);
        setNewCookingSteps('');
    }

    // Style điều khiển hiển thị picker độ khó
    const difficultyHeaderStyle = {
        marginBottom: isDifficultyPickerVisible ? 0 : 15,
        borderBottomLeftRadius: isDifficultyPickerVisible ? 0 : 8,
        borderBottomRightRadius: isDifficultyPickerVisible ? 0 : 8,
    };


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                    ref={scrollViewRef}
                >
                    <Text style={styles.screenTitle}>Chi Tiết Công Thức</Text>

                    {/* Cover Photo Input */}
                    <Text style={styles.sectionTitle}>Ảnh Bìa</Text>
                    <CoverPhotoInput uri={coverPhotoUri} onPhotoSelected={handlePhotoSelected} />

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
                        <View style={{ flex: 1, marginRight: 10 }}> {/* Thêm margin để tách 2 input */}
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
                        {/* <View style={{ flex: 1 }}>
                            <Text style={styles.sectionTitle}>Khẩu phần</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="2"
                                placeholderTextColor="#999"
                                keyboardType="number-pad"
                                value={servings}
                                onChangeText={setServings}
                            />
                        </View> */}
                    </View>

                    {/* Difficulty Picker */}
                    <Text style={styles.sectionTitle}>Độ khó</Text>
                    {/* Nút hiển thị độ khó hiện tại và bật/tắt danh sách */}
                    <TouchableOpacity
                        style={[styles.difficultyHeader, difficultyHeaderStyle]}
                        onPress={toggleDifficultyPicker}
                         // Vô hiệu hóa nút nếu chưa có dữ liệu level hoặc level rỗng
                        disabled={!level || level.length === 0}
                    >
                        <View style={styles.difficultyHeaderInner}>
                            <View style={styles.difficultyHeaderContent}>
                                {/* Dòng này đã được comment trong code gốc, nếu bạn muốn hiển thị màu, cần có logic map name_level với color */}
                                {/* <View style={[styles.difficultyIndicator, { backgroundColor: selectedDifficulty?.color }]} /> */}
                                <Text style={styles.difficultyHeaderText}>
                                    {/* Hiển thị tên độ khó đã chọn, hoặc thông báo nếu chưa có/đang tải */}
                                    {selectedDifficulty
                                        ? selectedDifficulty.name_level
                                        : (level && level.length > 0 ? 'Chọn độ khó' : 'Đang tải độ khó...')}
                                </Text>
                            </View>
                            {/* Icon mũi tên */}
                            {isDifficultyPickerVisible ? (
                                <ChevronUpIcon size={24} color="#999" />
                            ) : (
                                <ChevronDownIcon size={24} color="#999" />
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Danh sách các lựa chọn độ khó (hiển thị có điều kiện) */}
                    {/* Chỉ hiển thị danh sách nếu isDifficultyPickerVisible là true VÀ có dữ liệu trong mảng level */}
                    {isDifficultyPickerVisible && level && level.length > 0 && (
                        <View style={styles.difficultyOptionsContainer}>
                            {level.map((levelItem, index) => {
                                 // Kiểm tra xem levelItem hiện tại có phải là độ khó đang được chọn không
                                const isCurrentSelectionInList = selectedDifficulty && levelItem.id === selectedDifficulty.id;
                                 const isLastItem = index === level.length - 1; // Kiểm tra xem có phải item cuối cùng không để bỏ borderBottom

                                return (
                                    <TouchableOpacity
                                         key={levelItem.id} // Sử dụng id của levelItem làm key
                                        style={[
                                            styles.difficultyOptionItem,
                                             isCurrentSelectionInList && styles.selectedDifficultyInList, // Style cho item đang được chọn
                                             !isLastItem && styles.difficultyOptionItemBorder // Style cho đường kẻ giữa các item
                                        ]}
                                         onPress={() => handleSelectDifficulty(levelItem)} // Gọi hàm khi chọn một item
                                    >
                                        {/* Nếu bạn muốn hiển thị màu tương ứng với độ khó, cần map id/name với màu */}
                                        {/* <View style={[styles.difficultyIndicator, { backgroundColor: 'orange' }]} /> */}
                                        <Text style={styles.difficultyOptionText}>{levelItem.name_level}</Text> {/* Hiển thị tên độ khó */}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}


                    {/* Category Selector */}
                    <Text style={styles.sectionTitle}>Danh mục</Text>
                    {/* Chỉ hiển thị danh sách danh mục nếu có dữ liệu */}
                    {categories && categories.length > 0 ? (
                          <Animated.ScrollView
                              horizontal
                              entering={FadeInDown.duration(500).springify()} // Adjusted duration to 500
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={styles.horizontalList}
                              style={styles.categoryScrollView}>
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
                         // Hiển thị thông báo nếu không có dữ liệu danh mục
                         <Text style={styles.infoText}>Đang tải danh mục...</Text>
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
                          <Text style={styles.addNewItemTitle}>Thêm nguyên liệu mới</Text> {/* Thêm tiêu đề cho input bước mới */}
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
                                keyboardType="default" // Changed to default as quantity can be text (e.g., "một ít")
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
                           <Text style={styles.addNewItemTitle}>Thêm bước nấu mới</Text> {/* Thêm tiêu đề cho input bước mới */}
                        <TextInput
                            style={styles.multilineInput}
                            placeholder="Mô tả bước nấu..."
                            placeholderTextColor="#999"
                            value={newCookingSteps} // Sử dụng state đúng
                            onChangeText={setNewCookingSteps} // Sử dụng setter đúng
                            multiline={true}
                            minHeight={100}
                        />
                        <TouchableOpacity style={[styles.addButton, styles.addStepButton]} onPress={handleAddStep}>
                            <PlusCircleIcon size={24} color="white" /> {/* Thêm icon cho button thêm bước */}
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
        paddingHorizontal: 20,

    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingTop: 20,
        paddingBottom: 100,

    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,

        color: '#eee',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 8,

        color: '#eee',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        backgroundColor: '#3a3a3a',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2, // Tăng opacity shadow để dễ thấy trên nền tối
        shadowRadius: 3, // Tăng bán kính shadow
        elevation: 4, // Tăng elevation
    },
    multilineInput: {
        backgroundColor: '#3a3a3a',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#eee',
        textAlignVertical: 'top',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
     infoText: { // Style cho thông báo "Đang tải danh mục..."
         fontSize: 14,
         color: '#999',
         textAlign: 'center',
         marginTop: 10,
     },
    // Styles cho Difficulty Picker
    difficultyHeader: {
        backgroundColor: '#3a3a3a',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        zIndex: 1,
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
        fontSize: 16,
        color: '#eee', // Chữ sáng
    },
    difficultyOptionsContainer: {
        backgroundColor: '#3a3a3a', // Nền list tối nhạt hơn
        borderRadius: 8,
        marginTop: 6,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3, // Tăng opacity shadow
        shadowRadius: 5, // Tăng bán kính shadow
        elevation: 6, // Tăng elevation
        zIndex: 0,
        marginBottom: 15,
        overflow: 'hidden',
    },
    difficultyOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    difficultyOptionItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#555', // Màu border xám đậm hơn
    },
    selectedDifficultyInList: {
        backgroundColor: '#4a4a4a', // Nền hơi sáng hơn để highlight
    },
    difficultyOptionText: {
        fontSize: 16,
        color: '#eee', // Chữ sáng
    },
    difficultyIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },

    categoryScrollView: {
        marginBottom: 15,
    },
    horizontalList: {
        paddingHorizontal: 6,
        flexDirection: 'row',
    },
    categoryButton: {
        marginHorizontal: 4,
        width: hp(10),
        alignItems: 'center',
        padding: 5,
    },
    categoryimageContainer: {
        alignItems: 'center',
    },
    categoryitem: {
        padding: 6,
        borderRadius: hp(999),
    },
    categoryimage: {
        width: hp(8),
        height: hp(8),
        alignItems: 'center',
        borderRadius: 999,
        objectFit: 'cover'
    },
    categoryactive: {
        backgroundColor: 'rgba(251, 191, 36, 1)',
    },
    categoryinactive: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Nền xám nhạt (trắng hơi trong)
    },
    categorytext: {
        color: '#eee',
        textAlign: 'center',
        textTransform: 'capitalize',
        fontWeight: 'normal',
        minWidth: 80,
        fontSize: 12,
        marginTop: 4,
    },
    itemsList: {
        marginBottom: 15,
    },
    addNewItemContainer: {
        marginTop: 15,
        marginBottom: 15,
    },
    addNewItemTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#eee',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#888', // Màu xám cho nút thêm nguyên liệu
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        justifyContent: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    addStepButton: {
        backgroundColor: '#FF7043', // Màu cam cho nút thêm bước
    },
    createButton: {
        backgroundColor: '#FF7043',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 30,
        shadowColor: '#FF7043',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    createButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});