/**
 * Supabase Service - Main Service File
 * 
 * This file provides the main Supabase client and authentication services.
 * All Supabase operations should use this service to ensure consistency.
 */

import { createClient } from '@supabase/supabase-js';
import supabaseConfig from '../config/supabaseConfig';

// Initialize Supabase client
const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);

export default supabase;

// Authentication functions
export const authService = {
  // Sign up with email and password
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
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
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};

// Database functions
export const dbService = {
  // Get data from a table
  get: async (table, options = {}) => {
    let query = supabase.from(table).select('*');
    
    if (options.eq) {
      Object.keys(options.eq).forEach(key => {
        query = query.eq(key, options.eq[key]);
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
  add: async (table, data) => {
    const { data: result, error } = await supabase.from(table).insert(data).select();
    return { data: result, error };
  },

  // Update data in a table
  update: async (table, id, data) => {
    const { data: result, error } = await supabase.from(table).update(data).eq('id', id).select();
    return { data: result, error };
  },

  // Delete data from a table
  delete: async (table, id) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    return { error };
  },

  // Listen to real-time changes
  subscribe: (table, callback) => {
    return supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
      .subscribe();
  },
};

// Storage functions
export const storageService = {
  // Upload file
  upload: async (bucket, path, file) => {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file);
    return { data, error };
  },

  // Get public URL
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  // Delete file
  delete: async (bucket, path) => {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return { error };
  },
};
