import { Router } from 'express';
import { getQuickTransactions } from './controllers/getQuickTransactions.controller';
import { createQuickTransaction } from './controllers/createQuickTransaction.controller';

const router = Router();

router.get('/', getQuickTransactions);
router.post('/', createQuickTransaction);

export default router;

