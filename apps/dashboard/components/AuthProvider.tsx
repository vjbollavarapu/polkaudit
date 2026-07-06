"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, User } from '../lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const token = auth.getToken();
            if (token) {
                try {
                    const user = await auth.me();
                    setUser(user);
                } catch (error) {
                    console.error("Auth init failed", error);
                    auth.logout();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (token: string) => {
        localStorage.setItem('token', token);
        try {
            const user = await auth.me();
            setUser(user);
            router.push('/');
        } catch (e) {
            console.error("Login fetch user failed", e);
        }
    };

    const logout = () => {
        auth.logout();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
