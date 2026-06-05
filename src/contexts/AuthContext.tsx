import React, { createContext, useContext, useState, useEffect } from 'react';
import { Linking } from 'react-native';
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
  signOut: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async (url: string | null) => {
      console.log('[DEBUG] AuthContext: handleAuthCallback called with URL:', url);
      if (!url || !url.startsWith('trexshop://auth/callback')) {
        console.log('[DEBUG] AuthContext: URL does not match auth callback pattern');
        return;
      }

      console.log('[DEBUG] AuthContext: URL matches auth callback pattern, exchanging code for session');
      setLoading(true);
      const { error } = await authService.exchangeCodeForSession(url);
      if (error) {
        console.error('[DEBUG] AuthContext: Failed to exchange auth code', error);
        setLoading(false);
      } else {
        console.log('[DEBUG] AuthContext: Successfully exchanged auth code for session');
      }
    };

    console.log('[DEBUG] AuthContext: Setting up deep linking');
    Linking.getInitialURL().then((url) => {
      console.log('[DEBUG] AuthContext: Initial URL:', url);
      handleAuthCallback(url);
    }).catch((error) => {
      console.error('[DEBUG] AuthContext: Failed to get initial URL', error);
      setLoading(false);
    });
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      console.log('[DEBUG] AuthContext: Deep link received:', url);
      handleAuthCallback(url);
    });

    authService.getCurrentSession().then(({ session }) => {
      console.log('[DEBUG] AuthContext: Current session:', session);
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        setUser({
          uid: session.user.id,
          email: session.user.email || null,
          displayName: metadata.full_name || metadata.name || metadata.displayName || null,
          phoneNumber: session.user.phone || metadata.phone || null,
          photoURL: metadata.avatar_url || metadata.picture || metadata.photo_url || metadata.photoURL || null,
        });
      }
      setLoading(false);
    }).catch((error) => {
      console.error('[DEBUG] AuthContext: Failed to get current session', error);
      setLoading(false);
    });

    // Listen for auth state changes
    console.log('[DEBUG] AuthContext: Setting up auth state listener');
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      console.log('[DEBUG] AuthContext: Auth state changed', event, session);
      if (session?.user) {
        const metadata = session.user.user_metadata || {};
        setUser({
          uid: session.user.id,
          email: session.user.email || null,
          displayName: metadata.full_name || metadata.name || metadata.displayName || null,
          phoneNumber: session.user.phone || metadata.phone || null,
          photoURL: metadata.avatar_url || metadata.picture || metadata.photo_url || metadata.photoURL || null,
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
      linkingSubscription.remove();
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    setUser,
    signOut: async () => {
      console.log('[DEBUG] AuthContext: Sign out called');
      const { error } = await authService.signOut();
      if (error) {
        console.error('[DEBUG] AuthContext: Sign out failed', error);
        throw error;
      }
      console.log('[DEBUG] AuthContext: Sign out completed, setting user to null');
      setUser(null);
      console.log('[DEBUG] AuthContext: User set to null');
    },
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