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
import { CameraIcon as HeroCameraIcon, PlusCircleIcon } from 'react-native-heroicons/outline';
import { TrashIcon } from 'react-native-heroicons/solid';
import { getAllCategories } from '../../services/categoryService';
import { getAllLevel } from '../../services/levelService';
import { getRecipeById, updateRecipe } from '../../services/recipeService';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useLocalSearchParams, router } from 'expo-router';

import CoverPhotoInput from '../../components/FormRecipe/CoverPhotoInput';
import IngredientItem from '../../components/FormRecipe/IngredientItem';
import CookingStepItem from '../../components/FormRecipe/CookingStepItem';
import { ChevronDownIcon, ChevronUpIcon } from 'react-native-heroicons/outline';

export default function UpdateRecipeScreen() {
    const { id } = useLocalSearchParams();

    const [loadingRecipe, setLoadingRecipe] = useState(true);
    const [recipeError, setRecipeError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [categories, setCategories] = useState([]);
    const [level, setLevel] = useState([]);

    const [coverPhoto, setCoverPhoto] = useState(null);
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
        if (id) {
            fetchData();
        } else {
            setRecipeError("Không có ID công thức được cung cấp.");
            setLoadingRecipe(false);
        }
    }, [id]);

    const fetchData = async () => {
        setLoadingRecipe(true);
        setRecipeError(null);
        console.log("Fetching data for recipe ID:", id);
        try {
            const [categoriesRes, levelRes, recipeRes] = await Promise.all([
                getAllCategories().catch(e => { console.error("Error fetching categories:", e); return { status: 500, message: e.message || "Lỗi tải danh mục" }; }),
                getAllLevel().catch(e => { console.error("Error fetching levels:", e); return { status: 500, message: e.message || "Lỗi tải độ khó" }; }),
                getRecipeById(id).catch(e => { console.error("Error fetching recipe:", e); return { status: 500, message: e.message || "Lỗi tải công thức" }; })
            ]);

            if (categoriesRes.status === 200 && categoriesRes.data) {
                setCategories(categoriesRes.data);
            } else {
                console.warn("Failed to load categories:", categoriesRes.message);
                setCategories([]);
            }

            if (levelRes.status === 200 && levelRes.data && levelRes.data.length > 0) {
                setLevel(levelRes.data);
            } else {
                console.warn("Failed to load levels:", levelRes.message);
                setLevel([]);
            }

            if (recipeRes.status === 200 && recipeRes.data) {
                const fetchedRecipe = recipeRes.data;
                console.log("Fetched Recipe Data:", fetchedRecipe);

                if (fetchedRecipe.image && typeof fetchedRecipe.image === 'string') {
                    setCoverPhoto({ uri: fetchedRecipe.image });
                } else {
                    setCoverPhoto(null);
                }
                setTitle(fetchedRecipe.title || '');
                setDescription(
                    typeof fetchedRecipe.description === 'string'
                        ? fetchedRecipe.description
                        : (Array.isArray(fetchedRecipe.description) ? fetchedRecipe.description.join('\n') : '')
                );

                const timeValue = fetchedRecipe.timecook ? String(fetchedRecipe.timecook).match(/^(\d+)/) : null;
                setCookingTime(timeValue ? timeValue[1] : '');


                // Assuming API returns ingredients as an array of strings like: ["1 cup flour", "2 eggs"]
                if (fetchedRecipe.ingredients && Array.isArray(fetchedRecipe.ingredients)) {
                    const parsedIngredients = fetchedRecipe.ingredients.map((itemString, index) => {
                        const trimmedItem = itemString.trim();
                        // Regex to split quantity (potentially multi-word) from name
                        // It captures (everything before the last space if it's followed by non-space) and (the last word)
                        // OR (the whole string if no space)
                        const match = trimmedItem.match(/^(.*?)\s+([^\s]+)$/);
                        let qty = '';
                        let name = trimmedItem;

                        if (match) {
                            // Check if the first part (potential quantity) contains numbers or common fractions
                            // This is a heuristic and might need refinement based on your data
                            const potentialQty = match[1];
                            if (/\d/.test(potentialQty) || ['½', '¼', '¾', '1/2', '1/4', '3/4'].some(frac => potentialQty.includes(frac))) {
                                qty = potentialQty;
                                name = match[2];
                            } else {
                                // If not, the whole string is the name
                                name = trimmedItem;
                            }
                        }
                        return { id: `ing-${Date.now()}-${index}-${Math.random()}`, name: name.trim(), qty: qty.trim() };
                    }).filter(item => item.name || item.qty);
                    setIngredients(parsedIngredients);
                } else {
                    console.warn('API: ingredients is not an array or is missing:', fetchedRecipe.ingredients);
                    setIngredients([]);
                }

                // Assuming API returns instructions as an array of strings
                if (fetchedRecipe.instructions && Array.isArray(fetchedRecipe.instructions)) {
                    const parsedSteps = fetchedRecipe.instructions.map((step, index) => ({
                        id: `step-${Date.now()}-${index}-${Math.random()}`,
                        description: step || ''
                    })).filter(step => step.description);
                    setCookingSteps(parsedSteps);
                } else {
                    console.warn('API: instructions is not an array or is missing:', fetchedRecipe.instructions);
                    setCookingSteps([]);
                }
                if (categoriesRes.data && fetchedRecipe.id_category) {
                    setSelectedCategory(fetchedRecipe.id_category);
                }
                if (levelRes.data && fetchedRecipe.id_level) {
                    const matchedDifficulty = levelRes.data.find(lvl => lvl.id === fetchedRecipe.id_level);
                    setSelectedDifficulty(matchedDifficulty || null);
                }

            } else {
                setRecipeError(recipeRes.message || `Không tìm thấy công thức với ID: ${id}.`);
            }

        } catch (error) {
            console.error('Critical error in fetchData:', error);
            setRecipeError('Lỗi nghiêm trọng khi tải dữ liệu.');
        } finally {
            setLoadingRecipe(false);
        }
    };

    const handlePhotoSelected = (photoData) => {
        console.log("Photo data selected by user:", photoData);
        if (photoData && typeof photoData === 'object' && photoData.hasOwnProperty('uri')) {
            setCoverPhoto(photoData);
        } else if (photoData === null) {
            setCoverPhoto(null);
            console.log("Photo selection resulted in null, coverPhoto reset.");
        } else {
            console.error("Invalid photoData received from CoverPhotoInput:", photoData);
        }
    };

    const handleCategoryPress = (categoryId) => {
        setSelectedCategory(prev => (prev === categoryId ? null : categoryId));
    };

    const handleAddIngredient = () => {
        const trimmedName = newIngredientName.trim();
        const trimmedQty = newIngredientQty.trim();
        if (trimmedName) {
            setIngredients(prev => [
                ...prev,
                { id: `ing-${Date.now()}-${Math.random()}`, name: trimmedName, qty: trimmedQty }
            ]);
            setNewIngredientName('');
            setNewIngredientQty('');
        } else {
            Alert.alert("Thiếu thông tin", "Vui lòng nhập tên nguyên liệu.");
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
                { id: `step-${Date.now()}-${Math.random()}`, description: trimmedDescription }
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
        if (!coverPhoto || !coverPhoto.uri) {
            Alert.alert("Thiếu ảnh bìa", "Vui lòng thêm ảnh bìa cho công thức.");
            return;
        }
        if (!title.trim()) {
            Alert.alert("Thiếu tiêu đề", "Vui lòng nhập tiêu đề công thức.");
            return;
        }
        // ... (các validation khác tương tự)

        const timeNum = parseInt(cookingTime, 10);
        if (isNaN(timeNum) || timeNum <= 0) {
            Alert.alert("Thời gian nấu không hợp lệ", "Vui lòng nhập thời gian nấu hợp lệ (lớn hơn 0).");
            return;
        }
        if (!selectedCategory) {
            Alert.alert("Thiếu danh mục", "Vui lòng chọn danh mục.");
            return;
        }
        if (!selectedDifficulty || !selectedDifficulty.id) {
            Alert.alert("Thiếu độ khó", "Vui lòng chọn độ khó cho công thức.");
            return;
        }

        setIsSubmitting(true);

        // Backend mong đợi ingredients là một chuỗi "qty1 name1,qty2 name2,..."
        // và instructions là "step1\\step2\\..."
        const ingredientsString = ingredients.map(item => `${item.qty} ${item.name}`.trim()).join(',');
        const instructionsString = cookingSteps.map(step => step.description).join('\\');

        const formData = new FormData();
        formData.append('id', id);
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('ingredients', ingredientsString);
        formData.append('instructions', instructionsString);
        formData.append('id_category', selectedCategory);
        formData.append('id_level', selectedDifficulty.id);
        formData.append('timecook', String(timeNum));

        // Chỉ thêm trường 'image' nếu người dùng đã chọn một file mới
        // Dấu hiệu là coverPhoto.name và coverPhoto.type tồn tại (được set bởi CoverPhotoInput)
        if (coverPhoto.name && coverPhoto.type) {
            formData.append('image', {
                uri: Platform.OS === 'ios' ? coverPhoto.uri.replace('file://', '') : coverPhoto.uri,
                name: coverPhoto.name,
                type: coverPhoto.type,
            });
        }
        // Nếu không có coverPhoto.name và coverPhoto.type, nghĩa là người dùng không thay đổi ảnh
        // hoặc ảnh hiện tại là từ server. Backend sẽ không nhận trường 'image' và giữ nguyên ảnh cũ.

        console.log("FormData entries prepared for update:");
        for (let pair of formData.entries()) {
            if (pair[0] === 'image' && typeof pair[1] === 'object') {
                console.log(`${pair[0]}, URI: ${pair[1].uri}, Name: ${pair[1].name}, Type: ${pair[1].type}`);
            } else {
                console.log(`${pair[0]}, ${pair[1]}`);
            }
        }

        try {
            // Giả sử service updateRecipe chỉ cần formData, vì id đã có trong formData
            // Hoặc nếu service cần id riêng: await updateRecipe(id, formData);
            const response = await updateRecipe(formData);
            console.log('API Update Response:', response);
            if (response.status === true || response.status === 200 || response.status === 201) {
                Alert.alert("Thành công", response.message || "Công thức đã được cập nhật!");
                router.back();
            } else {
                Alert.alert("Lỗi", response.message || "Đã xảy ra lỗi khi cập nhật công thức.");
            }

        } catch (error) {
            console.error('Lỗi khi cập nhật công thức:', error);
            let errorMessage = "Không thể kết nối đến máy chủ hoặc có lỗi xảy ra. Vui lòng thử lại.";
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            Alert.alert("Lỗi", errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const difficultyHeaderStyle = {
        marginBottom: isDifficultyPickerVisible ? 0 : 15,
        borderBottomLeftRadius: isDifficultyPickerVisible ? 0 : 8,
        borderBottomRightRadius: isDifficultyPickerVisible ? 0 : 8,
    };

    const uriForCoverPhotoInput = (coverPhoto && coverPhoto.uri && typeof coverPhoto.uri === 'string')
        ? coverPhoto.uri
        : null;

    if (loadingRecipe) {
        return (
            <View style={styles.fullScreenMessageContainer}>
                <ActivityIndicator size="large" color="#FFA500" />
                <Text style={styles.fullScreenMessageText}>Đang tải công thức...</Text>
            </View>
        );
    }

    if (recipeError && !loadingRecipe) {
        return (
            <View style={styles.fullScreenMessageContainer}>
                <Text style={styles.fullScreenMessageText}>{recipeError}</Text>
                <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Thử lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? hp(10) : 0} // Tăng offset cho iOS
        >
            <SafeAreaView style={styles.safeArea}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                    ref={scrollViewRef}
                    keyboardShouldPersistTaps="handled"
                >
                    <Text style={styles.screenTitle}>Cập Nhật Công Thức</Text>

                    <Text style={styles.sectionTitle}>Ảnh Bìa</Text>
                    <CoverPhotoInput
                        uri={uriForCoverPhotoInput}
                        onPhotoSelected={handlePhotoSelected}
                    />

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
                        minHeight={hp(12)}
                    />

                    <View style={styles.rowContainer}>
                        <View style={{ flex: 1, marginRight: wp(2) }}>
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
                                        : (level && level.length > 0 ? 'Chọn độ khó' : 'Đang tải...')}
                                </Text>
                            </View>
                            {isDifficultyPickerVisible ? (
                                <ChevronUpIcon size={wp(6)} color="#999" />
                            ) : (
                                <ChevronDownIcon size={wp(6)} color="#999" />
                            )}
                        </View>
                    </TouchableOpacity>

                    {isDifficultyPickerVisible && level && level.length > 0 && (
                        <View style={styles.difficultyOptionsContainer}>
                            {level.map((levelItem) => (
                                <TouchableOpacity
                                    key={levelItem.id}
                                    style={[
                                        styles.difficultyOptionItem,
                                        selectedDifficulty && levelItem.id === selectedDifficulty.id && styles.selectedDifficultyInList,
                                    ]}
                                    onPress={() => handleSelectDifficulty(levelItem)}
                                >
                                    <Text style={styles.difficultyOptionText}>{levelItem.name_level}</Text>
                                </TouchableOpacity>
                            ))}
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
                                return (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => handleCategoryPress(cat.id)}
                                        style={styles.categoryButton}
                                    >
                                        <View style={styles.categoryimageContainer}>
                                            <View style={[styles.categoryitem, isSelected ? styles.categoryactive : styles.categoryinactive]}>
                                                <Image
                                                    source={{ uri: cat.image }}
                                                    style={styles.categoryimage}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                            <Text style={styles.categorytext} numberOfLines={2}>{cat.name_category}</Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </Animated.ScrollView>
                    ) : (
                        <View style={styles.messageContainer}>
                            <Text style={styles.infoText}>{(categories && categories.length === 0 && !loadingRecipe) ? "Không có danh mục." : "Đang tải..."}</Text>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Nguyên liệu</Text>
                    {ingredients.map(item => (
                        <IngredientItem
                            key={item.id}
                            ingredient={item}
                            onRemove={() => handleRemoveIngredient(item.id)}
                        />
                    ))}
                    <View style={styles.addNewItemContainer}>
                        <Text style={styles.addNewItemTitle}>Thêm nguyên liệu mới</Text>
                        <View style={styles.rowContainer}>
                            <TextInput
                                style={[styles.input, { flex: 2, marginRight: wp(2), marginBottom: 0 }]}
                                placeholder="Tên nguyên liệu"
                                placeholderTextColor="#999"
                                value={newIngredientName}
                                onChangeText={setNewIngredientName}
                            />
                            <TextInput
                                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                placeholder="Số lượng"
                                placeholderTextColor="#999"
                                keyboardType="default" // Consider 'numeric' or 'decimal-pad' if always numbers
                                value={newIngredientQty}
                                onChangeText={setNewIngredientQty}
                            />
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={handleAddIngredient}>
                            <PlusCircleIcon size={wp(6)} color="white" />
                            <Text style={styles.addButtonText}>Thêm Nguyên liệu</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Các bước nấu</Text>
                    {cookingSteps.map((step, index) => (
                        <CookingStepItem
                            key={step.id}
                            step={step}
                            index={index}
                            onRemove={() => handleRemoveStep(step.id)}
                        />
                    ))}
                    <View style={styles.addNewItemContainer}>
                        <Text style={styles.addNewItemTitle}>Thêm bước nấu mới</Text>
                        <TextInput
                            style={styles.multilineInput}
                            placeholder="Mô tả bước nấu..."
                            placeholderTextColor="#999"
                            value={newCookingSteps}
                            onChangeText={setNewCookingSteps}
                            multiline={true}
                            minHeight={hp(12)}
                        />
                        <TouchableOpacity style={[styles.addButton, styles.addStepButton]} onPress={handleAddStep}>
                            <PlusCircleIcon size={wp(6)} color="white" />
                            <Text style={styles.addButtonText}>Thêm Bước</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={styles.createButton} onPress={handleUpdateRecipe} disabled={isSubmitting || loadingRecipe}>
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.createButtonText}>Cập Nhật Công Thức</Text>
                        )}
                    </TouchableOpacity>

                    <View style={{ height: hp(7) }} />
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
        paddingHorizontal: wp(5),

    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        paddingTop: hp(2),
        paddingBottom: hp(10),

    },
    screenTitle: {
        fontSize: wp(6.5),
        fontWeight: 'bold',
        marginBottom: hp(3),
        color: '#eee',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: wp(4.5),
        fontWeight: '600',
        marginTop: hp(2.5),
        marginBottom: hp(1),
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
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        fontSize: wp(4),
        color: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        marginBottom: hp(1.5),
    },
    multilineInput: {
        backgroundColor: '#3a3a3a',
        borderRadius: 8,
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        fontSize: wp(4),
        color: '#eee',
        textAlignVertical: 'top',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        marginBottom: hp(1.5),
    },
    infoText: {
        fontSize: wp(3.8),
        color: '#999',
        textAlign: 'center',
        marginTop: hp(1.5),
    },
    messageContainer: {
        minHeight: hp(10),
        justifyContent: 'center',
        alignItems: 'center',
    },
    difficultyHeader: {
        backgroundColor: '#3a3a3a',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingVertical: hp(1.8),
        paddingHorizontal: wp(4),
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
        zIndex: 10,
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
        paddingHorizontal: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 5,
        marginBottom: hp(2),
        overflow: 'hidden',
    },
    difficultyOptionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: hp(1.8),
        paddingHorizontal: wp(4),
        borderBottomWidth: 1, // Add border to all items for consistency
        borderBottomColor: '#555',
    },
    selectedDifficultyInList: {
        backgroundColor: '#4a4a4a',
    },
    difficultyOptionText: {
        fontSize: wp(4),
        color: '#eee',
    },

    categoryScrollView: {
        marginBottom: hp(2),
    },
    horizontalList: {
        paddingVertical: hp(1),
        flexDirection: 'row',
    },
    categoryButton: {
        marginHorizontal: wp(1),
        width: hp(11),
        alignItems: 'center',
        paddingVertical: hp(0.5),
    },
    categoryimageContainer: {
        alignItems: 'center',
    },
    categoryitem: {
        padding: wp(1.5),
        borderRadius: hp(10),
    },
    categoryimage: {
        width: hp(8),
        height: hp(8),
        borderRadius: hp(4),
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
        fontWeight: '500',
        fontSize: wp(3.2),
        marginTop: hp(0.5),
        flexShrink: 1,
    },
    itemsList: {
        marginBottom: hp(2),
    },
    addNewItemContainer: {
        marginTop: hp(1),
        marginBottom: hp(2.5),
    },
    addNewItemTitle: {
        fontSize: wp(4.5),
        fontWeight: '600',
        marginBottom: hp(1.5),
        color: '#eee',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#555',
        borderRadius: 8,
        paddingVertical: hp(1.8),
        paddingHorizontal: wp(5),
        justifyContent: 'center',
        marginTop: hp(1.5),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    addButtonText: {
        color: 'white',
        fontSize: wp(4),
        fontWeight: 'bold',
        marginLeft: wp(2),
    },
    addStepButton: {
        backgroundColor: '#FF7043',
    },
    createButton: {
        backgroundColor: '#FF7043',
        borderRadius: 8,
        paddingVertical: hp(2.2),
        alignItems: 'center',
        marginTop: hp(4),
        shadowColor: '#FF7043',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
    createButtonText: {
        color: 'white',
        fontSize: wp(4.5),
        fontWeight: 'bold',
    },
    fullScreenMessageContainer: {
        flex: 1,
        backgroundColor: '#1e1e1e',
        justifyContent: 'center',
        alignItems: 'center',
        padding: wp(5),
    },
    fullScreenMessageText: {
        fontSize: wp(4.5),
        color: '#eee',
        textAlign: 'center',
        marginTop: hp(2),
    },
    retryButton: {
        marginTop: hp(3),
        backgroundColor: '#FF7043',
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(8),
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: wp(4),
        fontWeight: 'bold',
    }
});