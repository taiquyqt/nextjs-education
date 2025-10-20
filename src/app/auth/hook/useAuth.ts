// hooks/useAuth.ts - FIXED VERSION
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname(); // Sử dụng usePathname cho App Router

    // Hàm validate token với Spring Boot backend
    const validateToken = async (token: string): Promise<boolean> => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/validate', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.ok;
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    };

    const redirectUser = (userData: any, role?: string) => {
        const currentPath = pathname;
        const shouldRedirect = ['/login', '/register', '/'].includes(currentPath);

        if (shouldRedirect) {
            if (role) {
                router.replace(`/dashboard/${role}`);
            } else {
                if (userData.roles && userData.roles.length > 1) {
                    router.replace('/select-role');
                } else if (userData.roles && userData.roles.length === 1) {
                    const userRole = userData.roles[0].toLowerCase();
                    localStorage.setItem('role', userRole);
                    setUserRole(userRole);
                    router.replace(`/dashboard/${userRole}`);
                }
            }
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const userData = localStorage.getItem('user');
                const role = localStorage.getItem('role');

                if (token && userData) {
                    const isValid = await validateToken(token);
                    if (isValid) {
                        const userObj = JSON.parse(userData);
                        setIsAuthenticated(true);
                        setUser(userObj);
                        setUserRole(role);
                        redirectUser(userObj, role);
                    } else {
                        clearAuthData();
                        setIsAuthenticated(false);
                    }
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                clearAuthData();
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [pathname, router]); // Thêm dependencies

    const clearAuthData = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        setUser(null);
        setUserRole(null);
    };

    const login = (userData: any) => {
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('user', JSON.stringify(userData));

        setIsAuthenticated(true);
        setUser(userData);

        if (userData.roles && userData.roles.length === 1) {
            const role = userData.roles[0].toLowerCase();
            localStorage.setItem('role', role);
            setUserRole(role);
        }
    };

    const logout = () => {
        clearAuthData();
        setIsAuthenticated(false);
        router.push('/login');
    };

    return {
        isAuthenticated,
        loading,
        user,
        userRole,
        login,
        logout
    };
};