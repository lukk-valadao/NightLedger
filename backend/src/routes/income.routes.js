import { Router } from 'express';
import * as incomeController from '../controllers/income.controller.js';
import { validateIncome } from '../middlewares/validation.middleware.js';

const router = Router();

router.post('/', validateIncome, incomeController.create);
router.get('/', incomeController.getAll);
router.get('/:id', incomeController.getById);
router.delete('/:id', incomeController.remove);

export default router;
