// lib/supabase-direct.js - Direct Supabase client implementation
import { createClient } from '@supabase/supabase-js'

// Directly use this specific format instead of previous approaches
export const createDirectClient = () => {
  return createClient(
    'https://cuwajzlxhvccjiszqmft.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1d2Fqemx4aHZjY2ppc3pxbWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0MDg4NDcsImV4cCI6MjAzMDk4NDg0N30.PAg5hvpDnT9rD5glQUflvNLgL89zMYOkr3gjNHH4vxw'
  )
}

// Create a single instance to be used throughout the application
const supabaseClient = createDirectClient()
export default supabaseClient
