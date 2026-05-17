import prisma from '../prisma/client.js';
import { NotFoundError } from '../utils/errors.js';

export const getAllAccounts = async () => {
  return await prisma.account.findMany({
    orderBy: {
      name: 'asc'
    }
  });
};

export const getAccountById = async (id) => {
  const account = await prisma.account.findUnique({
    where: { id }
  });
  if (!account) {
    throw new NotFoundError(`Conta bancária com ID ${id} não encontrada.`);
  }
  return account;
};

export const createAccount = async (data) => {
  const { name, balance } = data;
  return await prisma.account.create({
    data: {
      name: name.trim(),
      balance: balance ? parseFloat(balance) : 0.0
    }
  });
};

export const updateAccount = async (id, data) => {
  // Check existence
  await getAccountById(id);

  const { name, balance } = data;
  return await prisma.account.update({
    where: { id },
    data: {
      name: name ? name.trim() : undefined,
      balance: balance !== undefined ? parseFloat(balance) : undefined
    }
  });
};

export const deleteAccount = async (id) => {
  // Check existence
  await getAccountById(id);

  return await prisma.account.delete({
    where: { id }
  });
};
