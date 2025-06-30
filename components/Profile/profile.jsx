import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    Modal,
    TextInput,
    Pressable
} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import Colors from '../../constants/color';
import Layout from '../../constants/layout'
import Fonts from '../../constants/fonts'
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image as ExpoImage } from 'expo-image';


import { getDataUser, logoutall } from '../../services/authService';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoadingUser, setIsLoadingUser] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            fetchUserData();
        }, [])
    );
    // Lấy dữ liệu user đang đăng nhập
    const fetchUserData = async () => {
        setIsLoadingUser(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setMessage('Bạn cần đăng nhập.');
                setUser(null);
                setIsLoadingUser(false);
                return;
            }

            const response = await getDataUser(); // Sử dụng getDataUser từ authService

            if (response && response.data) {
                setUser(response.data);
                console.log("User data fetched:", response.data);
                setMessage('');
            } else {
                console.warn("getDataUser returned unexpected data:", response);
                setMessage(response?.message || 'Không lấy được dữ liệu người dùng.');
                setUser(null);
            }

        } catch (error) {
            console.error('Error fetching user data:', error.message || error);
            setMessage(error.message || 'Lỗi khi lấy thông tin người dùng.');
            setUser(null);
            if (error.status === 401) {
                router.replace("/auth/login");
            }
        } finally {
            setIsLoadingUser(false);
        }
    };

    // Hàm xử lý đăng xuất tất cả
    const handleLogout = async () => {
        Alert.alert(
            "Xác nhận đăng xuất",
            "Bạn có chắc chắn muốn đăng xuất khỏi thiết bị?",
            [
                {
                    text: "Hủy",
                    style: "cancel"
                },
                {
                    text: "Đăng xuất",
                    onPress: async () => {
                        setIsLoggingOut(true);
                        setMessage('');

                        try {
                            const token = await AsyncStorage.getItem('token');

                            if (!token) {
                                console.log('Không có token trong AsyncStorage khi logout.');
                                Alert.alert("Thông báo", "Bạn chưa đăng nhập.");
                                await AsyncStorage.removeItem('token');
                                router.replace("/auth/login");
                                return;
                            }

                            const response = await logoutall(); // Sử dụng logoutall từ authService

                            if (response && response.status === true) {
                                console.log('Đăng xuất thành công:', response.message);
                                Alert.alert("Thành công", response.message || "Đã đăng xuất thiết bị.");
                                router.replace("/auth/login");
                            } else {
                                console.warn('Backend reported logout failed:', response?.message);
                                Alert.alert("Thất bại", response?.message || "Không thể đăng xuất.");
                            }

                        } catch (error) {
                            console.error('Lỗi khi thực hiện đăng xuất:', error.message || error);
                            Alert.alert("Lỗi", error.message || "Không thể kết nối server hoặc có lỗi xảy ra.");
                            await AsyncStorage.removeItem('token');
                            router.replace("/auth/login");
                        } finally {
                            setIsLoggingOut(false);
                        }
                    },
                    style: "destructive"
                }
            ]
        );
    };


    const menuItems = [
        {
            icon: <AntDesign name="heart" size={24} color={Colors.primary} />,
            title: "Công thức yêu thích",
            onPress: () => {
                router.push("/(tabs)/favorite");
            },
        },
        {
            icon: <AntDesign name="bars" size={24} color={Colors.primary} />,
            title: "Công thức của tôi",
            onPress: () => {
                router.push("/recipe-user");
            },
        },
        {
            icon: <AntDesign name="bells" size={24} color={Colors.primary} />,
            title: "Thông báo",
            onPress: () => { Alert.alert("Thông báo", "Tính năng này chưa được triển khai.") },
        },
        {
            icon: <AntDesign name="setting" size={24} color={Colors.primary} />,
            title: "Cài đặt",
            onPress: () => { Alert.alert("Thông báo", "Tính năng này chưa được triển khai.") },
        },
        {
            icon: <Entypo name="help" size={24} color={Colors.primary} />,
            title: "Trợ giúp và hỗ trợ",
            onPress: () => { Alert.alert("Thông báo", "Tính năng này chưa được triển khai.") },
        },
    ];

    // === HIỂN THỊ GIAO DIỆN CHÍNH KHI CÓ USER ===
    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.container}>
                {/* Phần Profile */}
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        <ExpoImage
                            source={{ uri: user?.avatar || 'https://i.pinimg.com/564x/24/21/85/242185eaef43192fc3f9646932fe3b46.jpg' }}
                            style={styles.profileImage}
                            contentFit="cover"
                        />
                    </View>
                    {/* Tên người dùng */}
                    <Text style={styles.profileName}>{user?.name || 'Guest'}</Text>
                    <View style={styles.profileIconContainer}>
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: '/change-profile'
                            })}>
                            <AntDesign name="edit" size={24} color="white" style={styles.profileIcon} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Phần Menu */}
                <View style={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemDivider]}
                            onPress={item.onPress}>
                            <View style={styles.menuItemLeft}>
                                {item.icon}
                                <Text style={styles.menuItemTitle}>{item.title}</Text>
                            </View>
                            <Entypo name="chevron-right" size={24} color={Colors.textLight} />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}>
                    <View style={styles.logoutButtonContent}>
                        <>
                            <Entypo name="log-out" size={20} color={Colors.error} />
                            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                        </>
                    </View>
                </TouchableOpacity>

                {/* Hiển thị thông báo lỗi chung */}
                {message && user ? (
                    <Text style={styles.errorMessage}>{message}</Text>
                ) : null}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#000000',
    },
    scrollViewContent: {
        paddingBottom: Layout.spacing.xxl,
    },
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: Colors.text,
    },
    loadingMessage: {
        marginTop: 5,
        fontSize: 14,
        color: Colors.textLight,
        textAlign: 'center',
    },
    messageOnlyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Layout.spacing.xl,
        backgroundColor: Colors.background,
    },
    messageOnlyText: {
        fontSize: 18,
        color: Colors.text,
        textAlign: 'center',
        marginBottom: Layout.spacing.md,
    },
    retryButton: {
        marginTop: Layout.spacing.md,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: Colors.primary,
        borderRadius: 5,
    },
    retryButtonText: {
        color: Colors.white,
        fontSize: 16,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 20,
        backgroundColor: Colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: Layout.spacing.xl,
    },
    profileImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    profileName: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
    },
    profileIconContainer: {
        flexDirection: 'row',
        marginTop: 10,
    },
    profileIcon: {
        marginHorizontal: 8,
    },
    menuSection: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        marginHorizontal: Layout.spacing.xl,
        marginBottom: Layout.spacing.xl,
        paddingVertical: Layout.spacing.md,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: Layout.spacing.md,
        paddingHorizontal: Layout.spacing.lg,
    },
    menuItemDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: Colors.border,
    },
    menuItemLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    menuItemTitle: {
        fontSize: Fonts.sizes.md,
        color: Colors.text,
        marginLeft: Layout.spacing.md,
    },
    logoutButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: Colors.error,
        borderRadius: 12,
        paddingVertical: 14,
        marginHorizontal: Layout.spacing.xl,
        marginBottom: Layout.spacing.xxl,
        marginTop: Layout.spacing.md,
        overflow: 'hidden',
        backgroundColor: '#FFF'
    },
    logoutButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoutButtonText: {
        color: Colors.error,
        fontSize: Fonts.sizes.md,
        marginLeft: Layout.spacing.sm,
        fontWeight: '500',
    },
    errorMessage: {
        color: Colors.error,
        textAlign: 'center',
        marginTop: Layout.spacing.sm,
        marginHorizontal: Layout.spacing.xl,
    },
});