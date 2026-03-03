export const storage = {
  getData: (key: string) => JSON.parse(localStorage.getItem(key) || '[]'),
  setData: (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data)),

  // Products
  getProducts: () => storage.getData('products'),
  addProduct: (product: any) => {
    const products = storage.getData('products');
    const newProduct = { ...product, id: Date.now() };
    storage.setData('products', [...products, newProduct]);
    return newProduct;
  },
  updateProduct: (id: number, product: any) => {
    const products = storage.getData('products');
    storage.setData('products', products.map((p: any) => p.id === id ? { ...product, id } : p));
  },
  deleteProduct: (id: number) => {
    storage.setData('products', storage.getData('products').filter((p: any) => p.id !== id));
  },

  // Purchases
  getPurchases: () => storage.getData('purchases').sort((a: any, b: any) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime()),
  addPurchase: (purchase: any) => {
    const purchases = storage.getData('purchases');
    storage.setData('purchases', [...purchases, { ...purchase, id: Date.now() }]);
  },
  deletePurchase: (id: number) => {
    storage.setData('purchases', storage.getData('purchases').filter((p: any) => p.id !== id));
  },

  // Income
  getIncome: () => storage.getData('income').sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  addIncome: (income: any) => {
    const incomes = storage.getData('income');
    storage.setData('income', [...incomes, { ...income, id: Date.now() }]);
  },
  deleteIncome: (id: number) => {
    storage.setData('income', storage.getData('income').filter((p: any) => p.id !== id));
  },

  // Expenses
  getExpenses: () => storage.getData('expenses').sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  addExpense: (expense: any) => {
    const expenses = storage.getData('expenses');
    storage.setData('expenses', [...expenses, { ...expense, id: Date.now() }]);
  },
  deleteExpense: (id: number) => {
    storage.setData('expenses', storage.getData('expenses').filter((p: any) => p.id !== id));
  },

  // Udhar
  getUdhar: () => {
    const udhar = storage.getData('udhar');
    const payments = storage.getData('udhar_payments');
    return udhar.map((u: any) => {
      const udharPayments = payments.filter((p: any) => p.udhar_id === u.id);
      const paid_amount = udharPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      return { ...u, paid_amount };
    }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  addUdhar: (udhar: any) => {
    const udhars = storage.getData('udhar');
    storage.setData('udhar', [...udhars, { ...udhar, id: Date.now(), status: 'PENDING' }]);
  },
  deleteUdhar: (id: number) => {
    storage.setData('udhar', storage.getData('udhar').filter((p: any) => p.id !== id));
    storage.setData('udhar_payments', storage.getData('udhar_payments').filter((p: any) => p.udhar_id !== id));
  },
  addUdharPayment: (udhar_id: number, payment: any) => {
    const payments = storage.getData('udhar_payments');
    storage.setData('udhar_payments', [...payments, { ...payment, id: Date.now(), udhar_id }]);
    
    const udhars = storage.getData('udhar');
    const udhar = udhars.find((u: any) => u.id === udhar_id);
    const udharPayments = storage.getData('udhar_payments').filter((p: any) => p.udhar_id === udhar_id);
    const paid_amount = udharPayments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    
    if (paid_amount >= Number(udhar.amount)) {
      storage.setData('udhar', udhars.map((u: any) => u.id === udhar_id ? { ...u, status: 'PAID' } : u));
    }
  },

  // Dashboard
  getDashboardSummary: () => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    const incomes = storage.getData('income');
    const expenses = storage.getData('expenses');
    const purchases = storage.getData('purchases');
    const products = storage.getData('products');
    const udhars = storage.getData('udhar');
    const payments = storage.getData('udhar_payments');

    const todayIncome = incomes.filter((i: any) => i.date === today).reduce((sum: number, i: any) => sum + Number(i.amount), 0);
    const todayExpenses = expenses.filter((e: any) => e.date === today).reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    const monthlyIncome = incomes.filter((i: any) => i.date.startsWith(currentMonth)).reduce((sum: number, i: any) => sum + Number(i.amount), 0);
    const monthlyExpenses = expenses.filter((e: any) => e.date.startsWith(currentMonth)).reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const monthlyPurchases = purchases.filter((p: any) => p.purchase_date.startsWith(currentMonth)).reduce((sum: number, p: any) => sum + Number(p.total_amount), 0);

    const monthlyProfit = monthlyIncome - monthlyExpenses - monthlyPurchases;
    const inventoryValue = products.reduce((sum: number, p: any) => sum + (Number(p.purchase_price) * Number(p.quantity)), 0);

    const pendingUdhars = udhars.filter((u: any) => u.status === 'PENDING');
    const totalUdhar = pendingUdhars.reduce((sum: number, u: any) => sum + Number(u.amount), 0);
    const totalPaidUdhar = payments.filter((p: any) => pendingUdhars.some((u: any) => u.id === p.udhar_id)).reduce((sum: number, p: any) => sum + Number(p.amount), 0);
    const pendingUdhar = totalUdhar - totalPaidUdhar;

    return { todayIncome, todayExpenses, monthlyProfit, monthlyPurchases, inventoryValue, pendingUdhar };
  },

  getDashboardCharts: () => {
    const incomes = storage.getData('income');
    const expenses = storage.getData('expenses');
    const purchases = storage.getData('purchases');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const last30DaysIncomeMap = new Map();
    incomes.filter((i: any) => new Date(i.date) >= thirtyDaysAgo).forEach((i: any) => {
      last30DaysIncomeMap.set(i.date, (last30DaysIncomeMap.get(i.date) || 0) + Number(i.amount));
    });
    const last30DaysIncome = Array.from(last30DaysIncomeMap.entries()).map(([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date));

    const expenseDistributionMap = new Map();
    expenses.forEach((e: any) => {
      expenseDistributionMap.set(e.category, (expenseDistributionMap.get(e.category) || 0) + Number(e.amount));
    });
    const expenseDistribution = Array.from(expenseDistributionMap.entries()).map(([name, value]) => ({ name, value }));

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyData = new Map();
    
    incomes.filter((i: any) => new Date(i.date) >= sixMonthsAgo).forEach((i: any) => {
      const month = i.date.substring(0, 7);
      if (!monthlyData.has(month)) monthlyData.set(month, { month, income: 0, expenses: 0, purchases: 0 });
      monthlyData.get(month).income += Number(i.amount);
    });
    expenses.filter((e: any) => new Date(e.date) >= sixMonthsAgo).forEach((e: any) => {
      const month = e.date.substring(0, 7);
      if (!monthlyData.has(month)) monthlyData.set(month, { month, income: 0, expenses: 0, purchases: 0 });
      monthlyData.get(month).expenses += Number(e.amount);
    });
    purchases.filter((p: any) => new Date(p.purchase_date) >= sixMonthsAgo).forEach((p: any) => {
      const month = p.purchase_date.substring(0, 7);
      if (!monthlyData.has(month)) monthlyData.set(month, { month, income: 0, expenses: 0, purchases: 0 });
      monthlyData.get(month).purchases += Number(p.total_amount);
    });

    const monthlyComparison = Array.from(monthlyData.values()).map((m: any) => ({
      ...m, profit: m.income - m.expenses - m.purchases
    })).sort((a: any, b: any) => a.month.localeCompare(b.month));

    return { last30DaysIncome, expenseDistribution, monthlyComparison };
  },

  getYearlyOverview: () => {
    const incomes = storage.getData('income');
    const expenses = storage.getData('expenses');
    const purchases = storage.getData('purchases');
    const monthlyData = new Map();
    
    incomes.forEach((i: any) => {
      const month = i.date.substring(0, 7);
      if (!monthlyData.has(month)) monthlyData.set(month, { month, income: 0, expenses: 0, purchases: 0 });
      monthlyData.get(month).income += Number(i.amount);
    });
    expenses.forEach((e: any) => {
      const month = e.date.substring(0, 7);
      if (!monthlyData.has(month)) monthlyData.set(month, { month, income: 0, expenses: 0, purchases: 0 });
      monthlyData.get(month).expenses += Number(e.amount);
    });
    purchases.forEach((p: any) => {
      const month = p.purchase_date.substring(0, 7);
      if (!monthlyData.has(month)) monthlyData.set(month, { month, income: 0, expenses: 0, purchases: 0 });
      monthlyData.get(month).purchases += Number(p.total_amount);
    });

    return Array.from(monthlyData.values()).map((m: any) => ({
      ...m, profit: m.income - m.expenses - m.purchases
    })).sort((a: any, b: any) => b.month.localeCompare(a.month));
  }
};
