// Storage Cleanup Utility
// Prevents out of memory errors by managing localStorage efficiently

export const STORAGE_KEYS = {
  USERS: 'mk_marketing_users',
  ADVANCES: 'mk_marketing_advances',
  EXPENSES: 'mk_marketing_expenses',
  COLLECTIONS: 'mk_marketing_collections',
  TRANSPORT: 'mk_marketing_transport_payments', // Changed from 'transportPayments'
  CURRENT_USER: 'mk_marketing_current_user',
};

// Maximum entries to keep in localStorage (prevent memory issues)
const MAX_ENTRIES = {
  EXPENSES: 500,
  ADVANCES: 200,
  COLLECTIONS: 300,
  TRANSPORT: 200,
};

/**
 * Clean old data from localStorage to prevent memory issues
 */
export function cleanupOldData() {
  try {
    // Clean expenses
    const expenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
    if (expenses.length > MAX_ENTRIES.EXPENSES) {
      // Keep only latest entries
      const sorted = expenses.sort((a: any, b: any) => 
        new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
      );
      const trimmed = sorted.slice(0, MAX_ENTRIES.EXPENSES);
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(trimmed));
      console.log(`Cleaned ${expenses.length - trimmed.length} old expenses`);
    }

    // Clean advances
    const advances = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADVANCES) || '[]');
    if (advances.length > MAX_ENTRIES.ADVANCES) {
      const sorted = advances.sort((a: any, b: any) => 
        new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
      );
      const trimmed = sorted.slice(0, MAX_ENTRIES.ADVANCES);
      localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(trimmed));
      console.log(`Cleaned ${advances.length - trimmed.length} old advances`);
    }

    // Clean collections
    const collections = JSON.parse(localStorage.getItem(STORAGE_KEYS.COLLECTIONS) || '[]');
    if (collections.length > MAX_ENTRIES.COLLECTIONS) {
      const sorted = collections.sort((a: any, b: any) => 
        new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
      );
      const trimmed = sorted.slice(0, MAX_ENTRIES.COLLECTIONS);
      localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(trimmed));
      console.log(`Cleaned ${collections.length - trimmed.length} old collections`);
    }

    // Clean transport payments
    const transport = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSPORT) || '[]');
    if (transport.length > MAX_ENTRIES.TRANSPORT) {
      const sorted = transport.sort((a: any, b: any) => 
        new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()
      );
      const trimmed = sorted.slice(0, MAX_ENTRIES.TRANSPORT);
      localStorage.setItem(STORAGE_KEYS.TRANSPORT, JSON.stringify(trimmed));
      console.log(`Cleaned ${transport.length - trimmed.length} old transport payments`);
    }

    return true;
  } catch (error) {
    console.error('Cleanup error:', error);
    return false;
  }
}

/**
 * Get storage usage info
 */
export function getStorageInfo() {
  try {
    let totalSize = 0;
    const info: Record<string, number> = {};

    for (const key in STORAGE_KEYS) {
      const data = localStorage.getItem(STORAGE_KEYS[key as keyof typeof STORAGE_KEYS]);
      if (data) {
        const size = new Blob([data]).size;
        totalSize += size;
        info[key] = size;
      }
    }

    return {
      totalSize,
      totalSizeKB: Math.round(totalSize / 1024),
      breakdown: info,
      limit: 5120, // 5MB typical limit
      percentUsed: Math.round((totalSize / (5 * 1024 * 1024)) * 100),
    };
  } catch (error) {
    console.error('Storage info error:', error);
    return null;
  }
}

/**
 * Emergency cleanup - removes all old settled/completed records
 */
export function emergencyCleanup() {
  try {
    console.log('🚨 Running emergency cleanup...');

    // Remove old settled expenses (older than 90 days)
    const expenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]');
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const recentExpenses = expenses.filter((e: any) => {
      const expenseDate = new Date(e.date);
      return expenseDate > ninetyDaysAgo || e.status === 'pending';
    });
    
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(recentExpenses));
    console.log(`Removed ${expenses.length - recentExpenses.length} old expenses`);

    // Remove old settled advances
    const advances = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADVANCES) || '[]');
    const recentAdvances = advances.filter((a: any) => {
      const advanceDate = new Date(a.date);
      return advanceDate > ninetyDaysAgo || a.status !== 'settled';
    });
    
    localStorage.setItem(STORAGE_KEYS.ADVANCES, JSON.stringify(recentAdvances));
    console.log(`Removed ${advances.length - recentAdvances.length} old advances`);

    cleanupOldData();
    console.log('✅ Emergency cleanup complete!');
    return true;
  } catch (error) {
    console.error('Emergency cleanup failed:', error);
    return false;
  }
}

/**
 * Check if cleanup is needed
 */
export function shouldCleanup(): boolean {
  const info = getStorageInfo();
  if (!info) return false;
  
  // Cleanup if using more than 70% of storage
  return info.percentUsed > 70;
}

/**
 * Auto cleanup on app start
 */
export function initStorageManagement() {
  try {
    // Run cleanup if needed
    if (shouldCleanup()) {
      console.log('📦 Storage usage high, running cleanup...');
      cleanupOldData();
    }

    // Log storage info
    const info = getStorageInfo();
    if (info) {
      console.log(`💾 Storage: ${info.totalSizeKB}KB used (${info.percentUsed}%)`);
    }
  } catch (error) {
    console.error('Storage management init failed:', error);
  }
}
