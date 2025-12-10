# Troubleshooting Guide

## Common Issues and Solutions

### 1. Network Error - Cannot Connect to API Server

**Error Message:**
```
ERROR ❌ خطأ أثناء إرسال OTP: Network Error
```

**Solution:**
1. Make sure the backend server is running:
   ```bash
   cd server
   npm start
   ```
   The server should start on port 3000.

2. Verify the API URL in `services/config/api.config.js` matches your network:
   - **For mobile testing**: Use your local IP (e.g., `http://172.20.44.26:3000`)
   - **For web/emulator**: Use `http://localhost:3000`

3. Check if your device and server are on the same network.

### 2. Navigation Error - HomeV2 Screen Not Found

**Error Message:**
```
ERROR The action 'REPLACE' with payload {"name":"HomeV2","params":{"admin":false}} was not handled by any navigator.
```

**Cause:**
The app is trying to navigate to a screen called `HomeV2` that doesn't exist in the navigation stack.

**Solution:**
This is a development warning and won't affect production. To fix it:
1. Check your navigation files (App.js or navigation folder)
2. Either add the `HomeV2` screen to your navigator, OR
3. Update the navigation call to use an existing screen name

### 3. Server Configuration

**Current Setup:**
- Backend Server: `http://172.20.44.26:3000`
- Frontend App: `http://172.20.44.26:8081`

**To change the API URL:**
Edit `services/config/api.config.js`:
```javascript
const API_URL = 'http://YOUR_IP_HERE:3000';
```

Or set environment variable:
```bash
export REACT_APP_API_URL=http://YOUR_IP_HERE:3000
```

## Quick Start Commands

### Start Backend Server:
```bash
cd server
npm start
```

### Start Frontend App:
```bash
npm start
```

### Restart Everything (Clean):
```bash
# Stop all node processes
taskkill /F /IM node.exe

# Start backend
cd server
npm start

# In another terminal, start frontend
cd ..
npm start
```
