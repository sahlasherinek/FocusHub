import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    role: string;
}

interface AuthContextValue {
    user: User | null;
    sessionExpired: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    resumeSession: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [sessionExpired, setSessionExpired] = useState(false);

    const login = (token: string, newUser: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setSessionExpired(false);
    };

    // Called after the user successfully re-enters their password in the modal
    const resumeSession = (token: string, refreshedUser: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(refreshedUser));
        setUser(refreshedUser);
        setSessionExpired(false);
    };

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'user' || e.key === 'token') {
                const stored = localStorage.getItem('user');
                setUser(stored ? JSON.parse(stored) : null);
            }
        };
        const handleSessionExpired = () => setSessionExpired(true);

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('session-expired', handleSessionExpired);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('session-expired', handleSessionExpired);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, sessionExpired, login, logout, resumeSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}