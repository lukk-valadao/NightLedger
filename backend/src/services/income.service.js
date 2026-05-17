import prisma from '../prisma/client.js';
import { NotFoundError } from '../utils/errors.js';

export const createIncome = async (data) => {
  const { amount, date, notes } = data;
  const parsedAmount = parseFloat(amount);
  const parsedDate = date ? new Date(date) : new Date();

  return await prisma.$transaction(async (tx) => {
    // 1. Create the income record
    const income = await tx.income.create({
      data: {
        amount: parsedAmount,
        date: parsedDate,
        notes
      }
    });

    // 2. Fetch all current expenses
    const expenses = await tx.expense.findMany();
    const totalExpensesTarget = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // 3. Proportional distribution with Dynamic Overflow
    if (expenses.length > 0 && totalExpensesTarget > 0) {
      // Calculate selected month & year start/end to aggregate current coverage
      const currentMonth = parsedDate.getMonth() + 1;
      const currentYear = parsedDate.getFullYear();
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

      // Fetch all allocations registered in this same month/year prior to this new income
      const currentAllocations = await tx.allocation.findMany({
        where: {
          income: {
            date: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        }
      });

      // Map already covered amounts per expense
      const coveredByExpense = {};
      currentAllocations.forEach((alloc) => {
        if (!coveredByExpense[alloc.expenseId]) {
          coveredByExpense[alloc.expenseId] = 0;
        }
        coveredByExpense[alloc.expenseId] += alloc.amountAllocated;
      });

      // Initialize session allocation trackers
      const sessionAllocated = {};
      expenses.forEach((exp) => {
        sessionAllocated[exp.id] = 0;
      });

      let amountRemainingToAllocate = parsedAmount;
      let iterations = 0;
      const maxIterations = expenses.length + 5; // Prevent any theoretical infinite loops

      while (amountRemainingToAllocate > 0.001 && iterations < maxIterations) {
        iterations++;

        // Find all expenses that are not yet fully covered in this session
        const pendingExpenses = expenses.filter((exp) => {
          const alreadyCovered = coveredByExpense[exp.id] || 0;
          const currentSessionAllocated = sessionAllocated[exp.id];
          return alreadyCovered + currentSessionAllocated < exp.amount;
        });

        // If no pending expenses are left, distribute remaining amount proportionally among all expenses
        if (pendingExpenses.length === 0) {
          const remainingToShare = amountRemainingToAllocate;
          expenses.forEach((exp) => {
            const proportion = exp.amount / totalExpensesTarget;
            const share = remainingToShare * proportion;
            sessionAllocated[exp.id] += share;
          });
          amountRemainingToAllocate = 0;
          break;
        }

        // Calculate total target of pending expenses
        const totalPendingTarget = pendingExpenses.reduce((sum, exp) => sum + exp.amount, 0);

        let allocatedInThisIteration = 0;

        // Distribute proportionally among pending expenses
        pendingExpenses.forEach((exp) => {
          const proportion = exp.amount / totalPendingTarget;
          const share = amountRemainingToAllocate * proportion;

          const alreadyCovered = coveredByExpense[exp.id] || 0;
          const currentSessionAllocated = sessionAllocated[exp.id];
          const maxRoom = Math.max(0, exp.amount - (alreadyCovered + currentSessionAllocated));

          if (share > maxRoom) {
            sessionAllocated[exp.id] += maxRoom;
            allocatedInThisIteration += maxRoom;
          } else {
            sessionAllocated[exp.id] += share;
            allocatedInThisIteration += share;
          }
        });

        // Subtract what was allocated in this iteration
        amountRemainingToAllocate = Math.max(0, amountRemainingToAllocate - allocatedInThisIteration);

        // Safety break if no progress was made in this iteration (e.g. rounding anomalies)
        if (allocatedInThisIteration < 0.001) {
          const remainingToShare = amountRemainingToAllocate;
          pendingExpenses.forEach((exp) => {
            const proportion = exp.amount / totalPendingTarget;
            sessionAllocated[exp.id] += remainingToShare * proportion;
          });
          amountRemainingToAllocate = 0;
          break;
        }
      }

      // Compile final allocations data to insert
      const allocationsData = expenses.map((expense) => {
        const amountAllocated = sessionAllocated[expense.id];
        // Percentage relative to the total income amount
        const percentage = parsedAmount > 0 ? (amountAllocated / parsedAmount) * 100 : 0;

        return {
          incomeId: income.id,
          expenseId: expense.id,
          amountAllocated,
          percentage
        };
      });

      // Bulk create allocations in database
      await tx.allocation.createMany({
        data: allocationsData
      });
    }

    // Return the income with its created allocations
    return await tx.income.findUnique({
      where: { id: income.id },
      include: {
        allocations: {
          include: {
            expense: true
          }
        }
      }
    });
  });
};

export const getAllIncomes = async () => {
  return await prisma.income.findMany({
    include: {
      allocations: {
        include: {
          expense: {
            select: {
              name: true,
              category: true
            }
          }
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  });
};

export const getIncomeById = async (id) => {
  const income = await prisma.income.findUnique({
    where: { id },
    include: {
      allocations: {
        include: {
          expense: true
        }
      }
    }
  });

  if (!income) {
    throw new NotFoundError(`Income with ID ${id} not found`);
  }
  return income;
};

export const deleteIncome = async (id) => {
  // Verify existence
  await getIncomeById(id);

  // Deletion will cascade delete the related allocations because of standard onDelete: Cascade in prisma schema
  return await prisma.income.delete({
    where: { id }
  });
};
