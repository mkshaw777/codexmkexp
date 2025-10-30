// Supabase data management with real-time cloud sync
import { supabase } from './supabase';

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

export interface Expense {
  id: string;
  userId: string;
  advanceId?: string;
  date: string;
  category: 'Transport' | 'Bazar' | 'Sealdah' | 'Out Station' | 'Paglahat' | 'Others';
  categoryDetail: string;
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
  settledBy?: string;
  settlementDate?: string;
  settlementStatus: 'pending' | 'settled';
  createdAt: string;
}

export interface Advance {
  id: string;
  userId: string;
  adminId: string;
  staffId: string;
  date: string;
  amount: number;
  remainingBalance: number;
  status: 'active' | 'settled' | 'cancelled';
  description: string;
  totalExpenses: number;
  balanceToSettle: number;
  settlementStatus: 'pending' | 'settled';
  createdAt: string;
}

export interface Return {
  id: string;
  userId: string;
  date: string;
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  adminComments?: string;
  createdAt: string;
}

export interface AdminExpense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  paymentTo: string;
  billUrls: string[];
  remarks: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  enteredBy: string;
  enteredByName: string;
  enteredByRole: 'admin' | 'staff';
  approved: boolean;
  approvedBy?: string;
  approvedByName?: string;
  approvedDate?: string;
  remarks?: string;
  paymentMode: 'Cash' | 'Online' | 'Cheque';
  createdAt: string;
}

// ============================================
// EXPENSE FUNCTIONS
// ============================================

export const getExpenses = async (userId?: string): Promise<Expense[]> => {
  try {
    let query = supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching expenses:', error);
      return [];
    }

    // Map database columns to interface properties
    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      advanceId: row.advance_id,
      date: row.date,
      category: row.category,
      categoryDetail: row.category_detail || '',
      subCategory: row.sub_category,
      fare: row.fare || 0,
      parking: row.parking || 0,
      oil: row.oil || 0,
      breakfast: row.breakfast || 0,
      others: row.others || 0,
      total: row.total || 0,
      numberOfCases: row.number_of_cases || 0,
      billUrls: row.bill_urls || [],
      remarks: row.remarks || '',
      submittedToAdmin: row.submitted_to_admin || false,
      settledBy: row.settled_by,
      settlementDate: row.settlement_date,
      settlementStatus: row.settlement_status || 'pending',
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Exception in getExpenses:', err);
    return [];
  }
};

export const getExpenseById = async (id: string): Promise<Expense | null> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching expense:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      advanceId: data.advance_id,
      date: data.date,
      category: data.category,
      categoryDetail: data.category_detail || '',
      subCategory: data.sub_category,
      fare: data.fare || 0,
      parking: data.parking || 0,
      oil: data.oil || 0,
      breakfast: data.breakfast || 0,
      others: data.others || 0,
      total: data.total || 0,
      numberOfCases: data.number_of_cases || 0,
      billUrls: data.bill_urls || [],
      remarks: data.remarks || '',
      submittedToAdmin: data.submitted_to_admin || false,
      settledBy: data.settled_by,
      settlementDate: data.settlement_date,
      settlementStatus: data.settlement_status || 'pending',
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Exception in getExpenseById:', err);
    return null;
  }
};

export const createExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense | null> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        user_id: expense.userId,
        advance_id: expense.advanceId || null,
        date: expense.date,
        category: expense.category,
        category_detail: expense.categoryDetail,
        sub_category: expense.subCategory,
        fare: expense.fare,
        parking: expense.parking,
        oil: expense.oil,
        breakfast: expense.breakfast,
        others: expense.others,
        total: expense.total,
        number_of_cases: expense.numberOfCases,
        bill_urls: expense.billUrls,
        remarks: expense.remarks,
        submitted_to_admin: expense.submittedToAdmin,
        settlement_status: expense.settlementStatus,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating expense:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      advanceId: data.advance_id,
      date: data.date,
      category: data.category,
      categoryDetail: data.category_detail || '',
      subCategory: data.sub_category,
      fare: data.fare || 0,
      parking: data.parking || 0,
      oil: data.oil || 0,
      breakfast: data.breakfast || 0,
      others: data.others || 0,
      total: data.total || 0,
      numberOfCases: data.number_of_cases || 0,
      billUrls: data.bill_urls || [],
      remarks: data.remarks || '',
      submittedToAdmin: data.submitted_to_admin || false,
      settledBy: data.settled_by,
      settlementDate: data.settlement_date,
      settlementStatus: data.settlement_status || 'pending',
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Exception in createExpense:', err);
    return null;
  }
};

export const updateExpense = async (id: string, updates: Partial<Expense>): Promise<Expense | null> => {
  try {
    // Map interface properties to database columns
    const dbUpdates: any = {};
    if (updates.userId !== undefined) dbUpdates.user_id = updates.userId;
    if (updates.advanceId !== undefined) dbUpdates.advance_id = updates.advanceId;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.categoryDetail !== undefined) dbUpdates.category_detail = updates.categoryDetail;
    if (updates.subCategory !== undefined) dbUpdates.sub_category = updates.subCategory;
    if (updates.fare !== undefined) dbUpdates.fare = updates.fare;
    if (updates.parking !== undefined) dbUpdates.parking = updates.parking;
    if (updates.oil !== undefined) dbUpdates.oil = updates.oil;
    if (updates.breakfast !== undefined) dbUpdates.breakfast = updates.breakfast;
    if (updates.others !== undefined) dbUpdates.others = updates.others;
    if (updates.total !== undefined) dbUpdates.total = updates.total;
    if (updates.numberOfCases !== undefined) dbUpdates.number_of_cases = updates.numberOfCases;
    if (updates.billUrls !== undefined) dbUpdates.bill_urls = updates.billUrls;
    if (updates.remarks !== undefined) dbUpdates.remarks = updates.remarks;
    if (updates.submittedToAdmin !== undefined) dbUpdates.submitted_to_admin = updates.submittedToAdmin;
    if (updates.settledBy !== undefined) dbUpdates.settled_by = updates.settledBy;
    if (updates.settlementDate !== undefined) dbUpdates.settlement_date = updates.settlementDate;
    if (updates.settlementStatus !== undefined) dbUpdates.settlement_status = updates.settlementStatus;

    const { data, error } = await supabase
      .from('expenses')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating expense:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      advanceId: data.advance_id,
      date: data.date,
      category: data.category,
      categoryDetail: data.category_detail || '',
      subCategory: data.sub_category,
      fare: data.fare || 0,
      parking: data.parking || 0,
      oil: data.oil || 0,
      breakfast: data.breakfast || 0,
      others: data.others || 0,
      total: data.total || 0,
      numberOfCases: data.number_of_cases || 0,
      billUrls: data.bill_urls || [],
      remarks: data.remarks || '',
      submittedToAdmin: data.submitted_to_admin || false,
      settledBy: data.settled_by,
      settlementDate: data.settlement_date,
      settlementStatus: data.settlement_status || 'pending',
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Exception in updateExpense:', err);
    return null;
  }
};

export const deleteExpense = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in deleteExpense:', err);
    return false;
  }
};

export const settleExpense = async (id: string, adminId: string): Promise<Expense | null> => {
  return updateExpense(id, {
    settlementStatus: 'settled',
    settledBy: adminId,
    settlementDate: new Date().toISOString(),
  });
};

// ============================================
// ADVANCE FUNCTIONS
// ============================================

export const getAdvances = async (userId?: string): Promise<Advance[]> => {
  try {
    let query = supabase
      .from('advances')
      .select('*')
      .order('date', { ascending: false });

    if (userId) {
      query = query.eq('staff_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching advances:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      userId: row.staff_id,
      adminId: row.admin_id,
      staffId: row.staff_id,
      date: row.date,
      amount: row.amount || 0,
      remainingBalance: row.remaining_balance || 0,
      status: row.status || 'active',
      description: row.description || '',
      totalExpenses: row.total_expenses || 0,
      balanceToSettle: row.balance_to_settle || 0,
      settlementStatus: row.settlement_status || 'pending',
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Exception in getAdvances:', err);
    return [];
  }
};

export const getAdvanceById = async (id: string): Promise<Advance | null> => {
  try {
    const { data, error } = await supabase
      .from('advances')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching advance:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.staff_id,
      adminId: data.admin_id,
      staffId: data.staff_id,
      date: data.date,
      amount: data.amount || 0,
      remainingBalance: data.remaining_balance || 0,
      status: data.status || 'active',
      description: data.description || '',
      totalExpenses: data.total_expenses || 0,
      balanceToSettle: data.balance_to_settle || 0,
      settlementStatus: data.settlement_status || 'pending',
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Exception in getAdvanceById:', err);
    return null;
  }
};

export const createAdvance = async (advance: Omit<Advance, 'id' | 'createdAt'>): Promise<Advance | null> => {
  try {
    const { data, error } = await supabase
      .from('advances')
      .insert([{
        staff_id: advance.staffId,
        admin_id: advance.adminId,
        date: advance.date,
        amount: advance.amount,
        remaining_balance: advance.remainingBalance,
        status: advance.status,
        description: advance.description,
        total_expenses: advance.totalExpenses || 0,
        balance_to_settle: advance.balanceToSettle || 0,
        settlement_status: advance.settlementStatus || 'pending',
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating advance:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.staff_id,
      adminId: data.admin_id,
      staffId: data.staff_id,
      date: data.date,
      amount: data.amount || 0,
      remainingBalance: data.remaining_balance || 0,
      status: data.status || 'active',
      description: data.description || '',
      totalExpenses: data.total_expenses || 0,
      balanceToSettle: data.balance_to_settle || 0,
      settlementStatus: data.settlement_status || 'pending',
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Exception in createAdvance:', err);
    return null;
  }
};

export const updateAdvance = async (id: string, updates: Partial<Advance>): Promise<Advance | null> => {
  try {
    const dbUpdates: any = {};
    if (updates.staffId !== undefined) dbUpdates.staff_id = updates.staffId;
    if (updates.adminId !== undefined) dbUpdates.admin_id = updates.adminId;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.remainingBalance !== undefined) dbUpdates.remaining_balance = updates.remainingBalance;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.totalExpenses !== undefined) dbUpdates.total_expenses = updates.totalExpenses;
    if (updates.balanceToSettle !== undefined) dbUpdates.balance_to_settle = updates.balanceToSettle;
    if (updates.settlementStatus !== undefined) dbUpdates.settlement_status = updates.settlementStatus;

    const { data, error } = await supabase
      .from('advances')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating advance:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.staff_id,
      adminId: data.admin_id,
      staffId: data.staff_id,
      date: data.date,
      amount: data.amount || 0,
      remainingBalance: data.remaining_balance || 0,
      status: data.status || 'active',
      description: data.description || '',
      totalExpenses: data.total_expenses || 0,
      balanceToSettle: data.balance_to_settle || 0,
      settlementStatus: data.settlement_status || 'pending',
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Exception in updateAdvance:', err);
    return null;
  }
};

export const deleteAdvance = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('advances')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting advance:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in deleteAdvance:', err);
    return false;
  }
};

// ============================================
// COLLECTION FUNCTIONS
// ============================================

export const getCollections = async (userId?: string): Promise<Collection[]> => {
  try {
    let query = supabase
      .from('collections')
      .select('*')
      .order('date', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching collections:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      customerName: row.party_name || '',
      amount: row.amount || 0,
      date: row.date,
      enteredBy: row.user_id,
      enteredByName: row.entered_by_name || '',
      enteredByRole: row.entered_by_role || 'staff',
      approved: row.approved || false,
      approvedBy: row.approved_by,
      approvedByName: row.approved_by_name,
      approvedDate: row.approved_date,
      remarks: row.remarks,
      paymentMode: row.payment_mode || 'Cash',
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Exception in getCollections:', err);
    return [];
  }
};

export const createCollection = async (collection: Omit<Collection, 'id' | 'createdAt'>): Promise<Collection | null> => {
  try {
    const { data, error } = await supabase
      .from('collections')
      .insert([{
        user_id: collection.enteredBy,
        party_name: collection.customerName,
        amount: collection.amount,
        date: collection.date,
        entered_by_name: collection.enteredByName,
        entered_by_role: collection.enteredByRole,
        approved: collection.approved,
        approved_by: collection.approvedBy,
        approved_by_name: collection.approvedByName,
        approved_date: collection.approvedDate,
        remarks: collection.remarks,
        payment_mode: collection.paymentMode,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating collection:', error);
      return null;
    }

    return {
      id: data.id,
      customerName: data.party_name || '',
      amount: data.amount || 0,
      date: data.date,
      enteredBy: data.user_id,
      enteredByName: data.entered_by_name || '',
      enteredByRole: data.entered_by_role || 'staff',
      approved: data.approved || false,
      approvedBy: data.approved_by,
      approvedByName: data.approved_by_name,
      approvedDate: data.approved_date,
      remarks: data.remarks,
      paymentMode: data.payment_mode || 'Cash',
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Exception in createCollection:', err);
    return null;
  }
};

export const updateCollection = async (id: string, updates: Partial<Collection>): Promise<Collection | null> => {
  try {
    const dbUpdates: any = {};
    if (updates.customerName !== undefined) dbUpdates.party_name = updates.customerName;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.approved !== undefined) dbUpdates.approved = updates.approved;
    if (updates.approvedBy !== undefined) dbUpdates.approved_by = updates.approvedBy;
    if (updates.approvedByName !== undefined) dbUpdates.approved_by_name = updates.approvedByName;
    if (updates.approvedDate !== undefined) dbUpdates.approved_date = updates.approvedDate;
    if (updates.remarks !== undefined) dbUpdates.remarks = updates.remarks;
    if (updates.paymentMode !== undefined) dbUpdates.payment_mode = updates.paymentMode;

    const { data, error } = await supabase
      .from('collections')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating collection:', error);
      return null;
    }

    return {
      id: data.id,
      customerName: data.party_name || '',
      amount: data.amount || 0,
      date: data.date,
      enteredBy: data.user_id,
      enteredByName: data.entered_by_name || '',
      enteredByRole: data.entered_by_role || 'staff',
      approved: data.approved || false,
      approvedBy: data.approved_by,
      approvedByName: data.approved_by_name,
      approvedDate: data.approved_date,
      remarks: data.remarks,
      paymentMode: data.payment_mode || 'Cash',
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Exception in updateCollection:', err);
    return null;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getUserBalance = async (userId: string): Promise<number> => {
  try {
    // Get all advances for user
    const advances = await getAdvances(userId);
    const totalAdvances = advances.reduce((sum, a) => sum + a.amount, 0);

    // Get all expenses for user
    const expenses = await getExpenses(userId);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);

    return totalAdvances - totalExpenses;
  } catch (err) {
    console.error('Exception in getUserBalance:', err);
    return 0;
  }
};

// Get unsettled advances for a staff member
export const getUnsettledAdvances = async (userId: string): Promise<Advance[]> => {
  const advances = await getAdvances(userId);
  return advances.filter(a => a.settlementStatus === 'pending' && a.status === 'active');
};

// Get expenses for a specific advance
export const getExpensesByAdvance = async (advanceId: string): Promise<Expense[]> => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('advance_id', advanceId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching expenses by advance:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      advanceId: row.advance_id,
      date: row.date,
      category: row.category,
      categoryDetail: row.category_detail || '',
      subCategory: row.sub_category,
      fare: row.fare || 0,
      parking: row.parking || 0,
      oil: row.oil || 0,
      breakfast: row.breakfast || 0,
      others: row.others || 0,
      total: row.total || 0,
      numberOfCases: row.number_of_cases || 0,
      billUrls: row.bill_urls || [],
      remarks: row.remarks || '',
      submittedToAdmin: row.submitted_to_admin || false,
      settledBy: row.settled_by,
      settlementDate: row.settlement_date,
      settlementStatus: row.settlement_status || 'pending',
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Exception in getExpensesByAdvance:', err);
    return [];
  }
};

// Calculate advance balance
export const calculateAdvanceBalance = async (advanceId: string): Promise<{ 
  totalExpenses: number; 
  balance: number;
  status: 'surplus' | 'deficit' | 'exact';
}> => {
  try {
    const advance = await getAdvanceById(advanceId);
    if (!advance) {
      return { totalExpenses: 0, balance: 0, status: 'exact' };
    }

    const expenses = await getExpensesByAdvance(advanceId);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
    const balance = advance.amount - totalExpenses;

    return {
      totalExpenses,
      balance,
      status: balance > 0 ? 'surplus' : balance < 0 ? 'deficit' : 'exact',
    };
  } catch (err) {
    console.error('Exception in calculateAdvanceBalance:', err);
    return { totalExpenses: 0, balance: 0, status: 'exact' };
  }
};

// Get advance expense status
export const getAdvanceExpenseStatus = async (advanceId: string): Promise<{
  totalAdvance: number;
  totalExpenses: number;
  remaining: number;
  status: 'pending' | 'partial' | 'complete' | 'exceeded';
}> => {
  try {
    const advance = await getAdvanceById(advanceId);
    if (!advance) {
      return {
        totalAdvance: 0,
        totalExpenses: 0,
        remaining: 0,
        status: 'pending',
      };
    }

    const { totalExpenses, balance } = await calculateAdvanceBalance(advanceId);

    let status: 'pending' | 'partial' | 'complete' | 'exceeded' = 'pending';
    if (totalExpenses === 0) {
      status = 'pending';
    } else if (balance < 0) {
      status = 'exceeded';
    } else if (balance === 0) {
      status = 'complete';
    } else {
      status = 'partial';
    }

    return {
      totalAdvance: advance.amount,
      totalExpenses,
      remaining: balance,
      status,
    };
  } catch (err) {
    console.error('Exception in getAdvanceExpenseStatus:', err);
    return {
      totalAdvance: 0,
      totalExpenses: 0,
      remaining: 0,
      status: 'pending',
    };
  }
};

// ============================================
// USER FUNCTIONS (Re-export from auth)
// ============================================

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'staff';
  staffCode?: string;
  username?: string;
}

// Get all staff members
export const getAllStaff = async (): Promise<User[]> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching staff:', error);
      return [];
    }

    return users.map((user) => ({
      id: user.id,
      email: user.username + '@mkmarketing.com',
      fullName: user.full_name,
      role: user.role,
      staffCode: user.staff_code || undefined,
      username: user.username,
    }));
  } catch (err) {
    console.error('Exception in getAllStaff:', err);
    return [];
  }
};

// ============================================
// ADMIN EXPENSE FUNCTIONS
// ============================================

export const getAdminExpenses = async (): Promise<AdminExpense[]> => {
  try {
    const { data, error } = await supabase
      .from('admin_expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching admin expenses:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      date: row.date,
      description: row.description || '',
      category: row.category || '',
      amount: row.amount || 0,
      paymentTo: row.payment_to || '',
      billUrls: row.bill_urls || [],
      remarks: row.remarks || '',
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Exception in getAdminExpenses:', err);
    return [];
  }
};

export const createAdminExpense = async (expense: Omit<AdminExpense, 'id' | 'createdAt'>): Promise<AdminExpense | null> => {
  try {
    const { data, error } = await supabase
      .from('admin_expenses')
      .insert([{
        date: expense.date,
        description: expense.description,
        category: expense.category,
        amount: expense.amount,
        payment_to: expense.paymentTo,
        bill_urls: expense.billUrls,
        remarks: expense.remarks,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating admin expense:', error);
      return null;
    }

    return {
      id: data.id,
      date: data.date,
      description: data.description || '',
      category: data.category || '',
      amount: data.amount || 0,
      paymentTo: data.payment_to || '',
      billUrls: data.bill_urls || [],
      remarks: data.remarks || '',
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Exception in createAdminExpense:', err);
    return null;
  }
};

export const deleteAdminExpense = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('admin_expenses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting admin expense:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception in deleteAdminExpense:', err);
    return false;
  }
};

// ============================================
// RETURN FUNCTIONS
// ============================================

export const getReturns = async (userId?: string): Promise<Return[]> => {
  try {
    let query = supabase
      .from('returns')
      .select('*')
      .order('date', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching returns:', error);
      return [];
    }

    return (data || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      date: row.date,
      amount: row.amount || 0,
      description: row.description || '',
      status: row.status || 'pending',
      approvedBy: row.approved_by,
      adminComments: row.admin_comments,
      createdAt: row.created_at,
    }));
  } catch (err) {
    console.error('Exception in getReturns:', err);
    return [];
  }
};

export const createReturn = async (returnData: Omit<Return, 'id' | 'createdAt'>): Promise<Return | null> => {
  try {
    const { data, error } = await supabase
      .from('returns')
      .insert([{
        user_id: returnData.userId,
        date: returnData.date,
        amount: returnData.amount,
        description: returnData.description,
        status: returnData.status || 'pending',
        approved_by: returnData.approvedBy,
        admin_comments: returnData.adminComments,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating return:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      amount: data.amount || 0,
      description: data.description || '',
      status: data.status || 'pending',
      approvedBy: data.approved_by,
      adminComments: data.admin_comments,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Exception in createReturn:', err);
    return null;
  }
};

export const updateReturn = async (id: string, updates: Partial<Return>): Promise<Return | null> => {
  try {
    const dbUpdates: any = {};
    if (updates.userId !== undefined) dbUpdates.user_id = updates.userId;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.approvedBy !== undefined) dbUpdates.approved_by = updates.approvedBy;
    if (updates.adminComments !== undefined) dbUpdates.admin_comments = updates.adminComments;

    const { data, error } = await supabase
      .from('returns')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating return:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      amount: data.amount || 0,
      description: data.description || '',
      status: data.status || 'pending',
      approvedBy: data.approved_by,
      adminComments: data.admin_comments,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('Exception in updateReturn:', err);
    return null;
  }
};

// ============================================
// COLLECTION HELPER FUNCTIONS
// ============================================

// Get all unique customer names
export const getAllCustomerNames = async (): Promise<string[]> => {
  try {
    const collections = await getCollections();
    const uniqueNames = [...new Set(collections.map(c => c.customerName))];
    return uniqueNames.filter(name => name && name.trim() !== '').sort();
  } catch (err) {
    console.error('Exception in getAllCustomerNames:', err);
    return [];
  }
};

// Get collection summary by customer
export const getCustomerCollectionSummary = async (): Promise<Array<{
  customerName: string;
  totalAmount: number;
  collectionCount: number;
  lastCollectionDate: string;
}>> => {
  try {
    const collections = await getCollections();
    const summaryMap = new Map<string, {
      customerName: string;
      totalAmount: number;
      collectionCount: number;
      lastCollectionDate: string;
    }>();

    collections.forEach(collection => {
      const existing = summaryMap.get(collection.customerName);
      if (existing) {
        existing.totalAmount += collection.amount;
        existing.collectionCount += 1;
        if (collection.date > existing.lastCollectionDate) {
          existing.lastCollectionDate = collection.date;
        }
      } else {
        summaryMap.set(collection.customerName, {
          customerName: collection.customerName,
          totalAmount: collection.amount,
          collectionCount: 1,
          lastCollectionDate: collection.date,
        });
      }
    });

    return Array.from(summaryMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount);
  } catch (err) {
    console.error('Exception in getCustomerCollectionSummary:', err);
    return [];
  }
};
