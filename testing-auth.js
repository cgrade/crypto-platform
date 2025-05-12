// testing-auth.js - A simple script to test Supabase auth directly
const { createClient } = require('@supabase/supabase-js');

// Create a direct client with minimal configuration
const supabase = createClient(
  'https://cuwajzlxhvccjiszqmft.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1d2Fqemx4aHZjY2ppc3pxbWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU0MDg4NDcsImV4cCI6MjAzMDk4NDg0N30.PAg5hvpDnT9rD5glQUflvNLgL89zMYOkr3gjNHH4vxw'
);

// Test function to sign in
async function testSignIn(email, password) {
  try {
    console.log('Testing sign in with:', { email, password: '********' });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Authentication error:', error);
      return;
    }
    
    console.log('Authentication successful:', {
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
      } : null,
      session: data.session ? 'Valid session token obtained' : 'No session',
    });
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Replace with your test credentials
const email = 'admin@crypto-platform.com';
const password = 'Admin123!';

// Run the test
testSignIn(email, password);
