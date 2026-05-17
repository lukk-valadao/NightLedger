import prisma from '../prisma/client.js';

export const getMonthlyDashboardData = async (month, year) => {
  const currentMonth = parseInt(month, 10);
  const currentYear = parseInt(year, 10);

  // Calculate start and end date for the selected month
  // Month is 1-indexed from client (e.g. 5 = May), Date constructor uses 0-indexed months (e.g. 4 = May)
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  // 1. Fetch all expenses
  const expenses = await prisma.expense.findMany({
    orderBy: {
      amount: 'desc'
    }
  });

  // 2. Fetch all incomes registered in this month
  const incomes = await prisma.income.findMany({
    where: {
      date: {
        gte: startOfMonth,
        lte: endOfMonth
      }
    },
    orderBy: {
      date: 'desc'
    }
  });

  // 3. Fetch all allocations in this month (for monthly faturamento analysis)
  const monthlyAllocations = await prisma.allocation.findMany({
    where: {
      income: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    }
  });

  // 4. Fetch all allocations in the current active cycles of all expenses
  const activeCycleAllocations = await prisma.allocation.findMany({
    where: {
      OR: expenses.map((exp) => ({
        expenseId: exp.id,
        cycleVersion: exp.cycleVersion
      }))
    }
  });

  // 5. Fetch all bank accounts to calculate asset balances
  const accounts = await prisma.account.findMany();
  const totalBankBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // 6. Group active cycle allocations by expense
  const activeAllocationsByExpense = {};
  activeCycleAllocations.forEach((alloc) => {
    if (!activeAllocationsByExpense[alloc.expenseId]) {
      activeAllocationsByExpense[alloc.expenseId] = 0;
    }
    activeAllocationsByExpense[alloc.expenseId] += alloc.amountAllocated;
  });

  // 7. Map each expense with its active cycle coverage status
  const expensesReport = expenses.map((expense) => {
    const amountCovered = activeAllocationsByExpense[expense.id] || 0;
    const amountRemaining = Math.max(0, expense.amount - amountCovered);
    const percentageCovered = expense.amount > 0 ? (amountCovered / expense.amount) * 100 : 0;

    return {
      id: expense.id,
      name: expense.name,
      category: expense.category,
      amountNeeded: expense.amount,
      amountCovered,
      amountRemaining,
      percentageCovered,
      isCovered: amountCovered >= expense.amount,
      cycleVersion: expense.cycleVersion
    };
  });

  // 8. Calculate total expense targets and overall totals
  const totalExpensesNeeded = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalGained = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  
  // Total Reserved is the sum of cash currently allocated to unpaid/active cycles
  const totalReserved = activeCycleAllocations.reduce((sum, alloc) => sum + alloc.amountAllocated, 0);
  
  // Free balance is bank assets minus reserved cash
  const freeBalance = totalBankBalance - totalReserved;

  const overallPercentageCovered = totalExpensesNeeded > 0 ? (totalReserved / totalExpensesNeeded) * 100 : 0;

  return {
    month: currentMonth,
    year: currentYear,
    totalExpensesNeeded,
    totalGained, // monthly gross income
    totalReserved, // cash committed to active bills
    totalCovered: totalReserved, // backward compatibility
    totalRemaining: Math.max(0, totalExpensesNeeded - totalReserved), // backward compatibility
    overallPercentageCovered, // backward compatibility
    totalBankBalance, // liquid assets
    freeBalance, // discretionary cash
    expenses: expensesReport,
    recentIncomes: incomes.slice(0, 5)
  };
};
