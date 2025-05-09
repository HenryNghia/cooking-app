import api from './api';

// Lấy tất cả công thức
export const getAllCategories = async () => {
    const response = await api.get('category/data');
    return response.data;
};

// Lấy công thức theo ID
export const getCategoryById = async (id) => {
    const response = await api.get(`category/${id}`);
    return response.data;
};

// Tìm kiếm công thức theo từ khóa
export const searchCategory = async (keyword) => {
    const response = await api.post(`category/search-data`, {
        params: { query: keyword } // Gửi keyword qua query param
    });
    return response.data;
};

// Thêm công thức
export const addCategory = async (categoryData) => {
    const response = await api.post('category/create-data', categoryData);
    return response.data;
};

// Cập nhật công thức
export const updateCategory = async (id, categoryData) => {
    const response = await api.put(`category/update-data/${id}`, categoryData);
    return response.data;
};

// Xoá công thức
export const deleteCategory = async (id) => {
    const response = await api.delete(`category/delete-data/${id}`);
    return response.data;
};