// Firebase Authentication Functions
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'staff';
  staffCode?: string;
  createdAt: string;
}

// Login function
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }
    
    const userData = userDoc.data() as User;
    
    // Store in localStorage for quick access
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    return userData;
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed');
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem('currentUser');
  } catch (error: any) {
    console.error('Logout error:', error);
    throw new Error('Logout failed');
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};

// Auth state listener
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        callback(userData);
      } else {
        callback(null);
      }
    } else {
      localStorage.removeItem('currentUser');
      callback(null);
    }
  });
};

// Create user in Firestore (Admin only function)
export const createUserInFirestore = async (userData: {
  email: string;
  fullName: string;
  role: 'admin' | 'staff';
  staffCode?: string;
  uid: string;
}): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', userData.uid), {
      id: userData.uid,
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
      staffCode: userData.staffCode || '',
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    throw new Error('Failed to create user data');
  }
};
