// components/CreateRecipe/CoverPhotoInput.jsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { CameraIcon } from 'react-native-heroicons/outline';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator'; // Import manipulator
// import { Linking } from 'react-native'; // Uncomment if you want to add an "Open Settings" button

export default function CoverPhotoInput({ uri, onPhotoSelected }) {

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                // Request media library permissions
                const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (mediaPermission.status !== 'granted') {
                    Alert.alert(
                        "Yêu cầu quyền",
                        "Ứng dụng cần quyền truy cập thư viện ảnh để bạn có thể chọn ảnh. Vui lòng cấp quyền trong Cài đặt."
                    );
                    console.log('Quyền truy cập thư thư viện ảnh là cần thiết.');
                }

                // Optional: Request camera permissions if you plan to allow taking photos directly
                // const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
                // if (cameraPermission.status !== 'granted') {
                //     Alert.alert("Yêu cầu quyền", "Vui lòng cấp quyền sử dụng camera để chụp ảnh.");
                // }
            }
        })();
    }, []);

    const handlePickImage = async () => {
        // Re-check media library permission before opening picker
        const { status: mediaStatus } = await ImagePicker.getMediaLibraryPermissionsAsync();

        if (mediaStatus !== 'granted') {
            Alert.alert(
                "Yêu cầu quyền",
                "Vui lòng cấp quyền truy cập thư viện ảnh trong phần Cài đặt của thiết bị để có thể chọn ảnh.",
                [
                    { text: "OK", style: "cancel" },
                    // { text: "Mở Cài đặt", onPress: () => Linking.openSettings() } // Optional
                ]
            );
            return;
        }

        let pickerResult;
        try {
            pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,      // Enables the native cropper
                aspect: [4, 3],           // Aspect ratio for cropping
                quality: 1,               // Pick highest quality (0 to 1)
            });
        } catch (error) {
            console.error("Lỗi khi mở thư viện ảnh:", error);
            Alert.alert("Lỗi", "Không thể mở thư viện ảnh. Vui lòng thử lại.");
            return;
        }

        console.log('Kết quả từ ImagePicker (sau khi edit):', pickerResult);

        if (!pickerResult.canceled) {
            let pickedUri = null;

            // Modern expo-image-picker returns assets array
            if (pickerResult.assets && pickerResult.assets.length > 0 && pickerResult.assets[0].uri) {
                pickedUri = pickerResult.assets[0].uri;
                console.log('Thông tin asset được chọn:', pickerResult.assets[0]);
            }
            // Fallback for older structures (less likely now)
            else if (pickerResult.uri) {
                pickedUri = pickerResult.uri;
            }

            if (pickedUri) {
                console.log('URI ảnh gốc sau khi crop từ picker:', pickedUri);
                try {
                    // Manipulate the image to ensure it's upright (correct EXIF orientation applied to pixels)
                    // and optionally compress.
                    const manipResult = await ImageManipulator.manipulateAsync(
                        pickedUri, // URI of the image *after* it comes out of the native cropper
                        [],        // No specific transform actions (like explicit rotate/flip).
                                    // This tells manipulator to read EXIF and apply it.
                        {
                            compress: 0.8, // Compress slightly (0.0 to 1.0)
                            format: ImageManipulator.SaveFormat.JPEG, // Save as JPEG (or PNG)
                            // base64: false, // You can set to true if you need base64 data
                        }
                    );

                    console.log('URI ảnh đã xử lý (thẳng đứng):', manipResult.uri);
                    console.log('Kích thước ảnh đã xử lý:', manipResult.width, 'x', manipResult.height);

                    onPhotoSelected(manipResult.uri); // Pass the URI of the manipulated (straightened) image
                } catch (manipError) {
                    console.error("Lỗi khi xử lý ảnh với ImageManipulator:", manipError);
                    Alert.alert(
                        "Lỗi xử lý ảnh",
                        "Không thể chuẩn hóa ảnh. Vui lòng thử lại hoặc chọn ảnh khác."
                    );
                    // Fallback option: use the original picked URI if manipulation fails,
                    // but it might still have an incorrect orientation.
                    // console.log("Sử dụng URI gốc do lỗi xử lý:", pickedUri);
                    // onPhotoSelected(pickedUri);
                }
            } else {
                console.log('Đã chọn ảnh từ picker, nhưng không tìm thấy URI trong kết quả.');
                Alert.alert("Lỗi", "Không thể lấy được đường dẫn của ảnh đã chọn. Vui lòng thử lại.");
            }
        } else {
            console.log('Người dùng đã hủy việc chọn ảnh từ thư viện/camera.');
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePickImage} activeOpacity={0.8}>
            {uri ? (
                <Image source={{ uri: uri }} style={styles.image} resizeMode="cover" />
            ) : (
                <View style={styles.placeholder}>
                    <CameraIcon size={40} color="#aaa" />
                    <Text style={styles.placeholderText}>Thêm Ảnh Bìa</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        aspectRatio: 4 / 3,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    placeholder: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    placeholderText: {
        marginTop: 8,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
});