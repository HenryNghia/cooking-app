import api from './api';

// Lấy tất cả công thức
export const getAllLevel = async () => {
    const response = await api.get('level/data');
    return response.data;
};

// Lấy công thức theo ID
export const getLevelById = async (id) => {
    const response = await api.get(`level/${id}`);
    return response.data;
};

// Tìm kiếm công thức theo từ khóa
export const searchLevel = async (keyword) => {
    const response = await api.post(`level/search-data`, {
         abc: keyword  // Gửi keyword qua query param
    });
    return response.data;
};

// Thêm công thức
export const addLevel = async (levelData) => {
    const response = await api.post('level/create-data', levelData);
    return response.data;
};

// Cập nhật công thức
export const updateLevel = async (id, levelData) => {
    const response = await api.put(`level/update-data/${id}`, levelData);
    return response.data;
};

// Xoá công thức
export const deleteLevel = async (id) => {
    const response = await api.delete(`level/delete-data/${id}`);
    return response.data;
};