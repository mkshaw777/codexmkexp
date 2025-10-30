// Supabase authentication system
import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  fullName: string;
}

export interface UserProfile extends User {
  role: 'admin' | 'staff';
  staffCode?: string;
  phoneNumber?: string;
  username?: string;
}

const STORAGE_KEYS = {
  CURRENT_USER: 'mk_marketing_current_user',
};

// Sign in with username/password using Supabase
export const signInWithUsername = async (
  username: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> => {
  try {
    // Query users table
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password);

    if (error) {
      console.error('Supabase login error:', error);
      return { user: null, error: 'Login failed: ' + error.message };
    }

    if (!users || users.length === 0) {
      return { user: null, error: 'Invalid username or password' };
    }

    const user = users[0];
    const userProfile: UserProfile = {
      id: user.id,
      email: user.username + '@mkmarketing.com', // Construct email from username
      fullName: user.full_name,
      role: user.role,
      staffCode: user.staff_code || undefined,
      username: user.username,
    };

    // Store in localStorage for session persistence
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userProfile));
    
    console.log('✅ Login successful:', userProfile.fullName, '(' + userProfile.role + ')');
    return { user: userProfile, error: null };
  } catch (err) {
    console.error('Login exception:', err);
    return { user: null, error: 'Login failed: ' + String(err) };
  }
};

// Backward compatibility - use username login
export const signInWithEmail = async (
  emailOrUsername: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> => {
  // Extract username from email if @ is present
  const username = emailOrUsername.includes('@') 
    ? emailOrUsername.split('@')[0] 
    : emailOrUsername;
  
  return signInWithUsername(username, password);
};

// Create staff account (admin only)
export const createStaff = async (
  username: string,
  password: string,
  fullName: string,
  staffCode: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          password,
          full_name: fullName,
          staff_code: staffCode,
          role: 'staff',
        },
      ])
      .select();

    if (error) {
      console.error('Create staff error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Staff created:', fullName, staffCode);
    return { success: true, error: null };
  } catch (err) {
    console.error('Create staff exception:', err);
    return { success: false, error: String(err) };
  }
};

// Alias for backward compatibility
export const createStaffAccount = createStaff;

// Get all users (for admin)
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get users error:', error);
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
    console.error('Get users exception:', err);
    return [];
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  console.log('✅ Logged out successfully');
};

// Get current user from localStorage (session)
export const getCurrentUser = (): UserProfile | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userStr) return null;
  return JSON.parse(userStr);
};

export const getUserProfile = (): UserProfile | null => {
  return getCurrentUser();
};

// Update password
export const updatePassword = async (
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId);

    if (error) {
      console.error('Update password error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Password updated successfully');
    return { success: true, error: null };
  } catch (err) {
    console.error('Update password exception:', err);
    return { success: false, error: String(err) };
  }
};

// Delete user (admin only)
export const deleteUser = async (
  userId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', userId);

    if (error) {
      console.error('Delete user error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ User deleted successfully');
    return { success: true, error: null };
  } catch (err) {
    console.error('Delete user exception:', err);
    return { success: false, error: String(err) };
  }
};

// Initialize default admin (run once on first setup)
export const initializeDefaultAdmin = async (): Promise<void> => {
  try {
    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .single();

    if (existingAdmin) {
      console.log('ℹ️ Admin user already exists');
      return;
    }

    // Create default admin
    const { error } = await supabase.from('users').insert([
      {
        username: 'admin',
        password: 'admin123',
        full_name: 'Administrator',
        staff_code: 'ADMIN',
        role: 'admin',
      },
    ]);

    if (error) {
      console.error('Failed to create default admin:', error);
    } else {
      console.log('✅ Default admin created: admin/admin123');
    }
  } catch (err) {
    console.error('Initialize admin exception:', err);
  }
};
