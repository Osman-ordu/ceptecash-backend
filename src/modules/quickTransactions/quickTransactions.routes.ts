import { Router } from 'express';
import { getQuickTransactions } from './controllers/getQuickTransactions.controller';
import { createQuickTransaction } from './controllers/createQuickTransaction.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Tüm quick transaction route'ları authentication gerektirir
router.get('/', authMiddleware, getQuickTransactions);
router.post('/', authMiddleware, createQuickTransaction);

export default router;

