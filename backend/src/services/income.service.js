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
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // 3. Proportional distribution
    if (expenses.length > 0 && totalExpenses > 0) {
      const allocationsData = expenses.map((expense) => {
        const proportion = expense.amount / totalExpenses;
        const amountAllocated = parsedAmount * proportion;
        // Percentage format: 0 to 100
        const percentage = proportion * 100;

        return {
          incomeId: income.id,
          expenseId: expense.id,
          amountAllocated,
          percentage
        };
      });

      // Bulk create allocations
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
