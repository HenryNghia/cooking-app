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
    Image,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraIcon, PlusCircleIcon } from 'react-native-heroicons/outline';
import { TrashIcon } from 'react-native-heroicons/solid';
import { getAllCategories } from '../../services/categoryService';
import { getAllLevel } from '../../services/levelService';
import { getRecipeById, updateRecipe } from '../../services/recipeService';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useLocalSearchParams, router } from 'expo-router';

import CoverPhotoInput from '../FormRecipe/CoverPhotoInput';
import IngredientItem from '../FormRecipe/IngredientItem';
import CookingStepItem from '../FormRecipe/CookingStepItem';

import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';

export default function UpdateRecipeScreen() {
    const { id } = useLocalSearchParams();

    const [loadingRecipe, setLoadingRecipe] = useState(true);
    const [recipeError, setRecipeError] = useState(null);

    const [categories, setCategories] = useState([]);
    const [level, setLevel] = useState([]);

    const [coverPhotoUri, setCoverPhotoUri] = useState(null);
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
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoadingRecipe(true);
        setRecipeError(null);

        try {
            const [categoriesRes, levelRes, recipeRes] = await Promise.all([
                getAllCategories().catch(e => { console.error("Error fetching categories:", e); return { status: 500 }; }),
                getAllLevel().catch(e => { console.error("Error fetching levels:", e); return { status: 500 }; }),
                id ? getRecipeById(id).catch(e => { console.error("Error fetching recipe:", e); return { status: 500 }; }) : Promise.resolve({ status: 404 })
            ]);

            if (categoriesRes.status === 200 && categoriesRes.data) {
                setCategories(categoriesRes.data);
            } else {
                console.error("Failed to load categories:", categoriesRes.message);
                setCategories([]);
            }

            if (levelRes.status === 200 && levelRes.data && levelRes.data.length > 0) {
                setLevel(levelRes.data);
            } else {
                console.error("Failed to load levels:", levelRes.message);
                setLevel([]);
            }

            if (id && recipeRes.status === 200 && recipeRes.data) {
                const fetchedRecipe = recipeRes.data;
                setCoverPhotoUri(fetchedRecipe.image);
                setTitle(fetchedRecipe.title);
                setDescription(fetchedRecipe.description);

                // Assuming time_cook is like "30 phút"
                const timeMatch = fetchedRecipe.time_cook ? fetchedRecipe.time_cook.match(/^(\d+)/) : null;
                setCookingTime(timeMatch ? timeMatch[1] : '');

                // Assuming ingredients are comma-separated "qty name"
                if (fetchedRecipe.ingredients) {
                    const parsedIngredients = fetchedRecipe.ingredients.split(', ').map((item, index) => {
                        const parts = item.split(' ');
                        const qty = parts.shift();
                        const name = parts.join(' ');
                        return { id: `${Date.now()}-${Math.random()}-${index}` + 'ing', name: name || '', qty: qty || '' };
                    }).filter(item => item.name || item.qty); // Filter out empty items
                    setIngredients(parsedIngredients);
                } else {
                    setIngredients([]);
                }


                // Assuming instructions are separated by '\\'
                if (fetchedRecipe.instructions) {
                    const parsedSteps = fetchedRecipe.instructions.split('\\').map((step, index) => ({
                        id: `${Date.now()}-${Math.random()}-${index}` + 'step',
                        description: step || ''
                    })).filter(step => step.description); // Filter out empty steps
                    setCookingSteps(parsedSteps);
                } else {
                    setCookingSteps([]);
                }


                // Set selected category and difficulty based on fetched IDs
                if (categoriesRes.data) {
                    setSelectedCategory(fetchedRecipe.id_category);
                }
                if (levelRes.data) {
                    const matchedDifficulty = levelRes.data.find(lvl => lvl.id === fetchedRecipe.id_level);
                    setSelectedDifficulty(matchedDifficulty || null);
                }


            } else if (id) {
                setRecipeError(recipeRes.message || 'Không tìm thấy công thức cần cập nhật.');
            } else {
                setRecipeError('Không có ID công thức được cung cấp.');
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            setRecipeError('Lỗi khi tải dữ liệu công thức và tùy chọn.');
        } finally {
            setLoadingRecipe(false);
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


    const handleUpdateRecipe = async () => {
        if (!id) {
            Alert.alert("Lỗi", "Không có ID công thức để cập nhật.");
            return;
        }

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


        const recipeData = {
            id: id, // Include the recipe ID in the update data
            image: coverPhotoUri,
            title: title.trim(),
            description: description.trim(),
            ingredients: ingredientsString,
            instructions: instructionsString,
            id_category: selectedCategory,
            id_level: selectedDifficulty.id,
            time_cook: `${timeNum} phút`,
        };

        console.log("Updating Recipe Data:", recipeData);

        try {
            const response = await updateRecipe(id, recipeData); // Assuming updateRecipe takes id and data

            console.log('API Response:', response);

            if (response.status === 200) {
                Alert.alert("Thành công", response.message || "Công thức đã được cập nhật!");
                // Optionally navigate back or to the updated recipe detail page
                router.back(); // Example: Navigate back after successful update
                // router.push(`/recipe-detail/${id}`); // Example: Navigate to detail page
            } else {
                Alert.alert("Lỗi", response.message || "Đã xảy ra lỗi khi cập nhật công thức.");
            }

        } catch (error) {
            console.error('Lỗi khi cập nhật công thức:', error);
            Alert.alert("Lỗi", "Không thể kết nối đến máy chủ hoặc có lỗi xảy ra. Vui lòng thử lại.");
        }
    };

    const difficultyHeaderStyle = {
        marginBottom: isDifficultyPickerVisible ? 0 : 15,
        borderBottomLeftRadius: isDifficultyPickerVisible ? 0 : 8,
        borderBottomRightRadius: isDifficultyPickerVisible ? 0 : 8,
    };


    if (loadingRecipe) {
        return (
            <View style={styles.fullScreenMessageContainer}>
                <ActivityIndicator size="large" color="#FFA500" />
                <Text style={styles.fullScreenMessageText}>Đang tải công thức...</Text>
            </View>
        );
    }

    if (recipeError) {
        return (
            <View style={styles.fullScreenMessageContainer}>
                <Text style={styles.fullScreenMessageText}>{recipeError}</Text>
                {/* Add a retry button if needed */}
                {/* <TouchableOpacity onPress={() => fetchData()} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity> */}
            </View>
        );
    }


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
                    <Text style={styles.screenTitle}>Cập Nhật Công Thức</Text>

                    <Text style={styles.sectionTitle}>Ảnh Bìa</Text>
                    <CoverPhotoInput uri={coverPhotoUri} onPhotoSelected={handlePhotoSelected} />

                    <Text style={styles.sectionTitle}>Tiêu đề</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Tiêu đề công thức"
                        placeholderTextColor="#999"
                        value={title}
                        onChangeText={setTitle}
                    />

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
                        <View style={styles.messageContainer}>
                            <Text style={styles.messageText}>Đang tải danh mục...</Text>
                        </View>
                    )}

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


                    <TouchableOpacity style={styles.createButton} onPress={handleUpdateRecipe}>
                        <Text style={styles.createButtonText}>Cập Nhật Công Thức</Text>
                    </TouchableOpacity>

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
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
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
    infoText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginTop: 10,
    },
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
        color: '#eee',
    },
    difficultyOptionsContainer: {
        backgroundColor: '#3a3a3a',
        borderRadius: 8,
        marginTop: 6,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
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
        borderBottomColor: '#555',
    },
    selectedDifficultyInList: {
        backgroundColor: '#4a4a4a',
    },
    difficultyOptionText: {
        fontSize: 16,
        color: '#eee',
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
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
        backgroundColor: '#888',
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
        backgroundColor: '#FF7043',
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
    fullScreenMessageContainer: {
        flex: 1,
        backgroundColor: '#1e1e1e',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    fullScreenMessageText: {
        fontSize: 18,
        color: '#eee',
        textAlign: 'center',
        marginTop: 10,
    }
});