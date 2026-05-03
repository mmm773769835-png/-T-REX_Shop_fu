import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/SupabaseService';

// Define types
interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  [key: string]: any; // For additional user data
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    console.log('[DEBUG] AuthContext: Setting up auth state listener');
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      console.log('[DEBUG] AuthContext: Auth state changed', event, session);
      if (session?.user) {
        setUser({
          uid: session.user.id,
          email: session.user.email || null,
          displayName: session.user.user_metadata?.full_name || null,
          phoneNumber: session.user.phone || null,
          // Add any other user properties you want to track
        });
      } else {
        setUser(null);
      }
      setLoading(false);
      console.log('[DEBUG] AuthContext: Loading set to false');
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;