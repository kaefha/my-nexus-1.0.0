import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize only if keys are present and not dummy values
export const supabase = 
  supabaseUrl && 
  supabaseServiceKey && 
  !supabaseUrl.includes('replace-me') 
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;
