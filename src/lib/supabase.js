import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidHttpUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  if (str === '[SENSITIVE]' || str.trim() === '') return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const supabaseUrl = isValidHttpUrl(rawUrl) ? rawUrl : 'https://placeholder.supabase.co';
const supabaseAnonKey = (rawKey && rawKey !== '[SENSITIVE]' && rawKey.trim() !== '') ? rawKey : 'placeholder-key';

if (!isValidHttpUrl(rawUrl) || !rawKey || rawKey === '[SENSITIVE]') {
  console.warn("⚠️ Valid Supabase URL or Anon Key is missing. Using safe placeholder fallback.");
}

// Fallback values prevent `createClient` from throwing fatal runtime crashes
let client;
try {
  client = createClient(supabaseUrl, supabaseAnonKey);
} catch (err) {
  console.warn("⚠️ Failed to initialize Supabase client with provided credentials, falling back to placeholder:", err);
  client = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export const supabase = client;
