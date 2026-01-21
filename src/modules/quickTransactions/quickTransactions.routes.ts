import { Router } from 'express';
import { getQuickTransactions } from './controllers/getQuickTransactions.controller';
import { getLatestQuickTransaction } from './controllers/getLatestQuickTransaction.controller';
import { createQuickTransaction } from './controllers/createQuickTransaction.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Tüm quick transaction route'ları authentication gerektirir
router.get('/', authMiddleware, getQuickTransactions);
router.get('/latest', authMiddleware, getLatestQuickTransaction);
router.post('/', authMiddleware, createQuickTransaction);

export default router;

