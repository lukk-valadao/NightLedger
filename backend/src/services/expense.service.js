import prisma from '../prisma/client.js';
import { NotFoundError } from '../utils/errors.js';

export const createExpense = async (data) => {
  const { name, amount, category } = data;
  return await prisma.expense.create({
    data: {
      name,
      amount: parseFloat(amount),
      category
    }
  });
};

export const getAllExpenses = async () => {
  return await prisma.expense.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const getExpenseById = async (id) => {
  const expense = await prisma.expense.findUnique({
    where: { id }
  });
  if (!expense) {
    throw new NotFoundError(`Expense with ID ${id} not found`);
  }
  return expense;
};

export const updateExpense = async (id, data) => {
  const { name, amount, category } = data;
  // Verify existence
  await getExpenseById(id);

  return await prisma.expense.update({
    where: { id },
    data: {
      name,
      amount: amount !== undefined ? parseFloat(amount) : undefined,
      category
    }
  });
};

export const deleteExpense = async (id) => {
  // Verify existence
  await getExpenseById(id);

  return await prisma.expense.delete({
    where: { id }
  });
};

export const payExpense = async (id, accountId, customAmount) => {
  // Verify existence
  const expense = await getExpenseById(id);

  return await prisma.$transaction(async (tx) => {
    // 1. Get allocations for the current active cycle to calculate covered balance
    const activeAllocations = await tx.allocation.findMany({
      where: {
        expenseId: id,
        cycleVersion: expense.cycleVersion
      }
    });

    const amountCovered = activeAllocations.reduce((sum, alloc) => sum + alloc.amountAllocated, 0);

    // 2. Increment cycle version on the expense
    const updatedExpense = await tx.expense.update({
      where: { id },
      data: {
        cycleVersion: {
          increment: 1
        }
      }
    });

    // 3. Deduct from account balance if accountId is provided
    if (accountId) {
      const account = await tx.account.findUnique({
        where: { id: accountId }
      });
      if (!account) {
        throw new NotFoundError(`Conta bancária com ID ${accountId} não encontrada.`);
      }

      const amountToDeduct = (customAmount !== undefined && customAmount !== null)
        ? parseFloat(customAmount)
        : amountCovered;

      await tx.account.update({
        where: { id: accountId },
        data: {
          balance: {
            decrement: amountToDeduct
          }
        }
      });
    }

    return updatedExpense;
  });
};
