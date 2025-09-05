import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables with fallback to hardcoded values for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://hlvkisfjusxposvmybag.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsdmtpc2ZqdXN4cG9zdm15YmFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMDgwMzksImV4cCI6MjA2Nzc4NDAzOX0.AuoAc4kJ2cRig3d3I78rx8NGIh63WNDVhwDR7lUhpPA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});