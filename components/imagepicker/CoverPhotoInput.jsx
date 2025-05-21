// File: CoverPhotoInput.jsx
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { CameraIcon } from 'react-native-heroicons/outline';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import PropTypes from 'prop-types';

export default function CoverPhotoInput({ uri = null, onPhotoSelected }) {
    useEffect(() => {
        const requestPermissions = async () => {
            if (Platform.OS !== 'web') {
                try {
                    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (mediaPermission.status !== 'granted') {
                        Alert.alert(
                            "Permission Required",
                            "The app needs access to your photo library to select images."
                        );
                    }
                } catch (error) {
                    console.error('Permission request error:', error);
                }
            }
        };

        requestPermissions();
    }, []);

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    "Permission Required",
                    "Please enable photo library access in device settings.",
                    [{ text: "OK" }]
                );
                return;
            }

            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (pickerResult.canceled) {
                console.log('User cancelled image picker');
                return;
            }

            const selectedAsset = pickerResult.assets?.[0];
            if (!selectedAsset?.uri) {
                throw new Error('No image URI found in picker result');
            }

            const manipResult = await ImageManipulator.manipulateAsync(
                selectedAsset.uri,
                [],
                { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG } // Luôn là JPEG
            );

            if (typeof onPhotoSelected === 'function') {
                // Tạo tên file và kiểu file dựa trên việc nó luôn là JPEG
                const outputFileName = `recipe_cover_${Date.now()}.jpg`;
                const outputFileType = 'image/jpeg';

                onPhotoSelected({
                    uri: manipResult.uri,
                    name: outputFileName,
                    type: outputFileType
                });
            }
        } catch (error) {
            console.error('Image selection error:', error);
            Alert.alert(
                "Error",
                "Failed to select image. Please try again."
            );
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePickImage}
            activeOpacity={0.8}
        >
            {uri ? ( // uri này vẫn là prop để hiển thị ảnh đã chọn
                <Image
                    source={{ uri }}
                    style={styles.image}
                    resizeMode="cover"
                    testID="cover-image"
                />
            ) : (
                <View style={styles.placeholder} testID="cover-placeholder">
                    <CameraIcon size={40} color="#aaa" />
                    <Text style={styles.placeholderText}>Add Cover Photo</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

CoverPhotoInput.propTypes = {
    uri: PropTypes.string, // Dùng để hiển thị ảnh đã chọn (nếu có)
    onPhotoSelected: PropTypes.func.isRequired,
};

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