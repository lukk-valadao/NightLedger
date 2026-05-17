import { Router } from 'express';
import * as expenseController from '../controllers/expense.controller.js';
import { validateExpense } from '../middlewares/validation.middleware.js';

const router = Router();

router.post('/', validateExpense, expenseController.create);
router.get('/', expenseController.getAll);
router.post('/:id/pay', expenseController.pay);
router.get('/:id', expenseController.getById);
router.put('/:id', validateExpense, expenseController.update);
router.delete('/:id', expenseController.remove);

export default router;
