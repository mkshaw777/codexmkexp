import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { supabaseAdmin, verifyAdmin, getUserFromToken } from "./supabase-admin.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-50b30067/health", (c) => {
  return c.json({ status: "ok", message: "MK Marketing Server Running" });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Login endpoint
app.post("/make-server-50b30067/auth/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: "Username and password required" }, 400);
    }

    // Query user from database
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password);

    if (error) {
      console.error('Login query error:', error);
      return c.json({ error: "Login failed" }, 500);
    }

    if (!users || users.length === 0) {
      return c.json({ error: "Invalid username or password" }, 401);
    }

    const user = users[0];
    
    // Return user profile
    return c.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        staffCode: user.staff_code,
      },
      // Simple token - in production use proper JWT
      token: username,
    });
  } catch (err) {
    console.error('Login error:', err);
    return c.json({ error: "Server error during login" }, 500);
  }
});

// Create staff (admin only)
app.post("/make-server-50b30067/auth/create-staff", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const adminCheck = await verifyAdmin(authHeader);
    
    if (!adminCheck.isAdmin) {
      return c.json({ error: "Admin access required" }, 403);
    }

    const { username, password, fullName, staffCode } = await c.req.json();
    
    if (!username || !password || !fullName) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Create staff user
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        username,
        password,
        full_name: fullName,
        staff_code: staffCode || username.toUpperCase(),
        role: 'staff',
      }])
      .select();

    if (error) {
      console.error('Create staff error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data[0] });
  } catch (err) {
    console.error('Create staff error:', err);
    return c.json({ error: "Server error" }, 500);
  }
});

// Get all users (admin only)
app.get("/make-server-50b30067/users", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const adminCheck = await verifyAdmin(authHeader);
    
    if (!adminCheck.isAdmin) {
      return c.json({ error: "Admin access required" }, 403);
    }

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get users error:', error);
      return c.json({ error: "Failed to fetch users" }, 500);
    }

    return c.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    return c.json({ error: "Server error" }, 500);
  }
});

// ============================================
// EXPENSE ROUTES
// ============================================

// Get expenses for user
app.get("/make-server-50b30067/expenses/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const { data: expenses, error } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Get expenses error:', error);
      return c.json({ error: "Failed to fetch expenses" }, 500);
    }

    return c.json({ expenses });
  } catch (err) {
    console.error('Get expenses error:', err);
    return c.json({ error: "Server error" }, 500);
  }
});

// Create expense
app.post("/make-server-50b30067/expenses", async (c) => {
  try {
    const expense = await c.req.json();
    
    const { data, error } = await supabaseAdmin
      .from('expenses')
      .insert([{
        user_id: expense.userId,
        advance_id: expense.advanceId || null,
        date: expense.date,
        category: expense.category,
        category_detail: expense.categoryDetail || null,
        fare: expense.fare || 0,
        parking: expense.parking || 0,
        oil: expense.oil || 0,
        breakfast: expense.breakfast || 0,
        others: expense.others || 0,
        total: expense.total,
        number_of_cases: expense.numberOfCases || 0,
        bill_urls: expense.billUrls || [],
        remarks: expense.remarks || null,
        submitted_to_admin: expense.submittedToAdmin || false,
        settlement_status: expense.settlementStatus || 'pending',
      }])
      .select();

    if (error) {
      console.error('Create expense error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, expense: data[0] });
  } catch (err) {
    console.error('Create expense error:', err);
    return c.json({ error: "Server error" }, 500);
  }
});

// ============================================
// ADVANCE ROUTES
// ============================================

// Get advances for staff
app.get("/make-server-50b30067/advances/:staffId", async (c) => {
  try {
    const staffId = c.req.param('staffId');
    
    const { data: advances, error } = await supabaseAdmin
      .from('advances')
      .select('*')
      .eq('staff_id', staffId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Get advances error:', error);
      return c.json({ error: "Failed to fetch advances" }, 500);
    }

    return c.json({ advances });
  } catch (err) {
    console.error('Get advances error:', err);
    return c.json({ error: "Server error" }, 500);
  }
});

// Create advance (admin only)
app.post("/make-server-50b30067/advances", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const adminCheck = await verifyAdmin(authHeader);
    
    if (!adminCheck.isAdmin) {
      return c.json({ error: "Admin access required" }, 403);
    }

    const advance = await c.req.json();
    
    const { data, error } = await supabaseAdmin
      .from('advances')
      .insert([{
        staff_id: advance.staffId,
        admin_id: adminCheck.userId,
        date: advance.date,
        amount: advance.amount,
        remaining_balance: advance.amount, // Initial balance = amount
        status: 'active',
        description: advance.description || null,
        total_expenses: 0,
        balance_to_settle: 0,
        settlement_status: 'pending',
      }])
      .select();

    if (error) {
      console.error('Create advance error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, advance: data[0] });
  } catch (err) {
    console.error('Create advance error:', err);
    return c.json({ error: "Server error" }, 500);
  }
});

// Get all advances (admin only)
app.get("/make-server-50b30067/advances", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const adminCheck = await verifyAdmin(authHeader);
    
    if (!adminCheck.isAdmin) {
      return c.json({ error: "Admin access required" }, 403);
    }

    const { data: advances, error } = await supabaseAdmin
      .from('advances')
      .select(`
        *,
        users:staff_id (
          full_name,
          staff_code
        )
      `)
      .order('date', { ascending: false });

    if (error) {
      console.error('Get all advances error:', error);
      return c.json({ error: "Failed to fetch advances" }, 500);
    }

    return c.json({ advances });
  } catch (err) {
    console.error('Get all advances error:', err);
    return c.json({ error: "Server error" }, 500);
  }
});

// ============================================
// COLLECTION ROUTES
// ============================================

// Get collections for user
app.get("/make-server-50b30067/collections/:userId", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    const { data: collections, error } = await supabaseAdmin
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Get collections error:', error);
      return c.json({ error: "Failed to fetch collections" }, 500);
    }

    return c.json({ collections });
  } catch (err) {
    console.error('Get collections error:', err);
    return c.json({ error: "Server error" }, 500);
  }
});

// Create collection
app.post("/make-server-50b30067/collections", async (c) => {
  try {
    const collection = await c.req.json();
    
    const { data, error } = await supabaseAdmin
      .from('collections')
      .insert([{
        user_id: collection.userId,
        date: collection.date,
        party_name: collection.partyName,
        amount: collection.amount,
        payment_mode: collection.paymentMode,
        remarks: collection.remarks || null,
      }])
      .select();

    if (error) {
      console.error('Create collection error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, collection: data[0] });
  } catch (err) {
    console.error('Create collection error:', err);
    return c.json({ error: "Server error" }, 500);
  }
});

// ============================================
// ADMIN DASHBOARD ROUTES
// ============================================

// Get dashboard stats (admin only)
app.get("/make-server-50b30067/admin/dashboard", async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const adminCheck = await verifyAdmin(authHeader);
    
    if (!adminCheck.isAdmin) {
      return c.json({ error: "Admin access required" }, 403);
    }

    // Get counts and stats
    const [usersResult, advancesResult, expensesResult, collectionsResult] = await Promise.all([
      supabaseAdmin.from('users').select('count', { count: 'exact', head: true }),
      supabaseAdmin.from('advances').select('amount', { count: 'exact' }),
      supabaseAdmin.from('expenses').select('total', { count: 'exact' }),
      supabaseAdmin.from('collections').select('amount', { count: 'exact' }),
    ]);

    const totalAdvances = advancesResult.data?.reduce((sum, a) => sum + (a.amount || 0), 0) || 0;
    const totalExpenses = expensesResult.data?.reduce((sum, e) => sum + (e.total || 0), 0) || 0;
    const totalCollections = collectionsResult.data?.reduce((sum, c) => sum + (c.amount || 0), 0) || 0;

    return c.json({
      stats: {
        totalUsers: usersResult.count || 0,
        totalAdvances,
        totalExpenses,
        totalCollections,
        advanceCount: advancesResult.count || 0,
        expenseCount: expensesResult.count || 0,
        collectionCount: collectionsResult.count || 0,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return c.json({ error: "Server error" }, 500);
  }
});

// Test Supabase connection
app.get("/make-server-50b30067/test-connection", async (c) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (error) {
      return c.json({ 
        connected: false, 
        error: error.message 
      }, 500);
    }

    return c.json({ 
      connected: true, 
      message: "Supabase connection successful!",
      userCount: data || 0
    });
  } catch (err) {
    return c.json({ 
      connected: false, 
      error: String(err) 
    }, 500);
  }
});

console.log("🚀 MK Marketing Server started!");
console.log("📊 Supabase Admin client initialized");
console.log("🔐 Service role key configured");
console.log("✅ All routes ready");

Deno.serve(app.fetch);