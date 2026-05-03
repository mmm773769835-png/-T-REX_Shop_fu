/**
 * Supabase Service - Main Service File
 * 
 * This file provides the main Supabase client and authentication services.
 * All Supabase operations should use this service to ensure consistency.
 */

import { createClient, SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';
import supabaseConfig from '../config/supabaseConfig';

// Initialize Supabase client
const supabase: SupabaseClient = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);

export default supabase;

// Authentication functions
export const authService = {
  // Sign up with email and password
  signUp: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
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
        redirectTo: 'com.trexshop.app://auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    return { data, error };
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
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
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
