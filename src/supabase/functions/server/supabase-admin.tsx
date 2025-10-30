// ⚠️ SERVER-SIDE ONLY - Service Role Key
// This file should NEVER be imported by frontend code

import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://mrsdwxswmlhpitdbopsi.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yc2R3eHN3bWxocGl0ZGJvcHNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM5MjI2MSwiZXhwIjoyMDc2OTY4MjYxfQ.HKT8u7BW1UbKEMcF6SdbkH04nv9h65WXO5QBtEsurhg';

// Admin Supabase client with service role privileges
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper: Verify admin authentication from request
export async function verifyAdmin(authHeader: string | null): Promise<{ isAdmin: boolean; userId?: string; error?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAdmin: false, error: 'No authorization header' };
  }

  const token = authHeader.split(' ')[1];
  
  // For simplicity, we'll check if the token matches a user in the database
  // In production, you'd validate JWT token properly
  const { data: users, error } = await supabaseAdmin
    .from('users')
    .select('id, role')
    .eq('username', token) // Simple check - improve with proper JWT validation
    .single();

  if (error || !users) {
    return { isAdmin: false, error: 'Invalid token' };
  }

  if (users.role !== 'admin') {
    return { isAdmin: false, error: 'Not an admin' };
  }

  return { isAdmin: true, userId: users.id };
}

// Helper: Get user from simple auth token (username-based)
export async function getUserFromToken(token: string): Promise<{ userId?: string; username?: string; role?: string; error?: string }> {
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, username, role')
    .eq('username', token)
    .single();

  if (error || !user) {
    return { error: 'Invalid token' };
  }

  return {
    userId: user.id,
    username: user.username,
    role: user.role,
  };
}
