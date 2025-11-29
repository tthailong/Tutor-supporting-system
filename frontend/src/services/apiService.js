import axios from 'axios';

// API Base URL - change this if your backend runs on different port
const API_BASE_URL = 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// REQUEST INTERCEPTOR - Attach JWT Token
// ==========================================

api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ==========================================
// RESPONSE INTERCEPTOR - Error Handling
// ==========================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
      
      // Handle 401 Unauthorized (token expired or invalid)
      if (error.response.status === 401) {
        console.warn('Authentication failed. Token may be expired.');
        // Optionally redirect to login:
        // localStorage.removeItem('token');
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error: No response from server');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ==========================================
// TUTOR ENDPOINTS
// ==========================================

/**
 * Get all tutors with optional filters
 * @param {Object} filters - { subject, minRating, dayOfWeek, page, limit }
 * @returns {Promise} Axios response with tutors array
 */
export const getTutors = (filters = {}) => {
  return api.get('/api/matching/tutors', { params: filters });
};

/**
 * Get specific tutor by ID
 * @param {string} tutorId - Tutor ID
 * @returns {Promise} Axios response with tutor data
 */
export const getTutorById = (tutorId) => {
  return api.get(`/api/tutors/${tutorId}`);
};

// ==========================================
// MATCHING ENDPOINTS
// ==========================================

/**
 * Create manual match request
 * @param {Object} data - { tutorId, subject, selectedTimeSlot, description }
 * @returns {Promise} Axios response with registration
 */
export const createManualMatchRequest = (data) => {
  return api.post('/api/matching/manual', data);
};

/**
 * Auto-match algorithm
 * @param {Object} data - { subject, description, preferredTimeSlots, priority }
 * @returns {Promise} Axios response with match result
 */
export const autoMatch = (data) => {
  return api.post('/api/matching/auto', data);
};

/**
 * Get student's match requests
 * @returns {Promise} Axios response with requests array
 */
export const getMyRequests = () => {
  return api.get('/api/matching/my-requests');
};

/**
 * Get tutor's availability
 * @param {string} tutorId - Tutor ID
 * @returns {Promise} Axios response with tutor availability
 */
export const getTutorAvailability = (tutorId) => {
  return api.get(`/api/tutors/${tutorId}`);
};

// ==========================================
// NOTIFICATION ENDPOINTS
// ==========================================

/**
 * Confirm manual match request (Tutor confirms)
 * @param {string} notificationId - Notification ID
 * @returns {Promise} Axios response with session data
 */
export const confirmMatchRequest = (notificationId) => {
  return api.post(`/api/notifications/${notificationId}/confirm-match`);
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Set authentication token
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

/**
 * Get current authentication token
 * @returns {string|null} JWT token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Remove authentication token (logout)
 */
export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export default api;
