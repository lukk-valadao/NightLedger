import * as accountService from '../services/account.service.js';
import { sendSuccess } from '../utils/response.js';

export const create = async (req, res, next) => {
  try {
    const account = await accountService.createAccount(req.body);
    return sendSuccess(res, account, 'Conta bancária criada com sucesso', 201);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const accounts = await accountService.getAllAccounts();
    return sendSuccess(res, accounts, 'Contas bancárias recuperadas com sucesso');
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const account = await accountService.getAccountById(req.params.id);
    return sendSuccess(res, account, 'Conta bancária recuperada com sucesso');
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const account = await accountService.updateAccount(req.params.id, req.body);
    return sendSuccess(res, account, 'Conta bancária atualizada com sucesso');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await accountService.deleteAccount(req.params.id);
    return sendSuccess(res, null, 'Conta bancária excluída com sucesso');
  } catch (error) {
    next(error);
  }
};
