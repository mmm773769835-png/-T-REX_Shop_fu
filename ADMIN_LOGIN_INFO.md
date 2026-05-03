# Admin Login Information - T-REX Shop
**Date**: April 11, 2026

---

##  Found Admin Login Screen

I found the admin login screen in the application at:
**File**: `src/screens/AdminLoginScreen.tsx`

###  Login Screen Details:

####  Navigation:
- Accessed from the main login screen
- Button: "Admin Panel" / "Admin Panel"
- Route: `AdminLogin`

####  API Endpoint:
```
POST ${apiUrl}/api/auth/admin-login
```
Where `apiUrl` is configured in `src/config/api.config.js`

####  Login Process:
1. User enters email and password
2. Validates email format
3. Sends request to server
4. Stores token in SecureStore if successful
5. Navigates to AdminPanel

---

##  Current Implementation

###  AdminLoginScreen.tsx:
- **Email Input**: No default value (empty)
- **Password Input**: No default value (empty)
- **Validation**: Email regex validation
- **Storage**: Uses expo-secure-store for token
- **Navigation**: Goes to 'AdminPanel' after login

###  Server Integration:
- **Endpoint**: `/api/auth/admin-login`
- **Method**: POST
- **Body**: `{ email, password }`
- **Response**: `{ token, user }`

---

##  Issue Found

The admin login screen **does not have hardcoded credentials**. It requires:
- User to manually enter email and password
- Server to validate against environment variables

###  Current Behavior:
```typescript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
```

Both fields start empty and require user input.

---

##  Solution Options

### Option 1: Add Default Credentials
Update the AdminLoginScreen to include default values:

```typescript
const [email, setEmail] = useState('mmm712874799@gmail.com');
const [password, setPassword] = useState('Admin@123456');
```

### Option 2: Add Auto-Fill Button
Add a button to auto-fill credentials:

```typescript
const autoFillCredentials = () => {
  setEmail('mmm712874799@gmail.com');
  setPassword('Admin@123456');
};
```

### Option 3: Add Development Mode
Check if in development and auto-fill:

```typescript
useEffect(() => {
  if (__DEV__) {
    setEmail('mmm712874799@gmail.com');
    setPassword('Admin@123456');
  }
}, []);
```

---

##  Recommended Solution

**Option 1** is recommended for easier testing during development.

Would you like me to implement one of these solutions?
