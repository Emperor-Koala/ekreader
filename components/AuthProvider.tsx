import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { deleteItemAsync, getItem, setItem } from 'expo-secure-store';
import React, { useContext } from "react";
import { SecureStorageKeys } from '~/util/secureStorageKeys';

interface LoginCredentials {
    server: string;
    username: string;
    password: string;
}

interface AuthUser {
    id: string;
    email: string;
    labelsAllow: string[];
    labelsExclude: string[];
    roles: string[];
    sharedAllLibraries: boolean;
    sharedLibrariesIds: string[];
    ageRestriction: {
        age: number;
        restriction: 'ALLOW_ONLY' | 'EXCLUDE';
    };
}

export const AuthContext = React.createContext<{
    currentUserQuery: ReturnType<typeof useQuery<AuthUser | null>>,
    login: ReturnType<typeof useMutation<AuthUser, Error, LoginCredentials>>,
    logout: ReturnType<typeof useMutation<unknown>>,
} | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {

    const queryClient = useQueryClient();
    
    const currentUserQuery = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const server = getItem(SecureStorageKeys.server);
            if (!server) {
                return null;
            }

            const response = await axios.get<AuthUser>(`${server}/api/v2/users/me`);

            if (response.status !== 200) {
                return null;
            }

            if (!response.data) {
                return null;
            }

            // TODO object validation?

            return response.data;
        },
    });

    const login = useMutation({
        mutationKey: ['login'],
        mutationFn: async (cred: LoginCredentials) => {
            const { server, username, password } = cred;
            if (!server || !username || !password) {
                throw new Error("Login Failed: Missing credentials");
            }

            const response = await axios.get<AuthUser>(`${server}/api/v2/users/me`, {
                params: {
                    'remember-me': true, // always remember user
                },
                auth: {
                    username,
                    password,
                },
            });

            if (response.status !== 200) {
                throw new Error("Login Failed: Invalid credentials");
            }

            if (!response.data) {
                throw new Error("Login Failed: No user data returned");
            }

            // TODO object validation?


            return response.data;
        },
        onSuccess: async (user, creds) => {
            // Store the server URL in secure storage and set as default base URL for axios
            axios.defaults.baseURL = creds.server;
            setItem(SecureStorageKeys.server, creds.server);

            // Update currentUser in query cache
            queryClient.setQueryData(['currentUser'], user);
        },
    });

    const logout = useMutation({
        mutationKey: ['logout'],
        mutationFn: async () => axios.get('/api/logout'),
        onSuccess: async () => {
            // Clear the server URL and session cookies
            await deleteItemAsync(SecureStorageKeys.server);

            // remove current user data
            queryClient.setQueryData(['currentUser'], null);
        },
    });

    return (
        <AuthContext.Provider
            value={{
                currentUserQuery,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}