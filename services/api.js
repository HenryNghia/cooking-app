
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
	baseURL: 'http://172.20.10.12:8000/api/', // Đổi thành API của bạn
	headers: {
		'Content-Type': 'application/json',
		'Content-Type': 'multipart/form-data',
		'Accept': 'application/json',
	},
});

// Gắn token tự động trước mỗi request
api.interceptors.request.use(async (config) => {
	const token = await AsyncStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
}, (error) => {
	return Promise.reject(error);
});

export default api;
