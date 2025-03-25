import { callApi } from "./api";

export const getCategoryData = async () => {
    return callApi('category/data');
};

export const searchCategoryData = async () => {
    return callApi('category/seacrh-data');
};

export const createCategoryData = async (categoryData) => {
    return callApi('category/create-data', 'PUT', categoryData);
};

export const updateCategoryData = async (id, categoryData) => {
    return callApi(`category/update-data/${id}`, 'POST', categoryData);
};

export const deleteCategoryData = async (id) => {
    return callApi(`category/delete-data/${id}`, 'DELETE');
};