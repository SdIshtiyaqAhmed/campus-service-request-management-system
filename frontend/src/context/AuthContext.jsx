import { useEffect, useState } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            return;
        }

        api.get('/auth/me')
            .then((response) => {
                setUser(response.data.data.user);
            })
            .catch(() => {
                localStorage.removeItem('token');
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', {
            email,
            password
        });

        const { token, user: loggedInUser } = response.data.data;

        localStorage.setItem('token', token);
        setUser(loggedInUser);
        setLoading(false);

        return loggedInUser;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
    };

    const value = {
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
