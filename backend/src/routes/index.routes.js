import { Router } from 'express';
import expenseRoutes from './expense.routes.js';
import incomeRoutes from './income.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.use('/expenses', expenseRoutes);
router.use('/incomes', incomeRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
