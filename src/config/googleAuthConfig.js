/**
 * Google OAuth Configuration
 * Project: T-REX Shop
 * Client ID: 37814615065-2du0mn7o45r0l1asjbibi3tsijn62a7b.apps.googleusercontent.com
 * Note: Client Secret is managed server-side by Supabase Auth
 */

export const GOOGLE_AUTH_CONFIG = {
  web: {
    client_id: "37814615065-2du0mn7o45r0l1asjbibi3tsijn62a7b.apps.googleusercontent.com",
    redirect_uris: ["https://udqnrsrwzifrzseixrcj.supabase.co/auth/v1/callback"]
  }
};

export default GOOGLE_AUTH_CONFIG;
