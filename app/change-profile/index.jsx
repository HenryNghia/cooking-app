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
import CoverPhotoInput from '../../components/imagepicker/CoverPhotoInput'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { getDataUser, updateUser } from '../../services/authService'
import {  router } from 'expo-router';
export default function index() {
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [name, setName] = useState("");
    const scrollViewRef = useRef(null);
    const [user, setUser] = useState({});
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await getDataUser();
        if (res.status == 200) {
            setName(res.data.name);
            setCoverPhoto({ uri: res.data.avatar });
            console.log(res.data.name);
            console.log(res.data.avatar);
            console.log('thanh cong');
        }
        else {
            console.log('lỗi');

        }
    }

    const handleUpdateUser = async () => {
        const formData = new FormData();
        formData.append('name', name.trim());

        if (coverPhoto.name && coverPhoto.type) {
            formData.append('avatar', {
                uri: Platform.OS === 'ios' ? coverPhoto.uri.replace('file://', '') : coverPhoto.uri,
                name: coverPhoto.name,
                type: coverPhoto.type,
            });
        }

        console.log("FormData entries prepared for update:");
        for (let pair of formData.entries()) {
            if (pair[0] === 'image' && typeof pair[1] === 'object') {
                console.log(`${pair[0]}, URI: ${pair[1].uri}, Name: ${pair[1].name}, Type: ${pair[1].type}`);
            } else {
                console.log(`${pair[0]}, ${pair[1]}`);
            }
        }

        try {
            const response = await updateUser(formData);
            console.log('API Update Response:', response);
            if (response.status === true || response.status === 200 || response.status === 201) {
                Alert.alert("Thành công", response.message || "đã được cập nhật!");
                router.back();
            } else {
                Alert.alert("Lỗi", response.message || "Đã xảy ra lỗi khi cập nhật.");
            }

        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
        }
    }

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

    const uriForCoverPhotoInput = (coverPhoto && coverPhoto.uri && typeof coverPhoto.uri === 'string')
        ? coverPhoto.uri
        : null;

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
                    <Text style={styles.screenTitle}>Hồ sơ</Text>

                    <Text style={styles.sectionTitle}>Ảnh Bìa</Text>
                    <CoverPhotoInput
                        uri={uriForCoverPhotoInput}
                        onPhotoSelected={handlePhotoSelected}
                    />

                    <Text style={styles.sectionTitle}>Tên</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Tên"
                        placeholderTextColor="#999"
                        value={name}
                        onChangeText={setName}
                    />

                    <TouchableOpacity style={styles.createButton} onPress={handleUpdateUser} >
                        <Text style={styles.createButtonText}>Chỉnh sửa</Text>
                    </TouchableOpacity>

                    <View style={{ height: hp(7) }} />
                </ScrollView>
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
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