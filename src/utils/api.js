import axios from 'axios';
import { pushToast, TOAST_TYPES } from './toaster';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})


axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleResponseError = (error) => {
  const statusCode = error.response?.status || 500;
  const data = error.response?.data;

  const getFallbackMessage = () => {
    if (statusCode >= 500) return 'Something went wrong on the server';
    if (statusCode === 401) return 'Unauthorized request';
    if (statusCode === 403) return 'Access denied';
    if (statusCode === 404) return 'Requested resource was not found';
    return 'Request failed';
  };

  const getToastType = () => {
    if (statusCode >= 400 && statusCode < 500) return TOAST_TYPES.warning;
    if (statusCode >= 500) return TOAST_TYPES.error;
    return TOAST_TYPES.info;
  };

  const message = data?.message || getFallbackMessage();
  pushToast({ message, type: getToastType() });

  if (statusCode === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/sign-in';
  }

  return Promise.reject(error);
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // If the backend returns success messages we could toast them here,
    // but typically we let components handle success logic.
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a 401, we have a config, and we haven't already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Don't intercept login or refresh token requests to prevent loops
      if (originalRequest.url.includes('/auth/login') || originalRequest.url.includes('/auth/refresh-token')) {
        return handleResponseError(error);
      }

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return handleResponseError(error);
      }

      if (isRefreshing) {
        try {
          // Wait for the token refresh to finish
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentToken = localStorage.getItem('token');

        // Make the refresh token request
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
          accessToken: currentToken || '',
          refreshToken: refreshToken
        });

        const refreshData = response.data;

        if (refreshData?.data?.accessToken) {
          const newToken = refreshData.data.accessToken;
          const newRefreshToken = refreshData.data.refreshToken || refreshToken;

          localStorage.setItem('token', newToken);
          localStorage.setItem('refresh_token', newRefreshToken);

          processQueue(null, newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        } else {
          throw new Error('Refresh token invalid');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        return handleResponseError(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return handleResponseError(error);
  }
);

export const authAPI = {
  signup: async ({ fullName, email, phone, password }) => {
    return axiosInstance.post('/api/v1/auth/register', { fullName, email, phone, password });
  },

  login: async ({ email, password }) => {
    return axiosInstance.post('/api/v1/auth/login-user', { email, password });
  },

  socialSignIn: async (provider, code, redirectUri) => {
    return axiosInstance.post('/api/v1/auth/social-signin', { provider, code, redirectUri });
  },
  githubSignIn: async () => {
    return axiosInstance.get('/api/v1/auth/github');
  },
  logout: async () => {
    return axiosInstance.get('/api/v1/auth/logout-user');
  },

  forgotPassword: async ({ email }) => {
    return axiosInstance.post('/api/v1/auth/forgot-password', { email });
  },

  verifyOTP: async ({ email, code, type = 'forgot_password_verify' }) => {
    return axiosInstance.post('/api/v1/auth/verify-email', { email, code, type });
  },

  resetPassword: async ({ email, newPassword }) => {
    return axiosInstance.post('/api/v1/auth/reset-password', { email, newPassword });
  },

  refreshToken: async (accessToken, refreshToken) => {
    return axiosInstance.post('/api/v1/auth/refresh-token', { accessToken, refreshToken });
  },
};

export const userAPI = {
  getProfile: async () => {
    return axiosInstance.get('/api/v1/user/profile-details');
  },

  updateProfile: async (userData) => {
    return axiosInstance.post('/api/v1/user/update-profile', userData);
  },

  changePassword: async ({ oldPassword, newPassword }) => {
    return axiosInstance.post('/api/v1/user/change-password', { oldPassword, newPassword });
  },
};

export const chatAPI = {
  getModels: async () => {
    return axiosInstance.get('/api/v1/chat/llm-models');
  },

  sendMessage: async (message, chatId, provider, modelId) => {
    return axiosInstance.post('/api/v1/chat/send-message', { message, chatId, provider, modelId });
  },

  getAllChats: async (limit = 10, page = 1) => {
    return axiosInstance.get(`/api/v1/chat/get-all`, { params: { limit, page } });
  },

  getChatDetails: async (chatId, page = 1, limit = 10) => {
    return axiosInstance.get(`/api/v1/chat/${chatId}`, { params: { limit, page } });
  },

  renameChat: async (chatId, newName) => {
    return axiosInstance.patch(`/api/v1/chat/rename/${chatId}`, { title: newName });
  },

  deleteChat: async (chatId) => {
    return axiosInstance.delete(`/api/v1/chat/delete/${chatId}`);
  },
};

export const mediaAPI = {
  uploadSingleFile: async (formData) => {
    return axiosInstance.post('/api/v1/media/upload-single-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}
export default {
  auth: authAPI,
  user: userAPI,
  chat: chatAPI,
  media: mediaAPI,
};
