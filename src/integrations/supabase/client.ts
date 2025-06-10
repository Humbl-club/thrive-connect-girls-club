
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get Supabase URL and Key from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the environment variables are set
if (!SUPABASE_URL) {
  throw new Error("VITE_SUPABASE_URL is not set in your environment variables. Please add it to your .env file.");
}
if (!SUPABASE_ANON_KEY) {
  throw new Error("VITE_SUPABASE_ANON_KEY is not set in your environment variables. Please add it to your .env file.");
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
