import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { deleteItemAsync, getItem, setItem } from 'expo-secure-store';
import React, { useContext } from "react";
import { SecureStorageKeys } from '~/lib/secureStorageKeys';

interface LoginCredentials {
    server: string;
    email: string;
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
    currentUser: ReturnType<typeof useQuery<AuthUser | null>>,
    login: ReturnType<typeof useMutation<AuthUser, Error, LoginCredentials>>,
    logout: ReturnType<typeof useMutation<unknown>>,
} | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {

    const queryClient = useQueryClient();
    
    const currentUser = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const server = getItem(SecureStorageKeys.server);
            if (!server) {
                return null;
            }
            if (!getItem(SecureStorageKeys.session)) {
                // No session cookie, user is not logged in
                return null;
            }

            const response = await axios.get<AuthUser>(
                `${server}/api/v2/users/me`,
                {
                    params: {
                        'remember-me': true, // always remember user
                    },
                    timeout: 10000, // 10 seconds timeout
                }
            );

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
            // await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate network delay
            const { server, email, password } = cred;
            if (!server || !email || !password) {
                throw new Error("Login Failed: Missing credentials");
            }

            // TODO validate input values

            const response = await axios.get<AuthUser>(`${server}/api/v2/users/me`, {
                params: {
                    'remember-me': true, // always remember user
                },
                auth: {
                    username: email,
                    password,
                },
                timeout: 10000, // 10 seconds timeout
            }).catch((error) => {
                console.error("Login request failed:", error);
                if (error.response) {
                    // Server responded with a status code outside the range of 2xx
                    throw new Error(`Login Failed: ${error.response.status} - ${error.response.data}`);
                }

            });
            if (!response) {
                throw new Error("Login Failed: No response from server");
            }

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
        mutationFn: async () => axios.post('/api/logout'),
        onSuccess: async () => {
            // Clear the session cookies
            await deleteItemAsync(SecureStorageKeys.session);
            await deleteItemAsync(SecureStorageKeys.remember);

            // remove current user data
            queryClient.setQueryData(['currentUser'], null);
        },
    });

    return (
        <AuthContext.Provider
            value={{
                currentUser,
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