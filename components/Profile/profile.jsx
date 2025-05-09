import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import Colors from '../../constants/color';
import Layout from '../../constants/layout'
import { useRouter } from 'expo-router';
import Fonts from '../../constants/fonts'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function profile() {
    const router = useRouter();
    const [user, setUser] = useState([]);
    const [message, setMessage] = useState(''); // State to store message
    useEffect(() => {
        GetUser();
    }, []);
    // lấy dữ liệu user đang đăng nhập
    const GetUser = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch('http://192.168.2.11:8000/api/user/data', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.status == 200) {
                setUser(data.data);
                console.log(data.data);
                setMessage(data.message);
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };



    const handleLogout = async () => {
        try {
            // 1. Lấy token từ AsyncStorage
            const token = await AsyncStorage.getItem('token');
            // Kiểm tra nếu có token
            if (token) {
                // 2. Gọi API logout
                const response = await fetch('http://192.168.1.88:8000/api/dang-xuat-tat-ca', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                console.log(data);
                if (data.status == true) {
                    router.replace("/auth/login");
                } else {
                    setMessage(data.message);
                }
            } else {
                setMessage('Bạn chưa đăng nhập');
            }
        } catch (error) {
            setMessage('Lỗi khi đăng xuất');
        }
    };
    const menuItems = [
        {
            icon: <AntDesign name="heart" size={24} color={Colors.primary} />,
            title: "Công thức yêu thích",
            onPress: () => router.push("/favorite"),
        },
        {
            icon: <AntDesign name="bars" size={24} color={Colors.primary} />,
            title: "Công thức của tôi",
            onPress: () => { },
        },
        {
            icon: <AntDesign name="bells" size={24} color={Colors.primary} />,
            title: "Thông báo",
            onPress: () => { },
        },
        {
            icon: <AntDesign name="setting" size={24} color={Colors.primary} />,
            title: "cài đặt",
            onPress: () => { },
        },
        {
            icon: <Entypo name="help" size={24} color={Colors.primary} />,
            title: "Trợ giúp và hổ trợ",
            onPress: () => { },
        },
    ];


    return (
        <View style={styles.container}>
            <View style={styles.profileSection}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={{ uri: 'https://i.pinimg.com/564x/24/21/85/242185eaef43192fc3f9646932fe3b46.jpg' }}
                        style={styles.profileImage}
                        contentFit="cover"
                    />
                </View>
                <Text style={styles.profileName}>{user.name}</Text>
                <View style={styles.profileIconContainer}>
                    <TouchableOpacity>
                        <AntDesign name="edit" size={24} color="white" style={styles.profileIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <AntDesign name="camera" size={24} color="white" style={styles.profileIcon} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.menuSection}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.menuItem}
                        onPress={item.onPress}
                    >
                        <View style={styles.menuItemLeft}>
                            {item.icon}
                            <Text style={styles.menuItemTitle}>{item.title}</Text>
                        </View>
                        <Entypo name="chevron-right" size={24} color={Colors.textLight} />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Improved Logout Button */}
            <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Entypo name="log-out" size={24} color={Colors.error} />
                <Text style={styles.logoutButtonText}>Log out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    profileImageContainer: {
        width: 140,
        height: 140,
        borderRadius: 50,
        overflow: 'hidden',
        marginBottom: 10,
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    profileName: {
        color: '#FFF',
        fontSize: 20
    },
    profileIconContainer: {
        flexDirection: 'row',
    },
    profileIcon: {
        margin: 6
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: Colors.error,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginHorizontal: Layout.spacing.xl,
        marginBottom: Layout.spacing.xxl,
    },
    logoutButtonText: {
        color: Colors.error,
        fontSize: Fonts.sizes.md,
        marginLeft: Layout.spacing.sm,
        fontWeight: '500',
    },
});