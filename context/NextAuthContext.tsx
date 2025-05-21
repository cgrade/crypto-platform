"use client";

import { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react';
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Define types for authentication responses
type AuthResult = {
  success: boolean;
  error?: string;
  data?: any;
};

interface NextAuthContextType {
  user: any;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, name: string, investmentPlan?: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const NextAuthContext = createContext<NextAuthContextType | null>(null);

export const NextAuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  
  const isAuthenticated = status === 'authenticated';
  const isAdmin = session?.user?.role === 'ADMIN';
  
  // Sign in user
  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      setLoading(true);
      
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Sign up new user
  const signUp = useCallback(async (email: string, password: string, name: string, investmentPlan?: string): Promise<AuthResult> => {
    try {
      setLoading(true);
      
      // Call the registration API endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, investmentPlan }),
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
    } catch (error: any) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [signIn]);
  
  // Sign out user
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      await nextAuthSignOut({ redirect: false });
      router.push('/login');
    } catch (error: any) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  return (
    <NextAuthContext.Provider
      value={{
        user: session?.user,
        isAuthenticated,
        isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </NextAuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useNextAuth = (): NextAuthContextType => {
  const context = useContext(NextAuthContext);
  
  if (!context) {
    throw new Error('useNextAuth must be used within a NextAuthProvider');
  }
  
  return context;
};
