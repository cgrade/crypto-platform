"use client";

import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Create a context for authentication
const NextAuthContext = createContext(undefined);

export function NextAuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user?.role === 'ADMIN';
  
  // Sign in with email and password
  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true);
      
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        return { success: false, error: result.error };
      }
      
      return { success: true, data: session };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [session]);
  
  // Sign up new user
  const signUp = useCallback(async (email, password, name) => {
    try {
      setLoading(true);
      
      // Call the registration API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }
      
      // If registration is successful, automatically sign in
      if (data.success) {
        const signInResult = await signIn(email, password);
        return signInResult;
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [signIn]);
  
  // Sign out user
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await nextAuthSignOut({ redirect: false });
      router.push('/login');
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  // Value to be provided by the context
  const value = {
    user: session?.user,
    loading: status === 'loading' || loading,
    isAuthenticated,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };
  
  return (
    <NextAuthContext.Provider value={value}>
      {children}
    </NextAuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useNextAuth() {
  const context = useContext(NextAuthContext);
  
  if (context === undefined) {
    throw new Error('useNextAuth must be used within a NextAuthProvider');
  }
  
  return context;
}
