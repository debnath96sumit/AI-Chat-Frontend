const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/sign-in';
    }
    throw new Error(data.message || 'An error occurred');
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
  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
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

// ============================================
// USER API CALLS
// ============================================
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
  changePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(response);
  },
};

// ============================================
// CHAT API CALLS
// ============================================
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

  // Get chat details with messages
  getChatDetails: async (chatId) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/chat/${chatId}`, {
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