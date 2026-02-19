const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// const getHeaders = () => {
//     const token = localStorage.getItem('token');
//     return {
//         'Content-Type': 'application/json',
//         ...(token ? { Authorization: `Bearer ${token}` } : {})
//     };
// }

const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        if (response.statusCode === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/sign-in';
        }
        throw new Error(data.message || 'An error occurred');
    }

    return data;
}

export const authAPI = {
    signup: async (username, email, password) => {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        return handleResponse(response);
    },

    socialSignIn: async (provider, oauthToken) => {
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/social-signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ oauthToken, provider })
        });
        return handleResponse(response);
    }
}

export default {
    authAPI
};