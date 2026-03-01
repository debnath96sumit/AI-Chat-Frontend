import { pushToast, TOAST_TYPES } from './toaster';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  const parsedStatusCode = Number(data?.statusCode);
  const statusCode = Number.isFinite(parsedStatusCode) ? parsedStatusCode : response.status;
  const isSuccess = statusCode >= 200 && statusCode < 300;

  const getFallbackMessage = () => {
    if (isSuccess) return 'Request completed successfully';
    if (statusCode >= 500) return 'Something went wrong on the server';
    if (statusCode === 401) return 'Unauthorized request';
    if (statusCode === 403) return 'Access denied';
    if (statusCode === 404) return 'Requested resource was not found';
    return 'Request failed';
  };

  const getToastType = () => {
    if (isSuccess) return TOAST_TYPES.success;
    if (statusCode >= 400 && statusCode < 500) return TOAST_TYPES.warning;
    if (statusCode >= 500) return TOAST_TYPES.error;
    return TOAST_TYPES.info;
  };

  const message = data?.message || getFallbackMessage();
  pushToast({ message, type: getToastType() });

  if (!isSuccess || !response.ok) {
    if (statusCode === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/sign-in';
    }
    const error = new Error(message);
    error.status = statusCode;
    error.data = data;
    throw error;
  }

  return data;
};

export const authAPI = {
  signup: async ({ fullName, email, phone, password }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, phone, password }),
    });
    return handleResponse(response);
  },

  login: async ({ email, password }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  socialSignIn: async (provider, code, redirectUri) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/social-signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, code, redirectUri }),
    });
    return handleResponse(response);
  },

  // Logout
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout-user`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Forgot password
  forgotPassword: async ({ email }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  verifyOTP: async ({ email, code, type = 'forgot_password_verify' }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, type }),
    });
    return handleResponse(response);
  },

  resetPassword: async ({ email, newPassword }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });
    return handleResponse(response);
  },

  // Refresh token
  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};


export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/profile-details`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/update-profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Change password
  changePassword: async ({ oldPassword, newPassword }) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    return handleResponse(response);
  },
};

export const chatAPI = {
  // Send message to AI
  sendMessage: async (message, chatId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/send-message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, chatId }),
    });
    return handleResponse(response);
  },

  // Get message stream
  getMessageStream: async (messageId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/stream/${messageId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return response; // Return raw response for streaming
  },

  // Get all user chats
  getAllChats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/get-all`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get chat details with messages also this api is going to accept limit and page a query param
  getChatDetails: async (chatId, page = 1, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/${chatId}?limit=${limit}&page=${page}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Rename chat
  renameChat: async (chatId, newName) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/rename/${chatId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: newName }),
    });
    return handleResponse(response);
  },

  // Delete chat
  deleteChat: async (chatId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/delete/${chatId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Export all APIs
export default {
  auth: authAPI,
  user: userAPI,
  chat: chatAPI,
};
