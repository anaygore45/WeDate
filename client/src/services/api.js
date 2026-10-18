import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach Authorization header if token is in localStorage (dual support: cookie + bearer)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('wedate_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle unauthenticated 401 gracefully
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
      code: error.response?.data?.code,
      status: error.response?.status,
      errors: error.response?.data?.errors
    };

    if (error.response?.status === 401) {
      // Clear token on session expiration
      localStorage.removeItem('wedate_token');
    }

    return Promise.reject(customError);
  }
);

// Auth endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

// Profile endpoints
export const profileApi = {
  getMyProfile: () => api.get('/profiles/me'),
  updateMyProfile: (data) => api.patch('/profiles/me', data),
  getProfileById: (id) => api.get(`/profiles/${id}`),
  uploadPhoto: (formData) =>
    api.post('/profiles/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deletePhoto: (photoId) => api.delete(`/profiles/photos/${photoId}`),
  setPrimaryPhoto: (photoId) => api.patch(`/profiles/photos/${photoId}/primary`),
  toggleVisibility: (isVisible) => api.patch('/profiles/visibility', { isVisible })
};

// Discovery & AI Recommendations
export const discoveryApi = {
  getQueue: (params) => api.get('/discovery', { params }),
  swipe: (userId, action) => api.post(`/discovery/${userId}/swipe`, { action }),
  getFilters: () => api.get('/discovery/filters'),
  updateFilters: (data) => api.put('/discovery/filters', data),
  getLikesStats: () => api.get('/discovery/likes-stats')
};

export const recommendationApi = {
  getSmartRecommendations: () => api.get('/recommendations')
};

// Matches
export const matchApi = {
  getMatches: () => api.get('/matches'),
  getMatchById: (matchId) => api.get(`/matches/${matchId}`),
  deleteMatch: (matchId) => api.delete(`/matches/${matchId}`)
};

// Chats & Messaging
export const chatApi = {
  getConversations: () => api.get('/chats'),
  getConversationByMatch: (matchId) => api.get(`/chats/match/${matchId}`),
  getMessages: (chatId, params) => api.get(`/chats/${chatId}/messages`, { params }),
  sendMessage: (chatId, data) => api.post(`/chats/${chatId}/messages`, data),
  uploadImage: (chatId, formData) =>
    api.post(`/chats/${chatId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Notifications
export const notificationApi = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all')
};

// Safety & User Blocking / Reporting
export const userApi = {
  blockUser: (userId) => api.post(`/users/${userId}/block`),
  unblockUser: (userId) => api.delete(`/users/${userId}/block`),
  getBlockedUsers: () => api.get('/users/blocked'),
  reportUser: (userId, data) => api.post(`/users/${userId}/report`, data)
};

// Settings
export const settingsApi = {
  updateNotifications: (data) => api.patch('/settings/notifications', data),
  updatePrivacy: (data) => api.patch('/settings/privacy', data),
  changePassword: (data) => api.patch('/settings/password', data),
  deleteAccount: (confirmationText) =>
    api.delete('/settings/account', { data: { confirmationText } })
};

// AI Smart Connection Assistant
export const aiApi = {
  getStatus: () => api.get('/ai/status'),
  explainMatch: (candidateUserId) => api.post('/ai/explain', { candidateUserId }),
  getIcebreakers: (matchId) => api.post('/ai/icebreakers', { matchId }),
  enhanceBio: (currentBio, tone) => api.post('/ai/enhance-bio', { currentBio, tone }),
  evaluateSynergy: (candidateUserIds) => api.post('/ai/synergy', { candidateUserIds }),
  suggestReplies: (chatId, matchId) => api.post('/ai/suggest-replies', { chatId, matchId })
};

export default api;

