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

  // 3. Fetch all allocations in this month
  const allocations = await prisma.allocation.findMany({
    where: {
      income: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    }
  });

  // 4. Calculate total expense target
  const totalExpensesNeeded = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // 5. Group allocations by expense
  const allocationsByExpense = {};
  allocations.forEach((alloc) => {
    if (!allocationsByExpense[alloc.expenseId]) {
      allocationsByExpense[alloc.expenseId] = 0;
    }
    allocationsByExpense[alloc.expenseId] += alloc.amountAllocated;
  });

  // 6. Map each expense with its coverage stats for the month
  const expensesReport = expenses.map((expense) => {
    const amountCovered = allocationsByExpense[expense.id] || 0;
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
      isCovered: amountCovered >= expense.amount
    };
  });

  // 7. Calculate overall financial totals
  const totalGained = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalCovered = allocations.reduce((sum, alloc) => sum + alloc.amountAllocated, 0);
  const totalRemaining = Math.max(0, totalExpensesNeeded - totalCovered);
  const overallPercentageCovered = totalExpensesNeeded > 0 ? (totalCovered / totalExpensesNeeded) * 100 : 0;

  return {
    month: currentMonth,
    year: currentYear,
    totalExpensesNeeded,
    totalGained,
    totalCovered,
    totalRemaining,
    overallPercentageCovered,
    expenses: expensesReport,
    recentIncomes: incomes.slice(0, 5) // Send top 5 recent incomes for quick dashboard display
  };
};
