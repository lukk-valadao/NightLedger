import { Router } from 'express';
import * as accountController from '../controllers/account.controller.js';
import { validateAccount } from '../middlewares/validation.middleware.js';

const router = Router();

router.post('/', validateAccount, accountController.create);
router.get('/', accountController.getAll);
router.get('/:id', accountController.getById);
router.put('/:id', validateAccount, accountController.update);
router.delete('/:id', accountController.remove);

export default router;
