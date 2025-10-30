/**
 * Debug Helper for MK Marketing Expense Management
 * 
 * This file provides console utilities to diagnose and fix common issues
 */

export const debugHelper = {
  // Check system health
  checkHealth: () => {
    console.log('\n🔍 ===== SYSTEM HEALTH CHECK =====\n');
    
    const results = {
      localStorage: false,
      users: 0,
      admins: 0,
      staff: 0,
      issues: [] as string[],
    };

    // Check localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      results.localStorage = true;
      console.log('✅ localStorage: Working');
    } catch (e) {
      console.error('❌ localStorage: Not accessible');
      results.issues.push('localStorage not accessible');
    }

    // Check users
    const usersStr = localStorage.getItem('mk_marketing_users');
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        results.users = users.length;
        
        const admins = users.filter((u: any) => u.role === 'admin');
        const staff = users.filter((u: any) => u.role === 'staff');
        
        results.admins = admins.length;
        results.staff = staff.length;

        console.log(`✅ Total Users: ${users.length}`);
        console.log(`   ├─ Admins: ${admins.length}`);
        console.log(`   └─ Staff: ${staff.length}`);

        // Validate
        if (results.users !== 6) {
          results.issues.push(`Expected 6 users, found ${results.users}`);
          console.warn(`⚠️  Expected 6 users, but found ${results.users}`);
        }
        if (results.admins !== 1) {
          results.issues.push(`Expected 1 admin, found ${results.admins}`);
          console.warn(`⚠️  Expected 1 admin, but found ${results.admins}`);
        }
        if (results.staff !== 5) {
          results.issues.push(`Expected 5 staff, found ${results.staff}`);
          console.warn(`⚠️  Expected 5 staff, but found ${results.staff}`);
        }

        // Check staff details
        console.log('\n📋 Staff Members:');
        staff.forEach((s: any, idx: number) => {
          const valid = s.fullName && s.email && s.staffCode;
          const icon = valid ? '✓' : '✗';
          console.log(`   ${icon} ${s.fullName || 'NO NAME'} (${s.staffCode || 'NO CODE'})`);
          console.log(`      ${s.email || 'NO EMAIL'}`);
          
          if (!valid) {
            results.issues.push(`Staff ${idx + 1} has missing fields`);
          }
        });

      } catch (e) {
        console.error('❌ Failed to parse users:', e);
        results.issues.push('Users data corrupted');
      }
    } else {
      console.error('❌ No users found in localStorage');
      results.issues.push('No users in localStorage');
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    if (results.issues.length === 0) {
      console.log('✅ System is HEALTHY! All checks passed.');
    } else {
      console.log('❌ Issues detected:');
      results.issues.forEach((issue, idx) => {
        console.log(`   ${idx + 1}. ${issue}`);
      });
      console.log('\n💡 Run debugHelper.fix() to attempt auto-fix');
    }
    
    console.log('\n================================\n');
    
    return results;
  },

  // Show all users in table format
  showUsers: () => {
    const usersStr = localStorage.getItem('mk_marketing_users');
    if (!usersStr) {
      console.error('❌ No users found');
      return;
    }
    
    const users = JSON.parse(usersStr);
    console.log(`\n📋 All Users (${users.length}):`);
    console.table(users.map((u: any) => ({
      ID: u.id,
      Name: u.fullName,
      Email: u.email,
      Role: u.role,
      Code: u.staffCode,
    })));
  },

  // Show only staff
  showStaff: () => {
    const usersStr = localStorage.getItem('mk_marketing_users');
    if (!usersStr) {
      console.error('❌ No users found');
      return;
    }
    
    const users = JSON.parse(usersStr);
    const staff = users.filter((u: any) => u.role === 'staff');
    
    console.log(`\n👥 Staff Members (${staff.length}):`);
    console.table(staff.map((s: any) => ({
      ID: s.id,
      Name: s.fullName,
      Email: s.email,
      Code: s.staffCode,
      Phone: s.phoneNumber,
    })));
  },

  // Auto-fix common issues
  fix: () => {
    console.log('\n🔧 ===== AUTO-FIX ATTEMPT =====\n');
    
    const usersStr = localStorage.getItem('mk_marketing_users');
    
    if (!usersStr) {
      console.log('ℹ️  No users found. This is normal on first load.');
      console.log('✅ Users will be created automatically on page refresh.');
      console.log('\n💡 Refreshing page in 2 seconds...');
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      return;
    }

    try {
      const users = JSON.parse(usersStr);
      const staff = users.filter((u: any) => u.role === 'staff');
      
      if (users.length !== 6 || staff.length !== 5) {
        console.log('⚠️  User count mismatch detected');
        console.log('🔧 Clearing users and reinitializing...');
        localStorage.removeItem('mk_marketing_users');
        
        console.log('✅ Users cleared. Refreshing page...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.log('✅ User count is correct!');
        console.log('ℹ️  If dropdown still empty, try hard refresh (Ctrl+Shift+R)');
      }
      
    } catch (e) {
      console.error('❌ Data corruption detected');
      console.log('🔧 Clearing all data...');
      localStorage.clear();
      
      console.log('✅ Data cleared. Refreshing page...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
    
    console.log('\n================================\n');
  },

  // Hard reset
  reset: () => {
    console.log('\n🗑️  ===== HARD RESET =====\n');
    console.log('⚠️  This will clear ALL data!');
    console.log('ℹ️  Demo data will be recreated on reload.');
    
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('✅ All data cleared!');
    console.log('🔄 Refreshing page in 2 seconds...');
    console.log('\n========================\n');
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  },

  // Show all available commands
  help: () => {
    console.log('\n📖 ===== DEBUG HELPER COMMANDS =====\n');
    console.log('Available commands:');
    console.log('');
    console.log('  debugHelper.checkHealth()  - Run full system health check');
    console.log('  debugHelper.showUsers()    - Display all users in table');
    console.log('  debugHelper.showStaff()    - Display only staff members');
    console.log('  debugHelper.fix()          - Auto-fix common issues');
    console.log('  debugHelper.reset()        - Hard reset (clear all data)');
    console.log('  debugHelper.help()         - Show this help message');
    console.log('');
    console.log('💡 Quick fixes:');
    console.log('  - Run checkHealth() first to diagnose');
    console.log('  - If issues found, run fix()');
    console.log('  - For complete reset, run reset()');
    console.log('');
    console.log('🎯 Most common solution:');
    console.log('  localStorage.clear(); location.reload();');
    console.log('');
    console.log('====================================\n');
  },
};

// Auto-run health check on import (only in development)
if (typeof window !== 'undefined') {
  // Make it globally available for console access
  (window as any).debugHelper = debugHelper;
  
  console.log('\n💡 Debug Helper loaded! Type "debugHelper.help()" for commands.\n');
}

export default debugHelper;
