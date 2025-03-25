// src/services/api.js
import axios from 'axios'

const BASE_URL = 'http://192.168.2.11:3000/api'; // Thay bằng base URL của API của bạn

export const callApi = async (endpoint, method = 'GET', data = null) => {
    try {
        const url = `${BASE_URL}/${endpoint}`;
        const config = {
            method,
            url,
            data,
        };
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(`API call failed to ${endpoint}:`, error);
        throw error;
    }
};
