// lib/supabase-browser.js - Browser-safe Supabase client
import { createClient } from '@supabase/supabase-js'

// IMPORTANT: These values must be hardcoded in the client bundle for authentication to work
// This is a common pattern in Supabase + Next.js applications
const SUPABASE_URL = 'https://cuwajzlxhvccjiszqmft.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1d2Fqemx4aHZjY2ppc3pxbWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0MDg4NDcsImV4cCI6MjAzMDk4NDg0N30.PAg5hvpDnT9rD5glQUflvNLgL89zMYOkr3gjNHH4vxw'

// We create and export a singleton instance once
let supabaseInstance = null

export const createBrowserClient = () => {
  if (supabaseInstance) return supabaseInstance
  
  // For debugging - look at exact values being used
  console.log('Creating Supabase browser client with URL:', SUPABASE_URL)
  
  // Create the client with explicit options
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'sb-auth-token',
      flowType: 'pkce',  // Use PKCE flow for better security
      debug: true,       // Enable auth debugging in development
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', 
        domain: typeof window !== 'undefined' ? window.location.hostname : undefined,
        maxAge: 60 * 60 * 24 * 7
      }
    },
    global: {
      headers: {
        'x-client-info': 'crypto-platform@0.1.0'
      }
    }
  })
  
  return supabaseInstance
}
