import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Đăng nhập
export const login = async (email, password) => {
    try {
        const response = await api.post('login', {
            email,
            password,
        });

        const token = response.data.token;
        await AsyncStorage.setItem('token', token); // Lưu token
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Đăng nhập thất bại' };
    }
};

// Đăng ký
export const register = async (name, email, password /* confirmPassword is not sent to backend */) => {
    const response = await api.post('register', {
        name,
        email,
        password,
    });
    return response.data;

};
// Đăng xuất
export const logoutall = async () => {
    const response = await api.post('dang-xuat-tat-ca');
    return response.data;
};

// lấy thông tin user đang đăng nhập
export const getDataUser = async () => {
    const response = await api.get('user/data');
    return response.data;
};

// Kiểm tra token có hợp lệ không
export const checkToken = async () => {
    try {
        const response = await api.post('check');
        return {
            isValid: true,
            user: response.data,
            message: response.data.message
        };
    } catch (error) {
        // Nếu có lỗi 401 (Unauthorized), token không hợp lệ
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token'); // Xóa token không hợp lệ
            return {
                isValid: false,
                user: null,
                message: 'Phiên đăng nhập đã hết hạn'
            };
        }
        // Các lỗi khác
        throw error.response?.data || { message: 'Lỗi khi kiểm tra token' };
    }
};

export const updateUser = async (UserData) => {
    const response = await api.post(`user/update-data`, UserData);
    return response.data;
};