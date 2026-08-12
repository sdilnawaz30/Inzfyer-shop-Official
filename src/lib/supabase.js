import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase URL or Anon Key is missing. Check your Vercel environment variables.");
}

// Fallback values prevent `createClient` from throwing a fatal error ("supabaseUrl is required").
// This allows the React app to render the UI instead of showing a blank screen, 
// even though data fetches will fail gracefully.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
