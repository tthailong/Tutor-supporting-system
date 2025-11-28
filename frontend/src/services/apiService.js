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
  

// ==========================================
// MATCHING ENDPOINTS (NO AUTH FOR TESTING)
// ==========================================

/**
 * Create manual match request
 * NOTE: Authentication is disabled on backend for testing
 * @param {Object} data - { tutorId, subject, description, preferredTimeSlots }
 * @returns {Promise} Axios response with registration
 */
export const createManualMatchRequest = (data) => {
  return api.post('/api/matching/manual', data);
};

/**
 * Auto-match algorithm
 * NOTE: Authentication is disabled on backend for testing
 * @param {Object} data - { subject, description, availableTimeSlots, priorityLevel }
 * @returns {Promise} Axios response with match result
 */
export const autoMatch = (data) => {
  return api.post('/api/matching/auto', data);
};

/**
 * Get student's match requests
 * NOTE: Authentication is disabled on backend for testing
 * @returns {Promise} Axios response with requests array
 */
export const getMyRequests = () => {
  return api.get('/api/matching/my-requests');
};

// ==========================================
// ERROR HANDLING
// ==========================================

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('API Error:', error.response.data);
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

export default api;