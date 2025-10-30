// Mock authentication system using localStorage
export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface UserProfile extends User {
  role: 'admin' | 'staff';
  staffCode?: string;
  phoneNumber?: string;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'mk_marketing_current_user',
  USERS: 'mk_marketing_users',
};

// Initialize with default admin account and demo staff
const initializeUsers = () => {
  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!existingUsers) {
    console.log('🔧 Initializing default users (1 admin + 5 staff)...');
    const defaultUsers = [
      {
        id: '1',
        email: 'admin@mkmarketing.com',
        password: 'admin123',
        fullName: 'Admin User',
        role: 'admin',
        staffCode: 'ADM001',
        phoneNumber: '+91 9876543210',
      },
      {
        id: 'staff_1',
        email: 'rajesh@mkmarketing.com',
        password: 'staff123',
        fullName: 'Rajesh Kumar',
        role: 'staff',
        staffCode: 'STF001',
        phoneNumber: '+91 9876543211',
      },
      {
        id: 'staff_2',
        email: 'priya@mkmarketing.com',
        password: 'staff123',
        fullName: 'Priya Sharma',
        role: 'staff',
        staffCode: 'STF002',
        phoneNumber: '+91 9876543212',
      },
      {
        id: 'staff_3',
        email: 'amit@mkmarketing.com',
        password: 'staff123',
        fullName: 'Amit Verma',
        role: 'staff',
        staffCode: 'STF003',
        phoneNumber: '+91 9876543213',
      },
      {
        id: 'staff_4',
        email: 'sneha@mkmarketing.com',
        password: 'staff123',
        fullName: 'Sneha Patel',
        role: 'staff',
        staffCode: 'STF004',
        phoneNumber: '+91 9876543214',
      },
      {
        id: 'staff_5',
        email: 'vikram@mkmarketing.com',
        password: 'staff123',
        fullName: 'Vikram Singh',
        role: 'staff',
        staffCode: 'STF005',
        phoneNumber: '+91 9876543215',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    console.log('✅ Default users created successfully:', defaultUsers.length, 'users');
  } else {
    const users = JSON.parse(existingUsers);
    console.log('ℹ️ Users already exist in localStorage:', users.length, 'users');
  }
};

// Export function to manually initialize users (for app startup)
export const initializeDefaultUsers = () => {
  console.log('🔄 initializeDefaultUsers called');
  initializeUsers();
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> => {
  initializeUsers();
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!usersStr) {
    return { user: null, error: 'No users found' };
  }

  const users = JSON.parse(usersStr);
  const user = users.find(
    (u: any) => u.email === email && u.password === password
  );

  if (!user) {
    return { user: null, error: 'Invalid email or password' };
  }

  const userProfile: UserProfile = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    staffCode: user.staffCode,
    phoneNumber: user.phoneNumber,
  };

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userProfile));
  return { user: userProfile, error: null };
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  fullName: string
): Promise<{ user: UserProfile | null; error: string | null }> => {
  initializeUsers();
  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!usersStr) {
    return { user: null, error: 'Failed to initialize users' };
  }

  const users = JSON.parse(usersStr);
  const existingUser = users.find((u: any) => u.email === email);

  if (existingUser) {
    return { user: null, error: 'Email already exists' };
  }

  const newUser = {
    id: Date.now().toString(),
    email,
    password,
    fullName,
    role: 'staff' as const,
    staffCode: `STF${String(users.length).padStart(3, '0')}`,
    phoneNumber: '',
  };

  users.push(newUser);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  const userProfile: UserProfile = {
    id: newUser.id,
    email: newUser.email,
    fullName: newUser.fullName,
    role: newUser.role,
    staffCode: newUser.staffCode,
    phoneNumber: newUser.phoneNumber,
  };

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userProfile));
  return { user: userProfile, error: null };
};

export const signOut = async (): Promise<void> => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = (): UserProfile | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userStr) return null;
  return JSON.parse(userStr);
};

export const getUserProfile = (): UserProfile | null => {
  return getCurrentUser();
};

export const updatePassword = async (
  newPassword: string
): Promise<{ success: boolean; error: string | null }> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'Not authenticated' };
  }

  const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!usersStr) {
    return { success: false, error: 'Failed to load users' };
  }

  const users = JSON.parse(usersStr);
  const userIndex = users.findIndex((u: any) => u.id === currentUser.id);

  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }

  users[userIndex].password = newPassword;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  return { success: true, error: null };
};
