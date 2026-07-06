import { api } from './api';

export interface User {
    id: number;
    email: string;
    role: 'admin' | 'auditor' | 'member' | 'viewer';
    is_active: boolean;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export const auth = {
    login: async (username: string, password: string): Promise<AuthResponse> => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/token`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            throw new Error('Login failed');
        }

        const data = await res.json();
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', data.access_token);
        }
        return data;
    },

    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    },

    getToken: () => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    },

    me: async (): Promise<User> => {
        const token = auth.getToken();
        if (!token) throw new Error("No token");

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to fetch user");
        return await res.json();
    }
};
