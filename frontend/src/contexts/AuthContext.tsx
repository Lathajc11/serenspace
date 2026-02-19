import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import {
  onAuthChange,
  signUp,
  signIn,
  signInWithGoogle,
  signInAnonymous,
  logOut,
  getUserProfile,
  type UserProfile,
} from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAnonymous: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user profile
  const loadUserProfile = async (user: User) => {
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (currentUser) {
      await loadUserProfile(currentUser);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up handler
  const handleSignUp = async (email: string, password: string, displayName: string) => {
    await signUp(email, password, displayName);
  };

  // Sign in handler
  const handleSignIn = async (email: string, password: string) => {
    await signIn(email, password);
  };

  // Google sign in handler
  const handleSignInWithGoogle = async () => {
    await signInWithGoogle();
  };

  // Anonymous sign in handler
  const handleSignInAnonymous = async () => {
    await signInAnonymous();
  };

  // Logout handler
  const handleLogout = async () => {
    await logOut();
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleSignInWithGoogle,
    signInAnonymous: handleSignInAnonymous,
    logout: handleLogout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
