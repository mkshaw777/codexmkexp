// Migration utilities to update old data to new schema

export const migrateData = () => {
  // Migrate Expenses
  const expensesStr = localStorage.getItem('mk_marketing_expenses');
  if (expensesStr) {
    const expenses = JSON.parse(expensesStr);
    const migratedExpenses = expenses.map((expense: any) => ({
      ...expense,
      advanceId: expense.advanceId || undefined,
      subCategory: expense.subCategory || expense.categoryDetail || '',
      submittedToAdmin: expense.submittedToAdmin !== undefined ? expense.submittedToAdmin : false,
      settlementStatus: expense.settlementStatus || 'pending',
      // Ensure new category values
      category: ['Transport', 'Bazar', 'Sealdah', 'Out Station', 'Paglahat', 'Others'].includes(expense.category)
        ? expense.category
        : 'Others',
    }));
    localStorage.setItem('mk_marketing_expenses', JSON.stringify(migratedExpenses));
  }

  // Migrate Advances
  const advancesStr = localStorage.getItem('mk_marketing_advances');
  if (advancesStr) {
    const advances = JSON.parse(advancesStr);
    const migratedAdvances = advances.map((advance: any) => ({
      ...advance,
      totalExpenses: advance.totalExpenses || 0,
      balanceToSettle: advance.balanceToSettle || 0,
      settlementStatus: advance.settlementStatus || 'pending',
    }));
    localStorage.setItem('mk_marketing_advances', JSON.stringify(migratedAdvances));
  }

  console.log('Data migration completed');
};

// Run migration on app load
if (typeof window !== 'undefined') {
  const migrationVersion = localStorage.getItem('mk_marketing_migration_version');
  if (migrationVersion !== '2.0') {
    migrateData();
    localStorage.setItem('mk_marketing_migration_version', '2.0');
  }
}
