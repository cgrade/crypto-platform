// lib/supabaseClient.js - Safe for server-side components
import { createClient } from '@supabase/supabase-js'

// Direct hardcoded values to ensure consistent behavior
const SUPABASE_URL = 'https://cuwajzlxhvccjiszqmft.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1d2Fqemx4aHZjY2ppc3pxbWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0MDg4NDcsImV4cCI6MjAzMDk4NDg0N30.PAg5hvpDnT9rD5glQUflvNLgL89zMYOkr3gjNHH4vxw'

// Create a minimal Supabase client for server contexts
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'x-client-info': 'crypto-platform-server@0.1.0'
    }
  }
})

// We use a different module for browser-specific supabase functionality