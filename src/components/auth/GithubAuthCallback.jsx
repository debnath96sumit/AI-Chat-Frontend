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
            navigate('/sign-in?error=Something went wrong on backend');
            return;
        }
        localStorage.setItem('token', token);
        setToken(token);

        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
            setRefreshTokenState(refreshToken);
        }
        refreshUser().then(({ success, user }) => {
            if (success) {
                if (user.hasActiveSubscription) {
                    navigate('/new');
                } else {
                    navigate('/plans');
                }
            } else {
                navigate('/sign-in?error=Something went wrong on backend');
            }
        });
    }, [navigate, refreshUser, setRefreshTokenState, setToken]);
    return (
        <Loading />
    );
}