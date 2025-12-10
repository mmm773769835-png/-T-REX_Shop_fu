Server README - Auth service (Twilio)

1) cd server
2) npm install express bcrypt jsonwebtoken express-rate-limit helmet cors dotenv twilio
3) node create-hash.js  # copy output and paste into .env as ADMIN_HASH
4) copy .env.example to .env and fill TWILIO keys and phone numbers
5) node index.js
6) Open client app and set API URL to your deployed server (or http://localhost:3000 for local testing)
