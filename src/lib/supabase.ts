import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Supabase URL construction
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password: string;
          full_name: string;
          staff_code: string | null;
          role: 'admin' | 'staff';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password: string;
          full_name: string;
          staff_code?: string | null;
          role: 'admin' | 'staff';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password?: string;
          full_name?: string;
          staff_code?: string | null;
          role?: 'admin' | 'staff';
          created_at?: string;
          updated_at?: string;
        };
      };
      advances: {
        Row: {
          id: string;
          user_id: string | null;
          admin_id: string | null;
          staff_id: string;
          date: string;
          amount: number;
          remaining_balance: number;
          status: 'active' | 'settled' | 'cancelled';
          description: string | null;
          total_expenses: number;
          balance_to_settle: number;
          settlement_status: 'pending' | 'settled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          admin_id?: string | null;
          staff_id: string;
          date: string;
          amount: number;
          remaining_balance?: number;
          status?: 'active' | 'settled' | 'cancelled';
          description?: string | null;
          total_expenses?: number;
          balance_to_settle?: number;
          settlement_status?: 'pending' | 'settled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          admin_id?: string | null;
          staff_id?: string;
          date?: string;
          amount?: number;
          remaining_balance?: number;
          status?: 'active' | 'settled' | 'cancelled';
          description?: string | null;
          total_expenses?: number;
          balance_to_settle?: number;
          settlement_status?: 'pending' | 'settled';
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string | null;
          advance_id: string | null;
          date: string;
          category: string;
          category_detail: string | null;
          fare: number;
          parking: number;
          oil: number;
          breakfast: number;
          others: number;
          total: number;
          number_of_cases: number;
          bill_urls: string[] | null;
          remarks: string | null;
          submitted_to_admin: boolean;
          settlement_status: 'pending' | 'settled';
          purchase_tours: any | null;
          printer_entries: any | null;
          designer_entries: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          advance_id?: string | null;
          date: string;
          category: string;
          category_detail?: string | null;
          fare?: number;
          parking?: number;
          oil?: number;
          breakfast?: number;
          others?: number;
          total: number;
          number_of_cases?: number;
          bill_urls?: string[] | null;
          remarks?: string | null;
          submitted_to_admin?: boolean;
          settlement_status?: 'pending' | 'settled';
          purchase_tours?: any | null;
          printer_entries?: any | null;
          designer_entries?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          advance_id?: string | null;
          date?: string;
          category?: string;
          category_detail?: string | null;
          fare?: number;
          parking?: number;
          oil?: number;
          breakfast?: number;
          others?: number;
          total?: number;
          number_of_cases?: number;
          bill_urls?: string[] | null;
          remarks?: string | null;
          submitted_to_admin?: boolean;
          settlement_status?: 'pending' | 'settled';
          purchase_tours?: any | null;
          printer_entries?: any | null;
          designer_entries?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      returns: {
        Row: {
          id: string;
          user_id: string | null;
          advance_id: string | null;
          date: string;
          amount: number;
          remarks: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          advance_id?: string | null;
          date: string;
          amount: number;
          remarks?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          advance_id?: string | null;
          date?: string;
          amount?: number;
          remarks?: string | null;
          created_at?: string;
        };
      };
      collections: {
        Row: {
          id: string;
          user_id: string | null;
          date: string;
          party_name: string;
          amount: number;
          payment_mode: string;
          remarks: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          date: string;
          party_name: string;
          amount: number;
          payment_mode: string;
          remarks?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          date?: string;
          party_name?: string;
          amount?: number;
          payment_mode?: string;
          remarks?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

// Helper function to check connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('count').single();
    if (error) {
      console.error('Supabase connection error:', error);
      return { connected: false, error: error.message };
    }
    return { connected: true, message: 'Successfully connected to Supabase!' };
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return { connected: false, error: String(err) };
  }
}
