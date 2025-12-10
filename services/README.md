# Services Directory

This directory contains all service modules for the T-REX Shop application.

## Structure

```
services/
├── config/
│   └── api.config.js       # API configuration and endpoints
├── AuthService.js          # Authentication service
├── index.js                # Main export file
└── README.md               # This file
```

## Services

### AuthService

Handles all authentication-related operations including OTP sending, verification, and auth checks.

#### Functions:

- **`sendOTP(username, password, phone, via)`**
  - Sends OTP code to user via SMS, WhatsApp, or both
  - Parameters:
    - `username`: User's username (use 'owner' for admin)
    - `password`: User's password
    - `phone`: Phone number
    - `via`: Delivery method ('sms', 'whatsapp', or 'both')

- **`verifyOTP(phone, code)`**
  - Verifies the OTP code
  - Parameters:
    - `phone`: Phone number
    - `code`: OTP code received

- **`checkAuth(token)`**
  - Validates JWT token and checks authentication status
  - Parameters:
    - `token`: JWT token

## Configuration

Update `config/api.config.js` to change:
- API base URL
- Request timeout
- Default headers
- API endpoints

## Usage

```javascript
// Import individual services
import { sendOTP, verifyOTP, checkAuth } from './services';

// Or import from specific service
import { sendOTP } from './services/AuthService';

// Use the service
const result = await sendOTP('owner', 'password', '+1234567890', 'both');
if (result.success) {
  console.log('OTP sent successfully!');
}
```

## Environment Variables

Set the following environment variable to configure the API URL:
- `REACT_APP_API_URL`: Backend server URL (default: http://localhost:3000)
