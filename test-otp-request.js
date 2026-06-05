// Test script to verify OTP server is working
const API_URL = 'http://172.20.44.26:4001';

async function testOtpRequest() {
  console.log('Testing OTP request to:', API_URL);
  
  try {
    const response = await fetch(`${API_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: process.env.ADMIN_USER || 'owner',
        password: process.env.ADMIN_PASSWORD || '<set ADMIN_PASSWORD env var>',
        phone: process.env.TEST_PHONE || '773769835',
        via: 'both'
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testOtpRequest();