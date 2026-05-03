import { createClient } from '@supabase/supabase-js';
import supabaseConfig from './supabaseConfig';

// إنشاء عميل Supabase
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

export default supabase;
