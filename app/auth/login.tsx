import React, { useState } from 'react'; // Imports giống RegisterScreen
import {
    View, Text, TextInput, ImageBackground, StyleSheet,
    TouchableOpacity, StatusBar, Image, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/authContext';
const LoginScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
            return;
        }
        setIsLoading(true);
        try {
            await login(email, password);
            router.replace('/(tabs)/home');
        } catch (error) {
            Alert.alert(
                'Đăng nhập thất bại',
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = () => {
        // router.push('/auth/forgot-password');
    };

    const handleLinkregister = () => {
        router.push('/auth/register');
    };

    const handleGoogleLogin = () => {
        Alert.alert('Thông báo', 'Tính năng đăng nhập bằng Google đang phát triển');
    };

    const handleFacebookLogin = () => {
        Alert.alert('Thông báo', 'Tính năng đăng nhập bằng Facebook đang phát triển');
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Đang đăng nhập...</Text>
            </View>
        );
    }


    return (
        <ImageBackground
            source={require('../../assets/images/backgroundlogin.webp')} // <<< THAY THẾ PATH
            resizeMode="cover"
            style={styles.background}
        >
            <StatusBar barStyle="light-content" />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/images/cheif.png')} // <<< THAY THẾ LOGO PATH
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.appName}>NGHIA RECIPE</Text>
                    <Text style={styles.tagline}>Cook in easy way</Text>
                </View>

                <Text style={styles.title}>Login</Text>

                {/* Input Fields */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputRow}>
                        <MaterialCommunityIcons name="email-outline" size={22} color="#FFF" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor="rgba(255, 255, 255, 0.7)"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"

                        />
                    </View>
                    <View style={styles.inputRow}>
                        <MaterialCommunityIcons name="key-variant" size={22} color="#FFF" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="rgba(255, 255, 255, 0.7)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isPasswordVisible}
                        />
                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                            <MaterialCommunityIcons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>


                {/* Login Button */}
                <TouchableOpacity style={styles.mainButtonOutline} onPress={handleLogin}>
                    <Text style={[styles.mainButtonText, styles.mainButtonTextOutline]}>Sign in</Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* <View style={styles.socialContainer}> */}
                <TouchableOpacity onPress={handleGoogleLogin} style={styles.socialButton}>
                    <MaterialCommunityIcons name="google" size={30} color="#DB4437" />
                    <Text style={[styles.mainButtonText, styles.mainButtonTextOutline]}>   Sign in with Google</Text>
                </TouchableOpacity>
                {/* </View> */}



                {/* Navigation Link */}
                <View style={styles.bottomTextContainer}>
                    <Text style={styles.bottomText}>Not Registered Yet? </Text>
                    <TouchableOpacity onPress={handleLinkregister}>
                        <Text style={[styles.bottomText, styles.linkText]}>Register Now</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    loadingText: {
        marginTop: 16,
        color: '#4CAF50',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 10,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 5,
    },
    tagline: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 30,
        textAlign: 'center'
    },
    inputContainer: {
        width: '100%',
        marginBottom: 15,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 20,
        paddingBottom: 5,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: "#FFF"

    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#FF9800',
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 25,
        width: '100%',
    },
    socialButton: {
        borderColor: '#FFF',
        borderWidth: 1.5,
        paddingVertical: 8,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
        backgroundColor: 'transparent',
        flexDirection: 'row',
        justifyContent: 'center',
    },

    mainButtonOrange: {
        backgroundColor: '#FF9800',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    mainButtonOutline: {
        borderColor: '#FFF',
        borderWidth: 1.5,
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
        backgroundColor: 'transparent',
    },
    mainButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    mainButtonTextOutline: {
        color: '#FFF',
    },
    bottomTextContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 15,
    },
    bottomText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 14,
    },
    linkText: {
        color: '#FF9800',
        fontWeight: 'bold',
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
    },
    dividerText: {
        marginHorizontal: 10,
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 16,
    },
});

