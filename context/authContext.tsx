// app/auth/authContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    login as loginService,
    logout as logoutService,
    checkToken,
    getDataUser
} from '../services/authService';
import api from '../services/api';

type AuthContextType = {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    login: async () => { },
    logout: async () => { },
    checkAuth: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any | null>(null);

    useEffect(() => {
        const initializeAuth = async () => {
            await checkAuth();
            setIsLoading(false);
        };
        initializeAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                return;
            }

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const tokenStatus = await checkToken();
            if (tokenStatus.isValid) {
                setIsAuthenticated(true);

                const userData = await getDataUser();
                setUser(userData.user);
            } else {
                await logout();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            await logout();
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const data = await loginService(email, password);

            api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            setIsAuthenticated(true);

            const userData = await getDataUser();
            setUser(userData.user);
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await logoutService();
        } catch (error) {
        } finally {
            await AsyncStorage.removeItem('token');
            setIsAuthenticated(false);
            setUser(null);
            setIsLoading(false);

            delete api.defaults.headers.common['Authorization'];
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                user,
                login,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
