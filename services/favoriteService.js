import api from './api';

// Lấy tất cả công thức
export const getCategoryByUser = async () => {
  const response = await api.get('favorite/data');
  return response.data;
};

export const check = async () => {
  const response = await api.get('favorite/check-data-favorite');
  return response.data;
};
// Lấy công thức theo ID
export const getFavoriteById = async (id) => {
  const response = await api.get(`favorite/${id}`);
  return response.data;
};

// Tìm kiếm công thức theo từ khóa
export const searchFavorite = async (keyword) => {
  const response = await api.get(`favorite/search-data`, {
    params: { query: keyword } // Gửi keyword qua query param
  });
  return response.data;
};

// Thêm công thức  vào mục yêu thích
export const addFavorite = async (favoriteData) => {
  const response = await api.post('favorite/create-data', favoriteData);
  return response.data;
};

// check công thức đã có trong danh sách yêu thích
export const checkFavorite = async (favoriteData) => {
  const response = await api.post('favorite/check-data', favoriteData);
  return response.data;
};

// Cập nhật công thức
export const updateFavorite = async (id, favoriteData) => {
  const response = await api.put(`favorite/update-data/${id}`, favoriteData);
  return response.data;
};

// Xoá công thức
export const deleteFavorite = async (recipeId) => {
  const response = await api.post(`favorite/delete-data`, {
    recipe_id: recipeId
  });
  return response.data;
}