#  Admin Credentials Information - T-REX Shop
**Date**: April 11, 2026

---

##  Default Admin Credentials

###  Email Address:
```
mmm712874799@gmail.com
```

###  Default Password:
```
733770042As
```

---

##  How to Change Admin Password

### Method 1: Using the Password Script
```bash
cd server
node set-admin-password.js "YourNewPassword123"
```

This will generate a new hash that you need to add to your `.env` file.

### Method 2: Manual Hash Generation
```bash
cd server
node set-admin-password.js
```

This uses the default password `Admin@123456`.

---

##  Environment Variables Setup

Create a file `server/.env` with the following content:

```env
# Admin Credentials
ADMIN_EMAIL=mmm712874799@gmail.com
ADMIN_HASH=generated_hash_from_script

# Server Configuration
PORT=4001
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=t-rex-5b17f
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@t-rex-5b17f.iam.gserviceaccount.com"

# Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:19006,http://localhost:8084,exp://localhost:8081
```

---

##  Security Notes

1. **Change Default Password**: Always change the default password in production
2. **Use Strong Password**: Use passwords with at least 8 characters, including uppercase, lowercase, numbers, and special characters
3. **Environment Variables**: Never commit `.env` files to version control
4. **Regular Updates**: Change admin passwords regularly for security

---

##  Testing Admin Access

### Login Endpoint:
```
POST http://localhost:4001/api/auth/admin/login
```

### Request Body:
```json
{
  "email": "mmm712874799@gmail.com",
  "password": "733770042As"
}
```

### Response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "email": "mmm712874799@gmail.com",
    "role": "admin"
  }
}
```

---

##  Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

---

##  Troubleshooting

### If Login Fails:
1. Check if `.env` file exists in server directory
2. Verify `ADMIN_EMAIL` and `ADMIN_HASH` are set correctly
3. Ensure server is running on port 4001
4. Check server logs for error messages

### Reset Admin Password:
1. Run the password generation script
2. Update `.env` file with new hash
3. Restart the server
4. Test login with new credentials

---

##  Important Security Reminders

- **Never share admin credentials**
- **Use different passwords for different environments**
- **Enable two-factor authentication if possible**
- **Monitor admin access logs regularly**
- **Keep software updated**

---

*This document contains sensitive information. Keep it secure and share only with authorized personnel.*
