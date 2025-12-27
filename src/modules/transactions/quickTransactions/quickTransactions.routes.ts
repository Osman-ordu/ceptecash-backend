import { Router } from 'express';
import quickTransactionsController from './quickTransactions.controller';

const router = Router();

router.get('/', quickTransactionsController.getQuickTransactions.bind(quickTransactionsController));

export default router;

