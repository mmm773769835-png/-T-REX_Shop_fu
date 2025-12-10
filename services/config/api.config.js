/**
 * API Configuration
 * Central configuration file for API endpoints
 */

// Server URL - Update this to match your backend server
// Development: Use your local IP for mobile testing
// Production: Update to your production server URL
// Note: RRST Backend server runs on port 4000 (with Firebase & Twilio)
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:4001';

export default API_URL;

// Additional API configuration options
export const API_CONFIG = {
  baseURL: API_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const ENDPOINTS = {
  auth: {
    requestOTP: '/send-otp',
    verifyOTP: '/verify-otp',
    checkAuth: '/api/auth/check',
  },
};