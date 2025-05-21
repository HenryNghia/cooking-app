import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Image, // Import Image for Logo
    ScrollView // Use ScrollView to prevent overflow on smaller screens
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/authContext';
import { register } from '../../services/authService';


const RegisterScreen = () => {
    const router = useRouter();
    const [name, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const { login } = useAuth();
    const handleRegister = async () => {
        console.log('Registering with:', { name, email, password, confirmPassword });

        if (!name || !email || !password || !confirmPassword) {
            alert('Vui lòng điền đầy đủ thông tin!');
            return;
        }

        if (password !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            const data = await register(name, email, password, confirmPassword);
            await login(email, password); // Gọi login lại sau khi đăng ký thành công
            router.replace('/auth/login'); // Điều hướng sang trang chính (hoặc sửa thành `/auth/login` nếu bạn muốn)
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Đăng ký thất bại!');
        }
    };

    const handelLinkLogin = () => {
        router.push('/auth/login')
    }
    const handleGoogleRegister = () => console.log('Register with Google');
    const handleFacebookRegister = () => console.log('Register with Facebook');

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
                <View>
                    <Text style={styles.title}>Register</Text>
                </View>


                {/* Input Fields */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputRow}>
                        <MaterialCommunityIcons name="account-outline" size={22} color="#FFF" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Full Name"
                            placeholderTextColor="rgba(255, 255, 255, 0.7)"
                            value={name}
                            onChangeText={setFullName}

                        />
                    </View>
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
                    <View style={styles.inputRow}>
                        <MaterialCommunityIcons name="key-variant" size={22} color="#FFF" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            placeholderTextColor="rgba(255, 255, 255, 0.7)"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!isConfirmPasswordVisible}
                        />
                        <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                            <MaterialCommunityIcons name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Social Icons */}
                <View style={styles.socialContainer}>
                    <TouchableOpacity onPress={handleGoogleRegister} style={styles.socialButton}>
                        <MaterialCommunityIcons name="google" size={30} color="#DB4437" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleFacebookRegister} style={styles.socialButton}>
                        <MaterialCommunityIcons name="facebook" size={30} color="#4267B2" />
                    </TouchableOpacity>
                </View>

                {/* Register Button */}
                <TouchableOpacity style={styles.mainButtonOrange} onPress={handleRegister}>
                    <Text style={styles.mainButtonText}>Register</Text>
                </TouchableOpacity>

                {/* Navigation Link */}
                <View style={styles.bottomTextContainer}>
                    <Text style={styles.bottomText}>Already Registered? </Text>
                    <TouchableOpacity
                        onPress={handelLinkLogin}>
                        <Text style={[styles.bottomText, styles.linkText]}>Login Now</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ImageBackground>
    );
};

export default RegisterScreen;
// --- Styles (Dùng chung cho cả 2 màn hình) ---
const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingBottom: 20, // Add padding at the bottom
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20, // Space below logo section
        marginTop: 40, // Space above logo section
    },
    logo: {
        width: 100, // Adjust size as needed
        height: 100, // Adjust size as needed
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
        color: '#4CAF50', // Green color for title
        marginBottom: 30,
        textAlign: 'center'
    },
    inputContainer: {
        width: '100%', // Take full width of the padded container
        marginBottom: 15,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.5)',
        marginBottom: 20, // Space between input rows
        paddingBottom: 5, // Small space below input before the line
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
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 25,
        width: '100%',
    },
    socialButton: {
        marginHorizontal: 15,
    },
    mainButtonOrange: {
        backgroundColor: '#FF9800',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
        elevation: 3, // Shadow for Android
        shadowColor: '#000', // Shadow for iOS
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
        marginBottom: 20,
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
});