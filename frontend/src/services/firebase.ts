import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';

// Firebase configuration - Replace with your own config from Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// User profile type
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  isAnonymous: boolean;
  createdAt: Timestamp | null;
  lastLoginAt: Timestamp | null;
  streakDays: number;
  longestStreak: number;
  totalCheckIns: number;
  preferences: {
    dailyReminder: boolean;
    reminderTime: string;
    theme: 'light' | 'dark';
  };
}

// Create user profile in Firestore
export const createUserProfile = async (user: User, displayName?: string): Promise<void> => {
  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    const userProfile: Omit<UserProfile, 'uid'> = {
      email: user.email,
      displayName: displayName || user.displayName || 'User',
      photoURL: user.photoURL,
      isAnonymous: user.isAnonymous,
      createdAt: serverTimestamp() as Timestamp,
      lastLoginAt: serverTimestamp() as Timestamp,
      streakDays: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      preferences: {
        dailyReminder: true,
        reminderTime: '09:00',
        theme: 'light',
      },
    };

    await setDoc(userRef, userProfile);
  } else {
    // Update last login
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
    });
  }
};

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnapshot = await getDoc(userRef);

  if (userSnapshot.exists()) {
    return { uid, ...userSnapshot.data() } as UserProfile;
  }

  return null;
};

// Sign up with email and password
export const signUp = async (email: string, password: string, displayName: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  // Update profile with display name
  await updateProfile(userCredential.user, { displayName });
  
  // Create user profile in Firestore
  await createUserProfile(userCredential.user, displayName);
  
  return userCredential.user;
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
  // Update last login
  await createUserProfile(userCredential.user);
  
  return userCredential.user;
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  
  // Create/update user profile
  await createUserProfile(userCredential.user);
  
  return userCredential.user;
};

// Sign in anonymously
export const signInAnonymous = async (): Promise<User> => {
  const userCredential = await signInAnonymously(auth);
  
  // Create user profile
  await createUserProfile(userCredential.user, 'Anonymous User');
  
  return userCredential.user;
};

// Log out
export const logOut = async (): Promise<void> => {
  await signOut(auth);
};

// Auth state observer
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user token
export const getIdToken = async (user: User): Promise<string> => {
  return await user.getIdToken();
};

export default app;
