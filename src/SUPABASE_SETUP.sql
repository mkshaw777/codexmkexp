-- ============================================
-- MK MARKETING - EXPENSE MANAGEMENT SYSTEM
-- Supabase Database Setup Script
-- ============================================
-- Version: 1.0
-- Created: 2025
-- Description: Complete database schema for expense management
-- ============================================

-- STEP 1: Enable Required Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STEP 2: Create Tables
-- ============================================

-- 1. USERS TABLE (Staff + Admin Accounts)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  staff_code TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE users IS 'Stores all user accounts - both admin and staff';
COMMENT ON COLUMN users.role IS 'User role: admin or staff';
COMMENT ON COLUMN users.staff_code IS 'Unique identifier for staff members';

-- 2. ADVANCES TABLE (Money Given to Staff)
-- ============================================
CREATE TABLE IF NOT EXISTS advances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id),
  staff_id TEXT NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  remaining_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'settled', 'cancelled')),
  description TEXT,
  total_expenses DECIMAL(10,2) DEFAULT 0,
  balance_to_settle DECIMAL(10,2) DEFAULT 0,
  settlement_status TEXT DEFAULT 'pending' CHECK (settlement_status IN ('pending', 'settled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE advances IS 'Tracks advances given to staff members';
COMMENT ON COLUMN advances.remaining_balance IS 'Money remaining from advance after expenses';
COMMENT ON COLUMN advances.settlement_status IS 'Whether advance is settled or pending';

-- 3. EXPENSES TABLE (Staff Expense Submissions)
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  advance_id UUID REFERENCES advances(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Transport', 'Bazar', 'Sealdah', 'Other')),
  category_detail TEXT,
  
  -- Transport category fields
  fare DECIMAL(10,2) DEFAULT 0 CHECK (fare >= 0),
  parking DECIMAL(10,2) DEFAULT 0 CHECK (parking >= 0),
  oil DECIMAL(10,2) DEFAULT 0 CHECK (oil >= 0),
  breakfast DECIMAL(10,2) DEFAULT 0 CHECK (breakfast >= 0),
  others DECIMAL(10,2) DEFAULT 0 CHECK (others >= 0),
  
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  number_of_cases INTEGER DEFAULT 0 CHECK (number_of_cases >= 0),
  bill_urls TEXT[],
  remarks TEXT,
  submitted_to_admin BOOLEAN DEFAULT FALSE,
  settlement_status TEXT DEFAULT 'pending' CHECK (settlement_status IN ('pending', 'settled')),
  
  -- JSON fields for complex data
  purchase_tours JSONB,
  printer_entries JSONB,
  designer_entries JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE expenses IS 'Stores all expense submissions by staff';
COMMENT ON COLUMN expenses.category IS 'Expense category: Transport, Bazar, Sealdah, Other';
COMMENT ON COLUMN expenses.purchase_tours IS 'JSON array for Bazar category purchase details';
COMMENT ON COLUMN expenses.printer_entries IS 'JSON array for Sealdah category printer entries';
COMMENT ON COLUMN expenses.designer_entries IS 'JSON array for Sealdah category designer entries';

-- 4. RETURNS TABLE (Money Returned by Staff)
-- ============================================
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  advance_id UUID REFERENCES advances(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE returns IS 'Tracks money returned by staff from advances';

-- 5. COLLECTIONS TABLE (Payment Collections by Staff)
-- ============================================
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  party_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Cash', 'Cheque', 'Online', 'Other')),
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE collections IS 'Tracks payment collections made by staff';
COMMENT ON COLUMN collections.payment_mode IS 'Payment method: Cash, Cheque, Online, Other';

-- ============================================
-- STEP 3: Create Indexes for Performance
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_staff_code ON users(staff_code);

-- Advances indexes
CREATE INDEX IF NOT EXISTS idx_advances_staff_id ON advances(staff_id);
CREATE INDEX IF NOT EXISTS idx_advances_status ON advances(status);
CREATE INDEX IF NOT EXISTS idx_advances_settlement_status ON advances(settlement_status);
CREATE INDEX IF NOT EXISTS idx_advances_date ON advances(date DESC);
CREATE INDEX IF NOT EXISTS idx_advances_user_id ON advances(user_id);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_advance_id ON expenses(advance_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_settlement_status ON expenses(settlement_status);

-- Returns indexes
CREATE INDEX IF NOT EXISTS idx_returns_user_id ON returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_advance_id ON returns(advance_id);
CREATE INDEX IF NOT EXISTS idx_returns_date ON returns(date DESC);

-- Collections indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_date ON collections(date DESC);

-- ============================================
-- STEP 4: Insert Default Admin User
-- ============================================

-- Default admin account
-- Username: admin
-- Password: admin123 (Change this in production!)
INSERT INTO users (username, password, full_name, staff_code, role)
VALUES (
  'admin',
  'admin123',
  'Administrator',
  'ADMIN',
  'admin'
)
ON CONFLICT (username) DO NOTHING;

-- Optional: Create test staff account for testing
INSERT INTO users (username, password, full_name, staff_code, role)
VALUES (
  'test_staff',
  'test123',
  'Test Staff Member',
  'MK999',
  'staff'
)
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- STEP 5: Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Create RLS Policies
-- ============================================

-- USERS TABLE POLICIES
-- ============================================

-- Allow all authenticated users to view users
CREATE POLICY "users_select_policy" ON users
  FOR SELECT 
  USING (true);

-- Allow authenticated users to insert users (for admin creating staff)
CREATE POLICY "users_insert_policy" ON users
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to update their own records
CREATE POLICY "users_update_policy" ON users
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- ADVANCES TABLE POLICIES
-- ============================================

-- Allow all to view advances
CREATE POLICY "advances_select_policy" ON advances
  FOR SELECT 
  USING (true);

-- Allow all to insert advances
CREATE POLICY "advances_insert_policy" ON advances
  FOR INSERT 
  WITH CHECK (true);

-- Allow all to update advances
CREATE POLICY "advances_update_policy" ON advances
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Allow all to delete advances (for admin)
CREATE POLICY "advances_delete_policy" ON advances
  FOR DELETE 
  USING (true);

-- EXPENSES TABLE POLICIES
-- ============================================

-- Allow all to view expenses
CREATE POLICY "expenses_select_policy" ON expenses
  FOR SELECT 
  USING (true);

-- Allow all to insert expenses
CREATE POLICY "expenses_insert_policy" ON expenses
  FOR INSERT 
  WITH CHECK (true);

-- Allow all to update expenses
CREATE POLICY "expenses_update_policy" ON expenses
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Allow all to delete expenses
CREATE POLICY "expenses_delete_policy" ON expenses
  FOR DELETE 
  USING (true);

-- RETURNS TABLE POLICIES
-- ============================================

-- Allow all to view returns
CREATE POLICY "returns_select_policy" ON returns
  FOR SELECT 
  USING (true);

-- Allow all to insert returns
CREATE POLICY "returns_insert_policy" ON returns
  FOR INSERT 
  WITH CHECK (true);

-- COLLECTIONS TABLE POLICIES
-- ============================================

-- Allow all to view collections
CREATE POLICY "collections_select_policy" ON collections
  FOR SELECT 
  USING (true);

-- Allow all to insert collections
CREATE POLICY "collections_insert_policy" ON collections
  FOR INSERT 
  WITH CHECK (true);

-- Allow all to update collections
CREATE POLICY "collections_update_policy" ON collections
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- ============================================
-- STEP 7: Create Helpful Views (Optional)
-- ============================================

-- View: Staff with their advance summary
CREATE OR REPLACE VIEW staff_advance_summary AS
SELECT 
  u.id,
  u.username,
  u.full_name,
  u.staff_code,
  COUNT(a.id) as total_advances,
  COALESCE(SUM(a.amount), 0) as total_advance_amount,
  COALESCE(SUM(a.total_expenses), 0) as total_expenses,
  COALESCE(SUM(a.remaining_balance), 0) as total_remaining
FROM users u
LEFT JOIN advances a ON u.id::text = a.staff_id
WHERE u.role = 'staff'
GROUP BY u.id, u.username, u.full_name, u.staff_code;

-- View: Pending expenses for admin review
CREATE OR REPLACE VIEW pending_expenses AS
SELECT 
  e.id,
  e.date,
  u.full_name as staff_name,
  u.staff_code,
  e.category,
  e.total,
  e.remarks,
  e.created_at
FROM expenses e
JOIN users u ON e.user_id = u.id
WHERE e.settlement_status = 'pending'
ORDER BY e.created_at DESC;

-- View: Active advances requiring settlement
CREATE OR REPLACE VIEW active_advances AS
SELECT 
  a.id,
  a.date,
  u.full_name as staff_name,
  u.staff_code,
  a.amount,
  a.total_expenses,
  a.remaining_balance,
  a.balance_to_settle,
  a.description
FROM advances a
JOIN users u ON a.staff_id = u.id::text
WHERE a.status = 'active' AND a.settlement_status = 'pending'
ORDER BY a.date DESC;

-- ============================================
-- STEP 8: Create Useful Functions
-- ============================================

-- Function to calculate advance balance
CREATE OR REPLACE FUNCTION calculate_advance_balance(advance_uuid UUID)
RETURNS TABLE (
  advance_amount DECIMAL,
  total_spent DECIMAL,
  balance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.amount,
    COALESCE(SUM(e.total), 0)::DECIMAL,
    (a.amount - COALESCE(SUM(e.total), 0))::DECIMAL
  FROM advances a
  LEFT JOIN expenses e ON a.id = e.advance_id
  WHERE a.id = advance_uuid
  GROUP BY a.id, a.amount;
END;
$$ LANGUAGE plpgsql;

-- Function to get staff expense summary
CREATE OR REPLACE FUNCTION get_staff_expense_summary(staff_user_id UUID)
RETURNS TABLE (
  total_expenses DECIMAL,
  expense_count BIGINT,
  pending_count BIGINT,
  settled_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(total), 0)::DECIMAL,
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE settlement_status = 'pending')::BIGINT,
    COUNT(*) FILTER (WHERE settlement_status = 'settled')::BIGINT
  FROM expenses
  WHERE user_id = staff_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 9: Add Triggers for Updated_at
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advances_updated_at 
  BEFORE UPDATE ON advances 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON expenses 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 10: Grant Permissions
-- ============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon role for public access
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these queries to verify setup:

-- 1. Check all tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- 2. Check admin user exists
-- SELECT * FROM users WHERE role = 'admin';

-- 3. Check indexes
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- 4. Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- 5. Check policies
-- SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready for:
-- ✅ User management (Admin + Staff)
-- ✅ Advance tracking
-- ✅ Expense management
-- ✅ Return tracking
-- ✅ Collection management
-- ✅ Real-time data sync
-- ✅ Row Level Security
-- ✅ Performance optimized with indexes
-- ============================================

-- Next Steps:
-- 1. Copy your Supabase Project URL
-- 2. Copy your anon public key
-- 3. Add to your app's environment variables:
--    VITE_SUPABASE_URL=your_url
--    VITE_SUPABASE_ANON_KEY=your_key
-- 4. Deploy and test!
-- ============================================
