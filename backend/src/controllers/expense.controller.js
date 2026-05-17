import * as expenseService from '../services/expense.service.js';
import { sendSuccess } from '../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.body);
    return sendSuccess(res, expense, 'Expense created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const expenses = await expenseService.getAllExpenses();
    return sendSuccess(res, expenses, 'Expenses fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const expense = await expenseService.getExpenseById(req.params.id);
    return sendSuccess(res, expense, 'Expense fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const expense = await expenseService.updateExpense(req.params.id, req.body);
    return sendSuccess(res, expense, 'Expense updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await expenseService.deleteExpense(req.params.id);
    return sendSuccess(res, null, 'Expense deleted successfully');
  } catch (error) {
    next(error);
  }
};
