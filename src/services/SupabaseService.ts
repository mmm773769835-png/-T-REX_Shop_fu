/**
 * Supabase Service - Main Service File
 * 
 * This file provides the main Supabase client and authentication services.
 * All Supabase operations should use this service to ensure consistency.
 */

import { createClient, SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabaseConfig from '../config/supabaseConfig';

// Initialize Supabase client
const supabase: SupabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export default supabase;

// Authentication functions
export const authService = {
  // Sign up with email and password
  signUp: async (email: string, password: string, userData: any = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'trexshop://auth/callback',
        data: userData,
      },
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with OTP (Phone Auth)
  signInWithOtp: async (options: { phone: string }) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: options.phone,
    });
    return { data, error };
  },

  // Verify OTP
  verifyOtp: async (options: { phone: string; token: string; type: 'sms' }) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: options.phone,
      token: options.token,
      type: options.type,
    });
    return { data, error };
  },

  // Sign in with Google OAuth
  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'trexshop://auth/callback',
        skipBrowserRedirect: true,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    return { data, error };
  },

  exchangeCodeForSession: async (url: string) => {
    try {
      console.log('[DEBUG] exchangeCodeForSession called with URL:', url);
      const queryParams: { [key: string]: string } = {};
      
      const queryIndex = url.indexOf('?');
      const hashIndex = url.indexOf('#');
      
      let queryString = '';
      let hashString = '';
      
      if (queryIndex !== -1) {
        const endOfQuery = hashIndex !== -1 && hashIndex > queryIndex ? hashIndex : url.length;
        queryString = url.substring(queryIndex + 1, endOfQuery);
      }
      
      if (hashIndex !== -1) {
        hashString = url.substring(hashIndex + 1);
      }
      
      const safeDecode = (str: string) => {
        try {
          return decodeURIComponent(str);
        } catch (e) {
          return str;
        }
      };
      
      const parsePairs = (str: string) => {
        if (!str) return;
        const pairs = str.split('&');
        for (const pair of pairs) {
          const eqIndex = pair.indexOf('=');
          if (eqIndex !== -1) {
            const key = pair.substring(0, eqIndex);
            const value = pair.substring(eqIndex + 1);
            if (key) {
              queryParams[safeDecode(key)] = safeDecode(value);
            }
          }
        }
      };
      
      parsePairs(queryString);
      parsePairs(hashString);
      
      console.log('[DEBUG] Parsed URL parameters:', {
        hasCode: !!queryParams.code,
        hasAccessToken: !!queryParams.access_token,
        hasRefreshToken: !!queryParams.refresh_token,
        error: queryParams.error,
        errorDescription: queryParams.error_description
      });
      
      if (queryParams.error) {
        return { 
          data: null, 
          error: new Error(queryParams.error_description || queryParams.error || 'Authentication error') 
        };
      }
      
      if (queryParams.access_token && queryParams.refresh_token) {
        console.log('[DEBUG] Found access_token and refresh_token, setting session directly');
        const { data, error } = await supabase.auth.setSession({
          access_token: queryParams.access_token,
          refresh_token: queryParams.refresh_token,
        });
        return { data, error };
      }
      
      if (queryParams.code) {
        console.log('[DEBUG] Found auth code, exchanging for session');
        const { data, error } = await supabase.auth.exchangeCodeForSession(queryParams.code);
        return { data, error };
      }
      
      return { data: null, error: new Error('No authentication code or tokens found in callback URL') };
    } catch (err: any) {
      console.error('[DEBUG] Exception in exchangeCodeForSession:', err);
      return { data: null, error: err };
    }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};

// Database functions
export const dbService = {
  // Get data from a table
  get: async (table: string, options: any = {}) => {
    let query = supabase.from(table).select('*');

    if (options.eq) {
      Object.keys(options.eq).forEach(key => {
        query = query.eq(key, options.eq[key]);
      });
    }

    if (options.gt) {
      Object.keys(options.gt).forEach(key => {
        query = query.gt(key, options.gt[key]);
      });
    }

    if (options.gte) {
      Object.keys(options.gte).forEach(key => {
        query = query.gte(key, options.gte[key]);
      });
    }

    if (options.lt) {
      Object.keys(options.lt).forEach(key => {
        query = query.lt(key, options.lt[key]);
      });
    }

    if (options.lte) {
      Object.keys(options.lte).forEach(key => {
        query = query.lte(key, options.lte[key]);
      });
    }

    if (options.neq) {
      Object.keys(options.neq).forEach(key => {
        query = query.neq(key, options.neq[key]);
      });
    }

    if (options.order) {
      query = query.order(options.order.column, {
        ascending: options.order.ascending !== false
      });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Add data to a table
  add: async (table: string, data: any) => {
    const { data: result, error } = await supabase.from(table).insert(data).select();
    return { data: result, error };
  },

  upsert: async (table: string, data: any, onConflict = 'id') => {
    const { data: result, error } = await supabase.from(table).upsert(data, { onConflict }).select();
    return { data: result, error };
  },

  // Update data in a table
  update: async (table: string, id: string, data: any) => {
    const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select();
    return { data: result, error };
  },

  // Delete data from a table
  delete: async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    return { error };
  },

  // Listen to real-time changes
  subscribe: (table: string, callback: any) => {
    return supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  },
};

// Storage functions
export const storageService = {
  // Upload file
  upload: async (bucket: string, path: string, file: any) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    return { data, error };
  },

  // Get public URL
  getPublicUrl: (bucket: string, path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete file
  delete: async (bucket: string, path: string) => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return { error };
  },
};
