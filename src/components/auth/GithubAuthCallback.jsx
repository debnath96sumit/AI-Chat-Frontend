// pages/AuthCallback.tsx (React example)
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import { useAuth } from '../../context/AuthContext';

export default function AuthCallback() {
    const navigate = useNavigate();
    const { refreshUser, setToken, setRefreshTokenState } = useAuth();
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const refreshToken = params.get('refreshToken');
        if (!token) {
            // Something went wrong on backend
            navigate('/sign-in?error=Something went wrong on backend');
            return;
        }

        // Store exactly the same way your normal login stores tokens
        localStorage.setItem('token', token);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        setToken(token);
        if (refreshToken) setRefreshTokenState(refreshToken);
        refreshUser().then(({ success }) => {
            navigate(success ? '/new' : '/sign-in?error=Something went wrong on backend');
        });
    }, []);

    // Show a brief loading state while processing
    return (
        <Loading />
    );
}