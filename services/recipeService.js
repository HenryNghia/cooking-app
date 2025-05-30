import api from './api';

// Lấy tất cả công thức
export const getAllRecipes = async () => {
    const response = await api.get('/recipe/data');
    return response.data;
};

// Lấy tất cả công thức
export const getRecipeByRating = async () => {
    const response = await api.get('/recipe/data-by-rating');
    return response.data;
};

// Lấy tất cả  công thức mới nhất
export const getRecipeByTime = async () => {
    const response = await api.get('/recipe/data-by-time');
    return response.data;
};
// Lấy công thức user đã tạo
export const getRecipeByUser = async () => {
    const response = await api.get('/recipe/data-by-user');
    return response.data;
};

// Lấy công thức theo ID
export const getRecipeById = async (id) => {
    const response = await api.get(`recipe/data/${id}`);
    return response.data;
};


// Tìm kiếm công thức theo từ khóa có trong danh mục
export const searchRecipe = async (keyword, categoryId) => {
    const response = await api.post(`recipe/search-data`, {
        abc: keyword,
        id : categoryId,
    });
    return response.data;
};

// Tìm kiếm công thức theo từ khóa có trong tất cả món ăn
export const searchRecipeALL = async (keyword) => {
    const response = await api.post(`recipe/search-data-all`, {
        abc: keyword,
    });
    return response.data;
};
// Thêm công thức
export const addRecipe = async (RecipeData) => {
    const response = await api.post('recipe/create-data', RecipeData);
    return response.data;
};

// Cập nhật công thức
export const updateRecipe = async ( RecipeData) => {
    const response = await api.post(`recipe/update-data`, RecipeData);
    return response.data;
};

// Xoá công thức
export const deleteRecipe = async (idrecipe) => {
    const response = await api.post(`recipe/delete-data`, {
        id : idrecipe
    });
    return response.data;

};

// lấy công thức theo category
export const GetRecipeByCategory = async (categoryId) => {
    const response = await api.get(`recipe/data-by-category/${categoryId}`);
    return response.data;
};