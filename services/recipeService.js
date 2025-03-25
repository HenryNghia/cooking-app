import { callApi } from "./api";

export const getRecipeData = async () => {
    return callApi('recipe/data');
};

export const searchRecipeData = async () => {
    return callApi('recipe/seacrh-data');
};

export const createRecipeData = async (recipeData) => {
    return callApi('recipe/create-data', 'PUT', recipeData);
};

export const updateRecipeData = async (id, recipeData) => {
    return callApi(`recipe/update-data/${id}`, 'POST', recipeData);
};

export const deleteRecipeData = async (id) => {
    return callApi(`recipe/delete-data/${id}`, 'DELETE');
};