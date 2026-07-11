// SERVER-ONLY Supabase client (service role). Never import in client components.
import { createClient } from '@supabase/supabase-js';
export function sb() {
  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null; // features degrade gracefully if not configured
  return createClient(url, key, { auth: { persistSession: false } });
}
