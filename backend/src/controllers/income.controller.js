import * as incomeService from '../services/income.service.js';
import { sendSuccess } from '../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const income = await incomeService.createIncome(req.body);
    return sendSuccess(res, income, 'Income registered and distributed successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const incomes = await incomeService.getAllIncomes();
    return sendSuccess(res, incomes, 'Incomes fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const income = await incomeService.getIncomeById(req.params.id);
    return sendSuccess(res, income, 'Income fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await incomeService.deleteIncome(req.params.id);
    return sendSuccess(res, null, 'Income deleted successfully');
  } catch (error) {
    next(error);
  }
};
