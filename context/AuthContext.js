import { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session from supabase on initial load
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: userData } = await supabase
            .from('User')
            .select('*')
            .eq('email', session.user.email)
            .single();
            
          setUser(userData || session.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          try {
            const { data: userData } = await supabase
              .from('User')
              .select('*')
              .eq('email', session.user.email)
              .single();
              
            setUser(userData || session.user);
          } catch (error) {
            console.error('Error fetching user data:', error);
            setUser(session.user);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, name) => {
    try {
      setLoading(true);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // Create user profile in User table
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('User')
          .insert([
            { 
              id: authData.user.id,
              email,
              name,
              password: 'hashed-in-db', // We'll use Supabase Auth for verification
              role: 'USER',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]);

        if (profileError) throw profileError;
      }

      return { success: true, data: authData };
    } catch (error) {
      console.error('Error signing up:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
