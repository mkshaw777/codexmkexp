// Firebase Firestore Data Functions
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { getCurrentUser } from './auth-firebase';

// Types (same as before)
export interface Staff {
  id: string;
  email: string;
  fullName: string;
  staffCode: string;
  role: 'staff';
  createdAt: string;
}

export interface Advance {
  id: string;
  staffId: string;
  amount: number;
  date: string;
  description: string;
  status: 'active' | 'settled';
  settlementStatus: 'pending' | 'settled';
  createdAt: string;
  settledAt?: string;
}

export interface Expense {
  id: string;
  userId: string;
  advanceId: string;
  date: string;
  category: string;
  categoryDetail?: string;
  subCategory?: string;
  fare: number;
  parking: number;
  oil: number;
  breakfast: number;
  others: number;
  total: number;
  numberOfCases: number;
  billUrls: string[];
  remarks: string;
  submittedToAdmin: boolean;
  settlementStatus: 'pending' | 'settled';
  createdAt: string;
  settledAt?: string;
}

export interface AdminExpense {
  id: string;
  date: string;
  category: string;
  categoryDetail?: string;
  amount: number;
  remarks: string;
  billUrls: string[];
  createdAt: string;
}

export interface Collection {
  id: string;
  staffId: string;
  date: string;
  amount: number;
  remarks: string;
  createdAt: string;
}

export interface TransportPayment {
  id: string;
  userId: string;
  date: string;
  company: 'Exh' | 'Genex' | 'IQ' | 'Canadian' | 'Others';
  amount: number;
  remarks: string;
  createdAt: string;
}

// ==================== STAFF FUNCTIONS ====================

export const getAllStaff = async (): Promise<Staff[]> => {
  try {
    const staffQuery = query(
      collection(db, 'users'),
      where('role', '==', 'staff'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(staffQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
  } catch (error) {
    console.error('Get staff error:', error);
    return [];
  }
};

export const createStaff = async (staffData: Omit<Staff, 'id' | 'createdAt'>): Promise<Staff> => {
  try {
    const newStaff = {
      ...staffData,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'users'), newStaff);
    return { id: docRef.id, ...newStaff };
  } catch (error: any) {
    console.error('Create staff error:', error);
    throw new Error('Failed to create staff');
  }
};

export const deleteStaff = async (staffId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'users', staffId));
    return true;
  } catch (error) {
    console.error('Delete staff error:', error);
    return false;
  }
};

// ==================== ADVANCE FUNCTIONS ====================

export const getAdvances = async (staffId?: string): Promise<Advance[]> => {
  try {
    let advanceQuery;
    if (staffId) {
      advanceQuery = query(
        collection(db, 'advances'),
        where('staffId', '==', staffId),
        orderBy('date', 'desc')
      );
    } else {
      advanceQuery = query(
        collection(db, 'advances'),
        orderBy('date', 'desc')
      );
    }
    const snapshot = await getDocs(advanceQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Advance));
  } catch (error) {
    console.error('Get advances error:', error);
    return [];
  }
};

export const createAdvance = async (advanceData: Omit<Advance, 'id' | 'createdAt'>): Promise<Advance> => {
  try {
    const newAdvance = {
      ...advanceData,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'advances'), newAdvance);
    return { id: docRef.id, ...newAdvance };
  } catch (error: any) {
    console.error('Create advance error:', error);
    throw new Error('Failed to create advance');
  }
};

export const updateAdvance = async (id: string, data: Partial<Advance>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'advances', id), data);
    return true;
  } catch (error) {
    console.error('Update advance error:', error);
    return false;
  }
};

export const deleteAdvance = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'advances', id));
    return true;
  } catch (error) {
    console.error('Delete advance error:', error);
    return false;
  }
};

// ==================== EXPENSE FUNCTIONS ====================

export const getExpenses = async (userId?: string): Promise<Expense[]> => {
  try {
    let expenseQuery;
    if (userId) {
      expenseQuery = query(
        collection(db, 'expenses'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
    } else {
      expenseQuery = query(
        collection(db, 'expenses'),
        orderBy('date', 'desc')
      );
    }
    const snapshot = await getDocs(expenseQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
  } catch (error) {
    console.error('Get expenses error:', error);
    return [];
  }
};

export const createExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> => {
  try {
    const newExpense = {
      ...expenseData,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'expenses'), newExpense);
    return { id: docRef.id, ...newExpense };
  } catch (error: any) {
    console.error('Create expense error:', error);
    throw new Error('Failed to create expense');
  }
};

export const updateExpense = async (id: string, data: Partial<Expense>): Promise<boolean> => {
  try {
    await updateDoc(doc(db, 'expenses', id), data);
    return true;
  } catch (error) {
    console.error('Update expense error:', error);
    return false;
  }
};

export const deleteExpense = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'expenses', id));
    return true;
  } catch (error) {
    console.error('Delete expense error:', error);
    return false;
  }
};

// ==================== ADMIN EXPENSE FUNCTIONS ====================

export const getAdminExpenses = async (): Promise<AdminExpense[]> => {
  try {
    const expenseQuery = query(
      collection(db, 'adminExpenses'),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(expenseQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminExpense));
  } catch (error) {
    console.error('Get admin expenses error:', error);
    return [];
  }
};

export const createAdminExpense = async (expenseData: Omit<AdminExpense, 'id' | 'createdAt'>): Promise<AdminExpense> => {
  try {
    const newExpense = {
      ...expenseData,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'adminExpenses'), newExpense);
    return { id: docRef.id, ...newExpense };
  } catch (error: any) {
    console.error('Create admin expense error:', error);
    throw new Error('Failed to create admin expense');
  }
};

export const deleteAdminExpense = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'adminExpenses', id));
    return true;
  } catch (error) {
    console.error('Delete admin expense error:', error);
    return false;
  }
};

// ==================== COLLECTION FUNCTIONS ====================

export const getCollections = async (staffId?: string): Promise<Collection[]> => {
  try {
    let collectionQuery;
    if (staffId) {
      collectionQuery = query(
        collection(db, 'collections'),
        where('staffId', '==', staffId),
        orderBy('date', 'desc')
      );
    } else {
      collectionQuery = query(
        collection(db, 'collections'),
        orderBy('date', 'desc')
      );
    }
    const snapshot = await getDocs(collectionQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Collection));
  } catch (error) {
    console.error('Get collections error:', error);
    return [];
  }
};

export const createCollection = async (collectionData: Omit<Collection, 'id' | 'createdAt'>): Promise<Collection> => {
  try {
    const newCollection = {
      ...collectionData,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'collections'), newCollection);
    return { id: docRef.id, ...newCollection };
  } catch (error: any) {
    console.error('Create collection error:', error);
    throw new Error('Failed to create collection');
  }
};

export const deleteCollection = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'collections', id));
    return true;
  } catch (error) {
    console.error('Delete collection error:', error);
    return false;
  }
};

// ==================== TRANSPORT PAYMENT FUNCTIONS ====================

export const getTransportPayments = async (userId?: string): Promise<TransportPayment[]> => {
  try {
    let paymentQuery;
    if (userId) {
      paymentQuery = query(
        collection(db, 'transportPayments'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
    } else {
      paymentQuery = query(
        collection(db, 'transportPayments'),
        orderBy('date', 'desc')
      );
    }
    const snapshot = await getDocs(paymentQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TransportPayment));
  } catch (error) {
    console.error('Get transport payments error:', error);
    return [];
  }
};

export const createTransportPayment = async (paymentData: Omit<TransportPayment, 'id' | 'createdAt'>): Promise<TransportPayment> => {
  try {
    const newPayment = {
      ...paymentData,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, 'transportPayments'), newPayment);
    return { id: docRef.id, ...newPayment };
  } catch (error: any) {
    console.error('Create transport payment error:', error);
    throw new Error('Failed to create transport payment');
  }
};

export const deleteTransportPayment = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'transportPayments', id));
    return true;
  } catch (error) {
    console.error('Delete transport payment error:', error);
    return false;
  }
};

// ==================== HELPER FUNCTIONS ====================

export const getExpensesByAdvance = async (advanceId: string): Promise<Expense[]> => {
  try {
    const expenseQuery = query(
      collection(db, 'expenses'),
      where('advanceId', '==', advanceId)
    );
    const snapshot = await getDocs(expenseQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
  } catch (error) {
    console.error('Get expenses by advance error:', error);
    return [];
  }
};

export const hasExpenseForAdvance = async (advanceId: string): Promise<boolean> => {
  const expenses = await getExpensesByAdvance(advanceId);
  return expenses.length > 0;
};

export const getAdvanceExpenseStatus = async (advanceId: string) => {
  const expenses = await getExpensesByAdvance(advanceId);
  const hasExpense = expenses.length > 0;
  const expense = expenses[0] || null;
  const isPending = expense ? expense.settlementStatus === 'pending' : false;

  return {
    hasExpense,
    expense,
    isPending,
  };
};

export const calculateAdvanceBalance = async (advanceId: string) => {
  const advances = await getAdvances();
  const advance = advances.find(a => a.id === advanceId);
  
  if (!advance) {
    return { spent: 0, balance: 0 };
  }

  const expenses = await getExpensesByAdvance(advanceId);
  const spent = expenses.reduce((sum, exp) => sum + exp.total, 0);
  const balance = advance.amount - spent;

  return { spent, balance };
};

// ==================== BILL IMAGE UPLOAD TO FIREBASE STORAGE ====================

export const uploadBillImage = async (base64Image: string, expenseId: string, index: number): Promise<string> => {
  try {
    const fileName = `bills/${expenseId}_${index}_${Date.now()}.jpg`;
    const storageRef = ref(storage, fileName);
    
    // Upload base64 image
    await uploadString(storageRef, base64Image, 'data_url');
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    console.error('Upload bill image error:', error);
    throw new Error('Failed to upload bill image');
  }
};

export const deleteBillImage = async (imageUrl: string): Promise<boolean> => {
  try {
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Delete bill image error:', error);
    return false;
  }
};

// ==================== INITIALIZE DEFAULT ADMIN ====================

export const initializeDefaultAdmin = async (): Promise<void> => {
  try {
    // Check if admin exists
    const usersQuery = query(
      collection(db, 'users'),
      where('role', '==', 'admin')
    );
    const snapshot = await getDocs(usersQuery);
    
    if (snapshot.empty) {
      // Create default admin
      await addDoc(collection(db, 'users'), {
        email: 'admin@mkmarketing.com',
        fullName: 'Admin',
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
      console.log('Default admin created');
    }
  } catch (error) {
    console.error('Initialize admin error:', error);
  }
};
