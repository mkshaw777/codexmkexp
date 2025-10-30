// Mock data management using localStorage

export interface Expense {
  id: string;
  userId: string;
  advanceId?: string; // Link to which advance this expense is against
  date: string;
  category: 'Transport' | 'Bazar' | 'Sealdah' | 'Out Station' | 'Paglahat' | 'Others';
  categoryDetail: string;
  // Dynamic fields based on category
  subCategory?: string; // For Transport: Travel, Parking, Oil
  fare: number;
  parking: number;
  oil: number;
  breakfast: number;
  others: number;
  total: number;
  numberOfCases: number;
  billUrls: string[];
  remarks: string;
  submittedToAdmin: boolean; // Whether expense has been submitted for review
  settledBy?: string; // Admin who settled this expense
  settlementDate?: string;
  settlementStatus: 'pending' | 'settled'; // Status of settlement
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
  totalExpenses: number; // Total expenses submitted against this advance
  balanceToSettle: number; // Plus or minus amount to be settled
  settlementStatus: 'pending' | 'settled'; // Whether the final settlement is done
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
  paymentTo: string; // Shop name, driver name, etc.
  billUrls: string[];
  remarks: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  enteredBy: string; // User ID who entered this
  enteredByName: string; // User name for display
  enteredByRole: 'admin' | 'staff'; // Role of person who entered
  approved: boolean; // Whether admin has received and approved
  approvedBy?: string; // Admin ID who approved
  approvedByName?: string; // Admin name who approved
  approvedDate?: string; // When approved
  remarks?: string; // Optional notes
  createdAt: string;
}

const STORAGE_KEYS = {
  EXPENSES: 'mk_marketing_expenses',
  ADVANCES: 'mk_marketing_advances',
  RETURNS: 'mk_marketing_returns',
  ADMIN_EXPENSES: 'mk_marketing_admin_expenses',
  COLLECTIONS: 'mk_marketing_collections',
};

// Initialize with some sample data
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADVANCES)) {
    localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RETURNS)) {
    localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADMIN_EXPENSES)) {
    localStorage.setItem(STORAGE_KEYS.ADMIN_EXPENSES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COLLECTIONS)) {
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify([]));
  }
};

// Expense functions
export const getExpenses = (userId?: string): Expense[] => {
  initializeData();
  const expensesStr = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  if (!expensesStr) return [];
  
  const expenses = JSON.parse(expensesStr);
  return userId ? expenses.filter((e: Expense) => e.userId === userId) : expenses;
};

export const getExpenseById = (id: string): Expense | null => {
  const expenses = getExpenses();
  return expenses.find((e) => e.id === id) || null;
};

export const createExpense = (expense: Omit<Expense, 'id' | 'createdAt'>): Expense => {
  const expenses = getExpenses();
  const newExpense: Expense = {
    ...expense,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  expenses.push(newExpense);
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  return newExpense;
};

export const updateExpense = (id: string, updates: Partial<Expense>): Expense | null => {
  const expenses = getExpenses();
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) return null;

  expenses[index] = { ...expenses[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  return expenses[index];
};

export const deleteExpense = (id: string): boolean => {
  const expenses = getExpenses();
  const filtered = expenses.filter((e) => e.id !== id);
  if (filtered.length === expenses.length) return false;

  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
  return true;
};

export const settleExpense = (id: string, adminId: string): Expense | null => {
  const expenses = getExpenses();
  const index = expenses.findIndex((e) => e.id === id);
  if (index === -1) return null;

  expenses[index] = {
    ...expenses[index],
    settlementStatus: 'settled',
    settledBy: adminId,
    settlementDate: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  return expenses[index];
};

// Advance functions
export const getAdvances = (userId?: string): Advance[] => {
  initializeData();
  const advancesStr = localStorage.getItem(STORAGE_KEYS.ADVANCES);
  if (!advancesStr) return [];
  
  const advances = JSON.parse(advancesStr);
  return userId ? advances.filter((a: Advance) => a.staffId === userId) : advances;
};

export const getAdvanceById = (id: string): Advance | null => {
  const advances = getAdvances();
  return advances.find((a) => a.id === id) || null;
};

export const createAdvance = (advance: Omit<Advance, 'id' | 'createdAt'>): Advance => {
  const advances = getAdvances();
  const newAdvance: Advance = {
    ...advance,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  advances.push(newAdvance);
  localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(advances));
  return newAdvance;
};

export const updateAdvance = (id: string, updates: Partial<Advance>): Advance | null => {
  const advances = getAdvances();
  const index = advances.findIndex((a) => a.id === id);
  if (index === -1) return null;

  advances[index] = { ...advances[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(advances));
  return advances[index];
};

export const deleteAdvance = (id: string): boolean => {
  const advances = getAdvances();
  const filtered = advances.filter((a) => a.id !== id);
  if (filtered.length === advances.length) return false;

  localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(filtered));
  return true;
};

// Return functions
export const getReturns = (userId?: string): Return[] => {
  initializeData();
  const returnsStr = localStorage.getItem(STORAGE_KEYS.RETURNS);
  if (!returnsStr) return [];
  
  const returns = JSON.parse(returnsStr);
  return userId ? returns.filter((r: Return) => r.userId === userId) : returns;
};

export const getReturnById = (id: string): Return | null => {
  const returns = getReturns();
  return returns.find((r) => r.id === id) || null;
};

export const createReturn = (returnData: Omit<Return, 'id' | 'createdAt'>): Return => {
  const returns = getReturns();
  const newReturn: Return = {
    ...returnData,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  returns.push(newReturn);
  localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns));
  return newReturn;
};

export const updateReturn = (id: string, updates: Partial<Return>): Return | null => {
  const returns = getReturns();
  const index = returns.findIndex((r) => r.id === id);
  if (index === -1) return null;

  returns[index] = { ...returns[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(returns));
  return returns[index];
};

export const deleteReturn = (id: string): boolean => {
  const returns = getReturns();
  const filtered = returns.filter((r) => r.id !== id);
  if (filtered.length === returns.length) return false;

  localStorage.setItem(STORAGE_KEYS.RETURNS, JSON.stringify(filtered));
  return true;
};

// Helper function to get all staff users
export const getAllStaff = (): any[] => {
  const usersStr = localStorage.getItem('mk_marketing_users');
  if (!usersStr) {
    console.warn('⚠️ getAllStaff: No users found in localStorage');
    return [];
  }
  try {
    const users = JSON.parse(usersStr);
    const staffUsers = users.filter((u: any) => u.role === 'staff');
    console.log(`✅ getAllStaff: Found ${staffUsers.length} staff members out of ${users.length} total users`);
    if (staffUsers.length === 0) {
      console.warn('⚠️ getAllStaff: No staff users found! Available roles:', users.map((u: any) => u.role));
    }
    return staffUsers;
  } catch (error) {
    console.error('❌ getAllStaff: Error parsing users:', error);
    return [];
  }
};

// Helper function to get user balance
export const getUserBalance = (userId: string): number => {
  const advances = getAdvances(userId);
  const returns = getReturns(userId);
  const expenses = getExpenses(userId);

  const totalAdvances = advances
    .filter((a) => a.status === 'active')
    .reduce((sum, a) => sum + a.amount, 0);
  
  const totalReturns = returns
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);

  return totalAdvances - totalExpenses - totalReturns;
};

// Admin Expense functions
export const getAdminExpenses = (): AdminExpense[] => {
  initializeData();
  const expensesStr = localStorage.getItem(STORAGE_KEYS.ADMIN_EXPENSES);
  if (!expensesStr) return [];
  return JSON.parse(expensesStr);
};

export const createAdminExpense = (expense: Omit<AdminExpense, 'id' | 'createdAt'>): AdminExpense => {
  const expenses = getAdminExpenses();
  const newExpense: AdminExpense = {
    ...expense,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  expenses.push(newExpense);
  localStorage.setItem(STORAGE_KEYS.ADMIN_EXPENSES, JSON.stringify(expenses));
  return newExpense;
};

export const deleteAdminExpense = (id: string): boolean => {
  const expenses = getAdminExpenses();
  const filtered = expenses.filter((e) => e.id !== id);
  if (filtered.length === expenses.length) return false;
  localStorage.setItem(STORAGE_KEYS.ADMIN_EXPENSES, JSON.stringify(filtered));
  return true;
};

// Helper function to get expenses for a specific advance
export const getExpensesByAdvance = (advanceId: string): Expense[] => {
  const expenses = getExpenses();
  return expenses.filter((e) => e.advanceId === advanceId);
};

// Helper function to check if expense exists for an advance
export const hasExpenseForAdvance = (advanceId: string): boolean => {
  const expenses = getExpensesByAdvance(advanceId);
  return expenses.length > 0;
};

// Helper function to get expense status for an advance
export const getAdvanceExpenseStatus = (advanceId: string): {
  hasExpense: boolean;
  expense: Expense | null;
  isPending: boolean;
  isSettled: boolean;
} => {
  const expenses = getExpensesByAdvance(advanceId);
  const expense = expenses.length > 0 ? expenses[0] : null;
  
  return {
    hasExpense: expenses.length > 0,
    expense,
    isPending: expense ? expense.settlementStatus === 'pending' : false,
    isSettled: expense ? expense.settlementStatus === 'settled' : false,
  };
};

// Helper function to calculate advance balance
export const calculateAdvanceBalance = (advanceId: string): { spent: number; balance: number; status: 'surplus' | 'deficit' | 'settled' } => {
  const advance = getAdvanceById(advanceId);
  if (!advance) return { spent: 0, balance: 0, status: 'settled' };
  
  const expenses = getExpensesByAdvance(advanceId);
  const spent = expenses.reduce((sum, e) => sum + e.total, 0);
  const balance = advance.amount - spent;
  
  return {
    spent,
    balance,
    status: balance > 0 ? 'surplus' : balance < 0 ? 'deficit' : 'settled'
  };
};

// Initialize demo data for testing
export const initializeDemoData = () => {
  const demoDataKey = 'mk_marketing_demo_initialized';
  
  // Check if demo data already exists
  if (localStorage.getItem(demoDataKey) === 'true') {
    return;
  }

  // Create demo advances
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  const fourDaysAgo = new Date(now);
  fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

  const demoAdvances: Advance[] = [
    {
      id: 'adv_1',
      userId: '1',
      adminId: '1',
      staffId: 'staff_1',
      date: fourDaysAgo.toISOString().split('T')[0],
      amount: 5000,
      remainingBalance: 5000,
      status: 'active',
      description: 'Bazar visit advance for Rajesh',
      totalExpenses: 0,
      balanceToSettle: 0,
      settlementStatus: 'pending',
      createdAt: fourDaysAgo.toISOString(),
    },
    {
      id: 'adv_2',
      userId: '1',
      adminId: '1',
      staffId: 'staff_2',
      date: threeDaysAgo.toISOString().split('T')[0],
      amount: 3500,
      remainingBalance: 3500,
      status: 'active',
      description: 'Transport advance for Priya',
      totalExpenses: 0,
      balanceToSettle: 0,
      settlementStatus: 'pending',
      createdAt: threeDaysAgo.toISOString(),
    },
    {
      id: 'adv_3',
      userId: '1',
      adminId: '1',
      staffId: 'staff_3',
      date: threeDaysAgo.toISOString().split('T')[0],
      amount: 7000,
      remainingBalance: 7000,
      status: 'active',
      description: 'Sealdah printing work advance',
      totalExpenses: 0,
      balanceToSettle: 0,
      settlementStatus: 'pending',
      createdAt: threeDaysAgo.toISOString(),
    },
    {
      id: 'adv_4',
      userId: '1',
      adminId: '1',
      staffId: 'staff_4',
      date: twoDaysAgo.toISOString().split('T')[0],
      amount: 4000,
      remainingBalance: 4000,
      status: 'active',
      description: 'Out station travel advance',
      totalExpenses: 0,
      balanceToSettle: 0,
      settlementStatus: 'pending',
      createdAt: twoDaysAgo.toISOString(),
    },
    {
      id: 'adv_5',
      userId: '1',
      adminId: '1',
      staffId: 'staff_5',
      date: yesterday.toISOString().split('T')[0],
      amount: 6000,
      remainingBalance: 6000,
      status: 'active',
      description: 'Mixed work advance for Vikram',
      totalExpenses: 0,
      balanceToSettle: 0,
      settlementStatus: 'pending',
      createdAt: yesterday.toISOString(),
    },
  ];

  // Create demo expenses
  const demoExpenses: Expense[] = [
    // Rajesh Kumar - Staff 1 (Bazar category)
    {
      id: 'exp_1',
      userId: 'staff_1',
      advanceId: 'adv_1',
      date: fourDaysAgo.toISOString().split('T')[0],
      category: 'Bazar',
      categoryDetail: 'Market purchase trip',
      fare: 250,
      parking: 50,
      oil: 0,
      breakfast: 100,
      others: 0,
      total: 2850,
      numberOfCases: 12,
      billUrls: [],
      remarks: JSON.stringify({
        original: 'Purchased supplies from multiple vendors',
        purchaseTours: [
          { supplier: 'ABC Traders', amount: 800 },
          { supplier: 'XYZ Store', amount: 650 },
          { supplier: 'Modern Supplies', amount: 1000 },
        ]
      }),
      submittedToAdmin: true,
      settlementStatus: 'pending',
      createdAt: fourDaysAgo.toISOString(),
    },
    {
      id: 'exp_2',
      userId: 'staff_1',
      advanceId: 'adv_1',
      date: threeDaysAgo.toISOString().split('T')[0],
      category: 'Bazar',
      categoryDetail: 'Second market visit',
      fare: 200,
      parking: 30,
      oil: 0,
      breakfast: 80,
      others: 50,
      total: 1660,
      numberOfCases: 8,
      billUrls: [],
      remarks: JSON.stringify({
        original: 'Additional supplies needed',
        purchaseTours: [
          { supplier: 'Quick Mart', amount: 500 },
          { supplier: 'City Supplies', amount: 800 },
        ]
      }),
      submittedToAdmin: true,
      settlementStatus: 'pending',
      createdAt: threeDaysAgo.toISOString(),
    },
    // Priya Sharma - Staff 2 (Transport category)
    {
      id: 'exp_3',
      userId: 'staff_2',
      advanceId: 'adv_2',
      date: threeDaysAgo.toISOString().split('T')[0],
      category: 'Transport',
      categoryDetail: 'Daily transport - Kolkata route',
      subCategory: 'Travel',
      fare: 450,
      parking: 80,
      oil: 1200,
      breakfast: 120,
      others: 0,
      total: 1850,
      numberOfCases: 15,
      billUrls: [],
      remarks: 'Covered 3 locations for delivery',
      submittedToAdmin: true,
      settlementStatus: 'settled',
      settledBy: '1',
      settlementDate: twoDaysAgo.toISOString(),
      createdAt: threeDaysAgo.toISOString(),
    },
    {
      id: 'exp_4',
      userId: 'staff_2',
      advanceId: 'adv_2',
      date: twoDaysAgo.toISOString().split('T')[0],
      category: 'Transport',
      categoryDetail: 'Transport - North Kolkata',
      subCategory: 'Travel',
      fare: 350,
      parking: 50,
      oil: 800,
      breakfast: 100,
      others: 30,
      total: 1330,
      numberOfCases: 10,
      billUrls: [],
      remarks: 'Multiple pickups and drops',
      submittedToAdmin: true,
      settlementStatus: 'pending',
      createdAt: twoDaysAgo.toISOString(),
    },
    // Amit Verma - Staff 3 (Sealdah category)
    {
      id: 'exp_5',
      userId: 'staff_3',
      advanceId: 'adv_3',
      date: twoDaysAgo.toISOString().split('T')[0],
      category: 'Sealdah',
      categoryDetail: 'Printing and design work',
      fare: 300,
      parking: 40,
      oil: 0,
      breakfast: 150,
      others: 0,
      total: 4990,
      numberOfCases: 5,
      billUrls: [],
      remarks: JSON.stringify({
        original: 'Brochure and banner printing completed',
        printerEntries: [
          { name: 'Classic Printers', amount: 2500 },
          { name: 'Digital Print Shop', amount: 1200 },
        ],
        designerEntries: [
          { name: 'Creative Designs', amount: 800 },
        ]
      }),
      submittedToAdmin: true,
      settlementStatus: 'pending',
      createdAt: twoDaysAgo.toISOString(),
    },
    // Sneha Patel - Staff 4 (Out Station)
    {
      id: 'exp_6',
      userId: 'staff_4',
      advanceId: 'adv_4',
      date: yesterday.toISOString().split('T')[0],
      category: 'Out Station',
      categoryDetail: 'Durgapur visit',
      fare: 800,
      parking: 100,
      oil: 1500,
      breakfast: 250,
      others: 350,
      total: 3000,
      numberOfCases: 20,
      billUrls: [],
      remarks: 'Client meeting and delivery - stayed overnight',
      submittedToAdmin: true,
      settlementStatus: 'settled',
      settledBy: '1',
      settlementDate: now.toISOString(),
      createdAt: yesterday.toISOString(),
    },
    // Vikram Singh - Staff 5 (Multiple expenses - some pending, some settled)
    {
      id: 'exp_7',
      userId: 'staff_5',
      advanceId: 'adv_5',
      date: yesterday.toISOString().split('T')[0],
      category: 'Transport',
      categoryDetail: 'Local transport',
      subCategory: 'Travel',
      fare: 400,
      parking: 60,
      oil: 900,
      breakfast: 120,
      others: 0,
      total: 1480,
      numberOfCases: 12,
      billUrls: [],
      remarks: 'Routine delivery rounds',
      submittedToAdmin: true,
      settlementStatus: 'settled',
      settledBy: '1',
      settlementDate: now.toISOString(),
      createdAt: yesterday.toISOString(),
    },
    {
      id: 'exp_8',
      userId: 'staff_5',
      advanceId: 'adv_5',
      date: now.toISOString().split('T')[0],
      category: 'Bazar',
      categoryDetail: 'Emergency supplies',
      fare: 150,
      parking: 30,
      oil: 0,
      breakfast: 100,
      others: 20,
      total: 1800,
      numberOfCases: 6,
      billUrls: [],
      remarks: JSON.stringify({
        original: 'Urgent purchase required',
        purchaseTours: [
          { supplier: 'Quick Shop', amount: 700 },
          { supplier: 'Express Mart', amount: 800 },
        ]
      }),
      submittedToAdmin: true,
      settlementStatus: 'pending',
      createdAt: now.toISOString(),
    },
  ];

  // Save demo data
  localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(demoAdvances));
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(demoExpenses));
  localStorage.setItem(demoDataKey, 'true');
};

// ============================================
// COLLECTION FUNCTIONS
// ============================================

export const getCollections = (): Collection[] => {
  initializeData();
  const collectionsStr = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
  if (!collectionsStr) return [];
  return JSON.parse(collectionsStr);
};

export const getCollectionById = (id: string): Collection | null => {
  const collections = getCollections();
  return collections.find((c) => c.id === id) || null;
};

export const createCollection = (collection: Omit<Collection, 'id' | 'createdAt'>): Collection => {
  const collections = getCollections();
  const newCollection: Collection = {
    ...collection,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  collections.push(newCollection);
  localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  return newCollection;
};

export const approveCollection = (id: string, adminId: string, adminName: string): Collection | null => {
  const collections = getCollections();
  const index = collections.findIndex((c) => c.id === id);
  if (index === -1) return null;

  collections[index] = {
    ...collections[index],
    approved: true,
    approvedBy: adminId,
    approvedByName: adminName,
    approvedDate: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  return collections[index];
};

export const updateCollection = (id: string, updates: Partial<Collection>): Collection | null => {
  const collections = getCollections();
  const index = collections.findIndex((c) => c.id === id);
  if (index === -1) return null;

  collections[index] = { ...collections[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  return collections[index];
};

export const deleteCollection = (id: string): boolean => {
  const collections = getCollections();
  const filtered = collections.filter((c) => c.id !== id);
  if (filtered.length === collections.length) return false;
  
  localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(filtered));
  return true;
};

// Helper: Get collections by customer name
export const getCollectionsByCustomer = (customerName: string): Collection[] => {
  const collections = getCollections();
  return collections.filter((c) => 
    c.customerName.toLowerCase().includes(customerName.toLowerCase())
  );
};

// Helper: Get pending collections (staff entries needing approval)
export const getPendingCollections = (): Collection[] => {
  const collections = getCollections();
  return collections.filter((c) => !c.approved && c.enteredByRole === 'staff');
};

// Helper: Get all customer names (unique)
export const getAllCustomerNames = (): string[] => {
  const collections = getCollections();
  const names = collections.map((c) => c.customerName);
  return [...new Set(names)].sort();
};

// Helper: Get total collection amount by customer
export const getCustomerCollectionSummary = (customerName: string): {
  totalAmount: number;
  approvedAmount: number;
  pendingAmount: number;
  collections: Collection[];
} => {
  const collections = getCollectionsByCustomer(customerName);
  
  return {
    totalAmount: collections.reduce((sum, c) => sum + c.amount, 0),
    approvedAmount: collections.filter(c => c.approved).reduce((sum, c) => sum + c.amount, 0),
    pendingAmount: collections.filter(c => !c.approved).reduce((sum, c) => sum + c.amount, 0),
    collections
  };
};
