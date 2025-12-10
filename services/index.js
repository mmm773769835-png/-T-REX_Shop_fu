/**
 * Services Index
 * Central export file for all services
 */

// Export all authentication services
export { sendOTP, verifyOTP, checkAuth } from './AuthService.js';

// Export API configuration
export { default as API_URL, API_CONFIG, ENDPOINTS } from './config/api.config.js';
