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
