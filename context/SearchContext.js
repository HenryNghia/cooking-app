import { createContext, useState } from "react";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [sharedSearchKeyword, setSharedSearchKeyword] = useState('');
    const [searchHistory, setSearchHistory] = useState([]);

    const addToSearchHistory = (keyword) => {
        if (keyword){
            const trimmedKeyword = keyword.trim();
            const updatedHistory = [
                trimmedKeyword,
                ...searchHistory.filter(item => item !== trimmedKeyword)
            ];
            const limitedHistory = updatedHistory.slice(0, 5);
            setSearchHistory(limitedHistory);
        }
        
    };

    return (
        <SearchContext.Provider value={{ 
            isSearchFocused, 
            setIsSearchFocused,
            sharedSearchKeyword,
            setSharedSearchKeyword,
            searchHistory,
            setSearchHistory,
            addToSearchHistory
        }}>
            {children}
        </SearchContext.Provider>
    );
};